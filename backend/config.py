"""
Environment Configuration and Security Settings for CargwinNewCar
Production-ready configuration management
"""
import os
import secrets
from typing import Optional, List
from pydantic import BaseModel
from functools import lru_cache

class Settings(BaseModel):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Database
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "cargwin_production")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    MAGIC_LINK_EXPIRE_MINUTES: int = int(os.getenv("MAGIC_LINK_EXPIRE_MINUTES", "15"))
    
    # CORS
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "*").split(",")
    CORS_CREDENTIALS: bool = os.getenv("CORS_CREDENTIALS", "true").lower() == "true"
    
    # API
    API_V1_PREFIX: str = "/api"
    PROJECT_TITLE: str = "CargwinNewCar API"
    PROJECT_VERSION: str = "1.0.0"
    
    # File Upload
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", str(10 * 1024 * 1024)))  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp", ".avif"]
    
    # URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://localhost:3000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8001")
    
    # Email (for magic links)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: Optional[str] = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@cargwin.com")
    
    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Redis (for caching and sessions)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "3600"))  # 1 hour
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")  # json or text
    
    # Performance
    WORKERS: int = int(os.getenv("WORKERS", "1"))
    MAX_CONNECTIONS: int = int(os.getenv("MAX_CONNECTIONS", "100"))
    
    # CDN & Assets
    CDN_URL: Optional[str] = os.getenv("CDN_URL")
    STATIC_URL: str = os.getenv("STATIC_URL", "/static")
    
    # Admin
    ADMIN_EMAILS: List[str] = os.getenv("ADMIN_EMAILS", "").split(",") if os.getenv("ADMIN_EMAILS") else []
    
    # Monitoring
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    
    # Development Features
    DOCS_ENABLED: bool = ENVIRONMENT == "development" or os.getenv("DOCS_ENABLED", "false").lower() == "true"
    DEBUG_TOOLBAR: bool = ENVIRONMENT == "development" and DEBUG
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"
    
    @property
    def database_url(self) -> str:
        return f"{self.MONGO_URL}/{self.DB_NAME}"
    
    def get_cors_origins(self) -> List[str]:
        """Get processed CORS origins"""
        if self.CORS_ORIGINS == ["*"]:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS if origin.strip()]

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Environment-specific configurations
class DevelopmentConfig:
    """Development environment configuration"""
    DEBUG = True
    TESTING = False
    LOG_LEVEL = "DEBUG"
    CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

class ProductionConfig:
    """Production environment configuration"""
    DEBUG = False
    TESTING = False
    LOG_LEVEL = "INFO"
    # CORS origins should be set via environment variable

class TestingConfig:
    """Testing environment configuration"""
    DEBUG = True
    TESTING = True
    LOG_LEVEL = "DEBUG"
    DB_NAME = "cargwin_test"

# Security Headers Configuration
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}

# Rate Limiting Configuration
RATE_LIMITS = {
    "auth": "5/minute",      # Authentication endpoints
    "upload": "10/minute",   # File upload endpoints
    "api": "100/minute",     # General API endpoints
    "public": "200/minute",  # Public endpoints
}

def validate_environment():
    """Validate required environment variables for production"""
    settings = get_settings()
    
    if settings.is_production:
        required_vars = [
            "SECRET_KEY",
            "JWT_SECRET_KEY", 
            "MONGO_URL",
            "FRONTEND_URL"
        ]
        
        missing_vars = []
        for var in required_vars:
            if not getattr(settings, var, None):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        # Validate security
        if settings.SECRET_KEY == "your-secret-key-here-change-in-production":
            raise ValueError("Default SECRET_KEY detected in production. Please set a secure SECRET_KEY.")
        
        if len(settings.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long for production.")
        
        if settings.CORS_ORIGINS == ["*"]:
            raise ValueError("Wildcard CORS origins not allowed in production. Set specific origins.")

def get_database_url() -> str:
    """Get database URL for connection"""
    settings = get_settings()
    return settings.MONGO_URL

def get_secret_key() -> str:
    """Get secret key for JWT signing"""
    settings = get_settings()
    return settings.JWT_SECRET_KEY