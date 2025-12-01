"""
Simple Analytics Cache

In-memory caching for expensive analytics queries
"""
from datetime import datetime, timedelta
from typing import Any, Optional
import logging
import hashlib
import json

logger = logging.getLogger(__name__)


class SimpleCache:
    """Simple in-memory cache with TTL"""
    
    def __init__(self, default_ttl_seconds: int = 300):
        self.cache = {}
        self.default_ttl = default_ttl_seconds
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key in self.cache:
            value, expires_at = self.cache[key]
            
            if datetime.now() < expires_at:
                logger.debug(f"Cache HIT: {key}")
                return value
            else:
                # Expired
                del self.cache[key]
                logger.debug(f"Cache EXPIRED: {key}")
        
        logger.debug(f"Cache MISS: {key}")
        return None
    
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None):
        """Set value in cache with TTL"""
        ttl = ttl_seconds or self.default_ttl
        expires_at = datetime.now() + timedelta(seconds=ttl)
        
        self.cache[key] = (value, expires_at)
        logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")
    
    def invalidate(self, key: str = None):
        """Invalidate cache entry or all cache"""
        if key:
            if key in self.cache:
                del self.cache[key]
                logger.info(f"Cache invalidated: {key}")
        else:
            self.cache.clear()
            logger.info("Cache fully invalidated")
    
    def make_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments"""
        data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
        return hashlib.md5(data.encode()).hexdigest()


# Global cache instance
analytics_cache = SimpleCache(default_ttl_seconds=300)  # 5 minutes


def get_analytics_cache() -> SimpleCache:
    """Get global analytics cache"""
    return analytics_cache
