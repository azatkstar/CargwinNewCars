"""
Database CRUD operations for parsed lease programs
"""
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)


async def create_parsed_program(db: AsyncIOMotorDatabase, program_data: Dict[str, Any]) -> str:
    """
    Create a new parsed lease program
    
    Args:
        db: MongoDB database instance
        program_data: Program data dict (from LeaseProgramParsed.dict())
        
    Returns:
        Created program ID
    """
    # Generate ID if not present
    if "id" not in program_data or not program_data["id"]:
        program_data["id"] = str(uuid4())
    
    # Insert into database
    await db.lease_programs_parsed.insert_one(program_data)
    
    logger.info(f"Created parsed program: {program_data['id']} ({program_data.get('brand')} {program_data.get('model')})")
    
    return program_data["id"]


async def get_parsed_program(db: AsyncIOMotorDatabase, program_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single parsed program by ID
    
    Args:
        db: MongoDB database instance
        program_id: Program ID
        
    Returns:
        Program dict or None if not found
    """
    program = await db.lease_programs_parsed.find_one({"id": program_id}, {"_id": 0})
    return program


async def get_parsed_programs(
    db: AsyncIOMotorDatabase,
    brand: Optional[str] = None,
    model: Optional[str] = None,
    month: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Get parsed programs with optional filters
    
    Args:
        db: MongoDB database instance
        brand: Filter by brand
        model: Filter by model
        month: Filter by month
        region: Filter by region
        limit: Maximum number of results
        
    Returns:
        List of program dicts
    """
    query = {}
    
    if brand:
        query["brand"] = {"$regex": f"^{brand}$", "$options": "i"}
    
    if model:
        query["model"] = {"$regex": f"^{model}$", "$options": "i"}
    
    if month:
        query["month"] = {"$regex": month, "$options": "i"}
    
    if region:
        query["region"] = {"$regex": region, "$options": "i"}
    
    programs = await db.lease_programs_parsed.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    logger.info(f"Found {len(programs)} parsed programs with filters: {query}")
    
    return programs


async def update_parsed_program(
    db: AsyncIOMotorDatabase,
    program_id: str,
    update_data: Dict[str, Any]
) -> bool:
    """
    Update a parsed program
    
    Args:
        db: MongoDB database instance
        program_id: Program ID
        update_data: Fields to update
        
    Returns:
        True if updated, False if not found
    """
    result = await db.lease_programs_parsed.update_one(
        {"id": program_id},
        {"$set": update_data}
    )
    
    if result.matched_count > 0:
        logger.info(f"Updated parsed program: {program_id}")
        return True
    
    return False


async def delete_parsed_program(db: AsyncIOMotorDatabase, program_id: str) -> bool:
    """
    Delete a parsed program
    
    Args:
        db: MongoDB database instance
        program_id: Program ID
        
    Returns:
        True if deleted, False if not found
    """
    result = await db.lease_programs_parsed.delete_one({"id": program_id})
    
    if result.deleted_count > 0:
        logger.info(f"Deleted parsed program: {program_id}")
        return True
    
    return False


async def get_programs_by_pdf_id(db: AsyncIOMotorDatabase, pdf_id: str) -> List[Dict[str, Any]]:
    """
    Get all parsed programs linked to a specific PDF
    
    Args:
        db: MongoDB database instance
        pdf_id: Raw PDF ID
        
    Returns:
        List of programs
    """
    programs = await db.lease_programs_parsed.find(
        {"pdf_id": pdf_id},
        {"_id": 0}
    ).to_list(length=None)
    
    return programs
