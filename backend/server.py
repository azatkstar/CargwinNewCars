from fastapi import FastAPI, APIRouter, HTTPException, Response, Cookie, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import json
import hashlib

# Import database modules
from database import (
    connect_to_mongo, 
    close_mongo_connection, 
    initialize_repositories,
    get_lot_repository,
    get_user_repository,
    get_audit_repository,
    LotRepository,
    UserRepository,
    AuditRepository
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


# Load environment variables
load_dotenv()

app = FastAPI(title="CargwinNewCar API", version="1.0.0")

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")

# Create API router
api_router = APIRouter(prefix="/api")

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection and repositories"""
    try:
        await connect_to_mongo()
        await initialize_repositories()
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections"""
    await close_mongo_connection()
    logger.info("Application shutdown completed")

# Dependency to get repositories
async def get_lots_repo() -> LotRepository:
    return get_lot_repository()

async def get_users_repo() -> UserRepository:
    return get_user_repository()

async def get_audit_repo() -> AuditRepository:
    return get_audit_repository()

# In-memory storage for demo (in production use database)
lots_storage = {}
preview_tokens = {}  # Store preview tokens with lot data


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

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

# Admin Authentication Routes
@api_router.post("/auth/magic")
async def magic_link_auth(request: MagicLinkRequest):
    """Send magic link (mock implementation)"""
    try:
        # Determine role based on email
        role = "viewer"
        if "admin@" in request.email:
            role = "admin"
        elif "editor@" in request.email:
            role = "editor"
        
        # Log the magic link request
        logger.info(f"Magic link requested for: {request.email} (role: {role})")
        
        # In production, you would:
        # 1. Generate secure token
        # 2. Send email with magic link
        # 3. Store token in database
        
        return {"ok": True, "message": "Magic link sent successfully"}
    except Exception as e:
        logger.error(f"Magic link error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send magic link")

@api_router.post("/auth/session")
async def check_session(response: Response):
    """Check if user has valid session (mock implementation)"""
    try:
        # Mock authenticated user for demo
        mock_user = {
            "id": "user_123",
            "email": "admin@cargwin.com",
            "role": "admin"
        }
        
        # In production, verify JWT token from httpOnly cookie
        return {
            "user": {
                "id": mock_user["id"],
                "email": mock_user["email"]
            },
            "role": mock_user["role"]
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")

@api_router.get("/auth/session")
async def get_session():
    """Get current session (mock implementation)"""
    try:
        # Mock authenticated user for demo
        mock_user = {
            "id": "user_123",
            "email": "admin@cargwin.com",
            "role": "admin"
        }
        
        return {
            "user": {
                "id": mock_user["id"],
                "email": mock_user["email"]
            },
            "role": mock_user["role"]
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Not authenticated")

@api_router.post("/auth/logout")
async def logout(response: Response):
    """Logout user"""
    # In production, clear httpOnly cookie
    return {"ok": True, "message": "Logged out successfully"}

# Admin Lots Routes
@api_router.get("/admin/lots")
async def get_admin_lots(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    make: Optional[str] = None,
    model: Optional[str] = None,
    lot_repo: LotRepository = Depends(get_lots_repo)
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
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    """Create new lot"""
    try:
        logger.info(f"Creating new lot: {lot_data.get('make', '')} {lot_data.get('model', '')} {lot_data.get('year', '')}")
        
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
            "user_email": "system",  # TODO: Get from auth context
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
    lot_repo: LotRepository = Depends(get_lots_repo)
):
    """Get single lot for editing"""
    try:
        lot = await lot_repo.get_lot_by_id(lot_id)
        if not lot:
            raise HTTPException(status_code=404, detail=f"Lot {lot_id} not found")
            
        logger.info(f"Retrieved lot: {lot_id}")
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
    audit_repo: AuditRepository = Depends(get_audit_repo)
):
    """Update existing lot"""
    try:
        logger.info(f"Updating lot: {lot_id}")
        
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
            "user_email": "system",  # TODO: Get from auth context
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

@api_router.get("/cars/{car_slug}")
async def get_public_car(car_slug: str):
    """Get public car data by slug for car detail pages"""
    try:
        # First try to find in lots_storage by slug or generated slug pattern
        matching_lot = None
        for lot_id, lot_data in lots_storage.items():
            # Check if slug matches or can be generated from lot data
            generated_slug = f"{lot_data.get('year', '')}-{lot_data.get('make', '').lower()}-{lot_data.get('model', '').lower()}-{lot_data.get('trim', '').lower()}".replace(' ', '-').replace('--', '-')
            if (lot_data.get('slug') == car_slug or 
                generated_slug.replace('-', '') in car_slug.replace('-', '') or
                car_slug.replace('-', '') in generated_slug.replace('-', '')):
                matching_lot = lot_data
                break
        
        if matching_lot:
            # Format for public car detail page
            public_car = {
                "id": car_slug,
                "title": f"{matching_lot.get('year', '')} {matching_lot.get('make', '')} {matching_lot.get('model', '')} {matching_lot.get('trim', '')}",
                "slug": car_slug,
                "msrp": matching_lot.get('msrp', 0),
                "fleet": matching_lot.get('msrp', 0) - matching_lot.get('discount', 0),
                "savings": matching_lot.get('discount', 0),
                "stockLeft": 1,
                "image": (matching_lot.get('images', []) if matching_lot.get('images') else [
                    {
                        "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjaGV2cm9sZXQlMjBjb2xvcmFkb3xlbnwwfHx8fDE3MDU0NDE3MDV8MA&ixlib=rb-4.1.0&q=85",
                        "alt": f"{matching_lot.get('year', '')} {matching_lot.get('make', '')} {matching_lot.get('model', '')} — вид спереди"
                    }
                ])[0]["url"],
                "dealer": "Fleet Dealer",
                "endsAt": datetime.utcnow() + timedelta(hours=48),
                "addonsAvg": matching_lot.get('feesHint', 0),
                "gallery": [img["url"] for img in (matching_lot.get('images', []) if matching_lot.get('images') else [
                    {
                        "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxjaGV2cm9sZXQlMjBjb2xvcmFkb3xlbnwwfHx8fDE3MDU0NDE3MDV8MA&ixlib=rb-4.1.0&q=85",
                        "alt": f"{matching_lot.get('year', '')} {matching_lot.get('make', '')} {matching_lot.get('model', '')} — вид спереди"
                    }
                ])],
                "specs": {
                    "year": str(matching_lot.get('year', '')),
                    "make": matching_lot.get('make', ''),
                    "model": matching_lot.get('model', ''),
                    "trim": matching_lot.get('trim', ''),
                    "engine": matching_lot.get('engine', ''),
                    "transmission": matching_lot.get('transmission', ''),
                    "drivetrain": matching_lot.get('drivetrain', ''), 
                    "exteriorColor": matching_lot.get('exteriorColor', ''),
                    "interiorColor": matching_lot.get('interiorColor', ''),
                    "vin": matching_lot.get('vin', '')
                },
                "description": matching_lot.get('description', ''),
                "isDrop": matching_lot.get('isWeeklyDrop', False),
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
                    "total": matching_lot.get('msrp', 0) - matching_lot.get('discount', 0)
                }
            }
            
            logger.info(f"Public car requested: {car_slug}, found: {matching_lot.get('make', '')} {matching_lot.get('model', '')}")
            return public_car
        else:
            # Return 404 if car not found
            raise HTTPException(status_code=404, detail="Car not found")
            
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


