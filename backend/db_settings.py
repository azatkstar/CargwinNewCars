"""
Settings CRUD Operations

Manage system settings in MongoDB
"""
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


async def get_settings(db: AsyncIOMotorDatabase) -> Optional[Dict[str, Any]]:
    """
    Get system settings (singleton document)
    
    Returns:
        Settings dict or None if not initialized
    """
    settings = await db.system_settings.find_one({"id": "system_settings"}, {"_id": 0})
    return settings


async def update_settings(
    db: AsyncIOMotorDatabase,
    updates: Dict[str, Any],
    updated_by: Optional[str] = None
) -> bool:
    """
    Update system settings
    
    Args:
        db: Database instance
        updates: Fields to update
        updated_by: User email who made changes
        
    Returns:
        True if updated
    """
    updates["updated_at"] = datetime.now(timezone.utc)
    if updated_by:
        updates["updated_by"] = updated_by
    
    result = await db.system_settings.update_one(
        {"id": "system_settings"},
        {"$set": updates},
        upsert=True
    )
    
    logger.info(f"Settings updated by {updated_by}: {list(updates.keys())}")
    
    return True


async def initialize_default_settings(db: AsyncIOMotorDatabase) -> None:
    """
    Initialize default settings if not exists
    """
    existing = await get_settings(db)
    
    if not existing:
        from models_settings import SystemSettings
        
        default_settings = SystemSettings().dict()
        
        await db.system_settings.insert_one(default_settings)
        
        logger.info("Initialized default system settings")
