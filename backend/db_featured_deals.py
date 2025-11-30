"""
Database CRUD operations for featured deals
"""
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)


async def create_deal(db: AsyncIOMotorDatabase, deal_data: Dict[str, Any]) -> str:
    """
    Create a new featured deal
    
    Args:
        db: MongoDB database instance
        deal_data: Deal data dict
        
    Returns:
        Created deal ID
    """
    # Generate ID if not present
    if "id" not in deal_data or not deal_data["id"]:
        deal_data["id"] = str(uuid4())
    
    # Insert into database
    await db.featured_deals.insert_one(deal_data)
    
    logger.info(f"Created featured deal: {deal_data['id']} ({deal_data.get('brand')} {deal_data.get('model')})")
    
    return deal_data["id"]


async def list_deals(
    db: AsyncIOMotorDatabase,
    brand: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 100,
    sort_by: str = "created_at",
    sort_order: int = -1
) -> List[Dict[str, Any]]:
    """
    List featured deals with optional filters
    
    Args:
        db: MongoDB database instance
        brand: Filter by brand
        region: Filter by region
        limit: Maximum number of results
        sort_by: Field to sort by
        sort_order: -1 for descending, 1 for ascending
        
    Returns:
        List of deal dicts
    """
    query = {}
    
    if brand:
        query["brand"] = {"$regex": f"^{brand}$", "$options": "i"}
    
    if region:
        query["region"] = {"$regex": region, "$options": "i"}
    
    deals = await db.featured_deals.find(
        query,
        {"_id": 0}
    ).sort(sort_by, sort_order).limit(limit).to_list(limit)
    
    logger.info(f"Found {len(deals)} featured deals with filters: {query}")
    
    return deals


async def get_deal(db: AsyncIOMotorDatabase, deal_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single featured deal by ID
    
    Args:
        db: MongoDB database instance
        deal_id: Deal ID
        
    Returns:
        Deal dict or None if not found
    """
    deal = await db.featured_deals.find_one({"id": deal_id}, {"_id": 0})
    return deal


async def delete_deal(db: AsyncIOMotorDatabase, deal_id: str) -> bool:
    """
    Delete a featured deal
    
    Args:
        db: MongoDB database instance
        deal_id: Deal ID
        
    Returns:
        True if deleted, False if not found
    """
    result = await db.featured_deals.delete_one({"id": deal_id})
    
    if result.deleted_count > 0:
        logger.info(f"Deleted featured deal: {deal_id}")
        return True
    
    return False


async def update_calculated_fields(
    db: AsyncIOMotorDatabase,
    deal_id: str,
    fields: Dict[str, Any]
) -> bool:
    """
    Update calculated fields for a deal
    
    Args:
        db: MongoDB database instance
        deal_id: Deal ID
        fields: Fields to update (calculated_payment, etc.)
        
    Returns:
        True if updated, False if not found
    """
    result = await db.featured_deals.update_one(
        {"id": deal_id},
        {"$set": fields}
    )
    
    if result.matched_count > 0:
        logger.info(f"Updated calculated fields for deal: {deal_id}")
        return True
    
    return False
