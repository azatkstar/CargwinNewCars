"""
SEO A/B Testing Module

Provides A/B test variants for SEO texts on deal pages
"""
import random
from typing import Dict, Any


# SEO Variants for different models
SEO_VARIANTS = {
    "Camry": {
        "A": {
            "title": "2025 Toyota Camry Lease - Best Deals | Hunter.Lease",
            "description": "Get the best Toyota Camry lease deals. Low monthly payments, transparent pricing, real bank programs."
        },
        "B": {
            "title": "Lease 2025 Toyota Camry - From $373/mo | California",
            "description": "Toyota Camry lease starting at $373/month. 36 months, 10k miles/year. Real TFS programs. Instant approval."
        }
    },
    "Accord": {
        "A": {
            "title": "2025 Honda Accord Lease Deals | Hunter.Lease",
            "description": "Honda Accord lease offers with real AHFC programs. Best rates, transparent pricing."
        },
        "B": {
            "title": "Lease Honda Accord - Low Payments | California",
            "description": "Honda Accord lease from $350/mo. Real bank programs. Instant online approval."
        }
    },
    "default": {
        "A": {
            "title": "{year} {brand} {model} Lease | Hunter.Lease",
            "description": "Lease {year} {brand} {model} with real bank programs. Best rates, transparent pricing."
        },
        "B": {
            "title": "Lease {year} {brand} {model} - Best Deals | California",
            "description": "{brand} {model} lease with real bank programs. Low payments, instant approval."
        }
    }
}


def get_seo_variant(model_name: str, variant: str = None) -> Dict[str, Any]:
    """
    Get SEO variant for a model
    
    Args:
        model_name: Vehicle model (e.g., "Camry", "Accord")
        variant: Force specific variant ("A" or "B"), or None for random 50/50
        
    Returns:
        SEO variant dict with title and description
    """
    # Determine variant
    if variant not in ["A", "B"]:
        variant = random.choice(["A", "B"])
    
    # Get model-specific variants or default
    model_variants = SEO_VARIANTS.get(model_name, SEO_VARIANTS["default"])
    
    seo_data = model_variants.get(variant, model_variants["A"])
    
    # Add metadata
    result = {
        **seo_data,
        "variant": variant,
        "model": model_name
    }
    
    return result


def format_seo_with_deal_data(seo_variant: Dict[str, str], deal_data: Dict[str, Any]) -> Dict[str, str]:
    """
    Format SEO variant with actual deal data
    
    Args:
        seo_variant: SEO variant from get_seo_variant()
        deal_data: Deal data dict
        
    Returns:
        Formatted SEO dict
    """
    # Extract placeholders
    replacements = {
        "{year}": str(deal_data.get("year", "")),
        "{brand}": deal_data.get("brand", ""),
        "{model}": deal_data.get("model", ""),
        "{trim}": deal_data.get("trim", ""),
        "${payment}": f"${int(deal_data.get('calculated_payment', 0))}",
        "${driveoff}": f"${int(deal_data.get('calculated_driveoff', 0))}"
    }
    
    # Apply replacements
    title = seo_variant.get("title", "")
    description = seo_variant.get("description", "")
    
    for placeholder, value in replacements.items():
        title = title.replace(placeholder, value)
        description = description.replace(placeholder, value)
    
    return {
        "title": title,
        "description": description,
        "variant": seo_variant.get("variant", "A")
    }
