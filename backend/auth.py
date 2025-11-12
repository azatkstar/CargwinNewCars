"""
Authentication and Authorization for CargwinNewCar
JWT-based authentication with magic-link login
"""
import os
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from database import get_user_repository, get_audit_repository, UserRepository, AuditRepository

logger = logging.getLogger(__name__)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
MAGIC_LINK_EXPIRE_MINUTES = 15

# Password context for hashing (not used for magic-link but useful for future)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer for token extraction
security = HTTPBearer(auto_error=False)

# Pydantic models
class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]

class MagicLinkRequest(BaseModel):
    email: EmailStr

class MagicLinkVerify(BaseModel):
    token: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CompleteProfileRequest(BaseModel):
    # Required fields
    credit_score: int
    auto_loan_history: bool
    employment_type: str  # 1099, W2, Self-employed
    annual_income: int
    employment_duration_months: int
    address: str
    residence_duration_months: int
    monthly_expenses: int
    down_payment_ready: int
    ssn: Optional[str] = None  # Social Security Number (encrypted)
    
    # New Finance Manager fields (optional)
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    time_at_job_months: Optional[int] = None
    monthly_income_pretax: Optional[int] = None
    date_of_birth: Optional[str] = None
    drivers_license_number: Optional[str] = None
    immigration_status: Optional[str] = None  # green_card, citizen, asylum
    phone: Optional[str] = None
    current_address: Optional[str] = None
    current_address_duration_months: Optional[int] = None
    previous_address: Optional[str] = None

class User(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    profile_completed: bool = False
    picture: str = ""
    last_login: Optional[datetime] = None
    
    # Credit fields (optional for response)
    credit_score: Optional[int] = None
    auto_loan_history: Optional[bool] = None
    employment_type: Optional[str] = None
    annual_income: Optional[int] = None
    employment_duration_months: Optional[int] = None
    address: Optional[str] = None
    residence_duration_months: Optional[int] = None
    monthly_expenses: Optional[int] = None
    down_payment_ready: Optional[int] = None
    ssn: Optional[str] = None
    
    # New Finance Manager fields (optional for response)
    employer_name: Optional[str] = None
    job_title: Optional[str] = None
    time_at_job_months: Optional[int] = None
    monthly_income_pretax: Optional[int] = None
    date_of_birth: Optional[str] = None
    drivers_license_number: Optional[str] = None
    immigration_status: Optional[str] = None
    phone: Optional[str] = None
    current_address: Optional[str] = None
    current_address_duration_months: Optional[int] = None
    previous_address: Optional[str] = None

# In-memory storage for magic links (in production use Redis)
magic_links_storage: Dict[str, Dict[str, Any]] = {}

# Utility functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[TokenData]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        if email is None:
            return None
            
        token_data = TokenData(email=email, role=role)
        return token_data
        
    except JWTError as e:
        logger.warning(f"Token verification failed: {e}")
        return None

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def generate_magic_link_token() -> str:
    """Generate secure magic link token"""
    return secrets.token_urlsafe(32)

async def create_magic_link(email: str, user_repo: UserRepository, audit_repo: AuditRepository) -> str:
    """Create magic link for user authentication"""
    try:
        # Check if user exists, create if not
        user = await user_repo.get_user_by_email(email)
        if not user:
            # Auto-create user with viewer role
            user_data = {
                "email": email,
                "name": email.split("@")[0],
                "role": "viewer",
                "is_active": True
            }
            user_id = await user_repo.create_user(user_data)
            user = await user_repo.get_user_by_email(email)
            
            # Log user creation
            await audit_repo.log_action({
                "user_email": email,
                "action": "user_created",
                "resource_type": "user",
                "resource_id": user_id,
                "changes": {"email": email, "role": "viewer"}
            })
        
        if not user['is_active']:
            raise HTTPException(
                status_code=403, 
                detail="User account is deactivated"
            )
        
        # Generate magic link token
        token = generate_magic_link_token()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=MAGIC_LINK_EXPIRE_MINUTES)
        
        # Store magic link
        magic_links_storage[token] = {
            "email": email,
            "user_id": user["id"],
            "expires_at": expires_at,
            "used": False
        }
        
        # Log magic link creation
        await audit_repo.log_action({
            "user_email": email,
            "action": "magic_link_created",
            "resource_type": "auth",
            "resource_id": token[:8] + "...",  # Partial token for security
            "changes": {"expires_at": expires_at.isoformat()}
        })
        
        logger.info(f"Magic link created for user: {email}")
        return token
        
    except Exception as e:
        logger.error(f"Failed to create magic link for {email}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create magic link")

async def verify_magic_link(token: str, user_repo: UserRepository, audit_repo: AuditRepository) -> User:
    """Verify magic link and return user"""
    try:
        # Check if token exists
        if token not in magic_links_storage:
            raise HTTPException(status_code=404, detail="Invalid or expired magic link")
        
        magic_link = magic_links_storage[token]
        
        # Check if token is expired
        if datetime.now(timezone.utc) > magic_link["expires_at"]:
            # Clean up expired token
            del magic_links_storage[token]
            raise HTTPException(status_code=404, detail="Magic link has expired")
        
        # Check if token is already used
        if magic_link["used"]:
            raise HTTPException(status_code=404, detail="Magic link has already been used")
        
        # Mark token as used
        magic_links_storage[token]["used"] = True
        
        # Get user
        user = await user_repo.get_user_by_email(magic_link["email"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update last login
        await user_repo.update_user(user["id"], {
            "last_login": datetime.now(timezone.utc)
        })
        
        # Log successful login
        await audit_repo.log_action({
            "user_email": user["email"],
            "action": "login_success",
            "resource_type": "auth",
            "resource_id": user["id"],
            "changes": {"login_method": "magic_link"}
        })
        
        # Clean up used token
        del magic_links_storage[token]
        
        logger.info(f"Successful magic link login for user: {user['email']}")
        return User(**user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to verify magic link: {e}")
        raise HTTPException(status_code=500, detail="Magic link verification failed")

async def create_user_tokens(user: User) -> Token:
    """Create access and refresh tokens for user"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    token_data = {
        "sub": user.email,
        "role": user.role,
        "user_id": user.id,
        "name": user.name
    }
    
    access_token = create_access_token(data=token_data, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(data=token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "is_active": user.is_active
        }
    )

# Dependency functions
async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    user_repo: UserRepository = Depends(get_user_repository)
) -> Optional[User]:
    """Get current authenticated user"""
    if not credentials:
        return None
    
    token_data = verify_token(credentials.credentials)
    if not token_data:
        return None
    
    user = await user_repo.get_user_by_email(token_data.email)
    if not user or not user["is_active"]:
        return None
    
    return User(**user)

async def require_auth(current_user: Optional[User] = Depends(get_current_user)) -> User:
    """Require authentication - raise exception if not authenticated"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

def require_role(required_role: str):
    """Create dependency that requires specific role"""
    def role_checker(current_user: User = Depends(require_auth)) -> User:
        role_hierarchy = {"user": 0, "finance_manager": 1, "editor": 2, "admin": 3}
        
        user_level = role_hierarchy.get(current_user.role, -1)
        required_level = role_hierarchy.get(required_role, 999)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' or higher required"
            )
        return current_user
    return role_checker

# Role-specific dependencies
require_admin = require_role("admin")
require_editor = require_role("editor")
require_finance_manager = require_role("finance_manager")

# Utility functions for cleanup
async def cleanup_expired_magic_links():
    """Clean up expired magic links"""
    current_time = datetime.now(timezone.utc)
    expired_tokens = [
        token for token, data in magic_links_storage.items()
        if current_time > data["expires_at"]
    ]
    
    for token in expired_tokens:
        del magic_links_storage[token]
    
    if expired_tokens:
        logger.info(f"Cleaned up {len(expired_tokens)} expired magic links")

def get_user_from_request_context(request: Request) -> Optional[User]:
    """Extract user from request context (if available)"""
    return getattr(request.state, "user", None)

def set_user_in_request_context(request: Request, user: User):
    """Set user in request context"""
    request.state.user = user

async def register_user(email: str, password: str, name: str, user_repo: UserRepository, audit_repo: AuditRepository) -> User:
    """Register new user with email and password"""
    # Check if user already exists
    existing_user = await user_repo.get_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Hash password
    password_hash = hash_password(password)
    
    # Create user
    user_data = {
        "email": email,
        "password_hash": password_hash,
        "name": name,
        "role": "user",
        "is_active": True,
        "profile_completed": False,
        "picture": ""
    }
    
    user_id = await user_repo.create_user(user_data)
    
    # Log user creation
    await audit_repo.log_action({
        "user_email": email,
        "action": "user_registered",
        "resource_type": "user",
        "resource_id": user_id,
        "changes": {"email": email, "name": name, "auth_method": "password"}
    })
    
    # Get created user
    user = await user_repo.get_user_by_email(email)
    return User(**user)

async def authenticate_user(email: str, password: str, user_repo: UserRepository) -> Optional[User]:
    """Authenticate user with email and password"""
    user = await user_repo.get_user_by_email(email)
    
    if not user:
        return None
    
    if not user.get('password_hash'):
        raise HTTPException(status_code=400, detail="This account uses a different login method (Google or Magic Link)")
    
    if not verify_password(password, user['password_hash']):
        return None
    
    if not user['is_active']:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    
    # Update last login
    await user_repo.update_user(user['id'], {"last_login": datetime.now(timezone.utc)})
    
    return User(**user)

async def process_oauth_session(session_id: str, user_repo: UserRepository, session_repo, audit_repo: AuditRepository) -> Dict[str, Any]:
    """Process Emergent OAuth session_id and return session_token + user data"""
    from database import get_session_repository
    import httpx
    
    session_repo = get_session_repository()
    
    # Call Emergent Auth API to get session data
    emergent_auth_api = os.environ.get(
        "EMERGENT_AUTH_API_URL",
        "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
    )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                emergent_auth_api,
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid session ID")
            
            data = response.json()
            
            # Extract user data
            user_id = data.get("id")
            email = data.get("email")
            name = data.get("name", "")
            picture = data.get("picture", "")
            
            # Check if user exists
            existing_user = await user_repo.get_user_by_email(email)
            
            if not existing_user:
                # Create new user
                user_data = {
                    "_id": user_id,  # Use Google ID as user ID
                    "email": email,
                    "name": name,
                    "picture": picture,
                    "role": "user",
                    "is_active": True,
                    "profile_completed": False
                }
                await user_repo.create_user(user_data)
                
                # Log user creation
                await audit_repo.log_action({
                    "user_email": email,
                    "action": "user_registered",
                    "resource_type": "user",
                    "resource_id": user_id,
                    "changes": {"email": email, "name": name, "auth_method": "google_oauth"}
                })
                
                user = await user_repo.get_user_by_email(email)
            else:
                user = existing_user
                user_id = user['id']
                
                # Update last login
                await user_repo.update_user(user_id, {"last_login": datetime.now(timezone.utc)})
            
            # Create session token
            import secrets
            session_token = secrets.token_urlsafe(32)
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)
            
            # Store session in database
            session_data = {
                "user_id": user_id,
                "session_token": session_token,
                "expires_at": expires_at
            }
            await session_repo.create_session(session_data)
            
            # Return session token and user data
            return {
                "session_token": session_token,
                "user": User(**user).dict(),
                "expires_in": 7 * 24 * 60 * 60  # 7 days in seconds
            }
            
    except httpx.RequestError as e:
        logger.error(f"Error calling Emergent Auth API: {e}")
        raise HTTPException(status_code=500, detail="Failed to process OAuth session")

async def get_user_from_session_token(session_token: str, user_repo: UserRepository, session_repo) -> Optional[User]:
    """Get user from session token (OAuth)"""
    from database import get_session_repository
    
    if not session_repo:
        session_repo = get_session_repository()
    
    # Get session
    session = await session_repo.get_session_by_token(session_token)
    
    if not session:
        return None
    
    # Get user
    user = await user_repo.get_user_by_id(session['user_id'])
    
    if not user:
        return None
    
    return User(**user)