"""
MongoDB Database Configuration and Models for CargwinNewCar
"""
import os
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic import BaseModel, Field
from bson import ObjectId

logger = logging.getLogger(__name__)

# MongoDB Connection
class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

# Database instance
db = Database()

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME")
    if not db_name:
        raise ValueError("DB_NAME environment variable is required")
    
    logger.info(f"Connecting to MongoDB: {mongo_url}")
    
    db.client = AsyncIOMotorClient(mongo_url)
    db.database = db.client[db_name]
    
    # Test connection
    try:
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db.database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return db.database

# Pydantic Models for MongoDB Documents

class ImageAsset(BaseModel):
    """Image asset model"""
    url: str
    alt: str = ""
    ratio: str = "16:9"
    width: int = 1920
    height: int = 1080
    is_hero: bool = False

class FOMOSettings(BaseModel):
    """FOMO settings model"""
    mode: str = "deterministic"  # deterministic, random, static
    viewers: int = 0
    confirms15: int = 0

class SEOSettings(BaseModel):
    """SEO settings model"""
    title: str = ""
    description: str = ""
    no_index: bool = False

class LotDocument(BaseModel):
    """Lot document model for MongoDB"""
    # Basic Info
    make: str
    model: str
    year: int
    trim: str = ""
    vin: str = ""
    
    # Technical Specs
    drivetrain: str = "FWD"
    engine: str = ""
    transmission: str = "AT"
    exterior_color: str = ""
    interior_color: str = ""
    
    # Pricing
    msrp: int = 0
    discount: int = 0
    fees_hint: int = 0
    state: str = "CA"
    
    # Content
    description: str = ""
    tags: List[str] = []
    
    # Media
    images: List[ImageAsset] = []
    
    # Settings
    is_weekly_drop: bool = False
    drop_window: Optional[str] = None
    fomo: FOMOSettings = Field(default_factory=FOMOSettings)
    seo: SEOSettings = Field(default_factory=SEOSettings)
    
    # Status and Metadata
    status: str = "draft"  # draft, scheduled, published, archived, deleted
    slug: str = ""
    publish_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    archived_at: Optional[datetime] = None
    
    class Config:
        # Allow ObjectId conversion
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

class UserDocument(BaseModel):
    """User document model for MongoDB"""
    email: str
    role: str = "user"  # admin, editor, user
    name: str = ""
    picture: str = ""
    password_hash: Optional[str] = None  # For email/password auth
    is_active: bool = True
    profile_completed: bool = False
    last_login: Optional[datetime] = None
    
    # Credit Application Fields
    credit_score: Optional[int] = None
    auto_loan_history: Optional[bool] = None  # Has paid off auto loans
    employment_type: Optional[str] = None  # 1099, W2, Self-employed
    annual_income: Optional[int] = None
    employment_duration_months: Optional[int] = None
    address: Optional[str] = None
    residence_duration_months: Optional[int] = None
    monthly_expenses: Optional[int] = None
    down_payment_ready: Optional[int] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

class UserSessionDocument(BaseModel):
    """User session document for OAuth (Emergent Auth)"""
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

class ApplicationDocument(BaseModel):
    """User application for a car lot"""
    user_id: str
    lot_id: str
    status: str = "pending"  # pending, approved, rejected, contacted
    
    # Snapshot of user data at time of application
    user_data: dict = {}
    lot_data: dict = {}
    
    admin_notes: Optional[str] = None
    contacted_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

class AuditLogDocument(BaseModel):
    """Audit log document model for MongoDB"""
    user_id: Optional[str] = None
    user_email: str = ""
    action: str = ""  # create, update, delete, publish, archive
    resource_type: str = ""  # lot, user, settings
    resource_id: str = ""
    changes: Dict[str, Any] = {}
    ip_address: str = ""
    user_agent: str = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

class PreviewTokenDocument(BaseModel):
    """Preview token document model for MongoDB"""
    token: str
    lot_data: Dict[str, Any]
    lot_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

# Database Operations

class LotRepository:
    """Repository for lot operations"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.lots
    
    async def create_indexes(self):
        """Create database indexes for optimization"""
        await self.collection.create_index("slug", unique=True)
        await self.collection.create_index("status")
        await self.collection.create_index("make")
        await self.collection.create_index("model")
        await self.collection.create_index("year")
        await self.collection.create_index("created_at")
        await self.collection.create_index("published_at")
        await self.collection.create_index([("make", 1), ("model", 1), ("year", 1)])
        logger.info("Created indexes for lots collection")
    
    async def create_lot(self, lot_data: Dict[str, Any]) -> str:
        """Create a new lot"""
        # Generate slug if not provided
        if not lot_data.get('slug'):
            lot_data['slug'] = self._generate_slug(lot_data)
        
        lot_data['created_at'] = datetime.now(timezone.utc)
        lot_data['updated_at'] = datetime.now(timezone.utc)
        
        result = await self.collection.insert_one(lot_data)
        return str(result.inserted_id)
    
    async def get_lot_by_id(self, lot_id: str) -> Optional[Dict[str, Any]]:
        """Get lot by MongoDB ObjectId"""
        try:
            from bson import ObjectId
            result = await self.collection.find_one({"_id": ObjectId(lot_id)})
            if result:
                result['id'] = str(result.pop('_id'))
            return result
        except Exception as e:
            logger.error(f"Error getting lot by id {lot_id}: {e}")
            return None
    
    async def get_lot_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """Get lot by slug"""
        result = await self.collection.find_one({"slug": slug})
        if result:
            result['id'] = str(result.pop('_id'))
        return result
    
    async def get_lots(self, 
                      skip: int = 0, 
                      limit: int = 20, 
                      status: Optional[str] = None,
                      make: Optional[str] = None,
                      model: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get lots with filtering and pagination"""
        query = {}
        
        if status:
            query['status'] = status
        if make:
            query['make'] = {"$regex": make, "$options": "i"}
        if model:
            query['model'] = {"$regex": model, "$options": "i"}
        
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        results = []
        
        async for doc in cursor:
            doc['id'] = str(doc.pop('_id'))
            results.append(doc)
        
        return results
    
    async def get_total_count(self, status: Optional[str] = None) -> int:
        """Get total count of lots"""
        query = {}
        if status:
            query['status'] = status
        return await self.collection.count_documents(query)
    
    async def update_lot(self, lot_id: str, update_data: Dict[str, Any]) -> bool:
        """Update lot"""
        try:
            from bson import ObjectId
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            result = await self.collection.update_one(
                {"_id": ObjectId(lot_id)}, 
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating lot {lot_id}: {e}")
            return False
    
    async def delete_lot(self, lot_id: str) -> bool:
        """Delete lot (soft delete - set status to deleted)"""
        try:
            from bson import ObjectId
            result = await self.collection.update_one(
                {"_id": ObjectId(lot_id)}, 
                {"$set": {
                    "status": "deleted",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error deleting lot {lot_id}: {e}")
            return False
    
    def _generate_slug(self, lot_data: Dict[str, Any]) -> str:
        """Generate URL slug from lot data"""
        year = lot_data.get('year', '')
        make = lot_data.get('make', '').lower().replace(' ', '-')
        model = lot_data.get('model', '').lower().replace(' ', '-')
        trim = lot_data.get('trim', '').lower().replace(' ', '-')
        
        parts = [str(year), make, model]
        if trim:
            parts.append(trim)
        
        return '-'.join(parts).replace('--', '-').strip('-')

class UserRepository:
    """Repository for user operations"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.users
    
    async def create_indexes(self):
        """Create database indexes"""
        await self.collection.create_index("email", unique=True)
        await self.collection.create_index("role")
        await self.collection.create_index("is_active")
        logger.info("Created indexes for users collection")
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        result = await self.collection.find_one({"email": email})
        if result:
            result['id'] = str(result.pop('_id'))
        return result
    
    async def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create new user"""
        user_data['created_at'] = datetime.now(timezone.utc)
        user_data['updated_at'] = datetime.now(timezone.utc)
        
        result = await self.collection.insert_one(user_data)
        return str(result.inserted_id)
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user"""
        try:
            from bson import ObjectId
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            result = await self.collection.update_one(
                {"_id": ObjectId(user_id)}, 
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            return False

class AuditRepository:
    """Repository for audit log operations"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.audit_logs
    
    async def create_indexes(self):
        """Create database indexes"""
        await self.collection.create_index("user_email")
        await self.collection.create_index("resource_type")
        await self.collection.create_index("resource_id")
        await self.collection.create_index("timestamp")
        await self.collection.create_index([("resource_type", 1), ("resource_id", 1)])
        logger.info("Created indexes for audit_logs collection")
    
    async def log_action(self, log_data: Dict[str, Any]):
        """Log an action"""
        log_data['timestamp'] = datetime.now(timezone.utc)
        await self.collection.insert_one(log_data)

# Initialize repositories when database is connected
lot_repo = None
user_repo = None
audit_repo = None

async def initialize_repositories():
    """Initialize all repositories"""
    global lot_repo, user_repo, audit_repo
    
    database = get_database()
    lot_repo = LotRepository(database)
    user_repo = UserRepository(database)
    audit_repo = AuditRepository(database)
    
    # Create indexes
    await lot_repo.create_indexes()
    await user_repo.create_indexes()
    await audit_repo.create_indexes()
    
    logger.info("Repositories initialized successfully")

def get_lot_repository() -> LotRepository:
    """Get lot repository instance"""
    if lot_repo is None:
        raise RuntimeError("Repositories not initialized. Call initialize_repositories() first.")
    return lot_repo

def get_user_repository() -> UserRepository:
    """Get user repository instance"""
    if user_repo is None:
        raise RuntimeError("Repositories not initialized. Call initialize_repositories() first.")
    return user_repo

def get_audit_repository() -> AuditRepository:
    """Get audit repository instance"""
    if audit_repo is None:
        raise RuntimeError("Repositories not initialized. Call initialize_repositories() first.")
    return audit_repo