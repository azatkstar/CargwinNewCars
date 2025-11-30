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


# WebSocket setup
from websocket_manager import sio
# Mount Socket.IO to FastAPI app
app.mount('/ws', socketio.ASGIApp(sio))
logger.info("WebSocket server mounted at /ws")

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize all application components"""
    try:
        # Setup logging first
        setup_logging(settings.LOG_LEVEL, settings.LOG_FORMAT)
        logger.info(f"Starting CargwinNewCar API v{settings.PROJECT_VERSION} in {settings.ENVIRONMENT} mode")
        
        # Initialize database
        await connect_to_mongo()
        await initialize_repositories()
        logger.info("Database connections established")
        
        # Initialize performance components
        await initialize_performance()
        logger.info("Performance optimization initialized")
        
        # Start background tasks for auto-archiving
        from background_tasks import start_background_tasks
        await start_background_tasks()
        logger.info("Background tasks started")
        
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
        return {"ok": True, "id": program.id, "program": program_dict}
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
        logger.error(f"Conversion tracking error: {e}")
        return {"ok": False, "error": str(e)}


@api_router.get("/ab-test/{test_name}")
async def get_ab_variant(
    test_name: str,
    user_id: Optional[str] = None
):
    """Get A/B test variant for user"""
    try:
        import sys
        sys.path.append('/app/backend')
        from ab_testing import get_ab_test
        
        # Use user_id or generate random for anonymous
        uid = user_id or str(uuid.uuid4())
        
        variant = get_ab_test(test_name, uid)
        
        if variant:
            return variant
        else:
            raise HTTPException(status_code=404, detail="Test not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"A/B test error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get variant")


@api_router.post("/admin/lots/from-template")
async def create_lot_from_template(
    make: str,
    model: str,
    year: int,
    trim: str,
    lot_repo: LotRepository = Depends(get_lots_repo),
    current_user: User = Depends(require_editor)
):
    """Create lot from model template"""
    try:
        import sys
        sys.path.append('/app/backend')
        from model_templates import get_model_template
        
        template = get_model_template(make, model)
        
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        # Create lot with template data
        lot_data = {
            "make": make,
            "model": model,
            "year": year,
            "trim": trim,
            "msrp": template["msrp_range"][0],  # Use minimum MSRP as default
            "discount": 0,
            "dealer_addons": 5000,  # Default
            "images": [{"url": template["image_url"], "alt": f"{year} {make} {model}"}],
            "lease": {
                "monthly": 0,  # Will be calculated
                "dueAtSigning": 1580,
                "termMonths": 36,
                "milesPerYear": 10000
            },
            "finance": {
                "apr": template["money_factor_base"] * 2400,  # Convert MF to APR
                "termMonths": 60,
                "downPayment": 3000
            },
            "status": "draft",
            "template_used": f"{make} {model}"
        }
        
        lot_id = await lot_repo.create_lot(lot_data)
        
        logger.info(f"Lot created from template: {make} {model} by {current_user.email}")
        
        return {
            "ok": True,
            "lot_id": lot_id,
            "message": f"Lot created from {make} {model} template"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create from template error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create lot")

        raise HTTPException(status_code=500, detail="Failed to create lot")

@api_router.get("/admin/lots/{lot_id}")
async def get_lot(
    lot_id: str, 
    lot_repo: LotRepository = Depends(get_lots_repo),
    current_user: User = Depends(require_auth)  # Any authenticated user can view
):
    """Get single lot for editing"""
    try:
        lot = await lot_repo.get_lot_by_id(lot_id)
        if not lot:
            raise HTTPException(status_code=404, detail=f"Lot {lot_id} not found")
            
        logger.info(f"Retrieved lot: {lot_id} by {current_user.email}")
        return lot
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get lot error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch lot")

@api_router.patch("/admin/lots/{lot_id}")
async def update_lot(
    lot_id: str, 
    lot_data: dict,
    lot_repo: LotRepository = Depends(get_lots_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo),
    current_user: User = Depends(require_editor)  # Require editor role or higher
):
    """Update existing lot"""
    try:
        logger.info(f"Updating lot: {lot_id} by {current_user.email}")
        
        # Get existing lot to compare changes
        existing_lot = await lot_repo.get_lot_by_id(lot_id)
        if not existing_lot:
            raise HTTPException(status_code=404, detail=f"Lot {lot_id} not found")
        
        # Ensure positive values for prices
        if 'msrp' in lot_data:
            lot_data['msrp'] = max(0, lot_data['msrp'])
        if 'discount' in lot_data:
            lot_data['discount'] = max(0, lot_data['discount'])
        if 'feesHint' in lot_data:
            lot_data['fees_hint'] = max(0, lot_data.pop('feesHint'))
        
        # Update lot in database
        success = await lot_repo.update_lot(lot_id, lot_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update lot")
        
        # Get updated lot
        updated_lot = await lot_repo.get_lot_by_id(lot_id)
        
        # Log audit trail
        await audit_repo.log_action({
            "user_email": current_user.email,
            "action": "update",
            "resource_type": "lot",
            "resource_id": lot_id,
            "changes": lot_data
        })
        
        return {
            "ok": True,
            "message": "Lot updated successfully",
            "data": updated_lot
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update lot error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update lot")

@api_router.get("/admin/lots/export/csv")
async def export_lots_csv(
    status: Optional[str] = None,
    lot_repo: LotRepository = Depends(get_lots_repo),
    current_user: User = Depends(require_editor)
):
    """Export all lots to CSV"""
    try:
        import pandas as pd
        from fastapi.responses import StreamingResponse
        import io
        
        # Get all lots
        lots = await lot_repo.get_lots(skip=0, limit=1000, status=status)
        
        if not lots:
            raise HTTPException(status_code=404, detail="No lots found to export")
        
        # Prepare data for CSV
        csv_data = []
        for lot in lots:
            csv_data.append({
                'ID': lot.get('id', ''),
                'Make': lot.get('make', ''),
                'Model': lot.get('model', ''),
                'Year': lot.get('year', ''),
                'Trim': lot.get('trim', ''),
                'VIN': lot.get('vin', ''),
                'MSRP': lot.get('msrp', 0),
                'Discount': lot.get('discount', 0),
                'Fleet Price': lot.get('msrp', 0) - lot.get('discount', 0),
                'Status': lot.get('status', ''),
                'Drivetrain': lot.get('drivetrain', ''),
                'Engine': lot.get('engine', ''),
                'Transmission': lot.get('transmission', ''),
                'Exterior Color': lot.get('exterior_color', ''),
                'Interior Color': lot.get('interior_color', ''),
                'State': lot.get('state', ''),
                'Description': lot.get('description', ''),
                'Tags': ','.join(lot.get('tags', [])),
                'Weekly Drop': lot.get('is_weekly_drop', False),
                'Created': lot.get('created_at', ''),
                'Updated': lot.get('updated_at', '')
            })
        
        # Create DataFrame
        df = pd.DataFrame(csv_data)
        
        # Create CSV in memory
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        logger.info(f"Exported {len(lots)} lots to CSV by {current_user.email}")
        
        # Return as downloadable file
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=lots_export_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export CSV error: {e}")
        raise HTTPException(status_code=500, detail="Failed to export lots to CSV")

@api_router.get("/admin/lots/export/xlsx")
async def export_lots_xlsx(
    status: Optional[str] = None,
    lot_repo: LotRepository = Depends(get_lots_repo),
    current_user: User = Depends(require_editor)
):
    """Export all lots to Excel (XLSX)"""
    try:
        import pandas as pd
        from fastapi.responses import StreamingResponse
        import io
        
        # Get all lots
        lots = await lot_repo.get_lots(skip=0, limit=1000, status=status)
        
        if not lots:
            raise HTTPException(status_code=404, detail="No lots found to export")
        
        # Prepare data for Excel
        excel_data = []
        for lot in lots:
            excel_data.append({
                'ID': lot.get('id', ''),
                'Make': lot.get('make', ''),
                'Model': lot.get('model', ''),
                'Year': lot.get('year', ''),
                'Trim': lot.get('trim', ''),
                'VIN': lot.get('vin', ''),
                'MSRP': lot.get('msrp', 0),
                'Discount': lot.get('discount', 0),
                'Fleet Price': lot.get('msrp', 0) - lot.get('discount', 0),
                'Status': lot.get('status', ''),
                'Drivetrain': lot.get('drivetrain', ''),
                'Engine': lot.get('engine', ''),
                'Transmission': lot.get('transmission', ''),
                'Exterior Color': lot.get('exterior_color', ''),
                'Interior Color': lot.get('interior_color', ''),
                'State': lot.get('state', ''),
                'Description': lot.get('description', ''),
                'Tags': ','.join(lot.get('tags', [])),
                'Weekly Drop': lot.get('is_weekly_drop', False),
                'Created': lot.get('created_at', ''),
                'Updated': lot.get('updated_at', '')
            })
        
        # Create DataFrame
        df = pd.DataFrame(excel_data)
        
        # Create Excel in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Lots')
        output.seek(0)
        
        logger.info(f"Exported {len(lots)} lots to XLSX by {current_user.email}")
        
        # Return as downloadable file
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=lots_export_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.xlsx"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Export XLSX error: {e}")
        raise HTTPException(status_code=500, detail="Failed to export lots to Excel")

@api_router.post("/admin/lots/import/csv")
async def import_lots_csv(
    file: UploadFile,
    lot_repo: LotRepository = Depends(get_lots_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo),
    current_user: User = Depends(require_editor)
):
    """Import lots from CSV file"""
    try:
        import pandas as pd
        import io
        
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Map CSV columns to lot data
                lot_data = {
                    'make': str(row.get('Make', '')),
                    'model': str(row.get('Model', '')),
                    'year': int(row.get('Year', datetime.now(timezone.utc).year)),
                    'trim': str(row.get('Trim', '')),
                    'vin': str(row.get('VIN', '')),
                    'msrp': int(row.get('MSRP', 0)),
                    'discount': int(row.get('Discount', 0)),
                    'drivetrain': str(row.get('Drivetrain', 'FWD')),
                    'engine': str(row.get('Engine', '')),
                    'transmission': str(row.get('Transmission', 'AT')),
                    'exterior_color': str(row.get('Exterior Color', '')),
                    'interior_color': str(row.get('Interior Color', '')),
                    'state': str(row.get('State', 'CA')),
                    'description': str(row.get('Description', '')),
                    'tags': str(row.get('Tags', '')).split(',') if row.get('Tags') else [],
                    'is_weekly_drop': bool(row.get('Weekly Drop', False)),
                    'status': str(row.get('Status', 'draft')),
                    'fees_hint': int(row.get('Fees Hint', 0)) if 'Fees Hint' in row else 0
                }
                
                # Generate default images
                lot_data['images'] = [{
                    "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjaGV2cm9sZXQlMjBjb2xvcmFkb3xlbnwwfHx8fDE3MDU0NDE3MDV8MA&ixlib=rb-4.1.0&q=85",
                    "alt": f"{lot_data['year']} {lot_data['make']} {lot_data['model']}"
                }]
                
                # Create lot
                lot_id = await lot_repo.create_lot(lot_data)
                imported_count += 1
                
                # Log audit
                await audit_repo.log_action({
                    "user_email": current_user.email,
                    "action": "import",
                    "resource_type": "lot",
                    "resource_id": lot_id,
                    "changes": {"source": "csv_import", "row": index + 1}
                })
                
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
                logger.error(f"Import error on row {index + 1}: {e}")
        
        logger.info(f"Imported {imported_count} lots from CSV by {current_user.email}")
        
        return {
            "ok": True,
            "imported": imported_count,
            "total_rows": len(df),
            "errors": errors
        }
        
    except Exception as e:
        logger.error(f"Import CSV error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to import CSV: {str(e)}")

@api_router.post("/admin/lots/import/xlsx")
async def import_lots_xlsx(
    file: UploadFile,
    lot_repo: LotRepository = Depends(get_lots_repo),
    audit_repo: AuditRepository = Depends(get_audit_repo),
    current_user: User = Depends(require_editor)
):
    """Import lots from Excel (XLSX) file"""
    try:
        import pandas as pd
        import io
        
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents), sheet_name='Lots')
        
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Map Excel columns to lot data
                lot_data = {
                    'make': str(row.get('Make', '')),
                    'model': str(row.get('Model', '')),
                    'year': int(row.get('Year', datetime.now(timezone.utc).year)),
                    'trim': str(row.get('Trim', '')),
                    'vin': str(row.get('VIN', '')),
                    'msrp': int(row.get('MSRP', 0)),
                    'discount': int(row.get('Discount', 0)),
                    'drivetrain': str(row.get('Drivetrain', 'FWD')),
                    'engine': str(row.get('Engine', '')),
                    'transmission': str(row.get('Transmission', 'AT')),
                    'exterior_color': str(row.get('Exterior Color', '')),
                    'interior_color': str(row.get('Interior Color', '')),
                    'state': str(row.get('State', 'CA')),
                    'description': str(row.get('Description', '')),
                    'tags': str(row.get('Tags', '')).split(',') if row.get('Tags') else [],
                    'is_weekly_drop': bool(row.get('Weekly Drop', False)),
                    'status': str(row.get('Status', 'draft')),
                    'fees_hint': int(row.get('Fees Hint', 0)) if 'Fees Hint' in row else 0
                }
                
                # Generate default images
                lot_data['images'] = [{
                    "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjaGV2cm9sZXQlMjBjb2xvcmFkb3xlbnwwfHx8fDE3MDU0NDE3MDV8MA&ixlib=rb-4.1.0&q=85",
                    "alt": f"{lot_data['year']} {lot_data['make']} {lot_data['model']}"
                }]
                
                # Create lot
                lot_id = await lot_repo.create_lot(lot_data)
                imported_count += 1
                
                # Log audit
                await audit_repo.log_action({
                    "user_email": current_user.email,
                    "action": "import",
                    "resource_type": "lot",
                    "resource_id": lot_id,
                    "changes": {"source": "xlsx_import", "row": index + 1}
                })
                
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
                logger.error(f"Import error on row {index + 1}: {e}")
        
        logger.info(f"Imported {imported_count} lots from Excel by {current_user.email}")
        
        return {
            "ok": True,
            "imported": imported_count,
            "total_rows": len(df),
            "errors": errors
        }
        
    except Exception as e:
        logger.error(f"Import XLSX error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to import Excel: {str(e)}")



class BatchLotActionRequest(BaseModel):
    """Request model for batch lot actions"""
    lotIds: List[str]



class CompleteProfileRequest(BaseModel):
    """Extended user profile request for fleet department"""
    # Credit fields
    credit_score: Optional[int] = None
    auto_loan_history: Optional[bool] = None
    
    # Employment (expanded)
    employment_type: Optional[str] = None  # self, 1099, W2, other
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    time_at_job_months: Optional[int] = None
    monthly_income_pretax: Optional[int] = None
    annual_income: Optional[int] = None
    employment_duration_months: Optional[int] = None
    
    # Personal
    date_of_birth: Optional[str] = None
    drivers_license_number: Optional[str] = None
    immigration_status: Optional[str] = None  # green_card, citizen, asylum
    phone: Optional[str] = None
    
    # Address
    current_address: Optional[str] = None
    current_address_duration_months: Optional[int] = None
    previous_address: Optional[str] = None
    address: Optional[str] = None  # Legacy
    residence_duration_months: Optional[int] = None
    
    # Financial
    monthly_expenses: Optional[int] = None
    down_payment_ready: Optional[int] = None
    ssn: Optional[str] = None

class TradeInRequest(BaseModel):
    """Trade-in vehicle information"""
    vin: str
    year: int
    make: str
    model: str
    mileage: int
    condition: str  # excellent, good, fair, poor
    photos: List[str] = []

class AlternativeVehicleRequest(BaseModel):
    """Alternative vehicle suggestion"""
    application_id: str
    lot_ids: List[str]  # Up to 3 alternatives
    reason: Optional[str] = None

@api_router.post("/admin/lots/batch/{action}")
async def batch_lot_action(
    action: str,
    request: BatchLotActionRequest,
    current_user: User = Depends(require_admin),
    lot_repo: LotRepository = Depends(get_lots_repo)
):
    """Perform batch action on multiple lots (admin only)"""
    try:
        from bson import ObjectId
        from database import get_database
        
        if action not in ['archive', 'delete', 'publish', 'unpublish']:
            raise HTTPException(status_code=400, detail=f"Invalid action: {action}")
        
        lotIds = request.lotIds
        if not lotIds or len(lotIds) == 0:
            raise HTTPException(status_code=400, detail="No lots selected")
        
        db = get_database()
        lots_collection = db.lots
        
        # Convert lot IDs to ObjectId if needed
        object_ids = []
        for lot_id in lotIds:
            try:
                if len(lot_id) == 24 and all(c in '0123456789abcdef' for c in lot_id.lower()):
                    object_ids.append(ObjectId(lot_id))
                else:
                    object_ids.append(lot_id)
            except:
                object_ids.append(lot_id)

        
        # Perform action
        update_data = {}
        if action == 'archive':
            update_data = {
                'status': 'archived',
                'archived_at': datetime.now(timezone.utc)
            }
        elif action == 'delete':
            update_data = {
                'status': 'deleted',
                'archived_at': datetime.now(timezone.utc)
            }
        elif action == 'publish':
            update_data = {
                'status': 'published',
                'publish_at': datetime.now(timezone.utc)
            }
        elif action == 'unpublish':
            update_data = {'status': 'draft'}
        
        # Update all selected lots
        result = await lots_collection.update_many(
            {'_id': {'$in': object_ids}},
            {'$set': update_data}
        )
        
        logger.info(f"Batch {action} performed by {current_user.email} on {result.modified_count} lots")
        
        return {
            'ok': True,
            'modified': result.modified_count,
            'message': f'{result.modified_count} lots {action}d successfully'
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch action error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to perform batch action: {str(e)}")


@api_router.get("/admin/vin/decode/{vin}")
async def decode_vin(
    vin: str,
    current_user: User = Depends(require_editor)
):
    """Decode VIN using NHTSA API (free, US vehicles)"""
    try:
        import httpx
        
        if len(vin) != 17:
            raise HTTPException(status_code=400, detail="VIN must be 17 characters")
        
        # Call NHTSA API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json",
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="VIN decoder service unavailable")
            
            data = response.json()
            results = data.get('Results', [])
            
            # Extract useful fields
            decoded = {}
            field_map = {
                'Make': 'make',
                'Model': 'model',
                'Model Year': 'year',
                'Trim': 'trim',
                'Vehicle Type': 'vehicle_type',
                'Body Class': 'body_class',
                'Drive Type': 'drivetrain',
                'Engine Number of Cylinders': 'engine_cylinders',
                'Displacement (L)': 'displacement',
                'Fuel Type - Primary': 'fuel_type',
                'Transmission Style': 'transmission',
                'Doors': 'doors',
                'Plant City': 'plant_city',
                'Plant Country': 'plant_country',
                'Error Code': 'error_code',
                'Error Text': 'error_text'
            }
            
            for result in results:
                variable = result.get('Variable')
                value = result.get('Value')
                
                if variable in field_map and value and value != 'Not Applicable':
                    decoded[field_map[variable]] = value
            
            # Check for errors
            if decoded.get('error_code') not in ['0', None]:
                logger.warning(f"VIN decode warning for {vin}: {decoded.get('error_text')}")
            
            logger.info(f"Decoded VIN {vin} by {current_user.email}")
            
            return {
                "vin": vin,
                "decoded": decoded,
                "source": "NHTSA"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"VIN decode error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to decode VIN: {str(e)}")


@api_router.get("/tax-fees/{state}")
async def get_tax_fees(state: str):
    """Get tax and fees for a specific state"""
    try:
        # Tax and fees table (simplified for US states)
        TAX_FEES_TABLE = {
            "CA": {
                "state_code": "CA",
                "state_name": "California",
                "sales_tax_rate": 7.25,  # Base rate, local tax may add more
                "dmv_registration": 65,
                "title_fee": 23,
                "doc_fee": 85,
                "tire_fee": 8.75,
                "smog_fee": 25,
                "local_tax_note": "Local tax rates vary by county (typically 1-2.5%)",
                "total_estimate_note": "Total may vary based on county and city"
            },
            "TX": {
                "state_code": "TX",
                "state_name": "Texas",
                "sales_tax_rate": 6.25,
                "dmv_registration": 51.75,
                "title_fee": 33,
                "doc_fee": 150,
                "inspection_fee": 25.50,
                "local_tax_note": "Local tax up to 2%",
                "total_estimate_note": "County fees may apply"
            },
            "FL": {
                "state_code": "FL",
                "state_name": "Florida",
                "sales_tax_rate": 6.0,
                "dmv_registration": 225,
                "title_fee": 75.75,
                "doc_fee": 199,
                "local_tax_note": "County surtax 0.5-1.5%",
                "total_estimate_note": "Initial registration fee is higher"
            },
            "NY": {
                "state_code": "NY",
                "state_name": "New York",
                "sales_tax_rate": 4.0,
                "dmv_registration": 32.50,
                "title_fee": 50,
                "doc_fee": 175,
                "plate_fee": 25,
                "local_tax_note": "Local sales tax 4-4.875%",
                "total_estimate_note": "NYC has additional fees"
            },
            "AZ": {
                "state_code": "AZ",
                "state_name": "Arizona",
                "sales_tax_rate": 5.6,
                "dmv_registration": 8.0,
                "title_fee": 4.0,
                "doc_fee": 85,
                "air_quality_fee": 1.50,
                "local_tax_note": "County tax 0.7-5.6%",
                "total_estimate_note": "Vehicle license tax (VLT) varies by vehicle value"
            },
            "NV": {
                "state_code": "NV",
                "state_name": "Nevada",
                "sales_tax_rate": 6.85,
                "dmv_registration": 33.0,
                "title_fee": 28.25,
                "doc_fee": 199,
                "emissions_fee": 11.50,
                "local_tax_note": "County tax 1.15-1.53%",
                "total_estimate_note": "Governmental services tax applies"
            },
            "WA": {
                "state_code": "WA",
                "state_name": "Washington",
                "sales_tax_rate": 6.5,
                "dmv_registration": 75.0,
                "title_fee": 15.0,
                "doc_fee": 150,
                "local_tax_note": "Local sales tax up to 3.9%",
                "total_estimate_note": "RTA tax may apply in some areas"
            },
            "OR": {
                "state_code": "OR",
                "state_name": "Oregon",
                "sales_tax_rate": 0.0,  # No sales tax in Oregon
                "dmv_registration": 122.0,
                "title_fee": 77.0,
                "doc_fee": 115,
                "plate_fee": 25.0,
                "local_tax_note": "No sales tax in Oregon",
                "total_estimate_note": "One of few states without sales tax"
            }
        }
        
        # Normalize state code
        state_upper = state.upper()
        
        if state_upper not in TAX_FEES_TABLE:
            # Return default/generic if state not found
            return {
                "state_code": state_upper,
                "state_name": state_upper,
                "sales_tax_rate": 7.0,  # Average US sales tax
                "dmv_registration": 100,
                "title_fee": 50,
                "doc_fee": 150,
                "local_tax_note": "Tax rates vary by state and locality",
                "total_estimate_note": "Contact dealer for accurate fees",
                "note": "State-specific data not available. Showing estimates."
            }
        
        return TAX_FEES_TABLE[state_upper]
        
    except Exception as e:
        logger.error(f"Get tax/fees error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tax and fees")

@api_router.get("/tax-fees")
async def get_all_tax_fees():
    """Get tax and fees for all available states"""
    try:
        # Return list of all supported states
        states = ["CA", "TX", "FL", "NY", "AZ", "NV", "WA", "OR"]
        result = []
        
        for state in states:
            state_data = await get_tax_fees(state)
            result.append(state_data)
        
        return {"states": result, "total": len(result)}
        
    except Exception as e:
        logger.error(f"Get all tax/fees error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tax and fees")

@api_router.get("/admin/search-car-images")
async def search_car_images(
    make: str,
    model: str,
    year: int,
    trim: Optional[str] = None,
    current_user: User = Depends(require_editor)
):
    """Search for car images from multiple sources"""
    try:
        import httpx
        
        results = {
            "make": make,
            "model": model,
            "year": year,
            "trim": trim,
            "images": []
        }
        
        # Build search query
        search_query = f"{year} {make} {model}"
        if trim:
            search_query += f" {trim}"
        
        # Try Unsplash API (free, high quality)
        try:
            async with httpx.AsyncClient() as client:
                # Unsplash requires API key, but we'll use search without it for demo
                unsplash_url = "https://api.unsplash.com/search/photos"
                params = {
                    "query": search_query + " car",
                    "per_page": 10,
                    "orientation": "landscape"
                }
                
                # If you have Unsplash API key, add it here
                unsplash_key = os.environ.get("UNSPLASH_ACCESS_KEY")
                if unsplash_key:
                    headers = {"Authorization": f"Client-ID {unsplash_key}"}
                    response = await client.get(unsplash_url, params=params, headers=headers, timeout=10.0)
                    
                    if response.status_code == 200:
                        data = response.json()
                        for photo in data.get("results", [])[:5]:
                            results["images"].append({
                                "url": photo["urls"]["regular"],
                                "thumb": photo["urls"]["thumb"],
                                "source": "unsplash",
                                "alt": f"{year} {make} {model}",
                                "photographer": photo.get("user", {}).get("name"),
                                "width": photo.get("width"),
                                "height": photo.get("height")
                            })
        except Exception as e:
            logger.warning(f"Unsplash search failed: {e}")
        
        # Fallback: Generate placeholder images with text
        if len(results["images"]) == 0:
            # Use placeholder service
            placeholder_images = [
                {
                    "url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",  # Generic car
                    "thumb": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80",
                    "source": "unsplash_fallback",
                    "alt": f"{year} {make} {model}",
                    "note": "Generic car image - please upload actual photos"
                },
                {
                    "url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
                    "thumb": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80",
                    "source": "unsplash_fallback",
                    "alt": f"{year} {make} {model} exterior",
                    "note": "Generic exterior view"
                },
                {
                    "url": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
                    "thumb": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80",
                    "source": "unsplash_fallback",
                    "alt": f"{year} {make} {model} front view",
                    "note": "Generic front view"
                }
            ]
            results["images"] = placeholder_images
            results["note"] = "No specific images found. Using generic car photos."
        
        logger.info(f"Found {len(results['images'])} images for {search_query} by {current_user.email}")
        
        return results
        
    except Exception as e:
        logger.error(f"Image search error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to search images: {str(e)}")


@api_router.post("/admin/lots/{lot_id}/fetch-autobandit-images")
async def fetch_autobandit_images(
    lot_id: str,
    current_user: User = Depends(require_editor),
    lot_repo: LotRepository = Depends(get_lots_repo)
):
    """Fetch images from AutoBandit for a specific lot"""
    try:
        # Get lot data
        lot = await lot_repo.get_lot_by_id(lot_id)
        if not lot:
            raise HTTPException(status_code=404, detail="Lot not found")
        
        make = lot.get('make', '')
        model = lot.get('model', '')
        year = lot.get('year', '')
        
        # Import and use scraper
        import sys
        sys.path.append('/app/backend')
        from autobandit_scraper import AutoBanditScraper
        
        scraper = AutoBanditScraper()
        result = scraper.search_vehicle(make, model, year)
        
        if result and result.get('images'):
            images = result['images']
            
            # Update lot with scraped images
            image_objects = [{"url": img, "alt": f"{year} {make} {model}"} for img in images]
            
            from database import get_database
            db = get_database()
            
            await db.lots.update_one(
                {"_id": lot['_id']},
                {"$set": {
                    "images": image_objects,
                    "image": images[0]
                }}
            )
            
            logger.info(f"Updated lot {lot_id} with {len(images)} images from AutoBandit")
            
            return {
                "ok": True,
                "images_found": len(images),
                "images": images,
                "message": f"Successfully fetched {len(images)} images from AutoBandit"
            }
        else:
            return {
                "ok": False,
                "message": "No matching images found on AutoBandit",
                "suggestion": "Use the Search Images button to find professional stock photos"
            }
        
    except Exception as e:
        logger.error(f"AutoBandit fetch error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch images: {str(e)}")

@api_router.post("/admin/sync-all-autobandit-images")
async def sync_all_autobandit_images(
    current_user: User = Depends(require_admin)
):
    """Sync images from AutoBandit for all lots (admin only)"""
    try:
        import sys
        sys.path.append('/app/backend')
        
        # Run the scraper asynchronously
        from autobandit_scraper import auto_update_lot_images
        
        # This runs in background
        import asyncio
        asyncio.create_task(auto_update_lot_images())
        
        return {
            "ok": True,
            "message": "AutoBandit image sync started in background",
            "note": "Check logs for progress"
        }
        
    except Exception as e:
        logger.error(f"Sync all images error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start sync: {str(e)}")



@api_router.post("/admin/lots/{lot_id}/preview")
async def create_preview_token(lot_id: str):
    """Create preview token for a lot"""
    try:
        # Check if lot exists in storage or generate from the lot_id data
        lot_data = None
        if lot_id in lots_storage:
            lot_data = lots_storage[lot_id]
        else:
            # If lot not in storage, this might be a new unsaved lot
            # Return an error to indicate that lot should be saved first
            raise HTTPException(status_code=400, detail="Lot must be saved before preview")
        
        # Generate preview token
        timestamp = datetime.utcnow().timestamp()
        import hashlib
        token_string = f"{lot_id}-{timestamp}"
        preview_token = hashlib.md5(token_string.encode()).hexdigest()[:16]
        
        # Store preview data with 2 hour expiry
        preview_tokens[preview_token] = {
            "lot_data": lot_data,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=2),
            "lot_id": lot_id
        }
        
        logger.info(f"Created preview token: {preview_token} for lot: {lot_id}")
        
        return {
            "ok": True,
            "token": preview_token,
            "expires_at": preview_tokens[preview_token]["expires_at"].isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create preview token error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create preview token")

@api_router.post("/admin/lots/preview-unsaved")
async def create_preview_for_unsaved_lot(lot_data: dict):
    """Create preview token for unsaved lot data"""
    try:
        # Generate preview token
        timestamp = datetime.utcnow().timestamp()
        import hashlib
        token_string = f"unsaved-{timestamp}"
        preview_token = hashlib.md5(token_string.encode()).hexdigest()[:16]
        
        # Store preview data with 2 hour expiry
        preview_tokens[preview_token] = {
            "lot_data": lot_data,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(hours=2),
            "lot_id": None
        }
        
        logger.info(f"Created preview token for unsaved lot: {preview_token}")
        
        return {
            "ok": True,
            "token": preview_token,
            "expires_at": preview_tokens[preview_token]["expires_at"].isoformat()
        }
        
    except Exception as e:
        logger.error(f"Create preview token for unsaved lot error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create preview token")

# Admin User Management Routes
@api_router.get("/admin/users")
async def get_all_users(
    page: int = 1,
    limit: int = 50,
    role: Optional[str] = None,
    current_user: User = Depends(require_admin),
    user_repo: UserRepository = Depends(get_users_repo)
):
    """Get all users (admin only)"""
    try:
        skip = (page - 1) * limit
        users = await user_repo.get_all_users(skip=skip, limit=limit, role=role)
        total = await user_repo.get_users_count(role=role)
        
        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Get users error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get users")

@api_router.patch("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str,
    current_user: User = Depends(require_admin),
    user_repo: UserRepository = Depends(get_users_repo)
):
    """Update user role (admin only)"""


# ============================================
# Finance Manager Routes
# ============================================

@api_router.post("/applications/{app_id}/add-alternatives")
async def add_alternative_vehicles(
    app_id: str,
    request: AlternativeVehicleRequest,
    current_user: User = Depends(require_auth)  # finance_manager or admin
):
    """Add alternative vehicle suggestions to application"""
    try:
        from bson import ObjectId
        from database import get_database
        
        # Check permissions
        if current_user.role not in ['finance_manager', 'admin', 'editor']:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        db = get_database()
        
        # Get application
        query_id = app_id
        if len(app_id) == 24 and all(c in '0123456789abcdef' for c in app_id.lower()):
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        # Build alternatives array
        alternatives = []
        for lot_id in request.lot_ids[:3]:  # Max 3
            lot = await db.lots.find_one({"_id": ObjectId(lot_id) if len(lot_id) == 24 else lot_id})
            if lot:
                alternatives.append({
                    "lot_id": str(lot['_id']),
                    "lot_slug": lot.get('slug', ''),
                    "title": f"{lot.get('year')} {lot.get('make')} {lot.get('model')}",
                    "monthly": lot.get('lease', {}).get('monthly', 0),
                    "suggested_by": current_user.email,
                    "suggested_at": datetime.now(timezone.utc).isoformat(),
                    "reason": request.reason
                })
        
        # Update application
        result = await db.applications.update_one(
            {"_id": query_id},
            {"$set": {
                "alternatives": alternatives,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        logger.info(f"Added {len(alternatives)} alternatives to application {app_id}")
        
        return {
            "ok": True,
            "alternatives_added": len(alternatives),
            "message": "Alternatives added successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add alternatives error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add alternatives")

@api_router.post("/applications/{app_id}/trade-in")
async def add_trade_in(
    app_id: str,
    trade_in: TradeInRequest,
    current_user: User = Depends(require_auth)
):
    """Add trade-in vehicle to application"""
    try:
        from bson import ObjectId
        from database import get_database
        
        db = get_database()
        
        # Mock KBB valuation (in production: call KBB API)
        # For now, simple formula based on year and mileage
        current_year = datetime.now().year
        age = current_year - trade_in.year
        base_depreciation = 0.15 * age  # 15% per year
        mileage_depreciation = (trade_in.mileage / 100000) * 0.20  # 20% at 100k miles
        condition_multiplier = {
            'excellent': 1.0,
            'good': 0.90,
            'fair': 0.75,
            'poor': 0.60
        }.get(trade_in.condition, 0.80)
        
        # Estimate base value (this would come from KBB)
        estimated_base = 30000  # Mock base value
        estimated_value = int(estimated_base * (1 - base_depreciation - mileage_depreciation) * condition_multiplier)
        
        trade_in_data = {
            "vin": trade_in.vin,
            "year": trade_in.year,
            "make": trade_in.make,
            "model": trade_in.model,
            "mileage": trade_in.mileage,
            "condition": trade_in.condition,
            "photos": trade_in.photos,
            "kbb_value": estimated_value,
            "kbb_note": "Mock valuation - KBB API not integrated",
            "added_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Update application
        query_id = app_id
        if len(app_id) == 24:
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        result = await db.applications.update_one(
            {"_id": query_id},
            {"$set": {"trade_in": trade_in_data}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "ok": True,
            "trade_in_value": estimated_value,
            "message": "Trade-in added successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add trade-in error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add trade-in")

@api_router.post("/applications/{app_id}/prescoring")
async def run_prescoring(
    app_id: str,
    current_user: User = Depends(require_auth)  # finance_manager or admin
):
    """Run prescoring check (mock - 700credit/eLAND integration)"""
    try:
        from bson import ObjectId
        from database import get_database
        
        # Check permissions
        if current_user.role not in ['finance_manager', 'admin']:
            raise HTTPException(status_code=403, detail="Finance Manager access required")
        
        db = get_database()
        
        # Get application
        query_id = app_id
        if len(app_id) == 24:
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        app = await db.applications.find_one({"_id": query_id})
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get user data
        user = await db.users.find_one({"_id": app['user_id']})
        
        # Mock prescoring results (in production: call 700credit API)
        credit_score = user.get('credit_score', 650)
        income = user.get('monthly_income_pretax', 0) or (user.get('annual_income', 0) / 12 if user.get('annual_income') else 0)
        
        # Calculate debt-to-income, approval probability
        mock_prescoring = {
            "credit_score": credit_score,
            "credit_tier": "Tier 1" if credit_score >= 720 else "Tier 2" if credit_score >= 680 else "Tier 3",
            "payment_history": "Good" if credit_score >= 700 else "Fair",
            "debt_to_income_ratio": 0.35,  # Mock
            "open_accounts": 5,  # Mock
            "recent_inquiries": 2,  # Mock
            "approval_probability": "High" if credit_score >= 700 else "Medium" if credit_score >= 650 else "Low",
            "recommended_down_payment": 3000 if credit_score >= 700 else 5000,
            "max_approved_amount": int(income * 36 * 0.15) if income else 30000,  # 15% of gross for car payment
            "notes": "Mock data - 700credit API not integrated",
            "checked_at": datetime.now(timezone.utc).isoformat(),
            "checked_by": current_user.email
        }
        
        # Save prescoring data
        result = await db.applications.update_one(
            {"_id": query_id},
            {"$set": {"prescoring_data": mock_prescoring}}
        )
        
        logger.info(f"Prescoring completed for application {app_id} by {current_user.email}")
        
        return {
            "ok": True,
            "prescoring": mock_prescoring,
            "message": "Prescoring completed (mock data)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prescoring error: {e}")
        raise HTTPException(status_code=500, detail="Failed to run prescoring")


@api_router.get("/applications/{app_id}/auto-alternatives")
async def get_auto_alternatives(
    app_id: str,
    current_user: User = Depends(require_auth)
):
    """Get automatically suggested alternative vehicles"""
    try:
        from bson import ObjectId
        from database import get_database
        
        db = get_database()
        
        # Get application
        query_id = app_id
        if len(app_id) == 24:
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        app = await db.applications.find_one({"_id": query_id})
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get selected car details - handle both string and ObjectId lot_id
        lot_id_query = app['lot_id']
        if len(app['lot_id']) == 24 and all(c in '0123456789abcdef' for c in app['lot_id'].lower()):
            try:
                lot_id_query = ObjectId(app['lot_id'])
            except:
                pass
        
        selected_lot = await db.lots.find_one({"_id": lot_id_query})
        if not selected_lot:
            # Try by slug if ObjectId failed
            selected_lot = await db.lots.find_one({"slug": app.get('lot_data', {}).get('slug', '')})
        
        if not selected_lot:
            # Can't find original lot, but we can still suggest alternatives based on lot_data
            logger.warning(f"Original lot not found for app {app_id}, using lot_data")
            selected_monthly = 500  # Default
        else:
            selected_monthly = selected_lot.get('lease', {}).get('monthly', 0)
        
        # Find alternatives
        all_lots = await db.lots.find({"status": "published"}).to_list(length=100)
        
        alternatives = {"cheaper": None, "similar": None, "luxury": None}
        
        for lot in all_lots:
            if str(lot['_id']) == app['lot_id']:
                continue
            
            lot_price = lot.get('msrp', 0) - lot.get('discount', 0)
            lot_monthly = lot.get('lease', {}).get('monthly', 0)
            
            # Cheaper: 20-40% less
            if not alternatives['cheaper'] and lot_monthly < selected_monthly * 0.8:
                alternatives['cheaper'] = {
                    "type": "cheaper",
                    "lot_id": str(lot['_id']),
                    "slug": lot.get('slug'),
                    "title": f"{lot['year']} {lot['make']} {lot['model']}",
                    "monthly": lot_monthly,
                    "savings_vs_original": selected_monthly - lot_monthly
                }
            
            # Similar: different brand, ±10% price
            if not alternatives['similar'] and lot.get('make') != selected_lot.get('make'):
                if abs(lot_monthly - selected_monthly) / selected_monthly <= 0.10:
                    alternatives['similar'] = {
                        "type": "similar",
                        "lot_id": str(lot['_id']),
                        "slug": lot.get('slug'),
                        "title": f"{lot['year']} {lot['make']} {lot['model']}",
                        "monthly": lot_monthly,
                        "price_diff": lot_monthly - selected_monthly
                    }
            
            # Luxury: 30-60% more expensive
            if not alternatives['luxury'] and lot_monthly > selected_monthly * 1.3:
                alternatives['luxury'] = {
                    "type": "luxury",
                    "lot_id": str(lot['_id']),
                    "slug": lot.get('slug'),
                    "title": f"{lot['year']} {lot['make']} {lot['model']}",
                    "monthly": lot_monthly,
                    "upgrade_cost": lot_monthly - selected_monthly
                }
        
        return {
            "ok": True,
            "alternatives": alternatives,
            "count": sum(1 for v in alternatives.values() if v is not None)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auto alternatives error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate alternatives")

@api_router.patch("/admin/applications/{app_id}/finance-manager-update")
async def finance_manager_update(
    app_id: str,
    verified_income: Optional[int] = None,
    manager_comments: Optional[str] = None,
    current_user: User = Depends(require_auth)
):
    """Update application with finance manager fields"""
    try:
        from bson import ObjectId
        from database import get_database
        
        if current_user.role not in ['finance_manager', 'admin']:
            raise HTTPException(status_code=403, detail="Finance Manager access required")
        
        db = get_database()
        
        update_data = {}
        if verified_income is not None:
            update_data['verified_income'] = verified_income
        if manager_comments:
            update_data['manager_comments'] = manager_comments
        
        update_data['updated_at'] = datetime.now(timezone.utc)
        
        query_id = app_id
        if len(app_id) == 24:
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        result = await db.applications.update_one(
            {"_id": query_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {"ok": True, "message": "Application updated"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Finance manager update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update application")

@api_router.post("/applications/{app_id}/send-notification")
async def send_status_notification(
    app_id: str,
    notification_type: str,  # email, sms
    message: str,
    current_user: User = Depends(require_auth)
):
    """Send notification to customer (mock - no actual sending)"""
    try:
        from bson import ObjectId
        from database import get_database
        
        db = get_database()
        
        # Get application and user
        query_id = app_id
        if len(app_id) == 24:
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        app = await db.applications.find_one({"_id": query_id})
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Mock notification (in production: SendGrid/Twilio)
        notification_record = {
            "type": notification_type,
            "status": "sent_mock",
            "message": message,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "sent_by": current_user.email
        }
        
        # Add to notifications array
        result = await db.applications.update_one(
            {"_id": query_id},
            {"$push": {"notifications_sent": notification_record}}
        )
        
        logger.info(f"Mock notification sent for app {app_id}: {notification_type}")
        
        return {
            "ok": True,
            "message": f"Mock {notification_type} notification sent",
            "note": "Integration with SendGrid/Twilio pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Send notification error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send notification")


# ============================================
# Subscription Routes (Model Alerts)
# ============================================

def get_subscriptions_repo():
    """Dependency for subscription repository"""
    return get_subscription_repository()

@api_router.post("/subscriptions")
async def create_subscription(
    makes: List[str] = [],
    models: List[str] = [],
    max_price: Optional[int] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    telegram_id: Optional[str] = None,
    notify_email: bool = True,
    notify_sms: bool = False,
    notify_telegram: bool = False,
    current_user: User = Depends(require_auth)
):
    """Subscribe to model alerts"""
    try:
        from database import get_subscription_repository
        sub_repo = get_subscription_repository()
        
        sub_data = {
            "user_id": current_user.id,
            "email": email or current_user.email,
            "phone": phone,
            "telegram_id": telegram_id,
            "makes": makes,
            "models": models,
            "max_price": max_price,
            "notify_email": notify_email,
            "notify_sms": notify_sms,
            "notify_telegram": notify_telegram,
            "notify_on_new_listing": True,
            "notify_on_price_drop": True,
            "is_active": True
        }
        
        sub_id = await sub_repo.create_subscription(sub_data)
        
        logger.info(f"Subscription created for {current_user.email}: {makes}, {models}")
        
        return {
            "ok": True,
            "subscription_id": sub_id,
            "message": f"Subscribed to {', '.join(makes + models)}"
        }
        
    except Exception as e:
        logger.error(f"Create subscription error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create subscription")


# ============================================
# Document Upload & Management
# ============================================

@api_router.post("/applications/{app_id}/upload-document")
async def upload_document(
    app_id: str,
    file: UploadFile,
    doc_type: str,
    current_user: User = Depends(require_auth),
    file_manager: FileStorageManager = Depends(get_file_storage_manager)
):
    """Upload document for application"""
    try:
        # Save file
        file_path = await file_manager.save_file(file, category='documents')
        
        # Add to application documents array
        from database import get_database
        from bson import ObjectId
        db = get_database()
        
        query_id = app_id
        if len(app_id) == 24:
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        doc_record = {
            "type": doc_type,
            "filename": file.filename,
            "url": file_path,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "uploaded_by": current_user.id
        }
        
        await db.applications.update_one(
            {"_id": query_id},
            {"$push": {"documents": doc_record}}
        )
        
        logger.info(f"Document uploaded for app {app_id}: {doc_type}")
        
        return {"ok": True, "url": file_path, "message": "Document uploaded"}
        
    except Exception as e:
        logger.error(f"Document upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload document")

# ============================================
# Appointment Scheduling
# ============================================

@api_router.post("/appointments")
async def create_appointment(
    application_id: str,
    appointment_type: str,
    date: str,
    time: str,
    current_user: User = Depends(require_auth)
):
    """Schedule appointment for test drive, pickup, or video call"""
    try:
        from database import get_database
        db = get_database()
        
        appointment_data = {
            "application_id": application_id,
            "user_id": current_user.id,
            "type": appointment_type,  # pickup, video, test_drive
            "date": date,
            "time": time,
            "status": "scheduled",
            "created_at": datetime.now(timezone.utc)
        }
        
        result = await db.appointments.insert_one(appointment_data)
        
        logger.info(f"Appointment scheduled: {appointment_type} on {date} {time}")
        
        return {
            "ok": True,
            "appointment_id": str(result.inserted_id),
            "message": f"{appointment_type} scheduled for {date} at {time}"
        }
        
    except Exception as e:
        logger.error(f"Appointment scheduling error: {e}")
        raise HTTPException(status_code=500, detail="Failed to schedule appointment")

# ============================================
# Bulk Operations for Finance Manager
# ============================================

@api_router.post("/admin/applications/bulk/prescoring")
async def bulk_prescoring(
    application_ids: List[str],
    current_user: User = Depends(require_auth)
):
    """Run prescoring for multiple applications at once"""
    try:
        if current_user.role not in ['finance_manager', 'admin']:
            raise HTTPException(status_code=403, detail="Finance Manager access required")
        
        from database import get_database
        from bson import ObjectId
        db = get_database()
        
        results = []
        for app_id in application_ids[:20]:  # Limit to 20 at a time
            try:
                query_id = ObjectId(app_id) if len(app_id) == 24 else app_id
                app = await db.applications.find_one({"_id": query_id})
                
                if app:
                    user = await db.users.find_one({"_id": app['user_id']})
                    credit_score = user.get('credit_score', 650)
                    income = user.get('monthly_income_pretax', 0) or (user.get('annual_income', 0) / 12 if user.get('annual_income') else 0)
                    
                    mock_prescoring = {
                        "credit_score": credit_score,
                        "credit_tier": "Tier 1" if credit_score >= 720 else "Tier 2" if credit_score >= 680 else "Tier 3",
                        "approval_probability": "High" if credit_score >= 700 else "Medium" if credit_score >= 650 else "Low",
                        "max_approved_amount": int(income * 36 * 0.15) if income else 30000,
                        "checked_at": datetime.now(timezone.utc).isoformat(),
                        "checked_by": current_user.email
                    }
                    
                    await db.applications.update_one(
                        {"_id": query_id},
                        {"$set": {"prescoring_data": mock_prescoring}}
                    )
                    
                    results.append({"app_id": app_id, "success": True})
            except Exception as e:
                results.append({"app_id": app_id, "success": False, "error": str(e)})
        
        success_count = sum(1 for r in results if r['success'])
        
        logger.info(f"Bulk prescoring: {success_count}/{len(application_ids)} completed")
        
        return {
            "ok": True,
            "total": len(application_ids),
            "success": success_count,
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk prescoring error: {e}")
        raise HTTPException(status_code=500, detail="Failed to run bulk prescoring")


# ============================================
# Referral Tracking System
# ============================================

@api_router.post("/referrals/track")
async def track_referral(
    referrer_code: str,
    current_user: User = Depends(require_auth)
):
    """Track referral when new user signs up"""
    try:
        from database import get_database
        db = get_database()
        
        # Decode referrer user ID
        import base64
        try:
            referrer_id = base64.b64decode(referrer_code).decode('utf-8')
        except:
            raise HTTPException(status_code=400, detail="Invalid referral code")
        
        # Check if referrer exists
        referrer = await db.users.find_one({"_id": referrer_id})
        if not referrer:
            raise HTTPException(status_code=404, detail="Referrer not found")
        
        # Create referral record
        referral_data = {
            "referrer_id": referrer_id,
            "referred_id": current_user.id,
            "referred_email": current_user.email,
            "status": "pending",  # pending, qualified, paid
            "reward_amount": 200,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.referrals.insert_one(referral_data)
        
        logger.info(f"Referral tracked: {referrer_id} referred {current_user.id}")
        
        return {
            "ok": True,
            "message": "Referral tracked",
            "reward": "$200 when referred user completes first lease"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Track referral error: {e}")
        raise HTTPException(status_code=500, detail="Failed to track referral")

@api_router.get("/referrals/my-stats")
async def get_referral_stats(
    current_user: User = Depends(require_auth)
):
    """Get user's referral statistics"""
    try:
        from database import get_database
        db = get_database()
        
        # Get all referrals by this user
        referrals = await db.referrals.find({"referrer_id": current_user.id}).to_list(length=100)
        
        stats = {
            "total_referrals": len(referrals),
            "pending": len([r for r in referrals if r['status'] == 'pending']),
            "qualified": len([r for r in referrals if r['status'] == 'qualified']),
            "paid": len([r for r in referrals if r['status'] == 'paid']),
            "total_earned": len([r for r in referrals if r['status'] == 'paid']) * 200,
            "pending_earnings": len([r for r in referrals if r['status'] == 'qualified']) * 200,
            "referrals": [
                {
                    "email": r.get('referred_email'),
                    "status": r.get('status'),
                    "date": r.get('created_at'),
                    "reward": r.get('reward_amount')
                }
                for r in referrals
            ]
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Get referral stats error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get stats")


@api_router.get("/recent-activity")
async def get_recent_activity():
    """Get recent activity feed (real reservations + applications)"""
    try:
        from database import get_database
        db = get_database()
        
        # Get recent reservations (last 24h)
        one_day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
        
        recent_reservations = await db.reservations.find({
            "created_at": {"$gte": one_day_ago},
            "status": {"$in": ["active", "converted"]}
        }).sort("created_at", -1).limit(10).to_list(length=10)
        
        # Get recent applications (last 24h)
        recent_applications = await db.applications.find({
            "created_at": {"$gte": one_day_ago}
        }).sort("created_at", -1).limit(10).to_list(length=10)
        
        # Format activities
        activities = []
        
        for res in recent_reservations:
            # Get user info
            user = await db.users.find_one({"_id": res['user_id']})
            if user:
                activities.append({
                    "type": "reservation",
                    "name": user.get('name', 'Someone').split()[0],  # First name only
                    "city": "Los Angeles",  # Would extract from user address
                    "car": res.get('lot_slug', '').replace('-', ' ').title(),
                    "action": "reserved",
                    "savings": 0,
                    "time": res.get('created_at')
                })
        
        for app in recent_applications:
            user_data = app.get('user_data', {})
            lot_data = app.get('lot_data', {})
            if user_data:
                activities.append({
                    "type": "application",
                    "name": user_data.get('name', 'Someone').split()[0],
                    "city": "LA",
                    "car": f"{lot_data.get('year', '')} {lot_data.get('make', '')} {lot_data.get('model', '')}",
                    "action": "applied for",
                    "savings": lot_data.get('fleet_price', 0) * 0.15,  # Estimate
                    "time": app.get('created_at')
                })
        
        # Sort by time
        activities.sort(key=lambda x: x.get('time', datetime.now(timezone.utc)), reverse=True)
        
        return {
            "ok": True,
            "activities": activities[:10],  # Top 10 most recent
            "count": len(activities)
        }
        
    except Exception as e:
        logger.error(f"Get recent activity error: {e}")
        return {"ok": True, "activities": [], "count": 0}  # Return empty on error


@api_router.post("/applications/{app_id}/invite-cosigner")
async def invite_cosigner(
    app_id: str,
    phone: str,
    current_user: User = Depends(require_auth)
):
    """Send SMS invite to co-signer"""
    try:
        from database import get_database
        from bson import ObjectId
        
        if current_user.role not in ['finance_manager', 'admin']:
            raise HTTPException(status_code=403, detail="Finance Manager access required")
        
        # Generate unique invite link
        import uuid
        invite_token = str(uuid.uuid4())
        invite_link = f"https://hunter.lease/cosigner-signup?token={invite_token}&app={app_id}"
        
        # Mock SMS sending (in production: Twilio)
        sms_message = f"hunter.lease: You've been invited as co-signer. Complete profile: {invite_link}"
        
        logger.info(f"Co-signer invite sent to {phone} for app {app_id}")
        logger.info(f"Mock SMS: {sms_message}")
        
        # Save invite to database
        db = get_database()
        query_id = ObjectId(app_id) if len(app_id) == 24 else app_id
        
        await db.applications.update_one(
            {"_id": query_id},
            {"$set": {
                "cosigner_invite": {
                    "phone": phone,
                    "token": invite_token,
                    "invited_at": datetime.now(timezone.utc).isoformat(),
                    "invited_by": current_user.email,
                    "status": "pending"
                }
            }}
        )
        
        return {
            "ok": True,
            "message": "Co-signer invite sent (mock)",
            "invite_link": invite_link
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Co-signer invite error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send invite")


# ============================================
# CargwinGPT AI Assistant
# ============================================

@api_router.post("/ai-chat")
async def chat_with_ai(
    request: dict
):
    """Chat with CargwinGPT AI assistant"""
    try:
        import uuid
        from cargwin_gpt import chat_with_cargwin_gpt
        
        message = request.get('message')
        session_id = request.get('session_id')
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Generate session ID if not provided
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Get AI response
        result = await chat_with_cargwin_gpt(message, session_id)
        
        return {
            "ok": True,
            "session_id": session_id,
            **result
        }
        
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        return {
            "ok": False,
            "response": "Sorry, I'm having trouble right now. Please try again.",
            "error": str(e)
        }


@api_router.post("/admin/broadcast-fomo/{offer_id}")
async def broadcast_fomo_update(
    offer_id: str,
    viewers: int,
    confirmed: int,
    current_user: User = Depends(require_editor)
):
    """Broadcast FOMO counter update to all connected clients"""
    try:
        from websocket_manager import update_fomo_counter
        
        await update_fomo_counter(offer_id, viewers, confirmed)
        
        logger.info(f"FOMO broadcast: {offer_id} - {viewers} viewers, {confirmed} confirmed")
        
        return {
            "ok": True,
            "message": "FOMO counters updated",
            "offer_id": offer_id,
            "viewers": viewers,
            "confirmed": confirmed
        }
        
    except Exception as e:
        logger.error(f"FOMO broadcast error: {e}")
        raise HTTPException(status_code=500, detail="Failed to broadcast")

@api_router.get("/admin/applications/export/excel")
async def export_applications_excel(
    status: Optional[str] = None,
    current_user: User = Depends(require_auth)
):
    """Export applications to Excel"""
    try:
        from database import get_database
        db = get_database()
        
        query = {}
        if status and status != 'all':
            query['status'] = status
        
        apps = await db.applications.find(query).to_list(length=1000)
        
        # Convert to CSV format
        csv_data = "ID,Customer,Email,Vehicle,Status,Credit Score,Income,Applied Date\\n"
        
        for app in apps:
            csv_data += f"{app.get('_id', '')},{app.get('user_data', {}).get('name', '')},"
            csv_data += f"{app.get('user_data', {}).get('email', '')},{app.get('lot_data', {}).get('year', '')} {app.get('lot_data', {}).get('make', '')},"
            csv_data += f"{app.get('status', '')},{app.get('user_data', {}).get('credit_score', '')},"
            csv_data += f"{app.get('user_data', {}).get('annual_income', '')},{app.get('created_at', '')}\\n"
        
        logger.info(f"Exported {len(apps)} applications")
        
        return {
            "ok": True,
            "data": csv_data,
            "count": len(apps)
        }
        
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail="Failed to export")


# ============================================
# Broker Applications
# ============================================

@api_router.post("/broker-application")
async def submit_broker_application(
    application_data: dict
):
    """Submit application from broker/external source"""
    try:
        from database import get_database
        db = get_database()
        
        # Add timestamp
        application_data['created_at'] = datetime.now(timezone.utc)
        application_data['status'] = 'pending'
        application_data['source'] = 'broker'
        
        # Insert into database
        result = await db.broker_applications.insert_one(application_data)
        
        # Send notification email to admin
        admin_emails = ['admin@hunter.lease', 'info@cargwin.com']
        for admin_email in admin_emails:
            import sys
            sys.path.append('/app/backend')
            from notifications import send_email
            
            await send_email(
                admin_email,
                f"New Broker Application - {application_data.get('first_name')} {application_data.get('last_name')}",
                f"New broker application received for {application_data.get('desired_cars')}\n\nReview in admin panel."
            )
        
        logger.info(f"Broker application created: {result.inserted_id}")
        
        return {
            "ok": True,
            "application_id": str(result.inserted_id),
            "message": "Application submitted successfully. We'll contact you within 24 hours."
        }
        
    except Exception as e:
        logger.error(f"Broker application error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit application")


# ============================================
# Professional Lease Calculator
# ============================================

@api_router.post("/calc/lease")
async def calculate_lease_payment(
    request: dict
):
    """Professional lease calculation with MF/Residual system"""
    try:
        from lease_calculator import calculate_lease
        from database import get_database
        
        db = get_database()
        
        # Extract params
        deal_external_id = request.get('dealExternalId')
        term_months = request.get('termMonths', 36)
        annual_mileage = request.get('annualMileage', 10000)
        credit_tier_code = request.get('creditTierCode', 'SUPER_ELITE')
        with_incentives = request.get('withIncentives', True)
        customer_down_payment = request.get('customer_down_payment', 0)
        zip_code = request.get('zip')
        tax_rate_override = request.get('taxRateOverride')
        
        if not deal_external_id:
            raise HTTPException(status_code=400, detail="dealExternalId required")
        
        # Calculate
        result = await calculate_lease(
            db,
            deal_external_id,
            term_months,
            annual_mileage,
            credit_tier_code,
            with_incentives,
            customer_down_payment,
            zip_code,
            tax_rate_override
        )
        
        return {
            "ok": True,
            **result
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Lease calc API error: {e}")
        raise HTTPException(status_code=500, detail="Calculation failed")


# ============================================
# Deal Calculator Management
# ============================================

@api_router.get("/deals/{deal_id}/calculator")
async def get_deal_calculator(
    deal_id: str,
    current_user: User = Depends(require_editor)
):
    """Get calculator settings for deal"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        query_id = ObjectId(deal_id) if len(deal_id) == 24 else deal_id
        deal = await db.lots.find_one({"_id": query_id})
        
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        return {
            "ok": True,
            "calculator": deal.get('dealCalculator', {})
        }
        
    except Exception as e:
        logger.error(f"Get calculator error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get calculator")

@api_router.post("/deals/{deal_id}/calculator")
async def update_deal_calculator(
    deal_id: str,
    calculator_data: dict,
    current_user: User = Depends(require_editor)
):
    """Update calculator settings for deal"""
    try:
        from database import get_database
        from bson import ObjectId
        
        db = get_database()
        
        query_id = ObjectId(deal_id) if len(deal_id) == 24 else deal_id
        
        result = await db.lots.update_one(
            {"_id": query_id},
            {"$set": {"dealCalculator": calculator_data}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Deal not found")
        
        return {"ok": True, "message": "Calculator updated"}
        
    except Exception as e:
        logger.error(f"Update calculator error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update calculator")

@api_router.post("/calculate/lease")
async def calculate_lease_detailed(
    request: dict
):
    """Calculate lease with full breakdown"""
    try:
        selling_price = request.get('sellingPrice')
        residual_value = request.get('residualValue')
        residual_percent = request.get('residualPercent')
        money_factor = request.get('moneyFactor')
        term = request.get('term')
        tax_rate = request.get('taxes', 0.0775)
        fees = request.get('fees', {})
        incentives = request.get('incentives', [])
        
        # Apply incentives
        total_incentives = sum(inc.get('amount', 0) for inc in incentives)
        
        # Calculate residual if not provided
        if not residual_value and residual_percent:
            residual_value = selling_price * residual_percent
        
        # Adjusted cap cost
        adjusted_cap = selling_price - total_incentives
        
        # Monthly depreciation
        depreciation = (adjusted_cap - residual_value) / term
        
        # Finance charge
        finance_charge = (adjusted_cap + residual_value) * money_factor
        
        # Base payment
        base_payment = depreciation + finance_charge
        
        # Tax on payment
        tax_on_payment = base_payment * tax_rate
        
        # Monthly payment
        monthly = round(base_payment + tax_on_payment, 2)
        
        # Due at signing
        acquisition = fees.get('acquisitionFee', 650)
        doc = fees.get('docFee', 85)
        registration = fees.get('registrationFee', 540)
        
        tax_on_fees = (acquisition + doc + registration) * tax_rate
        
        due_at_signing = round(
            monthly + acquisition + doc + registration + tax_on_fees,
            2
        )
        
        return {
            "ok": True,
            "monthlyPayment": monthly,
            "dueAtSigning": due_at_signing,
            "breakdown": {
                "depreciation": round(depreciation, 2),
                "financeCharge": round(finance_charge, 2),
                "basePayment": round(base_payment, 2),
                "taxOnPayment": round(tax_on_payment, 2),
                "acquisition": acquisition,
                "docFee": doc,
                "registration": registration,
                "taxOnFees": round(tax_on_fees, 2),
                "totalIncentives": total_incentives
            }
        }
        
    except Exception as e:
        logger.error(f"Calculate lease error: {e}")
        raise HTTPException(status_code=500, detail="Calculation failed")


@api_router.get("/admin/broker-applications")
async def get_broker_applications(
    status: Optional[str] = None,
    current_user: User = Depends(require_admin)
):
    """Get all broker applications (admin only)"""
    try:
        from database import get_database
        db = get_database()
        
        query = {}
        if status:
            query['status'] = status
        
        applications = await db.broker_applications.find(query).sort('created_at', -1).to_list(length=100)
        
        for app in applications:
            app['id'] = str(app.pop('_id'))
        
        return {
            "ok": True,
            "applications": applications,
            "total": len(applications)
        }
        
    except Exception as e:
        logger.error(f"Get broker applications error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get applications")

@api_router.get("/subscriptions")
async def get_my_subscriptions(
    current_user: User = Depends(require_auth)
):
    """Get user's active subscriptions"""
    try:
        from database import get_subscription_repository
        sub_repo = get_subscription_repository()
        
        subs = await sub_repo.get_subscriptions_by_user(current_user.id)
        
        return {"subscriptions": subs, "total": len(subs)}
        
    except Exception as e:
        logger.error(f"Get subscriptions error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get subscriptions")

@api_router.delete("/subscriptions/{sub_id}")
async def delete_subscription(
    sub_id: str,
    current_user: User = Depends(require_auth)
):
    """Unsubscribe from model alerts"""
    try:
        from database import get_subscription_repository
        sub_repo = get_subscription_repository()
        
        success = await sub_repo.delete_subscription(sub_id)
        
        if success:
            return {"ok": True, "message": "Unsubscribed successfully"}
        else:
            raise HTTPException(status_code=404, detail="Subscription not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete subscription error: {e}")
        raise HTTPException(status_code=500, detail="Failed to unsubscribe")


# ============================================
# Admin Application Management Routes
# ============================================
@api_router.get("/admin/applications")
async def get_all_applications(
    page: int = 1,
    limit: int = 50,
    status: Optional[str] = None,
    current_user: User = Depends(require_admin),
    app_repo: ApplicationRepository = Depends(get_apps_repo)
):
    """Get all applications (admin only)"""
    try:
        skip = (page - 1) * limit
        apps = await app_repo.get_all_applications(skip=skip, limit=limit, status=status)
        total = await app_repo.get_applications_count(status=status)
        
        return {
            "applications": apps,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Get applications error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get applications")

@api_router.patch("/admin/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    status: str,
    admin_notes: Optional[str] = None,
    current_user: User = Depends(require_admin),
    app_repo: ApplicationRepository = Depends(get_apps_repo)
):
    """Update application status (admin only)"""
    try:
        if status not in ["pending", "approved", "rejected", "contacted"]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        success = await app_repo.update_application_status(app_id, status, admin_notes)
        
        if not success:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Auto-send notification based on status change
        from database import get_database
        db = get_database()
        
        # Get application and user
        from bson import ObjectId
        query_id = app_id
        if len(app_id) == 24:
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        app = await db.applications.find_one({"_id": query_id})
        if app:
            # Get user
            user = await db.users.find_one({"_id": app.get('user_id')})
            
            # Send email with HTML template
            if user and status == "approved":
                # Use HTML template for approved emails
                import sys
                sys.path.append('/app/backend')
                from notifications import send_email
                
                template_data = {
                    'name': user.get('name', 'Customer'),
                    'car_title': f"{app.get('lot_data', {}).get('year', '')} {app.get('lot_data', {}).get('make', '')} {app.get('lot_data', {}).get('model', '')}",
                    'monthly': app.get('approval_details', {}).get('monthly_payment', 0),
                    'due_at_signing': app.get('approval_details', {}).get('down_payment', 0),
                    'term': app.get('approval_details', {}).get('loan_term', 36)
                }
                
                await send_email(
                    user.get('email'),
                    "🎉 You're Approved - hunter.lease",
                    "",  # body not used when template_type provided
                    template_type="approved",
                    template_data=template_data
                )
            
            # Define status messages for notification record
            status_messages = {
                "contacted": "We've received your application and our team is reviewing it. We'll contact you within 24 hours with next steps.",
                "approved": "🎉 Congratulations! Your application has been approved. Check your email for contract details and next steps.",
                "rejected": "Unfortunately, we're unable to approve your application at this time. However, we have alternative options available. Our team will contact you shortly.",
                "pending": "Your application status has been updated. Our team is reviewing your information."
            }
            
            message = status_messages.get(status, f"Your application status has been updated to: {status}")
            
            # Create notification record (mock - actual sending happens via SendGrid/Twilio)
            notification_record = {
                "type": "auto_status_change",
                "channel": "email",  # In production: send to both email and SMS if available
                "status": "sent_mock",
                "message": message,
                "triggered_by": f"status_change_to_{status}",
                "sent_at": datetime.now(timezone.utc).isoformat(),
                "sent_by": "system_auto"
            }
            
            await db.applications.update_one(
                {"_id": query_id},
                {"$push": {"notifications_sent": notification_record}}
            )
            
            logger.info(f"Auto-notification queued for app {app_id} on status change to {status}")
        
        logger.info(f"Application {app_id} status updated to {status} by {current_user.email}")
        
        return {"ok": True, "message": "Application status updated", "notification_sent": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update application status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update application status")

@api_router.get("/admin/applications/{app_id}/notifications")
async def get_application_notifications(
    app_id: str,
    current_user: User = Depends(require_auth)
):
    """Get notification history for an application"""
    try:
        from bson import ObjectId
        from database import get_database
        
        db = get_database()
        
        query_id = app_id
        if len(app_id) == 24:
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        app = await db.applications.find_one({"_id": query_id})
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        notifications = app.get('notifications_sent', [])
        
        return {
            "ok": True,
            "notifications": notifications,
            "total": len(notifications)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get notifications")


@api_router.patch("/admin/applications/{app_id}/approve")
async def approve_application_with_details(
    app_id: str,
    apr: Optional[float] = None,
    money_factor: Optional[float] = None,
    loan_term: int = 60,
    down_payment: float = 3000,
    monthly_payment: float = 0,
    admin_notes: Optional[str] = None,
    current_user: User = Depends(require_admin),
    app_repo: ApplicationRepository = Depends(get_apps_repo)
):
    """Approve application with financing details (admin only)"""
    try:
        from bson import ObjectId
        
        # Validate inputs
        if apr is None and money_factor is None:
            raise HTTPException(status_code=400, detail="Either APR or money_factor is required")
        
        if monthly_payment <= 0:
            raise HTTPException(status_code=400, detail="Monthly payment must be greater than 0")
        
        # Prepare approval details
        approval_details = {
            "apr": apr,
            "money_factor": money_factor,
            "loan_term": loan_term,
            "down_payment": down_payment,
            "monthly_payment": monthly_payment,
            "approved_by": current_user.email,
            "approved_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Update application
        query_id = app_id
        if len(app_id) == 24 and all(c in '0123456789abcdef' for c in app_id.lower()):
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        update_data = {
            'status': 'approved',
            'approval_details': approval_details,
            'pickup_status': 'ready_for_pickup',
            'updated_at': datetime.now(timezone.utc)
        }
        
        if admin_notes:
            update_data['admin_notes'] = admin_notes
        
        from database import get_database
        db = get_database()
        result = await db.applications.update_one(
            {"_id": query_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Application not found")
        
        logger.info(f"Application {app_id} approved with details by {current_user.email}")
        
        return {
            "ok": True,
            "message": "Application approved with financing details",
            "approval_details": approval_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Approve application error: {e}")
        raise HTTPException(status_code=500, detail="Failed to approve application")

@api_router.post("/applications/{app_id}/schedule-pickup")
async def schedule_pickup(
    app_id: str,
    pickup_slot: str,  # ISO datetime string
    current_user: User = Depends(require_auth),
    app_repo: ApplicationRepository = Depends(get_apps_repo)
):
    """Schedule pickup time for approved application"""
    try:
        from bson import ObjectId
        from database import get_database
        
        # Parse datetime
        try:
            pickup_datetime = datetime.fromisoformat(pickup_slot.replace('Z', '+00:00'))
        except:
            raise HTTPException(status_code=400, detail="Invalid datetime format")
        
        # Get application
        db = get_database()
        query_id = app_id
        if len(app_id) == 24 and all(c in '0123456789abcdef' for c in app_id.lower()):
            try:
                query_id = ObjectId(app_id)
            except:
                pass
        
        app = await db.applications.find_one({"_id": query_id})
        
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Check ownership
        if app['user_id'] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Check if approved
        if app.get('status') != 'approved':
            raise HTTPException(status_code=400, detail="Application must be approved first")
        
        # Update pickup slot
        result = await db.applications.update_one(
            {"_id": query_id},
            {"$set": {
                "pickup_slot": pickup_datetime,
                "pickup_status": "scheduled",
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to schedule pickup")
        
        logger.info(f"Pickup scheduled for application {app_id} at {pickup_slot}")
        
        return {
            "ok": True,
            "message": "Pickup time scheduled successfully",
            "pickup_slot": pickup_datetime.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Schedule pickup error: {e}")
        raise HTTPException(status_code=500, detail="Failed to schedule pickup")

@api_router.get("/admin/pickup-slots")
async def get_available_pickup_slots(
    date: Optional[str] = None,  # ISO date string YYYY-MM-DD
    current_user: User = Depends(require_admin)
):
    """Get available pickup slots (admin only)"""
    try:
        from datetime import timedelta
        
        # Parse date or use today
        if date:
            try:
                base_date = datetime.fromisoformat(date).date()
            except:
                raise HTTPException(status_code=400, detail="Invalid date format")
        else:
            base_date = datetime.now(timezone.utc).date()
        
        # Generate available slots (9 AM to 5 PM, every hour) for next 14 days
        slots = []
        for day_offset in range(14):
            current_date = base_date + timedelta(days=day_offset)
            
            # Skip Sundays
            if current_date.weekday() == 6:
                continue
            
            for hour in range(9, 17):  # 9 AM to 5 PM
                slot_time = datetime.combine(current_date, datetime.min.time().replace(hour=hour, tzinfo=timezone.utc))
                slots.append({
                    "datetime": slot_time.isoformat(),
                    "display": slot_time.strftime("%A, %B %d at %I:%M %p"),
                    "available": True  # In real app, check against bookings
                })
        
        return {"slots": slots}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get pickup slots error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get pickup slots")


@api_router.get("/admin/audit-logs")
async def get_audit_logs(
    page: int = 1,
    limit: int = 50,
    resource_type: Optional[str] = None,
    action: Optional[str] = None,
    user_email: Optional[str] = None,
    current_user: User = Depends(require_admin),
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    """Get audit logs (admin only)"""
    try:
        skip = (page - 1) * limit
        
        # Build filter
        filter_dict = {}
        if resource_type:
            filter_dict['resource_type'] = resource_type
        if action:
            filter_dict['action'] = action
        if user_email:
            filter_dict['user_email'] = user_email
        
        # Get logs from audit repository
        logs = await audit_repo.get_logs(skip=skip, limit=limit, filters=filter_dict)
        total = await audit_repo.get_logs_count(filters=filter_dict)
        
        return {
            "logs": logs,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Get audit logs error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit logs")


@api_router.get("/cars")
async def get_public_cars(
    lot_repo: LotRepository = Depends(get_lots_repo)
):
    """Get all published cars for public homepage"""
    try:
        # Get all published lots
        lots = await lot_repo.get_lots(skip=0, limit=100, status="published")
        
        # Format for public display
        public_cars = []
        for lot in lots:
            car_slug = f"{lot.get('year', '')}-{lot.get('make', '')}-{lot.get('model', '')}-{lot.get('trim', '')}".lower().replace(' ', '-')
            
            # Ensure lease and finance objects exist with defaults
            lease_data = lot.get('lease', {})
            if not lease_data:
                lease_data = {
                    "monthly": 0,
                    "dueAtSigning": 3000,
                    "termMonths": 36,
                    "milesPerYear": 7500
                }
            
            finance_data = lot.get('finance', {})
            if not finance_data:
                finance_data = {
                    "apr": 9.75,
                    "termMonths": 60,
                    "downPayment": 3000
                }
            
            public_car = {
                "id": car_slug,
                "slug": car_slug,
                "title": f"{lot.get('year', '')} {lot.get('make', '')} {lot.get('model', '')} {lot.get('trim', '')}",
                "msrp": lot.get('msrp', 0),
                "fleet": lot.get('msrp', 0) - lot.get('discount', 0),
                "savings": lot.get('discount', 0),
                "dealer_addons": lot.get('dealer_addons', 0),
                "stockLeft": 1,
                "image": (lot.get('images', [{}])[0].get('url', '') if lot.get('images') and len(lot.get('images')) > 0 else lot.get('image', '')),
                "gallery": [img.get('url') for img in lot.get('images', []) if img.get('url')],
                "dealer": "Fleet Dealer",
                "endsAt": (datetime.now(timezone.utc) + timedelta(hours=48)).isoformat(),
                "lease": lease_data,
                "finance": finance_data,
            }
            public_cars.append(public_car)
        
        return public_cars
        
    except Exception as e:
        logger.error(f"Get public cars error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cars")

@api_router.get("/cars/{car_slug}")
async def get_public_car(
    car_slug: str,
    lot_repo: LotRepository = Depends(get_lots_repo)
):
    """Get public car data by slug for car detail pages"""
    try:
        # Try to find lot by slug
        lot = await lot_repo.get_lot_by_slug(car_slug)
        
        if not lot or lot.get('status') != 'published':
            raise HTTPException(status_code=404, detail="Car not found")
        
        # Format for public car detail page
        public_car = {
            "id": car_slug,
            "title": f"{lot.get('year', '')} {lot.get('make', '')} {lot.get('model', '')} {lot.get('trim', '')}",
            "slug": car_slug,
            "msrp": lot.get('msrp', 0),
            "fleet": lot.get('msrp', 0) - lot.get('discount', 0),
            "savings": lot.get('discount', 0),
            "stockLeft": 1,
            "image": (lot.get('images', [{}])[0].get('url', '') if lot.get('images') else ''),
            "dealer": "Fleet Dealer",
            "endsAt": datetime.now(timezone.utc) + timedelta(hours=48),
            "addonsAvg": lot.get('fees_hint', 0),
            "gallery": [img.get('url', '') for img in lot.get('images', [])],
            "specs": {
                "year": str(lot.get('year', '')),
                "make": lot.get('make', ''),
                "model": lot.get('model', ''),
                "trim": lot.get('trim', ''),
                "engine": lot.get('engine', ''),
                "transmission": lot.get('transmission', ''),
                "drivetrain": lot.get('drivetrain', ''), 
                "exteriorColor": lot.get('exterior_color', ''),
                "interiorColor": lot.get('interior_color', ''),
                "vin": lot.get('vin', '')
            },
            "description": lot.get('description', ''),
            "isDrop": lot.get('is_weekly_drop', False),
            "lease": {
                "termMonths": 36,
                "milesPerYear": 10000,
                "dueAtSigning": 2800,
                "monthly": 310,
                "incentives": 1800
            },
            "finance": {
                "apr": 3.5,
                "termMonths": 60,
                "downPayment": 2500,
                "monthlyPayment": 520
            },
            "cash": {
                "incentives": 2500,
                "total": lot.get('msrp', 0) - lot.get('discount', 0)
            },
            "competitor_prices": lot.get('competitor_prices', {}),
            "fees_hint": lot.get('fees_hint', 0),
            "state": lot.get('state', 'CA')
        }
        
        logger.info(f"Public car requested: {car_slug}, found: {lot.get('make', '')} {lot.get('model', '')}")
        return public_car
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get public car error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch car data")

@api_router.get("/cars/{car_slug}/calculator-config")
async def get_calculator_config(
    car_slug: str,
    lot_repo: LotRepository = Depends(get_lots_repo)
):
    """Get calculator configuration for a specific car"""
    try:
        # Get lot by slug
        lot = await lot_repo.get_lot_by_slug(car_slug)
        
        if not lot or lot.get('status') != 'published':
            raise HTTPException(status_code=404, detail="Car not found")
        
        msrp = lot.get('msrp', 0)
        discount = lot.get('discount', 0)
        final_price = msrp - discount
        state = lot.get('state', 'CA')
        
        # Check if auto-generation enabled
        calculator_config_auto = lot.get('calculator_config_auto', True)
        calculator_config = lot.get('calculator_config', {})
        
        # If auto-generate OR no config exists, use service
        if calculator_config_auto or not calculator_config:
            from calculator_config_service import CalculatorConfigService
            service = CalculatorConfigService(db)
            try:
                calculator_config = await service.generate_calculator_config(lot.get('id'))
            except Exception as gen_error:
                logger.warning(f"Auto-generation failed, using fallback: {gen_error}")
                # Fallback to default if generation fails
                calculator_config = get_default_calculator_config(msrp, discount, state)
        
        # Always include car-specific data
        return {
            "car_id": car_slug,
            "make": lot.get('make', ''),
            "model": lot.get('model', ''),
            "year": lot.get('year', 0),
            "trim": lot.get('trim', ''),
            "msrp": msrp,
            "discount": discount,
            "final_price": final_price,
            "state": state,
            **calculator_config
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get calculator config error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch calculator configuration")

@api_router.get("/preview/{token}")
async def get_preview_lot(token: str):
    """Get lot data for preview by token"""
    try:
        # Check if token exists and is not expired
        if token not in preview_tokens:
            raise HTTPException(status_code=404, detail="Preview token not found")
        
        preview_data = preview_tokens[token]
        
        # Check if token is expired
        if datetime.utcnow() > preview_data["expires_at"]:
            # Clean up expired token
            del preview_tokens[token]
            raise HTTPException(status_code=404, detail="Preview token expired")
        
        lot_data = preview_data["lot_data"]
        
        # Format lot data for car detail page
        formatted_lot = {
            "id": f"preview-{token}",
            "title": f"{lot_data.get('year', '')} {lot_data.get('make', '')} {lot_data.get('model', '')} {lot_data.get('trim', '')} (Предпросмотр)",
            "slug": f"{lot_data.get('year', '')}-{lot_data.get('make', '').lower()}-{lot_data.get('model', '').lower()}-{lot_data.get('trim', '').lower()}-preview",
            "msrp": lot_data.get('msrp', 0),
            "fleet": lot_data.get('msrp', 0) - lot_data.get('discount', 0),
            "savings": lot_data.get('discount', 0),
            "description": lot_data.get('description', 'Это предпросмотр лота из админ-панели.'),
            "image": (lot_data.get('images', []) if lot_data.get('images') else [
                {
                    "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjaGV2cm9sZXQlMjBjb2xvcmFkb3xlbnwwfHx8fDE3MDU0NDE3MDV8MA&ixlib=rb-4.1.0&q=85",
                    "alt": f"{lot_data.get('year', '')} {lot_data.get('make', '')} {lot_data.get('model', '')} — предпросмотр"
                }
            ])[0]["url"],
            "gallery": [img["url"] for img in (lot_data.get('images', []) if lot_data.get('images') else [
                {
                    "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjaGV2cm9sZXQlMjBjb2xvcmFkb3xlbnwwfHx8fDE3MDU0NDE3MDV8MA&ixlib=rb-4.1.0&q=85",
                    "alt": f"{lot_data.get('year', '')} {lot_data.get('make', '')} {lot_data.get('model', '')} — предпросмотр"
                }
            ])],
            "specs": {
                "year": str(lot_data.get('year', '')),
                "make": lot_data.get('make', ''),
                "model": lot_data.get('model', ''),
                "trim": lot_data.get('trim', ''),
                "engine": lot_data.get('engine', ''),
                "transmission": lot_data.get('transmission', ''),
                "drivetrain": lot_data.get('drivetrain', ''), 
                "exteriorColor": lot_data.get('exteriorColor', ''),
                "interiorColor": lot_data.get('interiorColor', ''),
                "vin": lot_data.get('vin', '')
            },
            "images": lot_data.get('images', []) if lot_data.get('images') else [
                {
                    "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjaGV2cm9sZXQlMjBjb2xvcmFkb3xlbnwwfHx8fDE3MDU0NDE3MDV8MA&ixlib=rb-4.1.0&q=85",
                    "alt": f"{lot_data.get('year', '')} {lot_data.get('make', '')} {lot_data.get('model', '')} — предпросмотр"
                }
            ],
            "isPreview": True,
            "previewToken": token,
            "isDrop": lot_data.get('isWeeklyDrop', False),
            "stockLeft": 1,
            "dealer": "Fleet Preview",
            "endsAt": datetime.utcnow() + timedelta(hours=48),
            "addonsAvg": lot_data.get('feesHint', 0),
            "lease": {
                "termMonths": 36,
                "milesPerYear": 10000,
                "dueAtSigning": 2800,
                "monthly": 310,
                "incentives": 1800
            },
            "finance": {
                "apr": 3.5,
                "termMonths": 60,
                "downPayment": 2500,
                "monthlyPayment": 520
            },
            "cash": {
                "incentives": 2500,
                "total": lot_data.get('msrp', 0) - lot_data.get('discount', 0)
            }
        }
        
        logger.info(f"Preview requested for token: {token}, lot: {lot_data.get('make', '')} {lot_data.get('model', '')}")
        return formatted_lot
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Preview error: {e}")
        raise HTTPException(status_code=404, detail="Preview not found or expired")

# Include the router in the main app
app.include_router(api_router)


