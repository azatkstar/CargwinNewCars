"""
Performance Optimization for CargwinNewCar
Caching, connection pooling, and optimization utilities
"""
import asyncio
import logging
from typing import Optional, Dict, Any, Union, Callable
import json
import hashlib
from datetime import datetime, timedelta, timezone
import aioredis
from functools import wraps
import time

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class CacheManager:
    """Redis-based caching manager"""
    
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.enabled = bool(settings.REDIS_URL)
    
    async def connect(self):
        """Connect to Redis"""
        if not self.enabled:
            logger.info("Redis caching disabled - no REDIS_URL provided")
            return
        
        try:
            self.redis = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20
            )
            
            # Test connection
            await self.redis.ping()
            logger.info("Redis cache connected successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.enabled = False
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
            logger.info("Redis cache disconnected")
    
    def _make_key(self, key: str, prefix: str = "cargwin") -> str:
        """Create cache key with prefix"""
        return f"{prefix}:{key}"
    
    async def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache"""
        if not self.enabled or not self.redis:
            return default
        
        try:
            cache_key = self._make_key(key)
            value = await self.redis.get(cache_key)
            
            if value is None:
                return default
            
            # Try to parse JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
                
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return default
    
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL"""
        if not self.enabled or not self.redis:
            return False
        
        try:
            cache_key = self._make_key(key)
            
            # Serialize value
            if isinstance(value, (dict, list)):
                value = json.dumps(value, default=str)
            
            await self.redis.setex(cache_key, ttl, value)
            return True
            
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.enabled or not self.redis:
            return False
        
        try:
            cache_key = self._make_key(key)
            deleted = await self.redis.delete(cache_key)
            return deleted > 0
            
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        if not self.enabled or not self.redis:
            return 0
        
        try:
            cache_pattern = self._make_key(pattern)
            keys = await self.redis.keys(cache_pattern)
            if keys:
                deleted = await self.redis.delete(*keys)
                return deleted
            return 0
            
        except Exception as e:
            logger.error(f"Cache clear pattern error for {pattern}: {e}")
            return 0

# Global cache manager
cache_manager = CacheManager()

def cache_key_from_args(*args, **kwargs) -> str:
    """Generate cache key from function arguments"""
    key_parts = []
    
    # Add positional args
    for arg in args:
        if hasattr(arg, '__dict__'):
            # Skip complex objects
            continue
        key_parts.append(str(arg))
    
    # Add keyword args
    for k, v in sorted(kwargs.items()):
        if hasattr(v, '__dict__'):
            # Skip complex objects
            continue
        key_parts.append(f"{k}={v}")
    
    key_string = ":".join(key_parts)
    
    # Hash long keys
    if len(key_string) > 200:
        key_string = hashlib.md5(key_string.encode()).hexdigest()
    
    return key_string

def cached(ttl: int = 3600, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            func_name = f"{func.__module__}.{func.__name__}"
            args_key = cache_key_from_args(*args, **kwargs)
            cache_key = f"{key_prefix}:{func_name}:{args_key}" if key_prefix else f"{func_name}:{args_key}"
            
            # Try to get from cache
            cached_result = await cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {func_name}")
                return cached_result
            
            # Execute function
            logger.debug(f"Cache miss for {func_name}")
            start_time = time.time()
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Cache result (only if execution was successful)
            if result is not None:
                await cache_manager.set(cache_key, result, ttl)
                logger.debug(f"Cached result for {func_name} (took {execution_time:.3f}s)")
            
            return result
        
        return wrapper
    return decorator

class ConnectionPool:
    """Database connection pool manager"""
    
    def __init__(self):
        self.pool_size = settings.MAX_CONNECTIONS
        self.active_connections = 0
        self.semaphore = asyncio.Semaphore(self.pool_size)
    
    async def acquire(self):
        """Acquire connection from pool"""
        await self.semaphore.acquire()
        self.active_connections += 1
        logger.debug(f"Acquired connection ({self.active_connections}/{self.pool_size})")
    
    def release(self):
        """Release connection back to pool"""
        if self.active_connections > 0:
            self.active_connections -= 1
            self.semaphore.release()
            logger.debug(f"Released connection ({self.active_connections}/{self.pool_size})")
    
    def get_stats(self) -> Dict[str, int]:
        """Get connection pool statistics"""
        return {
            "pool_size": self.pool_size,
            "active_connections": self.active_connections,
            "available_connections": self.pool_size - self.active_connections
        }

# Global connection pool
connection_pool = ConnectionPool()

class QueryOptimizer:
    """Database query optimization utilities"""
    
    @staticmethod
    def optimize_lot_query(filters: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize lot database queries"""
        optimized_query = {}
        
        # Convert filters to MongoDB query
        if filters.get('status'):
            optimized_query['status'] = filters['status']
        
        if filters.get('make'):
            # Case-insensitive regex for make
            optimized_query['make'] = {
                "$regex": filters['make'], 
                "$options": "i"
            }
        
        if filters.get('model'):
            # Case-insensitive regex for model
            optimized_query['model'] = {
                "$regex": filters['model'], 
                "$options": "i"
            }
        
        if filters.get('year_min') or filters.get('year_max'):
            year_filter = {}
            if filters.get('year_min'):
                year_filter['$gte'] = filters['year_min']
            if filters.get('year_max'):
                year_filter['$lte'] = filters['year_max']
            optimized_query['year'] = year_filter
        
        if filters.get('price_min') or filters.get('price_max'):
            price_filter = {}
            if filters.get('price_min'):
                price_filter['$gte'] = filters['price_min']
            if filters.get('price_max'):
                price_filter['$lte'] = filters['price_max']
            optimized_query['msrp'] = price_filter
        
        return optimized_query
    
    @staticmethod
    def get_projection(fields: Optional[list] = None) -> Optional[Dict[str, int]]:
        """Get MongoDB projection for specific fields"""
        if not fields:
            return None
        
        projection = {field: 1 for field in fields}
        projection['_id'] = 1  # Always include _id
        return projection

class ResponseCompression:
    """Response compression utilities"""
    
    @staticmethod
    def should_compress(content_type: str, content_length: int) -> bool:
        """Determine if response should be compressed"""
        # Compress text-based content over 1KB
        compressible_types = [
            'application/json',
            'application/javascript',
            'text/css',
            'text/html',
            'text/plain',
            'application/xml'
        ]
        
        return (
            content_length > 1024 and
            any(ct in content_type for ct in compressible_types)
        )

class BatchProcessor:
    """Batch processing utilities for bulk operations"""
    
    @staticmethod
    async def process_in_batches(
        items: list,
        batch_size: int,
        processor: Callable,
        max_concurrency: int = 5
    ) -> list:
        """Process items in batches with concurrency control"""
        results = []
        semaphore = asyncio.Semaphore(max_concurrency)
        
        async def process_batch(batch):
            async with semaphore:
                return await processor(batch)
        
        # Split into batches
        batches = [
            items[i:i + batch_size] 
            for i in range(0, len(items), batch_size)
        ]
        
        # Process batches concurrently
        tasks = [process_batch(batch) for batch in batches]
        batch_results = await asyncio.gather(*tasks)
        
        # Flatten results
        for batch_result in batch_results:
            if isinstance(batch_result, list):
                results.extend(batch_result)
            else:
                results.append(batch_result)
        
        return results

# Performance monitoring decorators
def monitor_performance(operation_name: str):
    """Decorator to monitor function performance"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                
                # Log slow operations
                if duration > 1.0:
                    logger.warning(f"Slow operation: {operation_name} took {duration:.3f}s")
                else:
                    logger.debug(f"Operation {operation_name} completed in {duration:.3f}s")
                
                return result
                
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"Operation {operation_name} failed after {duration:.3f}s: {e}")
                raise
        
        return wrapper
    return decorator

# Initialize performance components
async def initialize_performance():
    """Initialize performance components"""
    await cache_manager.connect()
    logger.info("Performance optimization components initialized")

async def cleanup_performance():
    """Cleanup performance components"""
    await cache_manager.disconnect()
    logger.info("Performance optimization components cleaned up")

def get_cache_manager() -> CacheManager:
    """Get global cache manager"""
    return cache_manager

def get_connection_pool() -> ConnectionPool:
    """Get global connection pool"""
    return connection_pool