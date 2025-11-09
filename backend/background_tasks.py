"""
Background tasks for CargwinNewCar
Handles auto-archiving of expired offers and other periodic tasks
"""
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from database import get_database

logger = logging.getLogger(__name__)

# Background task control
_background_task = None
_should_run = False

async def archive_expired_offers():
    """
    Archive offers that have expired (after 48 hours from publish_at or endsAt)
    Also archive offers where a user paid deposit
    """
    try:
        db = get_database()
        lots_collection = db.lots
        reservations_collection = db.reservations
        
        # Find published lots that are older than 48 hours
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=48)
        
        # Find lots to archive
        result = await lots_collection.update_many(
            {
                "status": "published",
                "$or": [
                    {"publish_at": {"$lt": cutoff_time}},
                    {"created_at": {"$lt": cutoff_time}}
                ]
            },
            {
                "$set": {
                    "status": "archived",
                    "archived_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.modified_count > 0:
            logger.info(f"📦 Auto-archived {result.modified_count} expired offers")
        
        # Archive lots where someone paid reservation deposit
        # Find reservations with deposit_paid = True
        paid_reservations = await reservations_collection.find(
            {"deposit_paid": True, "status": "active"}
        ).to_list(length=None)
        
        for res in paid_reservations:
            lot_slug = res.get('lot_slug')
            if lot_slug:
                await lots_collection.update_one(
                    {"slug": lot_slug},
                    {
                        "$set": {
                            "status": "sold",
                            "archived_at": datetime.now(timezone.utc)
                        }
                    }
                )
                logger.info(f"🎉 Archived lot {lot_slug} - deposit paid")
        
        # Expire old reservations
        expired_result = await reservations_collection.update_many(
            {
                "status": "active",
                "expires_at": {"$lt": datetime.now(timezone.utc)}
            },
            {"$set": {"status": "expired"}}
        )
        
        if expired_result.modified_count > 0:
            logger.info(f"⏰ Expired {expired_result.modified_count} old reservations")
            
    except Exception as e:
        logger.error(f"Error in archive_expired_offers: {e}")

async def background_worker():
    """Run background tasks periodically"""
    global _should_run
    
    logger.info("🔄 Background worker started")
    
    while _should_run:
        try:
            # Run archiving task
            await archive_expired_offers()
            
            # Wait 1 hour before next run
            await asyncio.sleep(3600)
            
        except asyncio.CancelledError:
            logger.info("Background worker cancelled")
            break
        except Exception as e:
            logger.error(f"Background worker error: {e}")
            await asyncio.sleep(60)  # Wait 1 min on error

async def start_background_tasks():
    """Start all background tasks"""
    global _background_task, _should_run
    
    if _background_task is not None:
        logger.warning("Background tasks already running")
        return
    
    _should_run = True
    _background_task = asyncio.create_task(background_worker())
    logger.info("✅ Background tasks started")

async def stop_background_tasks():
    """Stop all background tasks"""
    global _background_task, _should_run
    
    _should_run = False
    
    if _background_task:
        _background_task.cancel()
        try:
            await _background_task
        except asyncio.CancelledError:
            pass
        _background_task = None
    
    logger.info("🛑 Background tasks stopped")
