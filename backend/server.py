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
    LotRepository,
    UserRepository,
    AuditRepository,
    UserSessionRepository,
    ApplicationRepository
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
async def get_status_checks():
    from database import get_database
    db = get_database()
    status_checks = await db.status_checks.find().to_list(1000)
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
        
        logger.info(f"User registered: {user.email}")
        
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
            "annual_income": profile_data.annual_income,
            "employment_duration_months": profile_data.employment_duration_months,
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
        
        logger.info(f"Application created: {app_id} for user {current_user.email}")
        
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
        
        return {
            "ok": True,
            "id": lot_id,
            "data": created_lot
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create lot error: {e}")
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
                    "url": f"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",  # Generic car
                    "thumb": f"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80",
                    "source": "unsplash_fallback",
                    "alt": f"{year} {make} {model}",
                    "note": "Generic car image - please upload actual photos"
                },
                {
                    "url": f"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
                    "thumb": f"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80",
                    "source": "unsplash_fallback",
                    "alt": f"{year} {make} {model} exterior",
                    "note": "Generic exterior view"
                },
                {
                    "url": f"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
                    "thumb": f"https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80",
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
    try:
        if role not in ["user", "editor", "admin"]:
            raise HTTPException(status_code=400, detail="Invalid role")
        
        success = await user_repo.update_user(user_id, {"role": role})
        
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        
        logger.info(f"User {user_id} role updated to {role} by {current_user.email}")
        
        return {"ok": True, "message": "User role updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update user role error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user role")

# Admin Application Management Routes
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
        
        logger.info(f"Application {app_id} status updated to {status} by {current_user.email}")
        
        return {"ok": True, "message": "Application status updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update application status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update application status")

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
                "stockLeft": 1,
                "image": (lot.get('images', [{}])[0].get('url', '') if lot.get('images') else ''),
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


