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
    Archive offers strategically:
    - Offers auto-renew every 48 hours by default (stay published)
    - Archive only if: user paid deposit OR manually set to archive
    - Check for price drops and notify subscribers
    """
    try:
        db = get_database()
        lots_collection = db.lots
        reservations_collection = db.reservations
        subscriptions_collection = db.subscriptions
        
        # Archive lots where someone paid reservation deposit
        # Find reservations with deposit_paid = True
        paid_reservations = await reservations_collection.find(
            {"deposit_paid": True, "status": "active"}
        ).to_list(length=None)
        
        archived_count = 0
        for res in paid_reservations:
            lot_slug = res.get('lot_slug')
            if lot_slug:
                result = await lots_collection.update_one(
                    {"slug": lot_slug, "status": "published"},
                    {
                        "$set": {
                            "status": "sold",
                            "archived_at": datetime.now(timezone.utc)
                        }
                    }
                )
                if result.modified_count > 0:
                    archived_count += 1
                    logger.info(f"🎉 Archived lot {lot_slug} - deposit paid")
        
        if archived_count > 0:
            logger.info(f"📦 Auto-archived {archived_count} sold offers")
        
        # Check for new published lots and notify subscribers
        # Get lots published in last hour
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        new_lots = await lots_collection.find({
            "status": "published",
            "created_at": {"$gte": one_hour_ago}
        }).to_list(length=None)
        
        for lot in new_lots:
            make = lot.get('make', '')
            model = lot.get('model', '')
            fleet_price = lot.get('msrp', 0) - lot.get('discount', 0)
            monthly = lot.get('lease', {}).get('monthly', 0)
            
            # Find matching subscriptions
            matching_subs = await subscriptions_collection.find({
                "is_active": True,
                "$or": [
                    {"makes": make},
                    {"models": model}
                ]
            }).to_list(length=None)
            
            # Filter by max_price
            for sub in matching_subs:
                if sub.get('max_price') and fleet_price > sub['max_price']:
                    continue
                
                # Log notification (in production: send via SendGrid/Twilio/Telegram)
                logger.info(f"📧 Would notify {sub.get('email')} about new {make} {model} at ${monthly}/mo")
                # TODO: Actual notification sending when API keys are configured
        
        # Expire old reservations (but don't archive lots)
        expired_result = await reservations_collection.update_many(
            {
                "status": "active",
                "expires_at": {"$lt": datetime.now(timezone.utc)}
            },
            {"$set": {"status": "expired"}}
        )
        
        if expired_result.modified_count > 0:
            logger.info(f"⏰ Expired {expired_result.modified_count} old reservations")
        
        # Note: Lots auto-renew by default and stay published
        # Admin must manually archive if needed
            
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
