"""
Professional Lease Calculator Engine
Implements 23-step algorithm from ТЗ
"""
import logging
from datetime import datetime, date, timezone
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

async def calculate_lease(
    db,
    deal_external_id: str,
    term_months: int,
    annual_mileage: int,
    credit_tier_code: str,
    with_incentives: bool,
    customer_down_payment: float,
    zip_code: Optional[str] = None,
    tax_rate_override: Optional[float] = None
) -> Dict[str, Any]:
    """
    Professional lease calculation with full MF/Residual system
    
    Returns: {
        "monthly": float,
        "dueAtSigning": float,
        "residualValue": float,
        "moneyFactor": float,
        "capCost": float,
        ...
    }
    """
    try:
        # STEP 1: Find deal
        deal = await db.deals.find_one({"external_deal_id": deal_external_id})
        if not deal:
            raise ValueError(f"Deal {deal_external_id} not found")
        
        # STEP 2: Get tax rate
        tax_rate = tax_rate_override if tax_rate_override else deal.get('tax_rate', 0.0775)
        
        # STEP 3: Find credit tier
        credit_tier = await db.credit_tiers.find_one({"code": credit_tier_code})
        if not credit_tier:
            raise ValueError(f"Credit tier {credit_tier_code} not found")
        
        # STEP 4: Find active MF program
        today = datetime.now(timezone.utc).date()
        mf_program = await db.mf_programs.find_one({
            "bank_id": deal['bank_id'],
            "effective_from": {"$lte": today},
            "effective_to": {"$gte": today}
        })
        
        if not mf_program:
            # Fallback: use any program for this bank
            mf_program = await db.mf_programs.find_one({"bank_id": deal['bank_id']})
        
        # STEP 5: Find MF value (most specific match)
        query = {
            "mf_program_id": str(mf_program['_id']) if mf_program else None,
            "credit_tier_id": str(credit_tier['_id'])
        }
        
        # Try specific match first
        mf_value = await db.mf_values.find_one({
            **query,
            "make": deal['make'],
            "model": deal['model'],
            "year": deal['year'],
            "term_months": term_months
        })
        
        if not mf_value:
            # Try without term
            mf_value = await db.mf_values.find_one({
                **query,
                "make": deal['make'],
                "model": deal['model'],
                "year": deal['year']
            })
        
        if not mf_value:
            # Fallback: generic for tier
            mf_value = await db.mf_values.find_one(query)
        
        # STEP 6: Base residual
        base_residual_percent = mf_value.get('residual_percent') if mf_value else deal.get('base_residual_percent', 0.55)
        
        # STEP 7: Mileage adjustment
        residual_percent = base_residual_percent
        if mf_value:
            override = await db.residual_overrides.find_one({
                "mf_value_id": str(mf_value['_id']),
                "annual_mileage": annual_mileage
            })
            if override:
                residual_percent = base_residual_percent + override.get('adjustment', 0)
        
        # STEP 8: Residual value
        residual_value = deal['msrp'] * residual_percent
        
        # STEP 9: Get fees
        deal_fees = await db.deal_fees.find_one({"deal_id": str(deal['_id'])})
        
        if deal_fees:
            acquisition_fee = deal_fees.get('acquisition_fee', 650)
            registration_fee = deal_fees.get('registration_fee', 540)
            doc_fee = deal_fees.get('doc_fee', 85)
            other_fees = deal_fees.get('other_fees', 0)
        else:
            # Defaults
            acquisition_fee = 650
            registration_fee = 540
            doc_fee = 85
            other_fees = 0
        
        total_fees_before_tax = acquisition_fee + registration_fee + doc_fee + other_fees
        
        # STEP 10: Incentives
        total_incentives = 0
        if with_incentives:
            incentives = await db.incentives.find({
                "deal_id": str(deal['_id']),
                "$or": [
                    {"expires_at": {"$gte": today}},
                    {"expires_at": None}
                ]
            }).to_list(length=100)
            
            total_incentives = sum(inc.get('amount', 0) for inc in incentives if inc.get('is_stackable', True))
        
        # STEP 11: Gross cap cost
        gross_cap_cost = deal['selling_price'] + total_fees_before_tax - total_incentives
        
        # STEP 12: Down payment tax
        down_payment_tax = customer_down_payment * tax_rate
        
        # STEP 13: Cap reduction
        cap_reduction = customer_down_payment
        
        # STEP 14: Final cap cost
        cap_cost = gross_cap_cost - cap_reduction
        
        # STEP 15: Money Factor
        money_factor = mf_value.get('money_factor', 0.00200) if mf_value else 0.00200
        
        # STEP 16: Depreciation Fee
        depreciation_fee = (cap_cost - residual_value) / term_months
        
        # STEP 17: Finance Fee
        finance_fee = (cap_cost + residual_value) * money_factor
        
        # STEP 18: Base Payment
        base_payment = depreciation_fee + finance_fee
        
        # STEP 19: Tax on Payment
        tax_on_payment = base_payment * tax_rate
        
        # STEP 20: Monthly Payment
        monthly_payment = round(base_payment + tax_on_payment, 2)
        
        # STEP 21: Tax on Fees
        tax_on_fees = total_fees_before_tax * tax_rate
        
        # STEP 22: Due at Signing
        due_at_signing = (
            customer_down_payment +
            down_payment_tax +
            total_fees_before_tax +
            tax_on_fees +
            monthly_payment  # First payment
        )
        
        # STEP 23: Return full result
        return {
            "monthly": monthly_payment,
            "dueAtSigning": round(due_at_signing, 2),
            "residualValue": round(residual_value, 2),
            "moneyFactor": money_factor,
            "capCost": round(cap_cost, 2),
            "taxRate": tax_rate,
            "totalIncentives": total_incentives,
            "fees": {
                "acquisitionFee": acquisition_fee,
                "registrationFee": registration_fee,
                "docFee": doc_fee,
                "otherFees": other_fees,
                "taxOnFees": round(tax_on_fees, 2)
            },
            "downPayment": {
                "customerDownPayment": customer_down_payment,
                "downPaymentTax": round(down_payment_tax, 2)
            },
            "debug": {
                "residualPercent": residual_percent,
                "baseResidualPercent": base_residual_percent,
                "creditTierCode": credit_tier_code,
                "mfProgramId": str(mf_program['_id']) if mf_program else None,
                "mfValueId": str(mf_value['_id']) if mf_value else None,
                "depreciationFee": round(depreciation_fee, 2),
                "financeFee": round(finance_fee, 2),
                "basePayment": round(base_payment, 2),
                "taxOnPayment": round(tax_on_payment, 2)
            }
        }
        
    except Exception as e:
        logger.error(f"Lease calculation error: {e}")
        raise
