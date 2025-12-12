from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
import hashlib
import json
import socketio

# Import configuration and middleware
from config import get_settings, validate_environment
from middleware import (
    SecurityHeadersMiddleware,
    RateLimitMiddleware,
    RequestLoggingMiddleware,
    ErrorHandlingMiddleware,
    HealthCheckMiddleware,
    CacheControlMiddleware,
    CompressionMiddleware,
    get_cors_config
)

# Import database modules
from database import (
    connect_to_mongo, 
    close_mongo_connection, 
    initialize_repositories,
    get_database,
    get_lot_repository,
    get_user_repository,
    get_audit_repository,
    get_session_repository,
    get_application_repository,
    get_reservation_repository,
    get_subscription_repository,
    LotRepository,
    UserRepository,
    AuditRepository,
    UserSessionRepository,
    ApplicationRepository,
    ReservationRepository,
    SubscriptionRepository
)

# Import authentication modules
from auth import (
    create_magic_link,
    verify_magic_link,
    create_user_tokens,
    get_current_user,
    require_auth,
    require_admin,
    require_editor,
    register_user,
    authenticate_user,
    process_oauth_session,
    get_user_from_session_token,
    MagicLinkRequest,
    MagicLinkVerify,
    RegisterRequest,
    LoginRequest,
    CompleteProfileRequest,
    Token,
    User
)

# Import file storage modules
from file_storage import (
    FileStorageManager,
    get_file_storage_manager,
    ImageAsset
)
from fastapi.staticfiles import StaticFiles

# Import monitoring
from monitoring import setup_logging, get_metrics_collector, HealthChecker
from performance import initialize_performance, cleanup_performance

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Get settings and validate environment
settings = get_settings()
try:
    validate_environment()
except ValueError as e:
    if settings.is_production:
        raise e
    else:
        logging.warning(f"Environment validation warning: {e}")

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_TITLE,
    version=settings.PROJECT_VERSION,
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None
)

# Add middleware (order matters!)
app.add_middleware(CompressionMiddleware)
app.add_middleware(CacheControlMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(HealthCheckMiddleware)

# Add rate limiting for production
if settings.is_production:
    app.add_middleware(RateLimitMiddleware)

# CORS configuration
cors_config = get_cors_config()
app.add_middleware(CORSMiddleware, **cors_config)

# Create API router
api_router = APIRouter(prefix=settings.API_V1_PREFIX)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Mount media directory (PHASE 9)
from pathlib import Path
Path("/app/media").mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory="/app/media"), name="media")


# WebSocket setup
from websocket_manager import sio
# Mount Socket.IO to FastAPI app
app.mount('/ws', socketio.ASGIApp(sio))
logger.info("WebSocket server mounted at /ws")

# Global database instance
db = None

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize all application components"""
    global db
    try:
        # Setup logging first
        setup_logging(settings.LOG_LEVEL, settings.LOG_FORMAT)
        logger.info(f"Starting CargwinNewCar API v{settings.PROJECT_VERSION} in {settings.ENVIRONMENT} mode")
        
        # Initialize database
        await connect_to_mongo()
        await initialize_repositories()
        db = get_database()  # Initialize global db instance
        logger.info("Database connections established")
        
        # Initialize performance components
        await initialize_performance()
        logger.info("Performance optimization initialized")
        
        # Start background tasks for auto-archiving
        from background_tasks import start_background_tasks
        await start_background_tasks()
        logger.info("Background tasks started")
        
        # Build search index (PHASE 11)
        try:
            from search_engine import index_deals
            await index_deals(db)
            logger.info("Search index built")
        except Exception as e:
            logger.warning(f"Search index build failed (non-critical): {e}")
        
        logger.info("🚀 Application startup completed successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to start application: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup all application components"""
    try:
        # Cleanup performance components
        await cleanup_performance()
        logger.info("Performance components cleaned up")
        
        # Stop background tasks
        from background_tasks import stop_background_tasks
        await stop_background_tasks()
        logger.info("Background tasks stopped")
        
        # Close database connections
        await close_mongo_connection()
        logger.info("Database connections closed")
        
        logger.info("✅ Application shutdown completed")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")
        # Don't raise during shutdown

# Dependency to get repositories
async def get_lots_repo() -> LotRepository:
    return get_lot_repository()

async def get_users_repo() -> UserRepository:
    return get_user_repository()

async def get_audit_repo() -> AuditRepository:
    return get_audit_repository()

async def get_sessions_repo() -> UserSessionRepository:
    return get_session_repository()

async def get_apps_repo() -> ApplicationRepository:
    return get_application_repository()

# DEPRECATED: In-memory storage (replaced by MongoDB in production)
# These are kept for backward compatibility during transition
lots_storage = {}
preview_tokens = {}  # Store preview tokens with lot data
# TODO: Remove after full MongoDB integration is confirmed working


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Admin Models
class MagicLinkRequest(BaseModel):
    email: str

class LotCreate(BaseModel):
    make: str
    model: str
    year: int
    trim: str
    vin: Optional[str] = ""
    drivetrain: str = "FWD"
    engine: Optional[str] = ""
    transmission: str = "AT"
    exteriorColor: Optional[str] = ""
    interiorColor: Optional[str] = ""
    msrp: int
    discount: int = 0
    feesHint: int = 0
    state: str = "CA"
    description: str
    tags: List[str] = []
    isWeeklyDrop: bool = False
    status: str = "draft"

# Calculator Program Models
class IncentiveItem(BaseModel):
    name: str
    amount: float
    stackable: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class LeaseProgram(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    model_pattern: str = ""
    trim_pattern: str = ""
    year_from: int
    year_to: int
    states: List[str] = ["ALL"]
    credit_tier_min_score: int = 680
    lease_terms: List[int] = [24, 36, 39]
    default_term: int = 36
    mileage_options: List[int] = [7500, 10000, 12000]
    default_mileage: int = 10000
    residual_percent: float = 56.0
    money_factor: float = 0.00191
    acquisition_fee: float = 695
    doc_fee: float = 85
    registration_fee_base: float = 540
    other_fees: float = 0
    due_at_signing_type: str = "first_plus_fees"
    fixed_due_at_signing: Optional[float] = None
    lender_name: str = "Manufacturer Financial"
    incentives: List[IncentiveItem] = []
    program_start: datetime
    program_end: datetime
    is_active: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class FinanceProgram(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brand: str
    model_pattern: str = ""
    trim_pattern: str = ""
    year_from: int
    year_to: int
    states: List[str] = ["ALL"]
    credit_tier_min_score: int = 680
    apr_options: List[float] = [2.9, 3.9, 4.9]
    default_apr: float = 3.9
    terms: List[int] = [48, 60, 72]
    default_term: int = 60
    down_payment_options: List[int] = [0, 1000, 2000, 3000, 5000]
    lender_name: str = "Manufacturer Financial"
    program_start: datetime
    program_end: datetime
    is_active: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class TaxConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    state: str
    zip_prefixes: List[str] = []
    tax_rate: float = 0.075
    tax_on_fees: bool = True
    acquisition_tax_rate: float = 0.0
    doc_tax_rate: float = 0.0
    registration_tax_rate: float = 0.0
    other_tax_rate: float = 0.0
    is_active: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Lot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    status: str
    make: str
    model: str
    year: int
    trim: str
    vin: Optional[str] = ""
    drivetrain: str
    engine: Optional[str] = ""
    transmission: str
    exteriorColor: Optional[str] = ""
    interiorColor: Optional[str] = ""
    msrp: int
    discount: int
    feesHint: int
    state: str
    description: str
    tags: List[str]
    isWeeklyDrop: bool
    images: List[Dict[str, Any]] = []
    fomo: Dict[str, Any] = {}
    seo: Dict[str, Any] = {}
    publishAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    archivedAt: Optional[datetime] = None
    
    # Calculator Configuration
    calculator_config_auto: bool = True  # True = auto-generate, False = manual override
    calculator_config_manual_json: Optional[str] = None  # Manual JSON override
    calculator_config_cached: Optional[Dict[str, Any]] = Field(default_factory=dict)  # Cached generated config

# Helper function to generate default calculator config
def get_default_calculator_config(msrp: int, discount: int, state: str = "CA") -> dict:
    """Generate default calculator configuration based on offer data"""
    final_price = msrp - discount
    
    return {
        # Lease Settings
        "lease_available": True,
        "lease_terms": [24, 36, 39, 48],
        "lease_mileages": [7500, 10000, 12000, 15000],
        "lease_residuals": {
            "24": {"7500": 0.64, "10000": 0.62, "12000": 0.60, "15000": 0.58},
            "36": {"7500": 0.59, "10000": 0.57, "12000": 0.55, "15000": 0.53},
            "39": {"7500": 0.57, "10000": 0.55, "12000": 0.53, "15000": 0.51},
            "48": {"7500": 0.52, "10000": 0.50, "12000": 0.48, "15000": 0.46}
        },
        "money_factor_by_tier": {
            "tier1": 0.00182,  # Super Elite 740+
            "tier2": 0.00197,  # Elite 720-739
            "tier3": 0.00212,  # Excellent 700-719
            "tier4": 0.00227   # Good 680-699
        },
        "acquisition_fee": 695,
        "dealer_fees": 0,
        "doc_fee": 85,
        "dmv_fee": 540,
        "tax_rate": 0.0775 if state == "CA" else 0.07,
        "default_lease_down_payments": [0, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000],
        "rebates_taxable": 0,
        "rebates_non_taxable": 0,
        
        # Finance Settings
        "finance_available": True,
        "finance_terms": [36, 48, 60, 72],
        "apr_by_tier": {
            "tier1": 5.99,   # Super Elite 740+
            "tier2": 6.99,   # Elite 720-739
            "tier3": 8.99,   # Excellent 700-719
            "tier4": 10.99   # Good 680-699
        },
        "default_finance_down_payments": [0, 1000, 2500, 5000, 7500, 10000, 15000],
        "finance_fees": 0,
        
        # Options
        "allow_incentives_toggle": True,
        "incentives_default_on": True,
        "credit_tiers": [
            {"code": "tier1", "label": "Super Elite 740+"},
            {"code": "tier2", "label": "Elite 720-739"},
            {"code": "tier3", "label": "Excellent 700-719"},
            {"code": "tier4", "label": "Good 680-699"}
        ]
    }

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    from database import get_database
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    db = get_database()
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(
    skip: int = 0,
    limit: int = 100
):
    """Get status checks with pagination"""
    from database import get_database
    db = get_database()
    status_checks = await db.status_checks.find().sort('timestamp', -1).skip(skip).limit(limit).to_list(limit)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.post("/admin/upload", response_model=List[dict])
async def upload_images(
    files: List[UploadFile],
    alt_texts: Optional[str] = None,  # JSON string of alt texts
    file_manager: FileStorageManager = Depends(get_file_storage_manager),
    current_user: User = Depends(require_editor)
):
    """Upload multiple images for lot"""
    try:
        import json
        
        # Parse alt texts if provided
        alt_text_list = []
        if alt_texts:
            try:
                alt_text_list = json.loads(alt_texts)
            except json.JSONDecodeError:
                logger.warning("Invalid alt_texts JSON, using empty strings")
        
        uploaded_images = []
        
        for i, file in enumerate(files):
            # Get alt text for this file
            alt_text = ""
            if i < len(alt_text_list):
                alt_text = alt_text_list[i]
            
            # Process image
            try:
                image_asset = await file_manager.process_image(file, alt_text)
                uploaded_images.append({
                    "id": image_asset.id,
                    "url": image_asset.url,
                    "alt": image_asset.alt,
                    "width": image_asset.width,
                    "height": image_asset.height,
                    "ratio": image_asset.ratio,
                    "variants": image_asset.variants
                })
                
                logger.info(f"Image uploaded by {current_user.email}: {file.filename} -> {image_asset.id}")
                
            except HTTPException as e:
                logger.error(f"Failed to upload {file.filename}: {e.detail}")
                # Continue with other files, but log the error
                uploaded_images.append({
                    "error": f"Failed to upload {file.filename}: {e.detail}"
                })
        
        return uploaded_images
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload images")

@api_router.delete("/admin/upload/{image_id}")
async def delete_image(
    image_id: str,
    file_manager: FileStorageManager = Depends(get_file_storage_manager),
    current_user: User = Depends(require_editor)
):
    """Delete uploaded image"""
    try:
        # In production, you would get image asset from database
        # For now, we'll return success (file cleanup would happen separately)
        
        logger.info(f"Image deletion requested by {current_user.email}: {image_id}")
        
        return {"ok": True, "message": "Image deleted successfully"}
        
    except Exception as e:
        logger.error(f"Delete image error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete image")

# File serving endpoint for development (in production use CDN/web server)
@api_router.get("/files/{file_path:path}")
async def serve_file(file_path: str):
    """Serve uploaded files (development only)"""
    try:
        from fastapi.responses import FileResponse
        import os
        
        full_path = f"/app/uploads/{file_path}"
        
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(full_path)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File serving error: {e}")
        raise HTTPException(status_code=500, detail="Failed to serve file")

# Admin Authentication Routes
@api_router.post("/auth/magic", response_model=dict)
async def send_magic_link(
    magic_request: MagicLinkRequest,
    user_repo: UserRepository = Depends(get_user_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """Send magic link to user email"""
    try:
        token = await create_magic_link(magic_request.email, user_repo, audit_repo)
        
        # In production, send email with magic link
        # For development, return the token (remove in production!)
        magic_link_url = f"{settings.FRONTEND_URL}/auth/verify?token={token}"
        
        logger.info(f"Magic link created for {magic_request.email}")
        
        # For development only - remove in production
        if os.getenv("ENVIRONMENT") == "development":
            return {
                "ok": True,
                "message": "Magic link sent successfully",
                "debug_token": token,  # Remove in production
                "debug_url": magic_link_url  # Remove in production
            }
        
        return {
            "ok": True,
            "message": "Magic link sent to your email"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Magic link error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send magic link")

@api_router.post("/auth/verify", response_model=Token)
async def verify_magic_link_endpoint(
    verify_request: MagicLinkVerify,
    user_repo: UserRepository = Depends(get_user_repository),
    audit_repo: AuditRepository = Depends(get_audit_repository)
):
    """Verify magic link and return authentication tokens"""
    try:
        user = await verify_magic_link(verify_request.token, user_repo, audit_repo)
        tokens = await create_user_tokens(user)
        
        logger.info(f"User authenticated successfully: {user.email}")
        return tokens
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Magic link verification error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@api_router.get("/auth/session", response_model=dict)
async def get_session(current_user: Optional[User] = Depends(get_current_user)):
    """Get current user session"""
    if not current_user:
        return {"authenticated": False, "user": None}
    
    return {
        "authenticated": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "role": current_user.role,
            "is_active": current_user.is_active
        }
    }

@api_router.post("/auth/logout")
async def logout(
    request: Request,
    session_repo: UserSessionRepository = Depends(get_sessions_repo),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Logout user (delete session and clear cookie)"""
    # Get session token from cookie
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Delete session from database
        await session_repo.delete_session(session_token)
    
    if current_user:
        logger.info(f"User logged out: {current_user.email}")
    
    # Return response with cookie deletion
    response = JSONResponse({"ok": True, "message": "Logged out successfully"})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    
    return response

@api_router.post("/auth/register", response_model=dict)
async def register(
    register_data: RegisterRequest,
    user_repo: UserRepository = Depends(get_users_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    """Register new user with email and password"""
    try:
        user = await register_user(
            register_data.email,
            register_data.password,
            register_data.name,
            user_repo,
            audit_repo
        )
        
        # Create tokens
        tokens = await create_user_tokens(user)
        
        # Send welcome email
        import sys
        sys.path.append('/app/backend')
        from notifications import send_email
        
        await send_email(
            user.email,
            "Welcome to hunter.lease! 🎉",
            "",
            template_type="welcome",
            template_data={'name': user.name or 'there'}
        )
        
        logger.info(f"User registered: {user.email}, welcome email sent")
        
        return {
            "ok": True,
            "message": "User registered successfully",
            "user": user.dict(),
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Failed to register user")

@api_router.post("/auth/login", response_model=dict)
async def login(
    login_data: LoginRequest,
    user_repo: UserRepository = Depends(get_users_repo)
):
    """Login with email and password"""
    try:
        user = await authenticate_user(login_data.email, login_data.password, user_repo)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create tokens
        tokens = await create_user_tokens(user)
        
        logger.info(f"User logged in: {user.email}")
        
        return {
            "ok": True,
            "message": "Logged in successfully",
            "user": user.dict(),
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Failed to login")

@api_router.post("/auth/oauth/session")
async def process_oauth(
    request: Request,
    user_repo: UserRepository = Depends(get_users_repo),
    session_repo: UserSessionRepository = Depends(get_sessions_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    """Process OAuth session_id from Emergent Auth and return session_token"""
    try:
        body = await request.json()
        session_id = body.get("session_id")
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        
        # Process OAuth session
        result = await process_oauth_session(session_id, user_repo, session_repo, audit_repo)
        
        # Set session token in httpOnly cookie
        response = JSONResponse({
            "ok": True,
            "user": result['user'],
            "message": "OAuth session processed successfully"
        })
        
        response.set_cookie(
            key="session_token",
            value=result['session_token'],
            max_age=result['expires_in'],
            httponly=True,
            secure=True,
            samesite="none",
            path="/"
        )
        
        logger.info(f"OAuth session processed for user: {result['user']['email']}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OAuth session error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process OAuth session")

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user (works with both JWT and OAuth session tokens)"""
    return current_user

# User Profile Routes
@api_router.get("/user/profile", response_model=User)
async def get_user_profile(current_user: User = Depends(require_auth)):
    """Get current user profile"""
    return current_user

@api_router.put("/user/profile", response_model=User)
async def update_user_profile(
    profile_data: CompleteProfileRequest,
    current_user: User = Depends(require_auth),
    user_repo: UserRepository = Depends(get_users_repo)
):
    """Complete/update user profile with credit application data"""
    try:
        update_data = {
            "credit_score": profile_data.credit_score,
            "auto_loan_history": profile_data.auto_loan_history,
            "employment_type": profile_data.employment_type,
            "employer_name": profile_data.employer_name,
            "job_title": profile_data.job_title,
            "time_at_job_months": profile_data.time_at_job_months,
            "monthly_income_pretax": profile_data.monthly_income_pretax,
            "annual_income": profile_data.annual_income,
            "employment_duration_months": profile_data.employment_duration_months,
            "date_of_birth": profile_data.date_of_birth,
            "drivers_license_number": profile_data.drivers_license_number,
            "immigration_status": profile_data.immigration_status,
            "phone": profile_data.phone,
            "current_address": profile_data.current_address,
            "current_address_duration_months": profile_data.current_address_duration_months,
            "previous_address": profile_data.previous_address,
            "address": profile_data.address,
            "residence_duration_months": profile_data.residence_duration_months,
            "monthly_expenses": profile_data.monthly_expenses,
            "down_payment_ready": profile_data.down_payment_ready,
            "ssn": profile_data.ssn,  # Store encrypted SSN
            "profile_completed": True
        }
        
        await user_repo.update_user(current_user.id, update_data)
        
        # Get updated user
        updated_user = await user_repo.get_user_by_id(current_user.id)
        
        logger.info(f"User profile updated: {current_user.email}")
        
        return User(**updated_user)
        
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

# Application Routes
@api_router.post("/applications")
async def create_application(
    lot_id: str,
    current_user: User = Depends(require_auth),
    app_repo: ApplicationRepository = Depends(get_apps_repo),
    lot_repo: LotRepository = Depends(get_lots_repo),
    user_repo: UserRepository = Depends(get_users_repo)
):
    """Submit application for a car"""
    try:
        # Try to find lot by slug first (lot_id might be a slug like "2024-lexus-rx350-premium")
        # If not found, try by ID
        lot = None
        
        # Search by make, model, year, trim combination (slug format)
        if '-' in lot_id:
            # Parse slug: "2024-lexus-rx350-premium"
            parts = lot_id.split('-')
            if len(parts) >= 4:
                year = parts[0]
                make = parts[1].capitalize()
                # model and trim are the rest
                
                # Find lot by these fields
                lots = await lot_repo.get_lots(skip=0, limit=100, status="published")
                for l in lots:
                    lot_slug = f"{l.get('year', '')}-{l.get('make', '')}-{l.get('model', '')}-{l.get('trim', '')}".lower().replace(' ', '-')
                    if lot_slug == lot_id:
                        lot = l
                        break
        
        # If still not found, try by ID
        if not lot:
            lot = await lot_repo.get_lot_by_id(lot_id)
        
        if not lot:
            raise HTTPException(status_code=404, detail="Car not found")
        
        # Get user data
        user_data = await user_repo.get_user_by_id(current_user.id)
        
        # Create application
        app_data = {
            "user_id": current_user.id,
            "lot_id": lot.get('id') or lot_id,  # Use actual lot ID from database
            "status": "pending",
            "user_data": {
                "email": user_data['email'],
                "name": user_data['name'],
                "credit_score": user_data.get('credit_score'),
                "employment_type": user_data.get('employment_type'),
                "annual_income": user_data.get('annual_income')
            },
            "lot_data": {
                "make": lot.get('make'),
                "model": lot.get('model'),
                "year": lot.get('year'),
                "msrp": lot.get('msrp'),
                "fleet_price": lot.get('msrp') - lot.get('discount')
            }
        }
        
        app_id = await app_repo.create_application(app_data)
        
        # Send application received email
        import sys
        sys.path.append('/app/backend')
        from notifications import send_email
        
        await send_email(
            current_user.email,
            "Application Received - hunter.lease",
            "",
            template_type="application_received",
            template_data={
                'name': user_data.get('name', 'Customer'),
                'car_title': f"{lot.get('year')} {lot.get('make')} {lot.get('model')}"
            }
        )
        
        logger.info(f"Application created: {app_id} for user {current_user.email}, email sent")
        
        return {"ok": True, "application_id": app_id, "message": "Application submitted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Application creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit application")

@api_router.get("/applications")
async def get_my_applications(
    current_user: User = Depends(require_auth),
    app_repo: ApplicationRepository = Depends(get_apps_repo)
):
    """Get current user's applications"""
    try:
        apps = await app_repo.get_applications_by_user(current_user.id)
        return {"applications": apps, "total": len(apps)}
    except Exception as e:
        logger.error(f"Get applications error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get applications")


# ============================================
# Reservation Routes
# ============================================

def get_reservations_repo(request: Request = None):
    """Dependency for reservation repository"""
    return get_reservation_repository()

@api_router.post("/reservations")
async def create_reservation(
    lot_slug: str,
    reserved_price: float,
    monthly_payment: float,
    due_at_signing: float,
    current_user: User = Depends(require_auth),
    reservation_repo: ReservationRepository = Depends(get_reservations_repo),
    lot_repo: LotRepository = Depends(get_lots_repo)
):
    """Create a price reservation for a car"""
    try:
        # Find lot by slug
        lots = await lot_repo.get_lots(skip=0, limit=100, status="published")
        lot = None
        for l in lots:
            lot_slug_check = f"{l.get('year', '')}-{l.get('make', '')}-{l.get('model', '')}-{l.get('trim', '')}".lower().replace(' ', '-')
            if lot_slug_check == lot_slug:
                lot = l
                break
        
        if not lot:
            raise HTTPException(status_code=404, detail="Car not found")
        
        # Check if user already has an active reservation for this lot
        existing = await reservation_repo.get_reservations_by_user(current_user.id, status="active")
        for res in existing:
            if res['lot_slug'] == lot_slug:
                raise HTTPException(status_code=400, detail="You already have an active reservation for this vehicle")
        
        # Create reservation (expires in 48 hours)
        from datetime import timedelta
        reservation_data = {
            "user_id": current_user.id,
            "lot_id": lot.get('id', ''),
            "lot_slug": lot_slug,
            "reserved_price": reserved_price,
            "monthly_payment": monthly_payment,
            "due_at_signing": due_at_signing,
            "status": "active",
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=48)
        }
        
        reservation_id = await reservation_repo.create_reservation(reservation_data)
        
        logger.info(f"Reservation created: {reservation_id} for user {current_user.email}")
        
        return {
            "ok": True,
            "reservation_id": reservation_id,
            "message": "Price reserved for 48 hours",
            "expires_at": reservation_data['expires_at'].isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reservation creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create reservation")

@api_router.get("/reservations")
async def get_my_reservations(
    current_user: User = Depends(require_auth),
    reservation_repo: ReservationRepository = Depends(get_reservations_repo)
):
    """Get current user's reservations"""
    try:
        # Expire old reservations first
        await reservation_repo.expire_old_reservations()
        
        # Get all reservations
        reservations = await reservation_repo.get_reservations_by_user(current_user.id)
        
        return {"reservations": reservations, "total": len(reservations)}
    except Exception as e:
        logger.error(f"Get reservations error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get reservations")

@api_router.delete("/reservations/{reservation_id}")
async def cancel_reservation(
    reservation_id: str,
    current_user: User = Depends(require_auth),
    reservation_repo: ReservationRepository = Depends(get_reservations_repo)
):
    """Cancel a reservation"""
    try:
        # Get reservation
        reservation = await reservation_repo.get_reservation_by_id(reservation_id)
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        # Check ownership
        if reservation['user_id'] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Update status
        success = await reservation_repo.update_reservation_status(reservation_id, "cancelled")
        
        if success:
            return {"ok": True, "message": "Reservation cancelled"}
        else:
            raise HTTPException(status_code=500, detail="Failed to cancel reservation")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel reservation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel reservation")

@api_router.post("/reservations/{reservation_id}/convert")
async def convert_reservation_to_application(
    reservation_id: str,
    current_user: User = Depends(require_auth),
    reservation_repo: ReservationRepository = Depends(get_reservations_repo),
    app_repo: ApplicationRepository = Depends(get_apps_repo),
    lot_repo: LotRepository = Depends(get_lots_repo),
    user_repo: UserRepository = Depends(get_users_repo)
):
    """Convert reservation to application"""
    try:
        # Get reservation
        reservation = await reservation_repo.get_reservation_by_id(reservation_id)
        
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        # Check ownership
        if reservation['user_id'] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Check if not expired
        if reservation['status'] != 'active':
            raise HTTPException(status_code=400, detail="Reservation is not active")
        
        # Handle timezone-aware comparison
        expires_at = reservation['expires_at']
        if isinstance(expires_at, datetime):
            # Make timezone-aware if needed
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            
            if expires_at < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Reservation has expired")
        
        # Get lot and user data
        lot = await lot_repo.get_lot_by_id(reservation['lot_id'])
        user_data = await user_repo.get_user_by_id(current_user.id)
        
        if not lot:
            raise HTTPException(status_code=404, detail="Car not found")
        
        # Create application
        app_data = {
            "user_id": current_user.id,
            "lot_id": reservation['lot_id'],
            "status": "pending",
            "user_data": {
                "email": user_data['email'],
                "name": user_data['name'],
                "credit_score": user_data.get('credit_score'),
                "employment_type": user_data.get('employment_type'),
                "annual_income": user_data.get('annual_income')
            },
            "lot_data": {
                "make": lot.get('make'),
                "model": lot.get('model'),
                "year": lot.get('year'),
                "msrp": lot.get('msrp'),
                "fleet_price": reservation['reserved_price']
            }
        }
        
        app_id = await app_repo.create_application(app_data)
        
        # Update reservation status
        await reservation_repo.update_reservation_status(reservation_id, "converted", app_id)
        
        logger.info(f"Reservation {reservation_id} converted to application {app_id}")
        
        return {
            "ok": True,
            "application_id": app_id,
            "message": "Application submitted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Convert reservation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to convert reservation")


# Admin Lots Routes
@api_router.get("/admin/lots")
async def get_admin_lots(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    make: Optional[str] = None,
    model: Optional[str] = None,
    lot_repo: LotRepository = Depends(get_lots_repo),
    current_user: User = Depends(require_auth)  # Any authenticated user can view
):
    """Get lots for admin dashboard with pagination and filtering"""
    try:
        skip = (page - 1) * limit
        
        lots = await lot_repo.get_lots(
            skip=skip, 
            limit=limit, 
            status=status,
            make=make,
            model=model
        )
        
        total = await lot_repo.get_total_count(status=status)
        
        return {
            "items": lots,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Get admin lots error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch lots")

@api_router.post("/admin/lots")
async def create_lot(
    lot_data: dict, 
    lot_repo: LotRepository = Depends(get_lots_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo),
    current_user: User = Depends(require_editor)  # Require editor role or higher
):
    """Create new lot"""
    try:
        logger.info(f"Creating new lot: {lot_data.get('make', '')} {lot_data.get('model', '')} {lot_data.get('year', '')} by {current_user.email}")
        
        # Validate required fields
        required_fields = ['make', 'model', 'year']
        for field in required_fields:
            if not lot_data.get(field):
                raise HTTPException(status_code=400, detail=f"Field '{field}' is required")
        
        # Ensure positive values for prices
        lot_data['msrp'] = max(0, lot_data.get('msrp', 0))
        lot_data['discount'] = max(0, lot_data.get('discount', 0))
        lot_data['fees_hint'] = max(0, lot_data.get('feesHint', 0))
        
        # Generate default images if none provided
        if not lot_data.get('images'):
            lot_data['images'] = [{
                "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjaGV2cm9sZXQlMjBjb2xvcmFkb3xlbnwwfHx8fDE3MDU0NDE3MDV8MA&ixlib=rb-4.1.0&q=85",
                "alt": f"{lot_data.get('year', '')} {lot_data.get('make', '')} {lot_data.get('model', '')} — предпросмотр"
            }]
        
        # Auto-generate calculator config if needed
        from auto_calculator_hooks import update_lot_calculator_config
        lot_data = await update_lot_calculator_config(lot_data, db)
        
        # Create lot in database
        lot_id = await lot_repo.create_lot(lot_data)
        created_lot = await lot_repo.get_lot_by_id(lot_id)
        
        # Log audit trail
        await audit_repo.log_action({
            "user_email": current_user.email,
            "action": "create",
            "resource_type": "lot",
            "resource_id": lot_id,
            "changes": lot_data
        })
        
        # Notify subscribers if lot is published
        if lot_data.get('status') == 'published':
            from database import get_subscription_repository
            try:
                sub_repo = get_subscription_repository()
                make = lot_data.get('make', '')
                model = lot_data.get('model', '')
                fleet_price = lot_data.get('msrp', 0) - lot_data.get('discount', 0)
                
                # Find matching subscriptions
                matching_subs = await sub_repo.find_matching_subscriptions(make, model, fleet_price)
                
                if matching_subs:
                    logger.info(f"Found {len(matching_subs)} subscribers for new {make} {model}")
                    # In production: send actual notifications via SendGrid/Twilio/Telegram
                    # For now: just log
            except Exception as e:
                logger.warning(f"Subscription notification error: {e}")
        
        return {
            "ok": True,
            "id": lot_id,
            "data": created_lot
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create lot error: {e}")


@api_router.get("/admin/model-templates")
async def get_model_templates(
    current_user: User = Depends(require_editor)
):
    """Get list of available model templates"""
    try:
        import sys
        sys.path.append('/app/backend')
        from model_templates import list_available_models, MODEL_TEMPLATES
        
        models = list_available_models()
        
        return {
            "ok": True,
            "models": models,
            "count": len(models),
            "templates": MODEL_TEMPLATES
        }
        
    except Exception as e:
        logger.error(f"Get templates error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get templates")



# ==========================================
# CALCULATOR PROGRAMS ENDPOINTS
# ==========================================

@api_router.get("/admin/lease-programs")
async def get_lease_programs(current_user: User = Depends(require_editor)):
    """Get all lease programs"""
    try:
        programs = await db.lease_programs.find().to_list(length=None)
        return {"ok": True, "programs": programs, "count": len(programs)}
    except Exception as e:
        logger.error(f"Get lease programs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/lease-programs")
async def create_lease_program(program: LeaseProgram, current_user: User = Depends(require_admin)):
    """Create new lease program"""
    try:
        program_dict = program.dict()
        await db.lease_programs.insert_one(program_dict)
        
        # Trigger auto-update for matching lots
        from auto_calculator_hooks import update_lots_for_lease_program
        updated_count = await update_lots_for_lease_program(program_dict, db)
        logger.info(f"Auto-updated {updated_count} lots after creating lease program")
        
        return {"ok": True, "id": program.id, "program": program_dict, "lots_updated": updated_count}
    except Exception as e:
        logger.error(f"Create lease program error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/admin/lease-programs/{program_id}")
async def update_lease_program(program_id: str, program: LeaseProgram, current_user: User = Depends(require_admin)):
    """Update lease program"""
    try:
        program_dict = program.dict()
        program_dict["updatedAt"] = datetime.now(timezone.utc)
        result = await db.lease_programs.update_one({"id": program_id}, {"$set": program_dict})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Program not found")
        return {"ok": True, "id": program_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update lease program error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/admin/lease-programs/{program_id}")
async def delete_lease_program(program_id: str, current_user: User = Depends(require_admin)):
    """Delete lease program"""
    try:
        result = await db.lease_programs.delete_one({"id": program_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Program not found")
        return {"ok": True, "id": program_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete lease program error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Finance Programs
@api_router.get("/admin/finance-programs")
async def get_finance_programs(current_user: User = Depends(require_editor)):
    """Get all finance programs"""
    try:
        programs = await db.finance_programs.find().to_list(length=None)
        return {"ok": True, "programs": programs, "count": len(programs)}
    except Exception as e:
        logger.error(f"Get finance programs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/finance-programs")
async def create_finance_program(program: FinanceProgram, current_user: User = Depends(require_admin)):
    """Create new finance program"""
    try:
        program_dict = program.dict()
        await db.finance_programs.insert_one(program_dict)
        return {"ok": True, "id": program.id, "program": program_dict}
    except Exception as e:
        logger.error(f"Create finance program error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/admin/finance-programs/{program_id}")
async def update_finance_program(program_id: str, program: FinanceProgram, current_user: User = Depends(require_admin)):
    """Update finance program"""
    try:
        program_dict = program.dict()
        program_dict["updatedAt"] = datetime.now(timezone.utc)
        result = await db.finance_programs.update_one({"id": program_id}, {"$set": program_dict})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Program not found")
        return {"ok": True, "id": program_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update finance program error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/admin/finance-programs/{program_id}")
async def delete_finance_program(program_id: str, current_user: User = Depends(require_admin)):
    """Delete finance program"""
    try:
        result = await db.finance_programs.delete_one({"id": program_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Program not found")
        return {"ok": True, "id": program_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete finance program error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Tax Configs
@api_router.get("/admin/tax-configs")
async def get_tax_configs(current_user: User = Depends(require_editor)):
    """Get all tax configurations"""
    try:
        configs = await db.tax_configs.find().to_list(length=None)
        return {"ok": True, "configs": configs, "count": len(configs)}
    except Exception as e:
        logger.error(f"Get tax configs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/tax-configs")
async def create_tax_config(config: TaxConfig, current_user: User = Depends(require_admin)):
    """Create new tax configuration"""
    try:
        config_dict = config.dict()
        await db.tax_configs.insert_one(config_dict)
        return {"ok": True, "id": config.id, "config": config_dict}
    except Exception as e:
        logger.error(f"Create tax config error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/admin/tax-configs/{config_id}")
async def update_tax_config(config_id: str, config: TaxConfig, current_user: User = Depends(require_admin)):
    """Update tax configuration"""
    try:
        config_dict = config.dict()
        config_dict["updatedAt"] = datetime.now(timezone.utc)
        result = await db.tax_configs.update_one({"id": config_id}, {"$set": config_dict})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Config not found")
        return {"ok": True, "id": config_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update tax config error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/admin/tax-configs/{config_id}")
async def delete_tax_config(config_id: str, current_user: User = Depends(require_admin)):
    """Delete tax configuration"""
    try:
        result = await db.tax_configs.delete_one({"id": config_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Config not found")
        return {"ok": True, "id": config_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete tax config error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Regenerate calculator configs
@api_router.post("/admin/regenerate-calculator-configs")
async def regenerate_calculator_configs(current_user: User = Depends(require_admin)):
    """Regenerate all auto-generated calculator configs"""
    try:
        from calculator_config_service import CalculatorConfigService
        service = CalculatorConfigService(db)
        count = await service.regenerate_all_auto_configs()
        return {"ok": True, "regenerated": count}
    except Exception as e:
        logger.error(f"Regenerate configs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# PDF IMPORT ENDPOINTS
# ==========================================

@api_router.post("/admin/lease-programs/import-pdf")
async def import_lease_program_pdf(
    file: UploadFile,
    current_user: User = Depends(require_admin)
):
    """
    Import lease program PDF - Step 1: Extract text
    
    Accepts a PDF file containing lease/finance program data,
    extracts text using OCR if needed, and stores in database
    for later parsing.
    
    Returns:
        - success: bool
        - text: Extracted text content
        - page_count: Number of pages
        - warnings: List of any warnings
        - pdf_id: Database ID for this PDF
    """
    try:
        from pdf_import_service import (
            extract_pdf_text,
            validate_pdf_file,
            save_pdf_to_database,
            clean_extracted_text
        )
        
        # Read file content
        file_content = await file.read()
        filename = file.filename or "unknown.pdf"
        
        logger.info(f"PDF import started by {current_user.email}: {filename} ({len(file_content)} bytes)")
        
        # Validate PDF
        try:
            validate_pdf_file(file_content, filename)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Extract text
        try:
            result = extract_pdf_text(file_content, filename)
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")
        
        # Clean text
        cleaned_text = clean_extracted_text(result["text"])
        
        # Save to database
        try:
            pdf_id = await save_pdf_to_database(
                db,
                filename=filename,
                text=cleaned_text,
                page_count=result["page_count"],
                method=result["method"],
                original_file_size=len(file_content)
            )
        except Exception as e:
            logger.error(f"Failed to save PDF to database: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save PDF data: {str(e)}")
        
        logger.info(f"PDF import successful: {pdf_id} - {result['page_count']} pages, {result['char_count']} chars")
        
        return {
            "success": True,
            "text": cleaned_text,
            "page_count": result["page_count"],
            "char_count": result["char_count"],
            "extraction_method": result["method"],
            "warnings": result["warnings"],
            "pdf_id": pdf_id,
            "filename": filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF import error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF import failed: {str(e)}")


@api_router.get("/admin/raw-pdfs")
async def get_raw_pdfs(
    current_user: User = Depends(require_editor),
    limit: int = 50
):
    """Get list of uploaded PDF imports"""
    try:
        pdfs = await db.raw_program_pdfs.find(
            {},
            {"_id": 0}
        ).sort("uploaded_at", -1).limit(limit).to_list(limit)
        
        return {
            "ok": True,
            "pdfs": pdfs,
            "count": len(pdfs)
        }
    except Exception as e:
        logger.error(f"Get raw PDFs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/raw-pdfs/{pdf_id}")
async def get_raw_pdf(
    pdf_id: str,
    current_user: User = Depends(require_editor)
):
    """Get specific uploaded PDF content"""
    try:
        pdf = await db.raw_program_pdfs.find_one({"id": pdf_id}, {"_id": 0})
        
        if not pdf:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        return pdf
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get raw PDF error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/admin/raw-pdfs/{pdf_id}")
async def delete_raw_pdf(
    pdf_id: str,
    current_user: User = Depends(require_admin)
):
    """Delete uploaded PDF"""
    try:
        result = await db.raw_program_pdfs.delete_one({"id": pdf_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        logger.info(f"Deleted PDF: {pdf_id} by {current_user.email}")
        
        return {"ok": True, "id": pdf_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete PDF error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# PARSED LEASE PROGRAMS ENDPOINTS
# ==========================================

@api_router.post("/admin/lease-programs/parse-from-pdf")
async def parse_lease_program_from_pdf(
    pdf_id: str,
    brand: str,
    model: Optional[str] = None,
    current_user: User = Depends(require_admin)
):
    """
    Parse a lease program from uploaded PDF
    
    Request body:
        pdf_id: ID of raw PDF in raw_program_pdfs collection
        brand: Brand name (Toyota, Honda, Kia, BMW, Mercedes)
        model: Optional model name to filter
        
    Returns:
        Parsed program data
    """
    try:
        from lease_program_parsers import parse_lease_program
        from db_lease_programs import create_parsed_program
        
        # Get raw PDF
        raw_pdf = await db.raw_program_pdfs.find_one({"id": pdf_id}, {"_id": 0})
        
        if not raw_pdf:
            raise HTTPException(status_code=404, detail=f"PDF not found: {pdf_id}")
        
        # Get text
        text = raw_pdf.get("text", "")
        
        if not text:
            raise HTTPException(status_code=400, detail="PDF has no text content")
        
        logger.info(f"Parsing PDF {pdf_id} as {brand} by {current_user.email}")
        
        # Parse
        try:
            parsed_result = parse_lease_program(
                brand=brand,
                text=text,
                model=model,
                pdf_id=pdf_id
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"Parse error: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to parse: {str(e)}")
        
        # Save to database
        parsed_dict = parsed_result.dict()
        program_id = await create_parsed_program(db, parsed_dict)
        
        # Get saved program
        from db_lease_programs import get_parsed_program
        saved_program = await get_parsed_program(db, program_id)
        
        logger.info(f"Successfully parsed and saved program: {program_id}")
        
        return {
            "success": True,
            "parsed_program": saved_program
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Parse from PDF error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse program: {str(e)}")


@api_router.get("/admin/lease-programs/parsed")
async def get_parsed_lease_programs(
    brand: Optional[str] = None,
    model: Optional[str] = None,
    month: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(require_editor)
):
    """
    Get list of parsed lease programs
    
    Query params:
        brand: Filter by brand
        model: Filter by model  
        month: Filter by month
        region: Filter by region
        limit: Max results (default 100)
        
    Returns:
        List of parsed programs
    """
    try:
        from db_lease_programs import get_parsed_programs
        
        programs = await get_parsed_programs(
            db,
            brand=brand,
            model=model,
            month=month,
            region=region,
            limit=limit
        )
        
        return {
            "items": programs,
            "total": len(programs)
        }
        
    except Exception as e:
        logger.error(f"Get parsed programs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/lease-programs/parsed/{program_id}")
async def get_parsed_lease_program(
    program_id: str,
    current_user: User = Depends(require_editor)
):
    """
    Get a single parsed lease program by ID
    """
    try:
        from db_lease_programs import get_parsed_program
        
        program = await get_parsed_program(db, program_id)
        
        if not program:
            raise HTTPException(status_code=404, detail="Program not found")
        
        return program
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get parsed program error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/admin/lease-programs/parsed/{program_id}")
async def delete_parsed_lease_program(
    program_id: str,
    current_user: User = Depends(require_admin)
):
    """
    Delete a parsed lease program
    """
    try:
        from db_lease_programs import delete_parsed_program
        
        success = await delete_parsed_program(db, program_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Program not found")
        
        logger.info(f"Deleted parsed program: {program_id} by {current_user.email}")
        
        return {"ok": True, "id": program_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete parsed program error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# ==========================================
# PRO LEASE CALCULATOR PUBLIC ENDPOINTS
# ==========================================

@api_router.post("/lease/calculate")
async def calculate_lease_payment(request: dict, req: Request):
    """
    Calculate lease payment using parsed program data
    
    Public endpoint - no authentication required
    Rate limited: 20 requests per minute per IP
    
    Request body: LeaseCalculationRequest JSON
    Returns: LeaseCalculationResult JSON with detailed breakdown
    """
    try:
        from models_lease_programs import LeaseCalculationRequest
        from lease_calculator_pro import calculate_lease_pro
        from db_lease_programs import get_latest_parsed_program_for
        from rate_limiter import get_rate_limiter
        
        # Rate limiting
        client_ip = req.client.host
        limiter = get_rate_limiter()
        
        if not limiter.is_allowed(client_ip, max_requests=20, window_seconds=60):
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please slow down. Try again in a minute."
            )
        
        # Parse request
        try:
            calc_request = LeaseCalculationRequest(**request)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid request format: {str(e)}")
        
        # Fetch parsed program
        parsed_program = await get_latest_parsed_program_for(
            db,
            brand=calc_request.brand,
            model=calc_request.model,
            region=calc_request.region
        )
        
        if not parsed_program:
            raise HTTPException(
                status_code=404,
                detail=f"No lease program found for {calc_request.brand} {calc_request.model or ''} in {calc_request.region or 'any region'}"
            )
        
        # Calculate
        try:
            result = calculate_lease_pro(calc_request, parsed_program)
            return result.dict()
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lease calculation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Calculation failed: {str(e)}")


@api_router.get("/lease/brands-models")
async def get_brands_and_models():
    """
    Get available brands and models for calculator dropdown
    
    Public endpoint - no authentication required
    
    Returns:
        {
            "brands": [
                {"name": "Toyota", "models": ["Camry", "RAV4"]},
                {"name": "Honda", "models": ["Civic", "Accord"]}
            ]
        }
    """
    try:
        from db_lease_programs import get_available_brands_and_models
        
        data = await get_available_brands_and_models(db)
        return data
        
    except Exception as e:
        logger.error(f"Get brands/models error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# ==========================================
# FEATURED DEALS ENDPOINTS
# ==========================================

@api_router.post("/deals/create")
async def create_featured_deal(
    request: dict,
    current_user: User = Depends(require_admin)
):
    """
    Create a new featured deal with auto-calculation
    
    Admin-only endpoint
    
    Automatically calculates:
    - Monthly payment
    - Drive-off
    - One-pay
    - MF, Residual
    - Savings
    """
    try:
        from models_featured_deals import CreateDealRequest, FeaturedDeal
        from db_featured_deals import create_deal, update_calculated_fields
        from models_lease_programs import LeaseCalculationRequest
        from lease_calculator_pro import calculate_lease_pro
        from db_lease_programs import get_latest_parsed_program_for
        
        # Parse request
        try:
            create_request = CreateDealRequest(**request)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid request: {str(e)}")
        
        # Create initial deal
        deal_dict = create_request.dict()
        deal_id = await create_deal(db, deal_dict)
        
        # Run PRO calculator
        try:
            # Fetch parsed program
            parsed_program = await get_latest_parsed_program_for(
                db,
                brand=create_request.brand,
                model=create_request.model,
                region=create_request.region
            )
            
            if parsed_program:
                # Calculate
                calc_request = LeaseCalculationRequest(
                    brand=create_request.brand,
                    model=create_request.model,
                    msrp=create_request.msrp,
                    selling_price=create_request.selling_price,
                    term_months=create_request.term_months,
                    annual_mileage=create_request.annual_mileage,
                    region=create_request.region
                )
                
                calc_result = calculate_lease_pro(calc_request, parsed_program)
                
                # Update calculated fields
                calc_fields = {
                    "calculated_payment": calc_result.monthly_payment_with_tax,
                    "calculated_driveoff": calc_result.estimated_drive_off,
                    "calculated_onepay": calc_result.one_pay_estimated,
                    "mf_used": calc_result.mf_used,
                    "residual_percent_used": calc_result.residual_percent_used,
                    "savings_vs_msrp": calc_result.estimated_savings_vs_msrp_deal,
                    "tax_rate": calc_result.tax_rate,
                    "updated_at": datetime.now(timezone.utc)
                }
                
                await update_calculated_fields(db, deal_id, calc_fields)
                
                logger.info(f"Auto-calculated deal: {deal_id} - ${calc_result.monthly_payment_with_tax:.2f}/mo")
            else:
                logger.warning(f"No parsed program found for deal {deal_id}, calculations skipped")
        
        except Exception as e:
            logger.error(f"Auto-calculation failed for deal {deal_id}: {e}")
            # Continue without calculations
        
        # Auto-generate SEO and AI Summary
        try:
            from seo_ai_generator import auto_generate_metadata, get_image_fallback
            from db_featured_deals import get_deal
            
            # Get updated deal with calculated fields
            deal_with_calc = await get_deal(db, deal_id)
            
            # Apply fallback image if missing
            if not deal_with_calc.get('image_url'):
                fallback_img = get_image_fallback(deal_with_calc.get('brand'), deal_with_calc.get('model'))
                await update_calculated_fields(db, deal_id, {"image_url": fallback_img})
                deal_with_calc['image_url'] = fallback_img
            
            # Generate metadata
            updated_deal = auto_generate_metadata(deal_with_calc)
            
            # Save SEO and AI fields
            metadata_fields = {
                "seo": updated_deal.get('seo'),
                "ai_summary": updated_deal.get('ai_summary')
            }
            
            await update_calculated_fields(db, deal_id, metadata_fields)
            
            logger.info(f"Auto-generated SEO and AI metadata for deal: {deal_id}")
            
        except Exception as e:
            logger.error(f"SEO/AI generation failed for deal {deal_id}: {e}")
            # Continue without metadata
        
        # Return created deal
        from db_featured_deals import get_deal
        created_deal = await get_deal(db, deal_id)
        
        return {
            "ok": True,
            "deal_id": deal_id,
            "deal": created_deal
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create featured deal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/deals/list")
async def list_featured_deals(
    brand: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 100,
    sort: str = "created_at"
):
    """
    List featured deals (public endpoint)
    
    Query params:
        brand: Filter by brand
        region: Filter by region
        limit: Max results (default 100)
        sort: Sort by field (created_at, calculated_payment)
    """
    try:
        from db_featured_deals import list_deals
        
        # Determine sort order based on field
        sort_order = 1 if sort == "calculated_payment" else -1
        
        deals = await list_deals(
            db,
            brand=brand,
            region=region,
            limit=limit,
            sort_by=sort,
            sort_order=sort_order
        )
        
        return {
            "deals": deals,
            "total": len(deals)
        }
        
    except Exception as e:
        logger.error(f"List deals error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/deals/{deal_id}")
async def get_featured_deal(deal_id: str):
    """
    Get a single featured deal (public endpoint)
    """
    try:
        from db_featured_deals import get_deal
        
        deal = await get_deal(db, deal_id)
        
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        return deal
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get deal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/deals/{deal_id}")
async def delete_featured_deal(
    deal_id: str,
    current_user: User = Depends(require_admin)
):
    """
    Delete a featured deal (admin-only)
    """
    try:
        from db_featured_deals import delete_deal
        
        success = await delete_deal(db, deal_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        logger.info(f"Deleted deal: {deal_id} by {current_user.email}")
        
        return {"ok": True, "id": deal_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete deal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))



# ==========================================
# AUTO SYNC ENGINE ENDPOINTS
# ==========================================

@api_router.post("/admin/sync/run")
async def run_sync_engine(current_user: User = Depends(require_admin)):
    """
    Run AutoSync Engine manually
    
    Scans for updated lease programs and recalculates affected deals
    """
    try:
        from auto_sync_engine import run_auto_sync
        
        logger.info(f"AutoSync triggered by {current_user.email}")
        
        result = await run_auto_sync(db)
        
        return {
            "ok": True,
            "programs_updated": result["programs_updated"],
            "deals_recalculated": result["deals_recalculated"],
            "logs_created": result["logs_created"],
            "changes": result["changes"]
        }
        
    except Exception as e:
        logger.error(f"Sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/sync/recalculate-all")
async def recalculate_all_deals(current_user: User = Depends(require_admin)):
    """
    Forcefully recalculate all Featured Deals
    
    Useful when:
    - New lease programs are uploaded
    - Calculator logic is updated
    - Manual sync needed
    """
    try:
        from auto_sync_engine import full_recalculate_all_deals
        
        logger.info(f"Full recalculation triggered by {current_user.email}")
        
        result = await full_recalculate_all_deals(db)
        
        return {
            "ok": True,
            "total": result["total"],
            "success": result["success"],
            "failed": result["failed"],
            "failed_deals": result["failed_deals"]
        }
        
    except Exception as e:
        logger.error(f"Recalculate all error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/sync/logs")
async def get_sync_logs(
    limit: int = 50,
    current_user: User = Depends(require_editor)
):
    """
    Get AutoSync logs history
    """
    try:
        logs = await db.auto_sync_logs.find(
            {},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        # Ensure logs is always a list
        if logs is None:
            logs = []
        
        return {
            "logs": logs,
            "total": len(logs)
        }
        
    except Exception as e:
        logger.error(f"Get sync logs error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ANALYTICS ENDPOINTS
# ==========================================

@api_router.get("/admin/analytics/overview")
async def get_analytics_overview(current_user: User = Depends(require_editor)):
    """Get analytics overview for Featured Deals (cached 5 min)"""
    try:
        from analytics_service import get_deals_overview
        from simple_cache import get_analytics_cache
        
        cache = get_analytics_cache()
        cache_key = "analytics_overview"
        
        # Try cache first
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Compute
        overview = await get_deals_overview(db)
        
        # Cache for 5 minutes
        cache.set(cache_key, overview, ttl_seconds=300)
        
        return overview
        
    except Exception as e:
        logger.error(f"Analytics overview error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/analytics/top-brands-models")
async def get_top_brands_models_analytics(
    limit: int = 10,
    current_user: User = Depends(require_editor)
):
    """Get top brands and models by deal count"""
    try:
        from analytics_service import get_top_brands_models
        
        top = await get_top_brands_models(db, limit=limit)
        return {"items": top, "total": len(top)}
        
    except Exception as e:
        logger.error(f"Top brands/models error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/analytics/distribution")
async def get_distribution_analytics(current_user: User = Depends(require_editor)):
    """Get distribution by banks, terms, mileage"""
    try:
        from analytics_service import (
            get_distribution_by_banks,
            get_distribution_by_terms,
            get_distribution_by_mileage
        )
        
        banks = await get_distribution_by_banks(db)
        terms = await get_distribution_by_terms(db)
        mileage = await get_distribution_by_mileage(db)
        
        return {
            "by_bank": banks,
            "by_term": terms,
            "by_mileage": mileage
        }
        
    except Exception as e:
        logger.error(f"Distribution analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/analytics/summary")
async def get_full_analytics_summary_endpoint(current_user: User = Depends(require_editor)):
    """
    Get complete analytics summary (cached 5 min)
    
    Returns all analytics sections for dashboard:
    - Payments distribution
    - Avg payment per brand
    - Deals timeline
    - Program changes trend
    """
    try:
        from analytics_engine import get_full_analytics_summary
        from simple_cache import get_analytics_cache
        
        cache = get_analytics_cache()
        cache_key = "analytics_full_summary"
        
        # Try cache first
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        # Compute
        summary = await get_full_analytics_summary(db)
        
        # Cache for 5 minutes
        cache.set(cache_key, summary, ttl_seconds=300)
        
        return summary
        
    except Exception as e:
        logger.error(f"Analytics summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/analytics/trends")
async def get_payment_trends_analytics(
    days: int = 30,
    current_user: User = Depends(require_editor)
):
    """Get payment trends over time"""
    try:
        from analytics_service import get_payment_trends
        
        trends = await get_payment_trends(db, days=days)
        return {"trends": trends, "period_days": days}
        
    except Exception as e:
        logger.error(f"Payment trends error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# SETTINGS ENDPOINTS



# ==========================================
# NOTIFICATIONS ENDPOINTS (PHASE 7)
# ==========================================

@api_router.get("/admin/notifications")
async def get_notifications(current_user: User = Depends(require_editor)):
    """Get all in-app notifications"""
    try:
        from notifications import load_notifications_from_file
        
        notifications = load_notifications_from_file()
        unread = [n for n in notifications if not n.get("read", False)]
        
        return {
            "notifications": notifications,
            "total": len(notifications),
            "unread": len(unread)
        }
        
    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/notifications/mark-read")
async def mark_notifications_read(current_user: User = Depends(require_admin)):
    """Mark all notifications as read"""
    try:
        from notifications import mark_all_notifications_read
        
        success = mark_all_notifications_read()
        
        if success:
            return {"ok": True, "message": "All notifications marked as read"}
        else:
            raise HTTPException(status_code=500, detail="Failed to mark notifications as read")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mark notifications error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# AI DEAL GENERATOR (PHASE 8)
# ==========================================

@api_router.post("/admin/ai/generate")
async def generate_deal_content(
    deal_id: str,
    mode: str = "full",
    current_user: User = Depends(require_editor)
):
    """
    Generate AI content for a deal
    
    Args:
        deal_id: Featured deal ID
        mode: "short", "long", "cta", "seo", "full"
        
    Returns:
        Generated content based on mode
    """
    try:
        from ai_tools import (
            generate_short_post,
            generate_long_description,
            generate_cta,
            generate_seo,
            generate_full_bundle
        )
        from db_featured_deals import get_deal
        
        # Get deal
        deal = await get_deal(db, deal_id)
        
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        # Generate based on mode
        if mode == "short":
            content = generate_short_post(deal)
        elif mode == "long":
            content = generate_long_description(deal)
        elif mode == "cta":
            content = generate_cta(deal)
        elif mode == "seo":
            content = generate_seo(deal)
        elif mode == "full":
            content = generate_full_bundle(deal)
        else:
            raise HTTPException(status_code=400, detail="Invalid mode")
        
        return {
            "ok": True,
            "content": content,
            "mode": mode
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# MEDIA MANAGER (PHASE 9)
# ==========================================

@api_router.post("/admin/media/upload")
async def upload_media_file(
    file: UploadFile,
    current_user: User = Depends(require_editor)
):
    """Upload media file to internal storage"""
    try:
        from media_manager import upload_media
        
        # Read file
        content = await file.read()
        
        # Upload
        media_entry = upload_media(
            file_content=content,
            filename=file.filename,
            uploaded_by=current_user.email
        )
        
        return {
            "ok": True,
            "media": media_entry
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Media upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/media/list")
async def list_media_files(
    limit: int = 100,
    current_user: User = Depends(require_editor)
):
    """Get list of uploaded media"""
    try:
        from media_manager import list_media, get_media_stats
        
        media_list = list_media(limit=limit)
        stats = get_media_stats()
        
        return {
            "media": media_list,
            "total": len(media_list),
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"List media error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/admin/media/{media_id}")
async def delete_media_file(
    media_id: str,
    current_user: User = Depends(require_admin)
):
    """Delete media file"""
    try:
        from media_manager import delete_media
        
        success = delete_media(media_id)
        
        if success:
            return {"ok": True, "message": "Media deleted"}
        else:
            raise HTTPException(status_code=404, detail="Media not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Media delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# COMPARISON ENGINE (PHASE 10)
# ==========================================

@api_router.post("/compare")
async def compare_deals_endpoint(request: dict, req: Request):
    """
    Compare up to 3 deals side-by-side
    Rate limited: 10 requests per 10 seconds per IP
    
    Request: {"deal_ids": ["id1", "id2", "id3"]}
    Returns: Comparison data with best value indicators
    """
    try:
        from comparison_engine import compare_deals, get_comparison_summary
        from db_featured_deals import get_deal
        from rate_limiter import get_rate_limiter
        
        # Rate limiting
        client_ip = req.client.host
        limiter = get_rate_limiter()
        
        if not limiter.is_allowed(client_ip, max_requests=10, window_seconds=10):
            raise HTTPException(
                status_code=429,
                detail="Too many comparison requests. Please slow down."
            )
        
        # Extract deal_ids from request
        deal_ids = request.get("deal_ids", [])
        
        # Validate
        if not deal_ids or len(deal_ids) > 3:
            raise HTTPException(
                status_code=400,
                detail="Must provide 1-3 deal IDs for comparison"
            )
        
        # Fetch deals
        deals = []
        for deal_id in deal_ids:
            deal = await get_deal(db, deal_id)
            if deal:
                deals.append(deal)
        
        if not deals:
            raise HTTPException(status_code=404, detail="No deals found")
        
        # Compare
        comparison = compare_deals(deals)
        summary = get_comparison_summary(deals)
        
        return {
            "ok": True,
            "comparison": comparison,
            "summary": summary
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Comparison error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# SEARCH ENGINE (PHASE 11)
# ==========================================

@api_router.get("/search")
async def search_deals_endpoint(q: str = "", limit: int = 20, req: Request = None):
    """
    Full-text search across Featured Deals
    Rate limited: 10 requests per 10 seconds per IP
    
    Query params:
        q: Search query (brand, model, trim, bank, or payment range)
        limit: Max results (default 20)
        
    Returns:
        List of matching deals
    """
    try:
        from search_engine import search_deals, get_index_status, index_deals
        from rate_limiter import get_rate_limiter
        
        # Rate limiting
        if req:
            client_ip = req.client.host
            limiter = get_rate_limiter()
            
            if not limiter.is_allowed(client_ip, max_requests=10, window_seconds=10):
                raise HTTPException(
                    status_code=429,
                    detail="Too many search requests. Please slow down."
                )
        
        # Sanitize query
        q = q.strip()[:64]  # Max 64 chars
        
        # Build index if not built
        status = get_index_status()
        if not status["built"]:
            logger.info("Building search index on first search request...")
            await index_deals(db)
        
        # Search
        results = search_deals(q, max_results=limit)
        
        return {
            "results": results,
            "total": len(results),
            "query": q
        }
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# AI FEEDS (SEO + AI INDEXING)
# ==========================================

@api_router.get("/feed/deals.json")
async def get_deals_json_feed():
    """JSON feed for AI indexing (public)"""
    try:
        from ai_feed_generator import generate_deals_json_feed
        
        deals = await generate_deals_json_feed(db)
        
        return {
            "items": deals,
            "total": len(deals),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"JSON feed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/feed/deals-ai.json")
async def get_deals_ai_feed():
    """Enhanced AI feed (public)"""
    try:
        from ai_feed_generator import generate_deals_ai_feed
        
        feed = await generate_deals_ai_feed(db)
        return feed
        
    except Exception as e:
        logger.error(f"AI feed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/feed/deals.xml")
async def get_deals_xml_feed():
    """XML feed for RSS readers (public)"""
    try:
        from ai_feed_generator import generate_deals_json_feed, generate_deals_xml_feed
        from fastapi.responses import Response
        
        deals = await generate_deals_json_feed(db)
        xml_content = generate_deals_xml_feed(deals)
        
        return Response(content=xml_content, media_type="application/xml")
        
    except Exception as e:
        logger.error(f"XML feed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))




# ==========================================
# SCRAPER INTEGRATION
# ==========================================

@api_router.post("/admin/import-offer")
async def import_scraped_offer(
    offer_data: dict,
    current_user: User = Depends(require_admin)
):
    """
    Import offer from scraper
    Auto-creates or updates offer in database
    """
    try:
        # Map scraper data to our schema
        car_data = {
            "title": offer_data.get("title", ""),
            "make": offer_data.get("make", ""),
            "model": offer_data.get("model", ""),
            "year": offer_data.get("year", 2025),
            "trim": offer_data.get("trim", ""),
            "msrp": offer_data.get("msrp", 0),
            "discount": offer_data.get("incentives", 0),
            "description": offer_data.get("title", ""),
            "image": offer_data.get("imageUrl", ""),
            "images": [{"url": offer_data.get("imageUrl", ""), "alt": offer_data.get("title", "")}],
            "lease": {
                "monthly": offer_data.get("monthlyPayment", 0),
                "dueAtSigning": offer_data.get("downPayment", 0),
                "termMonths": offer_data.get("termMonths", 36),
                "milesPerYear": offer_data.get("mileagePerYear", 10000)
            },
            "specs": {
                "make": offer_data.get("make", ""),
                "model": offer_data.get("model", ""),
                "year": offer_data.get("year", 2025)
            },
            "status": "active",
            "source": "autobandit",
            "sourceId": offer_data.get("id", "")
        }
        
        # Create in database
        from database import get_database
        db_instance = get_database()
        
        # Check if exists by sourceId
        existing = await db_instance.cars.find_one({"sourceId": car_data["sourceId"]})
        
        if existing:
            # Update
            await db_instance.cars.update_one(
                {"sourceId": car_data["sourceId"]},
                {"$set": car_data}
            )
            car_id = str(existing["_id"])
            action = "updated"
        else:
            # Insert
            result = await db_instance.cars.insert_one(car_data)
            car_id = str(result.inserted_id)
            action = "created"
        
        logger.info(f"Imported offer from scraper: {car_data['make']} {car_data['model']} - {action}")
        
        return {
            "ok": True,
            "id": car_id,
            "action": action
        }
        
    except Exception as e:
        logger.error(f"Import offer error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# SCRAPER CONTROL ENDPOINTS



@api_router.post("/admin/offers")
async def create_offer_manual(
    offer_data: dict,
    current_user: User = Depends(require_admin)
):
    """
    Create offer manually from admin panel
    Simplified - does not require all calculator fields
    """
    try:
        logger.info(f"Creating manual offer by {current_user.email}")
        logger.debug(f"Offer data: {offer_data}")
        
        # Extract required fields
        title = offer_data.get("title", "")
        make = offer_data.get("make", "")
        model = offer_data.get("model", "")
        year = offer_data.get("year", 2025)
        msrp = offer_data.get("msrp", 0)
        
        # Validate required fields
        if not all([title, make, model, year, msrp]):
            return {
                "success": False,
                "error": "Required fields missing: title, make, model, year, msrp"
            }
        
        # Process images if provided
        images_list = offer_data.get("images", [])
        if not images_list and offer_data.get("image"):
            images_list = [offer_data["image"]]
        
        # Image validation
        if not images_list:
            return {
                "success": False,
                "error": "At least 1 image is required"
            }
        
        # Prepare car data
        car_data = {
            "title": title,
            "make": make,
            "model": model,
            "year": year,
            "trim": offer_data.get("trim", ""),
            "vin": offer_data.get("vin", ""),
            "msrp": msrp,
            "discount": offer_data.get("discount", 0),
            "description": offer_data.get("description", ""),
            "image": images_list[0] if images_list else "",
            "images": [{"url": url, "alt": title} for url in images_list],
            "lease": offer_data.get("lease", {
                "monthly": 0,
                "dueAtSigning": 0,
                "termMonths": 36,
                "milesPerYear": 10000
            }),
            "specs": offer_data.get("specs", {
                "make": make,
                "model": model,
                "year": year
            }),
            "seo": offer_data.get("seo", {}),
            "status": offer_data.get("status", "active"),
            "source": offer_data.get("source", "manual")
        }
        
        # Generate slug if not provided
        if not car_data.get("slug"):
            slug = f"{year}-{make}-{model}".lower().replace(" ", "-")
            car_data["slug"] = slug
        
        # Save to database
        from database import get_database
        db_instance = get_database()
        
        result = await db_instance.cars.insert_one(car_data)
        offer_id = str(result.inserted_id)
        
        logger.info(f"Created offer: {offer_id} - {title}")
        
        # Try to process images (non-blocking)
        image_warning = None
        try:
            from image_processor import process_offer_images
            processed = process_offer_images(offer_id, images_list)
            logger.info(f"Processed {len(processed)} images")
        except Exception as img_err:
            logger.warning(f"Image processing failed (non-critical): {img_err}")
            image_warning = "Image processing failed, using original URLs"
        
        return {
            "success": True,
            "offerId": offer_id,
            "warning": image_warning
        }
        
    except Exception as e:
        logger.error(f"Create offer error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@api_router.delete("/admin/offers/delete-all")
async def delete_all_offers(
    confirm: str = "no",
    current_user: User = Depends(require_admin)
):
    """
    DANGER: Delete ALL offers from ALL collections
    Requires confirm="yes" parameter
    """
    if confirm != "yes":
        raise HTTPException(
            status_code=400, 
            detail="Must confirm with ?confirm=yes parameter"
        )
    
    try:
        from database import get_database
        db = get_database()
        
        # Delete from all collections
        result_lots = await db.lots.delete_many({})
        result_cars = await db.cars.delete_many({})
        result_featured = await db.featured_deals.delete_many({})
        
        total = result_lots.deleted_count + result_cars.deleted_count + result_featured.deleted_count
        
        logger.warning(f"MASS DELETE by {current_user.email}: {total} offers deleted")
        
        return {
            "ok": True,
            "deleted": {
                "lots": result_lots.deleted_count,
                "cars": result_cars.deleted_count,
                "featured_deals": result_featured.deleted_count,
                "total": total
            }
        }
        
    except Exception as e:
        logger.error(f"Mass delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/admin/offers/{offer_id}")
async def delete_single_offer(
    offer_id: str,
    current_user: User = Depends(require_admin)
):
    """Delete single offer by ID"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        # Try to convert to ObjectId
        try:
            oid = ObjectId(offer_id)
            query = {"_id": oid}
        except:
            # If not valid ObjectId, try as string id
            query = {"id": offer_id}
        
        # Try deleting from all collections
        deleted = False
        
        result = await db.lots.delete_one(query)
        if result.deleted_count > 0:
            deleted = True
            logger.info(f"Deleted from lots: {offer_id}")
        
        if not deleted:
            result = await db.cars.delete_one(query)
            if result.deleted_count > 0:
                deleted = True
                logger.info(f"Deleted from cars: {offer_id}")
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        return {"ok": True, "id": offer_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete offer error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/offers/{offer_id}")
async def get_offer_for_edit(offer_id: str, current_user: User = Depends(require_editor)):
    """Get offer for editing in admin panel"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        # Try ObjectId
        try:
            oid = ObjectId(offer_id)
            offer = await db.cars.find_one({"_id": oid})
        except:
            offer = await db.cars.find_one({"id": offer_id})
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        # Convert _id to string
        if offer.get('_id'):
            offer['id'] = str(offer['_id'])
            del offer['_id']
        
        return offer
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get offer for edit error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/admin/offers/{offer_id}")
async def update_offer(
    offer_id: str,
    offer_data: dict,
    current_user: User = Depends(require_admin)
):
    """Update existing offer"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        # Remove id fields to avoid conflicts
        offer_data.pop('_id', None)
        offer_data.pop('id', None)
        
        # Try ObjectId
        try:
            oid = ObjectId(offer_id)
            result = await db.cars.update_one(
                {"_id": oid},
                {"$set": offer_data}
            )
        except:
            result = await db.cars.update_one(
                {"id": offer_id},
                {"$set": offer_data}
            )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        logger.info(f"Updated offer: {offer_id}")
        
        return {
            "success": True,
            "offerId": offer_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update offer error: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# ==========================================
# SCRAPER CONTROL ENDPOINTS
# ==========================================

        
        return {
            "success": True,
            "offerId": offer_id,
            "warning": image_warning
        }
        
    except Exception as e:
        logger.error(f"Create offer error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }

# ==========================================

@api_router.get("/admin/scraper/status")
async def get_scraper_status(current_user: User = Depends(require_admin)):
    """Get scraper status and stats"""
    try:
        import os
        import json
        from pathlib import Path
        
        scraper_dir = Path("/app/scraper")
        state_file = scraper_dir / "state" / "lastRun.json"
        log_file = scraper_dir / "logs" / "scraper.log"
        
        # Read last run data
        last_run_data = {}
        if state_file.exists():
            try:
                with open(state_file) as f:
                    last_run_data = json.load(f)
            except:
                pass
        
        # Read recent logs
        recent_logs = []
        if log_file.exists():
            try:
                with open(log_file) as f:
                    lines = f.readlines()
                    for line in lines[-10:]:  # Last 10 lines
                        try:
                            log_entry = json.loads(line)
                            recent_logs.append(log_entry)
                        except:
                            recent_logs.append({
                                "timestamp": "",
                                "message": line.strip()
                            })
            except:
                pass
        
        return {
            "running": False,  # TODO: Check if process is actually running
            "lastRun": last_run_data.get("timestamp"),
            "totalScraped": last_run_data.get("scrapedCount", 0),
            "totalImported": last_run_data.get("updates", {}).get("imported", 0),
            "recentLogs": recent_logs
        }
        
    except Exception as e:
        logger.error(f"Scraper status error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/scraper/run")
async def run_scraper(
    force: bool = False,
    brands: str = "all",
    current_user: User = Depends(require_admin)
):
    """
    Run scraper - Python version for production compatibility
    """
    try:
        import subprocess
        import os
        from pathlib import Path
        
        # Use Python scraper (works in production)
        scraper_script = Path("/app/backend/autobandit_scraper_python.py")
        
        if scraper_script.exists():
            logger.info("Using Python scraper (production compatible)")
            
            # Run Python scraper
            env = os.environ.copy()
            env["HUNTER_API_URL"] = os.getenv("BACKEND_URL", "http://localhost:8001")
            
            # Get admin token
            token = create_access_token(data={"sub": current_user.email, "role": current_user.role})
            env["HUNTER_ADMIN_TOKEN"] = token
            
            process = subprocess.Popen(
                ["python3", str(scraper_script)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                start_new_session=True
            )
            
            logger.info(f"Python scraper started with PID: {process.pid}")
            
            return {
                "ok": True,
                "message": "Python scraper started (production mode)",
                "pid": process.pid,
                "mode": "python"
            }
        else:
            # Fallback: Try Node scraper (development only)
            scraper_dir = Path("/app/scraper")
            run_script = scraper_dir / "run.js"
            
            if not run_script.exists():
                raise HTTPException(status_code=404, detail="Scraper not found")
            
            cmd = ["node", str(run_script)]
            if force:
                cmd.append("--force")
            
            env = os.environ.copy()
            env["SELECTED_BRANDS"] = brands
            
            process = subprocess.Popen(
                cmd,
                cwd=str(scraper_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                start_new_session=True
            )
            
            return {
                "ok": True,
                "message": "Node scraper started (development mode)",
                "pid": process.pid,
                "mode": "nodejs"
            }
        
    except Exception as e:
        logger.error(f"Scraper run error: {e}")
        
        # Log error
        try:
            error_log = json.dumps({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": "error",
                "message": str(e)
            })
            
            log_file = Path("/app/scraper/logs/scraper.log")
            log_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(log_file, 'a') as f:
                f.write(error_log + "\n")
        except:
            pass
        
        raise HTTPException(status_code=500, detail=str(e))

        
        return {
            "ok": True,
            "id": car_id,
            "action": action
        }
        
    except Exception as e:
        logger.error(f"Import offer error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# COMPARISON ENGINE (PHASE 10)
# ==========================================

# ==========================================
# MULTI-BRAND SYNC (PHASE 12)
# ==========================================

@api_router.get("/admin/sync/brands")
async def get_brand_sync_status(current_user: User = Depends(require_editor)):
    """Get sync status for all supported brands"""
    try:
        from auto_sync_multi import get_supported_brands, get_brand_status
        
        brands = get_supported_brands()
        
        statuses = []
        for brand in brands:
            status = await get_brand_status(db, brand)
            statuses.append(status)
        
        return {
            "brands": statuses,
            "total": len(statuses)
        }
        
    except Exception as e:
        logger.error(f"Get brands error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/sync/run-brand")
async def run_brand_sync(brand: str, current_user: User = Depends(require_admin)):
    """
    Run sync for specific brand
    
    Query param: brand (e.g., "Toyota")
    """
    try:
        from auto_sync_multi import run_sync_for_brand
        
        result = await run_sync_for_brand(db, brand)
        
        return {
            "ok": True,
            **result
        }
        
    except Exception as e:
        logger.error(f"Brand sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/sync/run-all-brands")
async def run_all_brands_sync(current_user: User = Depends(require_admin)):
    """Run sync for all supported brands"""
    try:
        from auto_sync_multi import run_all_brand_syncs
        
        result = await run_all_brand_syncs(db)
        
        return {
            "ok": True,
            **result
        }
        
    except Exception as e:
        logger.error(f"All brands sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# COMPARISON ENGINE (PHASE 10)

@api_router.get("/admin/settings")
async def get_system_settings(current_user: User = Depends(require_admin)):
    """Get system settings"""
    try:
        from db_settings import get_settings, initialize_default_settings
        
        # Initialize if not exists
        await initialize_default_settings(db)
        
        settings = await get_settings(db)
        return settings or {}
        
    except Exception as e:
        logger.error(f"Get settings error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/admin/settings")
async def update_system_settings(
    updates: dict,
    current_user: User = Depends(require_admin)
):
    """Update system settings"""
    try:
        from db_settings import update_settings
        
        success = await update_settings(db, updates, updated_by=current_user.email)
        
        if success:
            from db_settings import get_settings
            updated = await get_settings(db)
            return {"ok": True, "settings": updated}
        else:
            raise HTTPException(status_code=500, detail="Failed to update settings")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update settings error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/admin/sync/stats")
async def get_sync_stats(current_user: User = Depends(require_editor)):
    """
    Get AutoSync statistics
    
    Returns:
        - Total parsed programs
        - Total featured deals
        - Last sync time
        - Deals updated in last sync
    """
    try:
        # Count programs
        programs_count = await db.lease_programs_parsed.count_documents({})
        
        # Count deals
        deals_count = await db.featured_deals.count_documents({})
        
        # Get last sync log
        last_sync = await db.auto_sync_logs.find_one(
            {},
            {"_id": 0},
            sort=[("timestamp", -1)]
        )
        
        return {
            "total_programs": programs_count,
            "total_deals": deals_count,
            "last_sync_time": last_sync.get("timestamp") if last_sync else None,
            "last_sync_deals_updated": last_sync.get("deals_count", 0) if last_sync else 0
        }
        
    except Exception as e:
        logger.error(f"Get sync stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))







@api_router.post("/ab-test/{test_name}/convert")
async def track_ab_conversion(
    test_name: str,
    user_id: str,
    variant: str,
    action: str
):
    """Track conversion for A/B test"""
    try:
        import sys
        sys.path.append('/app/backend')
        from ab_testing import track_conversion
        
        result = track_conversion(test_name, variant, user_id, action)
        
        # Also save to database
        from database import get_database
        db = get_database()
        
        await db.ab_conversions.insert_one({
            "test_name": test_name,
            "variant": variant,
            "user_id": user_id,
            "action": action,
            "timestamp": datetime.now(timezone.utc)
        })
        
        return {"ok": True, "message": "Conversion tracked"}
        
    except Exception as e:
        logger.error(f"Track conversion error: {e}")
        return {"ok": False}


# ==========================================
# OFFERS ENDPOINTS (ESSENTIAL ONLY)
# ==========================================

@api_router.get("/cars")
async def get_public_cars():
    """Get all offers from cars collection"""
    try:
        from database import get_database
        db = get_database()
        
        cars_cursor = db.cars.find({})
        cars = await cars_cursor.to_list(length=200)
        
        for car in cars:
            if car.get('_id'):
                car['id'] = str(car['_id'])
                del car['_id']
        
        logger.info(f"Returning {len(cars)} offers")
        return cars
    except Exception as e:
        logger.error(f"Get cars error: {e}")
        return []


@api_router.get("/cars/{car_id}")
async def get_car_by_id(car_id: str):
    """Get single car by ID for detail page"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        try:
            oid = ObjectId(car_id)
            car = await db.cars.find_one({"_id": oid})
        except:
            car = await db.cars.find_one({"id": car_id})
        
        if not car:
            raise HTTPException(status_code=404, detail="Car not found")
        
        if car.get('_id'):
            car['id'] = str(car['_id'])
            del car['_id']
        
        return car
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get car error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/admin/offers")
async def create_offer_manual(offer_data: dict, current_user: User = Depends(require_admin)):
    """Create offer manually"""
    try:
        from database import get_database
        db = get_database()
        
        logger.info(f"Creating offer: {offer_data.get('title')}")
        
        result = await db.cars.insert_one(offer_data)
        offer_id = str(result.inserted_id)
        
        logger.info(f"Created: {offer_id}")
        
        return {"success": True, "offerId": offer_id}
    except Exception as e:
        logger.error(f"Create error: {e}")
        return {"success": False, "error": str(e)}


@api_router.get("/admin/offers/{offer_id}")
async def get_offer_for_edit(offer_id: str, current_user: User = Depends(require_editor)):
    """Get offer for editing"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        try:
            oid = ObjectId(offer_id)
            offer = await db.cars.find_one({"_id": oid})
        except:
            offer = await db.cars.find_one({"id": offer_id})
        
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        if offer.get('_id'):
            offer['id'] = str(offer['_id'])
            del offer['_id']
        
        return offer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/admin/offers/{offer_id}")
async def update_offer(offer_id: str, offer_data: dict, current_user: User = Depends(require_admin)):
    """Update offer"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        offer_data.pop('_id', None)
        offer_data.pop('id', None)
        
        try:
            oid = ObjectId(offer_id)
            result = await db.cars.update_one({"_id": oid}, {"$set": offer_data})
        except:
            result = await db.cars.update_one({"id": offer_id}, {"$set": offer_data})
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        
        return {"success": True, "offerId": offer_id}
    except HTTPException:
        raise
    except Exception as e:
        return {"success": False, "error": str(e)}


@api_router.delete("/admin/offers/{offer_id}")
async def delete_offer(offer_id: str, current_user: User = Depends(require_admin)):
    """Delete single offer"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        try:
            oid = ObjectId(offer_id)
            result = await db.cars.delete_one({"_id": oid})
        except:
            result = await db.cars.delete_one({"id": offer_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Not found")
        
        return {"ok": True, "id": offer_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.delete("/admin/offers/delete-all")
async def delete_all_offers(confirm: str = "no", current_user: User = Depends(require_admin)):
    """Delete all offers - DANGER"""
    if confirm != "yes":
        raise HTTPException(status_code=400, detail="Must confirm")
    
    try:
        from database import get_database
        db = get_database()
        
        result = await db.cars.delete_many({})
        
        logger.warning(f"Mass delete: {result.deleted_count} offers")
        
        return {"ok": True, "deleted": result.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Include app with API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)
