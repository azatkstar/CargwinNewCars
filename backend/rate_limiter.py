"""
Simple Rate Limiter

Lightweight in-memory rate limiting for public endpoints
"""
from datetime import datetime, timedelta
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class SimpleRateLimiter:
    """In-memory rate limiter"""
    
    def __init__(self):
        self.requests = defaultdict(list)
        self.cleanup_interval = 60  # seconds
        self.last_cleanup = datetime.now()
    
    def is_allowed(self, identifier: str, max_requests: int = 20, window_seconds: int = 60) -> bool:
        """
        Check if request is allowed
        
        Args:
            identifier: IP address or user ID
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
            
        Returns:
            True if allowed, False if rate limited
        """
        now = datetime.now()
        
        # Periodic cleanup
        if (now - self.last_cleanup).seconds > self.cleanup_interval:
            self._cleanup()
        
        # Get request history for this identifier
        request_times = self.requests[identifier]
        
        # Remove requests outside the window
        cutoff = now - timedelta(seconds=window_seconds)
        request_times = [t for t in request_times if t > cutoff]
        
        # Check if under limit
        if len(request_times) < max_requests:
            request_times.append(now)
            self.requests[identifier] = request_times
            return True
        else:
            logger.warning(f"Rate limit exceeded for {identifier}: {len(request_times)} requests in {window_seconds}s")
            return False
    
    def _cleanup(self):
        """Remove old entries from memory"""
        now = datetime.now()
        cutoff = now - timedelta(seconds=120)  # Keep last 2 minutes
        
        for identifier in list(self.requests.keys()):
            self.requests[identifier] = [t for t in self.requests[identifier] if t > cutoff]
            if not self.requests[identifier]:
                del self.requests[identifier]
        
        self.last_cleanup = now
        logger.info(f"Rate limiter cleanup: {len(self.requests)} active identifiers")


# Global rate limiter instance
rate_limiter = SimpleRateLimiter()


def get_rate_limiter() -> SimpleRateLimiter:
    """Get global rate limiter instance"""
    return rate_limiter
