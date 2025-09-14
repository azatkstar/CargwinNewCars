"""
Security and Performance Middleware for CargwinNewCar
"""
import time
import logging
from typing import Callable, Dict, Any
from fastapi import Request, Response, HTTPException
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import asyncio
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
import json

from config import get_settings, SECURITY_HEADERS, RATE_LIMITS

logger = logging.getLogger(__name__)
settings = get_settings()

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add security headers
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value
        
        # Add CSP header for production
        if settings.is_production:
            csp_policy = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self'; "
                "media-src 'self'; "
                "object-src 'none'; "
                "frame-ancestors 'none';"
            )
            response.headers["Content-Security-Policy"] = csp_policy
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware"""
    
    def __init__(self, app):
        super().__init__(app)
        self.requests = defaultdict(lambda: deque())
        self.blocked_ips = {}
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded headers (when behind proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def get_rate_limit_for_path(self, path: str) -> tuple[int, int]:
        """Get rate limit for specific path"""
        if path.startswith("/api/auth"):
            return 5, 60  # 5 requests per minute
        elif path.startswith("/api/admin/upload"):
            return 10, 60  # 10 requests per minute
        elif path.startswith("/api/admin"):
            return 50, 60  # 50 requests per minute
        elif path.startswith("/api"):
            return 100, 60  # 100 requests per minute
        else:
            return 200, 60  # 200 requests per minute for public
    
    def is_rate_limited(self, ip: str, path: str) -> bool:
        """Check if IP is rate limited for this path"""
        max_requests, window_seconds = self.get_rate_limit_for_path(path)
        now = datetime.now(timezone.utc)
        
        # Check if IP is temporarily blocked
        if ip in self.blocked_ips:
            if now < self.blocked_ips[ip]:
                return True
            else:
                del self.blocked_ips[ip]
        
        # Clean old requests
        cutoff = now - timedelta(seconds=window_seconds)
        self.requests[ip] = deque([
            req_time for req_time in self.requests[ip] 
            if req_time > cutoff
        ])
        
        # Check rate limit
        if len(self.requests[ip]) >= max_requests:
            # Block IP for 5 minutes after exceeding rate limit
            self.blocked_ips[ip] = now + timedelta(minutes=5)
            logger.warning(f"Rate limit exceeded for IP {ip} on path {path}")
            return True
        
        # Add current request
        self.requests[ip].append(now)
        return False
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for development
        if settings.is_development:
            return await call_next(request)
        
        client_ip = self.get_client_ip(request)
        path = request.url.path
        
        if self.is_rate_limited(client_ip, path):
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": "Too many requests. Please try again later."
                },
                headers={"Retry-After": "300"}
            )
        
        return await call_next(request)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests for monitoring"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log response
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"- {response.status_code} ({process_time:.3f}s)"
        )
        
        # Log slow requests
        if process_time > 1.0:
            logger.warning(
                f"Slow request detected: {request.method} {request.url.path} "
                f"took {process_time:.3f}s"
            )
        
        return response

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Global error handling"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except HTTPException:
            # Let HTTPExceptions pass through
            raise
        except Exception as e:
            # Log unexpected errors
            logger.error(f"Unhandled error in {request.method} {request.url.path}: {e}", exc_info=True)
            
            # Return generic error response for production
            if settings.is_production:
                return JSONResponse(
                    status_code=500,
                    content={
                        "error": "Internal server error",
                        "message": "An unexpected error occurred. Please try again later."
                    }
                )
            else:
                # Return detailed error for development
                import traceback
                return JSONResponse(
                    status_code=500,
                    content={
                        "error": "Internal server error",
                        "message": str(e),
                        "traceback": traceback.format_exc()
                    }
                )

class HealthCheckMiddleware(BaseHTTPMiddleware):
    """Health check endpoint"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if request.url.path == "/health":
            return JSONResponse({
                "status": "healthy",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "version": settings.PROJECT_VERSION
            })
        
        return await call_next(request)

class CacheControlMiddleware(BaseHTTPMiddleware):
    """Add cache control headers"""
    
    def get_cache_headers(self, path: str) -> Dict[str, str]:
        """Get cache headers for specific paths"""
        if path.startswith("/uploads"):
            # Cache uploaded files for 1 year
            return {
                "Cache-Control": "public, max-age=31536000, immutable",
                "Expires": (datetime.now(timezone.utc) + timedelta(days=365)).strftime("%a, %d %b %Y %H:%M:%S GMT")
            }
        elif path.startswith("/api"):
            # Don't cache API responses
            return {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        else:
            # Default caching for static assets
            return {
                "Cache-Control": "public, max-age=3600"  # 1 hour
            }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add cache headers
        cache_headers = self.get_cache_headers(request.url.path)
        for header, value in cache_headers.items():
            response.headers[header] = value
        
        return response

class CompressionMiddleware(BaseHTTPMiddleware):
    """Response compression"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add compression hint for reverse proxy
        if request.headers.get("accept-encoding", "").find("gzip") != -1:
            response.headers["Vary"] = "Accept-Encoding"
        
        return response

# CORS Configuration
def get_cors_config():
    """Get CORS configuration based on environment"""
    return {
        "allow_origins": settings.get_cors_origins(),
        "allow_credentials": settings.CORS_CREDENTIALS,
        "allow_methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": [
            "Accept",
            "Accept-Language",
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-CSRF-Token",
        ],
        "expose_headers": [
            "X-Process-Time",
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset",
        ]
    }