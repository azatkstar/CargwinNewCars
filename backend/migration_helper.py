"""
Migration Helper - Lots to Featured Deals

Prepares for migration of legacy Lots to unified Featured Deals
"""
from typing import List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)


async def preview_lots_migration(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Preview what would be migrated from Lots to Featured Deals
    
    Returns:
        Migration preview statistics
    """
    # Get all published lots
    lots = await db.lots.find(
        {"status": "published"},
        {"_id": 0}
    ).to_list(length=None)
    
    migratable = []
    needs_attention = []
    
    for lot in lots:
        # Check if lot has minimum required fields
        has_required = all([
            lot.get('make'),
            lot.get('model'),
            lot.get('year'),
            lot.get('msrp')
        ])
        
        if has_required:
            migratable.append({
                "id": lot.get('id'),
                "make": lot.get('make'),
                "model": lot.get('model'),
                "year": lot.get('year'),
                "msrp": lot.get('msrp')
            })
        else:
            needs_attention.append({
                "id": lot.get('id'),
                "reason": "Missing required fields"
            })
    
    logger.info(f"Migration preview: {len(migratable)} lots ready, {len(needs_attention)} need attention")
    
    return {
        "total_lots": len(lots),
        "migratable": len(migratable),
        "needs_attention": len(needs_attention),
        "migratable_lots": migratable,
        "attention_lots": needs_attention
    }


async def migrate_lot_to_featured_deal(
    db: AsyncIOMotorDatabase,
    lot_id: str
) -> Dict[str, Any]:
    """
    Migrate a single Lot to Featured Deal
    
    Args:
        db: Database instance
        lot_id: Lot ID to migrate
        
    Returns:
        Result dict with new deal_id
    """
    from db_featured_deals import create_deal
    from models_lease_programs import LeaseCalculationRequest
    from lease_calculator_pro import calculate_lease_pro
    from db_lease_programs import get_latest_parsed_program_for
    from seo_ai_generator import auto_generate_metadata, get_image_fallback
    
    # Get lot
    lot = await db.lots.find_one({"id": lot_id}, {"_id": 0})
    
    if not lot:
        raise ValueError(f"Lot {lot_id} not found")
    
    # Map lot fields to deal fields
    deal_data = {
        "brand": lot.get('make'),
        "model": lot.get('model'),
        "trim": lot.get('trim', ''),
        "year": lot.get('year'),
        "msrp": lot.get('msrp', 0),
        "selling_price": lot.get('msrp', 0) - lot.get('discount', 0),
        "term_months": lot.get('lease', {}).get('termMonths', 36),
        "annual_mileage": lot.get('lease', {}).get('milesPerYear', 10000),
        "region": lot.get('state', 'CA'),
        "image_url": lot.get('images', [{}])[0].get('url') if lot.get('images') else None,
        "description": lot.get('description', ''),
        "stock_count": 1
    }
    
    # Apply fallback if no image
    if not deal_data['image_url']:
        deal_data['image_url'] = get_image_fallback(deal_data['brand'], deal_data['model'])
    
    # Create deal
    deal_id = await create_deal(db, deal_data)
    
    # Run calculations
    try:
        parsed_program = await get_latest_parsed_program_for(
            db,
            brand=deal_data['brand'],
            model=deal_data['model'],
            region=deal_data['region']
        )
        
        if parsed_program:
            calc_request = LeaseCalculationRequest(
                brand=deal_data['brand'],
                model=deal_data['model'],
                msrp=deal_data['msrp'],
                selling_price=deal_data['selling_price'],
                term_months=deal_data['term_months'],
                annual_mileage=deal_data['annual_mileage'],
                region=deal_data['region']
            )
            
            calc_result = calculate_lease_pro(calc_request, parsed_program)
            
            # Update with calculations
            from db_featured_deals import update_calculated_fields, get_deal
            
            calc_fields = {
                "calculated_payment": calc_result.monthly_payment_with_tax,
                "calculated_driveoff": calc_result.estimated_drive_off,
                "calculated_onepay": calc_result.one_pay_estimated,
                "mf_used": calc_result.mf_used,
                "residual_percent_used": calc_result.residual_percent_used,
                "savings_vs_msrp": calc_result.estimated_savings_vs_msrp_deal
            }
            
            await update_calculated_fields(db, deal_id, calc_fields)
            
            # Generate SEO/AI
            fresh_deal = await get_deal(db, deal_id)
            metadata = auto_generate_metadata(fresh_deal)
            
            await update_calculated_fields(db, deal_id, {
                "seo": metadata.get('seo'),
                "ai_summary": metadata.get('ai_summary')
            })
    
    except Exception as e:
        logger.error(f"Calculation failed during migration: {e}")
    
    logger.info(f"Migrated lot {lot_id} to deal {deal_id}")
    
    return {
        "lot_id": lot_id,
        "deal_id": deal_id,
        "success": True
    }


# NOTE: Full batch migration function would go here
# But per user request, we're only preparing, not executing
