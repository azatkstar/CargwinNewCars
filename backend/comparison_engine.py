"""
Comparison Engine

Compare multiple Featured Deals side-by-side
"""
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


def compare_deals(deals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compare up to 3 deals and identify best values
    
    Args:
        deals: List of 1-3 deal dicts
        
    Returns:
        Comparison structure with best value indicators
    """
    if not deals or len(deals) > 3:
        raise ValueError("Must provide 1-3 deals for comparison")
    
    # Extract comparable fields
    comparison_data = []
    
    for deal in deals:
        comparison_data.append({
            "id": deal.get("id"),
            "brand": deal.get("brand", ""),
            "model": deal.get("model", ""),
            "year": deal.get("year", ""),
            "trim": deal.get("trim", ""),
            "monthly_payment": deal.get("calculated_payment", 0),
            "driveoff": deal.get("calculated_driveoff", 0),
            "onepay": deal.get("calculated_onepay", 0),
            "term_months": deal.get("term_months", 0),
            "annual_mileage": deal.get("annual_mileage", 0),
            "msrp": deal.get("msrp", 0),
            "selling_price": deal.get("selling_price", 0),
            "bank": deal.get("bank", ""),
            "mf": deal.get("mf_used", 0),
            "residual": deal.get("residual_percent_used", 0),
            "savings": deal.get("savings_vs_msrp", 0),
            "image_url": deal.get("image_url", "")
        })
    
    # Identify best values (lowest for costs, highest for savings)
    if len(comparison_data) > 1:
        # Find best monthly payment
        min_payment = min(d["monthly_payment"] for d in comparison_data if d["monthly_payment"] > 0)
        for deal in comparison_data:
            if deal["monthly_payment"] == min_payment and min_payment > 0:
                deal["best_payment"] = True
        
        # Find best driveoff (lowest)
        min_driveoff = min(d["driveoff"] for d in comparison_data if d["driveoff"] >= 0)
        for deal in comparison_data:
            if deal["driveoff"] == min_driveoff:
                deal["best_driveoff"] = True
        
        # Find best savings (highest)
        max_savings = max(d["savings"] for d in comparison_data if d["savings"] >= 0)
        for deal in comparison_data:
            if deal["savings"] == max_savings and max_savings > 0:
                deal["best_savings"] = True
        
        # Find best MF (lowest)
        min_mf = min(d["mf"] for d in comparison_data if d["mf"] > 0)
        for deal in comparison_data:
            if deal["mf"] == min_mf and min_mf > 0:
                deal["best_mf"] = True
    
    logger.info(f"Compared {len(comparison_data)} deals")
    
    return {
        "deals": comparison_data,
        "count": len(comparison_data)
    }


def get_comparison_summary(deals: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Get summary statistics for comparison
    
    Args:
        deals: List of deal dicts
        
    Returns:
        Summary dict with averages and differences
    """
    if not deals:
        return {}
    
    avg_payment = sum(d.get("calculated_payment", 0) for d in deals) / len(deals)
    avg_driveoff = sum(d.get("calculated_driveoff", 0) for d in deals) / len(deals)
    
    max_payment = max(d.get("calculated_payment", 0) for d in deals)
    min_payment = min(d.get("calculated_payment", 0) for d in deals)
    
    return {
        "avg_payment": round(avg_payment, 2),
        "avg_driveoff": round(avg_driveoff, 2),
        "payment_spread": round(max_payment - min_payment, 2),
        "best_deal_index": deals.index(min(deals, key=lambda d: d.get("calculated_payment", float('inf'))))
    }
