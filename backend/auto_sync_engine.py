"""
AutoSync Engine

Automatically syncs and recalculates Featured Deals when lease programs change
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)


async def scan_for_updated_programs(db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
    """
    Scan for lease programs and compare with previous versions
    
    Returns:
        List of changes detected
    """
    changes = []
    
    # Get all parsed programs
    programs = await db.lease_programs_parsed.find({}, {"_id": 0}).to_list(length=None)
    
    logger.info(f"Scanning {len(programs)} parsed programs for changes")
    
    # For each program, check if there's a previous version in sync logs
    for program in programs:
        brand = program.get("brand")
        model = program.get("model")
        
        if not brand:
            continue
        
        # Get last sync log for this brand/model
        last_log = await db.auto_sync_logs.find_one(
            {"brand": brand, "model": model},
            sort=[("timestamp", -1)]
        )
        
        if last_log:
            # Compare MF
            old_mf = last_log.get("snapshot", {}).get("mf", {})
            new_mf = program.get("mf", {})
            
            mf_changes = {}
            for term in set(list(old_mf.keys()) + list(new_mf.keys())):
                old_val = old_mf.get(term)
                new_val = new_mf.get(term)
                if old_val != new_val:
                    mf_changes[f"mf_{term}"] = {"old": old_val, "new": new_val}
            
            # Compare Residuals
            old_rv = last_log.get("snapshot", {}).get("residual", {})
            new_rv = program.get("residual", {})
            
            rv_changes = {}
            for term in set(list(old_rv.keys()) + list(new_rv.keys())):
                old_term_data = old_rv.get(term, {})
                new_term_data = new_rv.get(term, {})
                
                for mileage in set(list(old_term_data.keys()) + list(new_term_data.keys())):
                    old_val = old_term_data.get(mileage)
                    new_val = new_term_data.get(mileage)
                    if old_val != new_val:
                        rv_changes[f"rv_{term}_{mileage}"] = {"old": old_val, "new": new_val}
            
            # If there are changes, record them
            if mf_changes or rv_changes:
                changes.append({
                    "brand": brand,
                    "model": model,
                    "mf_changes": mf_changes,
                    "rv_changes": rv_changes,
                    "program_id": program.get("id")
                })
                
                logger.info(f"Detected changes in {brand} {model}: {len(mf_changes)} MF changes, {len(rv_changes)} RV changes")
    
    return changes


async def recalc_featured_deals_for_brand_model(
    db: AsyncIOMotorDatabase,
    brand: str,
    model: Optional[str] = None
) -> int:
    """
    Recalculate all Featured Deals for specific brand/model
    
    Args:
        db: Database instance
        brand: Brand name
        model: Optional model name
        
    Returns:
        Number of deals updated
    """
    from models_lease_programs import LeaseCalculationRequest
    from lease_calculator_pro import calculate_lease_pro
    from db_lease_programs import get_latest_parsed_program_for
    from db_featured_deals import update_calculated_fields
    
    # Find matching deals
    query = {"brand": {"$regex": f"^{brand}$", "$options": "i"}}
    if model:
        query["model"] = {"$regex": f"^{model}$", "$options": "i"}
    
    deals = await db.featured_deals.find(query, {"_id": 0}).to_list(length=None)
    
    logger.info(f"Recalculating {len(deals)} deals for {brand} {model or 'all models'}")
    
    updated_count = 0
    
    for deal in deals:
        try:
            # Get latest parsed program
            parsed_program = await get_latest_parsed_program_for(
                db,
                brand=deal.get("brand"),
                model=deal.get("model"),
                region=deal.get("region")
            )
            
            if not parsed_program:
                logger.warning(f"No parsed program found for deal {deal.get('id')}")
                continue
            
            # Recalculate
            calc_request = LeaseCalculationRequest(
                brand=deal.get("brand"),
                model=deal.get("model"),
                msrp=deal.get("msrp"),
                selling_price=deal.get("selling_price"),
                term_months=deal.get("term_months"),
                annual_mileage=deal.get("annual_mileage"),
                region=deal.get("region", "California")
            )
            
            calc_result = calculate_lease_pro(calc_request, parsed_program)
            
            # Update calculated fields
            calc_fields = {
                "calculated_payment": calc_result.monthly_payment_with_tax,
                "calculated_driveoff": calc_result.estimated_drive_off,
                "calculated_onepay": calc_result.one_pay_estimated,
                "mf_used": calc_result.mf_used,
                "residual_percent_used": calc_result.residual_percent_used,
                "savings_vs_msrp": calc_result.estimated_savings_vs_msrp_deal
            }
            
            await update_calculated_fields(db, deal.get("id"), calc_fields)
            
            updated_count += 1
            
            logger.info(f"Updated deal {deal.get('id')}: ${calc_result.monthly_payment_with_tax:.2f}/mo")
            
        except Exception as e:
            logger.error(f"Failed to recalc deal {deal.get('id')}: {e}")
    
    return updated_count


async def full_recalculate_all_deals(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Recalculate all Featured Deals
    
    Returns:
        Statistics dict
    """
    logger.info("Starting full recalculation of all deals")
    
    deals = await db.featured_deals.find({}, {"_id": 0}).to_list(length=None)
    
    total = len(deals)
    success_count = 0
    failed_count = 0
    failed_deals = []
    
    from models_lease_programs import LeaseCalculationRequest
    from lease_calculator_pro import calculate_lease_pro
    from db_lease_programs import get_latest_parsed_program_for
    from db_featured_deals import update_calculated_fields
    
    for deal in deals:
        try:
            parsed_program = await get_latest_parsed_program_for(
                db,
                brand=deal.get("brand"),
                model=deal.get("model"),
                region=deal.get("region")
            )
            
            if not parsed_program:
                failed_count += 1
                failed_deals.append({
                    "id": deal.get("id"),
                    "reason": "No parsed program found"
                })
                continue
            
            calc_request = LeaseCalculationRequest(
                brand=deal.get("brand"),
                model=deal.get("model"),
                msrp=deal.get("msrp"),
                selling_price=deal.get("selling_price"),
                term_months=deal.get("term_months"),
                annual_mileage=deal.get("annual_mileage"),
                region=deal.get("region", "California")
            )
            
            calc_result = calculate_lease_pro(calc_request, parsed_program)
            
            calc_fields = {
                "calculated_payment": calc_result.monthly_payment_with_tax,
                "calculated_driveoff": calc_result.estimated_drive_off,
                "calculated_onepay": calc_result.one_pay_estimated,
                "mf_used": calc_result.mf_used,
                "residual_percent_used": calc_result.residual_percent_used,
                "savings_vs_msrp": calc_result.estimated_savings_vs_msrp_deal
            }
            
            await update_calculated_fields(db, deal.get("id"), calc_fields)
            
            # Regenerate SEO with updated payment
            try:
                from seo_ai_generator import auto_generate_metadata
                
                # Get fresh deal data with calculations
                from db_featured_deals import get_deal
                fresh_deal = await get_deal(db, deal.get("id"))
                
                # Generate metadata with fresh data
                metadata = auto_generate_metadata(fresh_deal)
                
                # Update SEO and AI
                await update_calculated_fields(db, deal.get("id"), {
                    "seo": metadata.get("seo"),
                    "ai_summary": metadata.get("ai_summary")
                })
                
                logger.info(f"Regenerated SEO for deal {deal.get('id')}")
            except Exception as e:
                logger.error(f"Failed to regenerate SEO for deal {deal.get('id')}: {e}")
            
            success_count += 1
            
        except Exception as e:
            logger.error(f"Failed to recalc deal {deal.get('id')}: {e}")
            failed_count += 1
            failed_deals.append({
                "id": deal.get("id"),
                "reason": str(e)
            })
    
    logger.info(f"Full recalculation complete: {success_count}/{total} success, {failed_count} failed")
    
    return {
        "total": total,
        "success": success_count,
        "failed": failed_count,
        "failed_deals": failed_deals
    }


async def write_sync_log(
    db: AsyncIOMotorDatabase,
    brand: str,
    model: Optional[str],
    changes: Dict[str, Any],
    deals_updated: List[str]
) -> str:
    """
    Write sync log entry to database
    
    Returns:
        Log entry ID
    """
    log_id = str(uuid4())
    
    log_entry = {
        "id": log_id,
        "timestamp": datetime.now(timezone.utc),
        "brand": brand,
        "model": model,
        "changes": changes,
        "deals_updated": deals_updated,
        "deals_count": len(deals_updated)
    }
    
    await db.auto_sync_logs.insert_one(log_entry)
    
    logger.info(f"Sync log created: {log_id} - {brand} {model} - {len(deals_updated)} deals updated")
    
    return log_id


async def run_auto_sync(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Run full AutoSync workflow with monitoring
    
    Returns:
        Sync statistics and logs
    """
    from monitoring import log_sync_status, send_alert_email
    
    logger.info("Starting AutoSync Engine")
    
    try:
        # Scan for changes
        changes = await scan_for_updated_programs(db)
    
    total_deals_updated = 0
    logs_created = []
    
    # For each change, recalculate affected deals
    for change in changes:
        brand = change["brand"]
        model = change["model"]
        
        # Recalculate deals
        updated_count = await recalc_featured_deals_for_brand_model(db, brand, model)
        
        # Get updated deal IDs
        query = {"brand": {"$regex": f"^{brand}$", "$options": "i"}}
        if model:
            query["model"] = {"$regex": f"^{model}$", "$options": "i"}
        
        updated_deals = await db.featured_deals.find(query, {"_id": 0, "id": 1}).to_list(length=None)
        updated_deal_ids = [d["id"] for d in updated_deals]
        
        # Write log
        log_id = await write_sync_log(
            db,
            brand=brand,
            model=model,
            changes={
                "mf_changes": change.get("mf_changes", {}),
                "rv_changes": change.get("rv_changes", {})
            },
            deals_updated=updated_deal_ids
        )
        
        logs_created.append(log_id)
        total_deals_updated += updated_count
    
    logger.info(f"AutoSync complete: {len(changes)} programs updated, {total_deals_updated} deals recalculated")
    
    # Log successful sync to monitoring
    log_sync_status("OK", f"{len(changes)} programs, {total_deals_updated} deals updated")
    
    return {
        "programs_updated": len(changes),
        "deals_recalculated": total_deals_updated,
        "logs_created": logs_created,
        "changes": changes
    }
    
    except Exception as e:
        # Log failure
        logger.error(f"AutoSync failed: {e}")
        log_sync_status("FAIL", str(e))
        send_alert_email(f"AutoSync Engine failed: {e}")
        raise
    }
