"""
Multi-Brand AutoSync Management

Manage AutoSync operations per brand independently
"""
from typing import Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Supported brands (from parsers)
SUPPORTED_BRANDS = ["Toyota", "Lexus", "Honda", "Acura", "Kia", "Hyundai", "BMW", "Mercedes"]


def get_supported_brands() -> List[str]:
    """Get list of supported brands"""
    return SUPPORTED_BRANDS


async def get_brand_status(db: AsyncIOMotorDatabase, brand: str) -> Dict[str, Any]:
    """
    Get sync status for a specific brand
    
    Args:
        db: Database instance
        brand: Brand name
        
    Returns:
        Status dict with programs count, deals count, last sync
    """
    # Count programs
    programs_count = await db.lease_programs_parsed.count_documents({
        "brand": {"$regex": f"^{brand}$", "$options": "i"}
    })
    
    # Count deals
    deals_count = await db.featured_deals.count_documents({
        "brand": {"$regex": f"^{brand}$", "$options": "i"}
    })
    
    # Get last sync log
    last_sync = await db.auto_sync_logs.find_one(
        {"brand": {"$regex": f"^{brand}$", "$options": "i"}},
        sort=[("timestamp", -1)]
    )
    
    return {
        "brand": brand,
        "programs_count": programs_count,
        "deals_count": deals_count,
        "last_sync_time": last_sync.get("timestamp") if last_sync else None,
        "last_sync_deals_updated": last_sync.get("deals_count", 0) if last_sync else 0,
        "status": "ok" if programs_count > 0 else "no_programs"
    }


async def run_sync_for_brand(db: AsyncIOMotorDatabase, brand: str) -> Dict[str, Any]:
    """
    Run AutoSync for a specific brand only
    
    Args:
        db: Database instance
        brand: Brand name
        
    Returns:
        Sync result dict
    """
    from auto_sync_engine import recalc_featured_deals_for_brand_model
    from monitoring import log_sync_status
    from notifications import add_in_app_notification
    
    logger.info(f"Running sync for brand: {brand}")
    
    try:
        # Recalculate deals for this brand
        updated_count = await recalc_featured_deals_for_brand_model(db, brand, model=None)
        
        # Log success
        log_sync_status("OK", f"Brand {brand}: {updated_count} deals updated")
        
        # Notification
        if updated_count > 0:
            add_in_app_notification(
                "info",
                f"{brand} sync completed: {updated_count} deals updated"
            )
        
        return {
            "brand": brand,
            "deals_updated": updated_count,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Sync failed for {brand}: {e}")
        log_sync_status("FAIL", f"Brand {brand}: {str(e)}")
        
        add_in_app_notification("error", f"{brand} sync failed: {str(e)}")
        
        return {
            "brand": brand,
            "deals_updated": 0,
            "status": "failed",
            "error": str(e)
        }


async def run_all_brand_syncs(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Run sync for all supported brands
    
    Returns:
        Summary of all syncs
    """
    results = []
    total_updated = 0
    
    for brand in SUPPORTED_BRANDS:
        result = await run_sync_for_brand(db, brand)
        results.append(result)
        total_updated += result.get("deals_updated", 0)
    
    logger.info(f"All brands sync complete: {total_updated} total deals updated")
    
    return {
        "brands": results,
        "total_deals_updated": total_updated
    }
