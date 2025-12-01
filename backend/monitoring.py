"""
Monitoring, Logging, and Observability for CargwinNewCar
Production-ready monitoring setup
"""
import os
import json
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager
import asyncio

# Structured logging setup
class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging"""
    
    def format(self, record):
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created, timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, 'user_id'):
            log_entry["user_id"] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry["request_id"] = record.request_id
        if hasattr(record, 'duration'):
            log_entry["duration_ms"] = record.duration
        
        return json.dumps(log_entry)

def setup_logging(log_level: str = "INFO", log_format: str = "json"):
    """Setup application logging"""
    level = getattr(logging, log_level.upper())
    
    # Create logs directory
    log_dir = "/app/logs"
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Remove default handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Console handler
    console_handler = logging.StreamHandler()
    if log_format == "json":
        console_handler.setFormatter(JSONFormatter())
    else:
        console_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        )
    root_logger.addHandler(console_handler)
    
    # File handler for errors
    error_handler = logging.FileHandler(f"{log_dir}/error.log")
    error_handler.setLevel(logging.ERROR)
    if log_format == "json":
        error_handler.setFormatter(JSONFormatter())
    else:
        error_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        )
    root_logger.addHandler(error_handler)
    
    # File handler for all logs
    app_handler = logging.FileHandler(f"{log_dir}/app.log")
    if log_format == "json":
        app_handler.setFormatter(JSONFormatter())
    else:
        app_handler.setFormatter(
            logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        )
    root_logger.addHandler(app_handler)
    
    return root_logger

class MetricsCollector:
    """Collect application metrics"""
    
    def __init__(self):
        self.metrics = {
            "requests_total": 0,
            "requests_by_method": {},
            "requests_by_status": {},
            "response_times": [],
            "errors_total": 0,
            "database_operations": 0,
            "file_uploads": 0,
            "active_users": set(),
            "memory_usage": 0,
            "cpu_usage": 0
        }
        self.start_time = time.time()
    
    def record_request(self, method: str, path: str, status_code: int, duration: float):
        """Record HTTP request metrics"""
        self.metrics["requests_total"] += 1
        self.metrics["requests_by_method"][method] = self.metrics["requests_by_method"].get(method, 0) + 1
        self.metrics["requests_by_status"][status_code] = self.metrics["requests_by_status"].get(status_code, 0) + 1
        self.metrics["response_times"].append(duration)
        
        # Keep only last 1000 response times
        if len(self.metrics["response_times"]) > 1000:
            self.metrics["response_times"] = self.metrics["response_times"][-1000:]
        
        if status_code >= 400:
            self.metrics["errors_total"] += 1
    
    def record_db_operation(self):
        """Record database operation"""
        self.metrics["database_operations"] += 1
    
    def record_file_upload(self):
        """Record file upload"""
        self.metrics["file_uploads"] += 1
    
    def record_active_user(self, user_id: str):
        """Record active user"""
        self.metrics["active_users"].add(user_id)
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        response_times = self.metrics["response_times"]
        
        metrics = {
            **self.metrics,
            "uptime_seconds": time.time() - self.start_time,
            "active_users_count": len(self.metrics["active_users"]),
            "response_time_avg": sum(response_times) / len(response_times) if response_times else 0,
            "response_time_p95": sorted(response_times)[int(len(response_times) * 0.95)] if response_times else 0,
            "error_rate": self.metrics["errors_total"] / max(self.metrics["requests_total"], 1),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Remove internal sets/lists from response
        metrics = {k: v for k, v in metrics.items() if k not in ["response_times", "active_users"]}
        
        return metrics
    
    def reset_periodic_metrics(self):
        """Reset metrics that should be periodically cleared"""
        self.metrics["active_users"].clear()

# Global metrics collector
metrics_collector = MetricsCollector()

class PerformanceMonitor:
    """Monitor application performance"""
    
    @staticmethod
    @asynccontextmanager
    async def monitor_operation(operation_name: str, logger: Optional[logging.Logger] = None):
        """Context manager for monitoring operations"""
        start_time = time.time()
        if logger:
            logger.info(f"Starting {operation_name}")
        
        try:
            yield
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            if logger:
                logger.error(f"{operation_name} failed after {duration:.2f}ms: {e}")
            raise
        else:
            duration = (time.time() - start_time) * 1000
            if logger:
                logger.info(f"{operation_name} completed in {duration:.2f}ms")

def log_slow_operation(operation_name: str, duration: float, threshold: float = 1.0):
    """Log slow operations"""
    if duration > threshold:
        logger = logging.getLogger(__name__)
        logger.warning(f"Slow operation detected: {operation_name} took {duration:.3f}s")

class HealthChecker:
    """Health check utilities"""
    
    @staticmethod
    async def check_database_health() -> Dict[str, Any]:
        """Check database connectivity"""
        from database import get_database
        
        try:
            db = get_database()
            # Simple ping to check connectivity
            await db.admin.command('ping')
            return {"status": "healthy", "latency_ms": 0}  # TODO: measure actual latency
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    @staticmethod
    def check_disk_space() -> Dict[str, Any]:
        """Check available disk space"""
        import shutil
        
        try:
            total, used, free = shutil.disk_usage("/app")
            free_percent = (free / total) * 100
            
            status = "healthy"
            if free_percent < 10:
                status = "critical"
            elif free_percent < 20:
                status = "warning"
            
            return {
                "status": status,
                "total_gb": round(total / (1024**3), 2),
                "used_gb": round(used / (1024**3), 2),
                "free_gb": round(free / (1024**3), 2),
                "free_percent": round(free_percent, 2)
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    @staticmethod
    def check_memory_usage() -> Dict[str, Any]:
        """Check memory usage"""
        import psutil
        
        try:
            memory = psutil.virtual_memory()
            return {
                "status": "healthy" if memory.percent < 80 else "warning",
                "total_gb": round(memory.total / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "used_percent": memory.percent
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    @staticmethod
    async def comprehensive_health_check() -> Dict[str, Any]:
        """Perform comprehensive health check"""
        health_status = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "overall_status": "healthy",
            "checks": {}
        }
        
        # Database check
        health_status["checks"]["database"] = await HealthChecker.check_database_health()
        
        # Disk space check
        health_status["checks"]["disk"] = HealthChecker.check_disk_space()
        
        # Memory check
        health_status["checks"]["memory"] = HealthChecker.check_memory_usage()
        
        # Determine overall status
        failed_checks = [
            name for name, check in health_status["checks"].items()
            if check["status"] in ["unhealthy", "critical", "error"]
        ]
        
        if failed_checks:
            health_status["overall_status"] = "unhealthy"
            health_status["failed_checks"] = failed_checks
        
        return health_status

# Error tracking setup
def setup_error_tracking():
    """Setup error tracking (Sentry, etc.)"""
    sentry_dsn = os.getenv("SENTRY_DSN")
    
    if sentry_dsn:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
            from sentry_sdk.integrations.logging import LoggingIntegration
            
            sentry_logging = LoggingIntegration(
                level=logging.INFO,
                event_level=logging.ERROR
            )
            
            sentry_sdk.init(
                dsn=sentry_dsn,
                integrations=[
                    FastApiIntegration(auto_enabling_integrations=False),
                    sentry_logging,
                ],
                traces_sample_rate=0.1,
                environment=os.getenv("ENVIRONMENT", "production")
            )
            
            logging.getLogger(__name__).info("Sentry error tracking initialized")
            
        except ImportError:
            logging.getLogger(__name__).warning("Sentry SDK not installed, error tracking disabled")

# Startup monitoring task
async def monitoring_background_task():
    """Background task for periodic monitoring"""
    logger = logging.getLogger(__name__)
    
    while True:
        try:
            # Log metrics every 5 minutes
            metrics = metrics_collector.get_metrics()
            logger.info("Application metrics", extra={"metrics": metrics})
            
            # Reset periodic metrics
            metrics_collector.reset_periodic_metrics()
            
            # Wait 5 minutes
            await asyncio.sleep(300)
            
        except Exception as e:
            logger.error(f"Monitoring task error: {e}")
            await asyncio.sleep(60)  # Wait 1 minute on error

def get_metrics_collector() -> MetricsCollector:
    """Get global metrics collector"""



# ==========================================
# AUTOSYNC MONITORING (Added for Stage 3)
# ==========================================

def log_sync_status(status: str, details: Optional[str] = None):
    """
    Log AutoSync execution status
    
    Args:
        status: "OK" or "FAIL"
        details: Optional details message
    """
    try:
        log_dir = Path("/app/backend/logs")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_file = log_dir / "autosync_monitor.log"
        
        timestamp = datetime.now(timezone.utc).isoformat()
        log_entry = f"{timestamp} | STATUS: {status}"
        
        if details:
            log_entry += f" | {details}"
        
        # Write to file
        with open(log_file, 'a') as f:
            f.write(log_entry + "\n")
        
        # Also use standard logger
        log_func = logging.info if status == "OK" else logging.error
        log_func(f"AutoSync monitor: {status} - {details or 'No details'}")
        
    except Exception as e:
        # Never break sync due to monitoring
        logging.error(f"Monitoring failed (non-critical): {e}")


def send_alert_email(message: str):
    """
    Send alert email (placeholder implementation)
    
    Args:
        message: Alert message
        
    Note:
        This is a placeholder. SMTP not implemented.
        Safe no-op - never breaks sync.
    """
    # Placeholder: just print and log
    print(f"EMAIL ALERT: {message}")
    logging.warning(f"Email alert triggered (not sent - SMTP not configured): {message}")


from pathlib import Path