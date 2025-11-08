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
    
    # Competitor Pricing (for price comparison)
    competitor_prices: Dict[str, Any] = Field(default_factory=dict)
    # Example: {
    #   "autobandit": {"monthly": 850, "due_at_signing": 3500, "term": 36, "updated_at": "2025-01-20"},
    #   "dealer_average": {"monthly": 900, "due_at_signing": 4000, "term": 36}
    # }
    
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
    ssn: Optional[str] = None  # Encrypted SSN for credit verification
    
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
    
    # Approval details (filled by admin when approving)
    approval_details: Optional[Dict[str, Any]] = None  # {apr, money_factor, loan_term, down_payment, monthly_payment, approved_by, approved_at}
    
    # Pickup management
    pickup_status: str = "pending"  # pending, ready_for_pickup, scheduled, completed
    pickup_slot: Optional[datetime] = None
    contract_sent: bool = False
    contract_signed: bool = False
    contract_sent_at: Optional[datetime] = None
    
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

class ReservationDocument(BaseModel):
    """User reservation for a car lot - holds price for limited time"""
    user_id: str
    lot_id: str
    lot_slug: str
    
    # Price snapshot at time of reservation
    reserved_price: float
    monthly_payment: float
    due_at_signing: float
    
    status: str = "active"  # active, expired, converted, cancelled
    expires_at: datetime
    
    # If converted to application
    application_id: Optional[str] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
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
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        # Handle ObjectId conversion if needed
        query_id = user_id
        if len(user_id) == 24 and all(c in '0123456789abcdef' for c in user_id.lower()):
            try:
                query_id = ObjectId(user_id)
            except:
                pass  # Use string ID if ObjectId conversion fails
        
        result = await self.collection.find_one({"_id": query_id})
        if result:
            result['id'] = str(result.pop('_id'))
        return result
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user"""
        try:
            update_data['updated_at'] = datetime.now(timezone.utc)
            
            # Handle ObjectId conversion if needed
            query_id = user_id
            if len(user_id) == 24 and all(c in '0123456789abcdef' for c in user_id.lower()):
                try:
                    query_id = ObjectId(user_id)
                except:
                    pass  # Use string ID if ObjectId conversion fails
            
            result = await self.collection.update_one(
                {"_id": query_id}, 
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {e}")
            return False
    
    async def get_all_users(self, skip: int = 0, limit: int = 50, role: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all users with pagination and filtering"""
        query = {}
        if role:
            query['role'] = role
        
        cursor = self.collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
        users = await cursor.to_list(length=limit)
        
        for user in users:
            user['id'] = str(user.pop('_id'))
        
        return users
    
    async def get_users_count(self, role: Optional[str] = None) -> int:
        """Get total count of users"""
        query = {}
        if role:
            query['role'] = role
        return await self.collection.count_documents(query)

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
    
    async def get_logs(self, skip: int = 0, limit: int = 50, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get audit logs with pagination and filters"""
        query = filters or {}
        cursor = self.collection.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        logs = await cursor.to_list(length=limit)
        
        # Convert all ObjectId fields to string for JSON serialization
        def convert_objectids(obj):
            """Recursively convert ObjectId to string in nested structures"""
            if isinstance(obj, dict):
                result = {}
                for key, value in obj.items():
                    if key == '_id':
                        result['id'] = str(value)
                    elif hasattr(value, '__class__') and value.__class__.__name__ == 'ObjectId':
                        result[key] = str(value)
                    elif isinstance(value, (dict, list)):
                        result[key] = convert_objectids(value)
                    else:
                        result[key] = value
                return result
            elif isinstance(obj, list):
                return [convert_objectids(item) for item in obj]
            elif hasattr(obj, '__class__') and obj.__class__.__name__ == 'ObjectId':
                return str(obj)
            else:
                return obj
        
        # Convert all logs
        converted_logs = [convert_objectids(log) for log in logs]
        
        return converted_logs
    
    async def get_logs_count(self, filters: Dict[str, Any] = None) -> int:
        """Get total count of audit logs"""
        query = filters or {}
        return await self.collection.count_documents(query)

class UserSessionRepository:
    """Repository for user session operations (OAuth)"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.user_sessions
    
    async def create_indexes(self):
        """Create database indexes"""
        await self.collection.create_index("session_token", unique=True)
        await self.collection.create_index("user_id")
        await self.collection.create_index("expires_at")
        logger.info("Created indexes for user_sessions collection")
    
    async def create_session(self, session_data: Dict[str, Any]) -> str:
        """Create new session"""
        result = await self.collection.insert_one(session_data)
        return str(result.inserted_id)
    
    async def get_session_by_token(self, session_token: str) -> Optional[Dict[str, Any]]:
        """Get session by token"""
        session = await self.collection.find_one({"session_token": session_token})
        if session:
            session['id'] = session.pop('_id')
            # Check if expired
            if session['expires_at'] < datetime.now(timezone.utc):
                return None
        return session
    
    async def delete_session(self, session_token: str) -> bool:
        """Delete session (logout)"""
        result = await self.collection.delete_one({"session_token": session_token})
        return result.deleted_count > 0

class ApplicationRepository:
    """Repository for car loan applications"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.applications
    
    async def create_indexes(self):
        """Create database indexes"""
        await self.collection.create_index("user_id")
        await self.collection.create_index("lot_id")
        await self.collection.create_index("status")
        await self.collection.create_index([("user_id", 1), ("lot_id", 1)])
        logger.info("Created indexes for applications collection")
    
    async def create_application(self, app_data: Dict[str, Any]) -> str:
        """Create new application"""
        app_data['created_at'] = datetime.now(timezone.utc)
        app_data['updated_at'] = datetime.now(timezone.utc)
        
        result = await self.collection.insert_one(app_data)
        return str(result.inserted_id)
    
    async def get_applications_by_user(self, user_id: str, skip: int = 0, limit: int = 20) -> List[Dict[str, Any]]:
        """Get applications for a user"""
        cursor = self.collection.find({"user_id": user_id}).skip(skip).limit(limit).sort("created_at", -1)
        apps = await cursor.to_list(length=limit)
        
        for app in apps:
            app['id'] = str(app.pop('_id'))
        
        return apps
    
    async def get_all_applications(self, skip: int = 0, limit: int = 50, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all applications (admin)"""
        query = {}
        if status:
            query['status'] = status
        
        cursor = self.collection.find(query).skip(skip).limit(limit).sort("created_at", -1)
        apps = await cursor.to_list(length=limit)
        
        for app in apps:
            app['id'] = str(app.pop('_id'))
        
        return apps
    
    async def update_application_status(self, app_id: str, status: str, admin_notes: Optional[str] = None) -> bool:
        """Update application status"""
        try:
            from bson import ObjectId
            update_data = {
                'status': status,
                'updated_at': datetime.now(timezone.utc)
            }
            if admin_notes:
                update_data['admin_notes'] = admin_notes
            if status == 'contacted':
                update_data['contacted_at'] = datetime.now(timezone.utc)
            
            # Handle both ObjectId and string IDs
            query_id = app_id
            if len(app_id) == 24 and all(c in '0123456789abcdef' for c in app_id.lower()):
                try:
                    query_id = ObjectId(app_id)
                except:
                    pass  # Use string ID if ObjectId conversion fails
            
            result = await self.collection.update_one(
                {"_id": query_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating application {app_id}: {e}")
            return False
    
    async def get_applications_count(self, status: Optional[str] = None) -> int:
        """Get total count of applications"""
        query = {}
        if status:
            query['status'] = status
        return await self.collection.count_documents(query)

class ReservationRepository:
    """Repository for car reservations"""
    
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.reservations
    
    async def create_indexes(self):
        """Create database indexes"""
        await self.collection.create_index("user_id")
        await self.collection.create_index("lot_id")
        await self.collection.create_index("lot_slug")
        await self.collection.create_index("status")
        await self.collection.create_index("expires_at")
        await self.collection.create_index([("user_id", 1), ("lot_id", 1)])
        logger.info("Created indexes for reservations collection")
    
    async def create_reservation(self, reservation_data: Dict[str, Any]) -> str:
        """Create new reservation"""
        reservation_data['created_at'] = datetime.now(timezone.utc)
        
        result = await self.collection.insert_one(reservation_data)
        return str(result.inserted_id)
    
    async def get_reservations_by_user(self, user_id: str, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get reservations for a user"""
        query = {"user_id": user_id}
        if status:
            query['status'] = status
        
        cursor = self.collection.find(query).sort("created_at", -1)
        reservations = await cursor.to_list(length=None)
        
        for res in reservations:
            res['id'] = str(res.pop('_id'))
        
        return reservations
    
    async def get_reservation_by_id(self, reservation_id: str) -> Optional[Dict[str, Any]]:
        """Get reservation by ID"""
        try:
            from bson import ObjectId
            query_id = reservation_id
            
            # Try ObjectId conversion for MongoDB IDs
            if len(reservation_id) == 24 and all(c in '0123456789abcdef' for c in reservation_id.lower()):
                try:
                    query_id = ObjectId(reservation_id)
                except:
                    pass
            
            reservation = await self.collection.find_one({"_id": query_id})
            if reservation:
                reservation['id'] = str(reservation.pop('_id'))
            return reservation
        except Exception as e:
            logger.error(f"Error getting reservation {reservation_id}: {e}")
            return None
    
    async def update_reservation_status(self, reservation_id: str, status: str, application_id: Optional[str] = None) -> bool:
        """Update reservation status"""
        try:
            from bson import ObjectId
            query_id = reservation_id
            
            if len(reservation_id) == 24 and all(c in '0123456789abcdef' for c in reservation_id.lower()):
                try:
                    query_id = ObjectId(reservation_id)
                except:
                    pass
            
            update_data = {'status': status}
            if application_id:
                update_data['application_id'] = application_id
            
            result = await self.collection.update_one(
                {"_id": query_id},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating reservation {reservation_id}: {e}")
            return False
    
    async def expire_old_reservations(self) -> int:
        """Expire reservations that have passed their expiration time"""
        result = await self.collection.update_many(
            {
                "status": "active",
                "expires_at": {"$lt": datetime.now(timezone.utc)}
            },
            {"$set": {"status": "expired"}}
        )
        return result.modified_count

# Initialize repositories when database is connected
lot_repo = None
user_repo = None
audit_repo = None
session_repo = None
application_repo = None
reservation_repo = None

async def initialize_repositories():
    """Initialize all repositories"""
    global lot_repo, user_repo, audit_repo, session_repo, application_repo, reservation_repo
    
    database = get_database()
    lot_repo = LotRepository(database)
    user_repo = UserRepository(database)
    audit_repo = AuditRepository(database)
    session_repo = UserSessionRepository(database)
    application_repo = ApplicationRepository(database)
    reservation_repo = ReservationRepository(database)
    
    # Create indexes
    await lot_repo.create_indexes()
    await user_repo.create_indexes()
    await audit_repo.create_indexes()
    await session_repo.create_indexes()
    await application_repo.create_indexes()
    await reservation_repo.create_indexes()
    
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

def get_session_repository() -> UserSessionRepository:
    """Get session repository instance"""
    if session_repo is None:
        raise RuntimeError("Repositories not initialized. Call initialize_repositories() first.")
    return session_repo

def get_application_repository() -> ApplicationRepository:
    """Get application repository instance"""
    if application_repo is None:
        raise RuntimeError("Repositories not initialized. Call initialize_repositories() first.")
    return application_repo

def get_reservation_repository() -> ReservationRepository:
    """Get reservation repository instance"""
    if reservation_repo is None:
        raise RuntimeError("Repositories not initialized. Call initialize_repositories() first.")
    return reservation_repo
