"""
PRO Lease Calculator Module

Calculates detailed lease payment breakdown using parsed program data
"""
from typing import Optional, Dict, Any
import logging
from models_lease_programs import LeaseCalculationRequest, LeaseCalculationResult

logger = logging.getLogger(__name__)


def pick_residual_for_term_and_mileage(
    parsed_program: Dict[str, Any],
    term_months: int,
    annual_mileage: int
) -> Optional[float]:
    """
    Select appropriate residual percentage from parsed program
    
    Args:
        parsed_program: Parsed program dict from database
        term_months: Lease term in months
        annual_mileage: Annual mileage
        
    Returns:
        Residual percentage or None if not found
    """
    term_key = str(term_months)
    mileage_key = str(annual_mileage)
    
    residual_dict = parsed_program.get("residual", {})
    if term_key not in residual_dict:
        logger.warning(f"Term {term_months} not found in residuals")
        return None
    
    term_residuals = residual_dict[term_key]
    
    # Direct match
    if mileage_key in term_residuals:
        return float(term_residuals[mileage_key])
    
    # If exact mileage not found, choose nearest mileage key
    if not term_residuals:
        return None
    
    try:
        mileage_ints = [
            (abs(int(k) - annual_mileage), float(v))
            for k, v in term_residuals.items()
        ]
        mileage_ints.sort(key=lambda x: x[0])
        logger.info(f"Using nearest mileage match: {mileage_ints[0][1]}%")
        return mileage_ints[0][1]
    except Exception as e:
        logger.error(f"Error finding nearest mileage: {e}")
        return None


def pick_mf_for_term(
    parsed_program: Dict[str, Any],
    term_months: int
) -> Optional[float]:
    """
    Select appropriate money factor from parsed program
    
    Args:
        parsed_program: Parsed program dict from database
        term_months: Lease term in months
        
    Returns:
        Money factor or None if not found
    """
    mf_dict = parsed_program.get("mf", {})
    term_key = str(term_months)
    
    if term_key in mf_dict:
        return float(mf_dict[term_key])
    
    # Fallback: if there is a single MF, use it
    if len(mf_dict) == 1:
        mf_value = float(list(mf_dict.values())[0])
        logger.info(f"Using fallback single MF: {mf_value}")
        return mf_value
    
    logger.warning(f"MF for term {term_months} not found")
    return None


def calculate_lease_pro(
    request: LeaseCalculationRequest,
    parsed_program: Optional[Dict[str, Any]] = None
) -> LeaseCalculationResult:
    """
    Calculate detailed lease payment breakdown
    
    Args:
        request: Calculation request parameters
        parsed_program: Optional pre-fetched program (if None, will raise error)
        
    Returns:
        Detailed calculation result
        
    Raises:
        ValueError: If required data is missing or invalid
    """
    logger.info(f"Calculating PRO lease for {request.brand} {request.model} - {request.term_months}mo/{request.annual_mileage}mi")
    
    # Validate parsed program
    if not parsed_program:
        raise ValueError("No parsed lease program provided for calculation")
    
    # 1. Determine Money Factor
    if request.override_mf is not None:
        mf_used = request.override_mf
        logger.info(f"Using override MF: {mf_used}")
    else:
        mf_used = pick_mf_for_term(parsed_program, request.term_months)
        if mf_used is None:
            raise ValueError(f"Could not determine money factor for term {request.term_months} months")
    
    # 2. Determine Residual Percent
    if request.override_residual_percent is not None:
        residual_percent_used = request.override_residual_percent
        logger.info(f"Using override residual: {residual_percent_used}%")
    else:
        residual_percent_used = pick_residual_for_term_and_mileage(
            parsed_program,
            request.term_months,
            request.annual_mileage
        )
        if residual_percent_used is None:
            raise ValueError(
                f"Could not determine residual for term {request.term_months}mo "
                f"and mileage {request.annual_mileage}mi"
            )
    
    # 3. Base Values
    msrp = request.msrp
    selling_price = request.selling_price
    residual_value = msrp * (residual_percent_used / 100.0)
    
    cap_cost_before_incentives = selling_price
    
    # 4. Incentives
    total_incentives_applied = 0.0
    if request.apply_incentives:
        if request.manual_incentives:
            total_incentives_applied = sum(request.manual_incentives.values())
            logger.info(f"Using manual incentives: ${total_incentives_applied}")
        else:
            incentives = parsed_program.get("incentives", {})
            total_incentives_applied = sum(incentives.values())
            logger.info(f"Using parsed incentives: ${total_incentives_applied}")
    
    adjusted_cap_cost = cap_cost_before_incentives - total_incentives_applied
    
    # 5. Fees
    acquisition_fee = request.acquisition_fee
    doc_fee = request.doc_fee
    registration_fee = request.registration_fee
    other_fees = request.other_fees
    
    total_fees_capitalized = acquisition_fee + doc_fee + registration_fee + other_fees
    
    # 6. Cap Cost after Down Payment + Fees
    # Standard assumption: down payment reduces cap cost; fees are capitalized
    gross_cap_cost = adjusted_cap_cost + total_fees_capitalized
    net_cap_cost = gross_cap_cost - request.down_payment
    
    # 7. Depreciation & Finance Fees
    term = request.term_months
    depreciation_fee = (net_cap_cost - residual_value) / term
    finance_fee = (net_cap_cost + residual_value) * mf_used
    
    base_payment_before_tax = depreciation_fee + finance_fee
    
    # 8. Tax & Monthly Payment
    tax_rate = request.tax_rate
    tax_amount = base_payment_before_tax * tax_rate
    monthly_payment_with_tax = base_payment_before_tax + tax_amount
    
    # 9. Estimated Drive-Off
    if request.drive_off_mode == "zero":
        # Zero drive-off: customer pays only first month + gov fees upfront
        estimated_drive_off = monthly_payment_with_tax + doc_fee + registration_fee
    else:
        # Standard: down payment + first month + fees
        estimated_drive_off = request.down_payment + monthly_payment_with_tax + doc_fee + registration_fee
    
    # 10. One-Pay (Approximate)
    # Simplified: total payments with a discount factor (MF reduction)
    total_monthly_with_tax = monthly_payment_with_tax * term
    one_pay_estimated = total_monthly_with_tax * 0.92  # ~8% MF discount
    
    # 11. Estimated Savings vs Naive MSRP Deal
    # Naive dealer deal: no discount, no incentives, inflated MF
    naive_mf = mf_used + 0.0004  # Markup
    naive_net_cap_cost = (msrp + total_fees_capitalized) - request.down_payment
    naive_depr = (naive_net_cap_cost - residual_value) / term
    naive_finance = (naive_net_cap_cost + residual_value) * naive_mf
    naive_base = naive_depr + naive_finance
    naive_monthly_with_tax = naive_base * (1 + tax_rate)
    naive_total = naive_monthly_with_tax * term
    
    pro_total = monthly_payment_with_tax * term
    estimated_savings_vs_msrp_deal = naive_total - pro_total
    
    logger.info(f"Calculation complete: ${monthly_payment_with_tax:.2f}/mo")
    
    return LeaseCalculationResult(
        brand=request.brand,
        model=request.model,
        trim=request.trim,
        region=request.region,
        term_months=term,
        annual_mileage=request.annual_mileage,
        msrp=msrp,
        selling_price=selling_price,
        mf_used=mf_used,
        residual_percent_used=residual_percent_used,
        residual_value=residual_value,
        cap_cost_before_incentives=cap_cost_before_incentives,
        total_incentives_applied=total_incentives_applied,
        adjusted_cap_cost=adjusted_cap_cost,
        acquisition_fee=acquisition_fee,
        doc_fee=doc_fee,
        registration_fee=registration_fee,
        other_fees=other_fees,
        total_fees_capitalized=total_fees_capitalized,
        depreciation_fee=depreciation_fee,
        finance_fee=finance_fee,
        base_payment_before_tax=base_payment_before_tax,
        tax_rate=tax_rate,
        tax_amount=tax_amount,
        monthly_payment_with_tax=monthly_payment_with_tax,
        down_payment=request.down_payment,
        estimated_drive_off=estimated_drive_off,
        one_pay_estimated=one_pay_estimated,
        estimated_savings_vs_msrp_deal=estimated_savings_vs_msrp_deal,
    )
