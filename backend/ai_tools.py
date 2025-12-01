"""
AI Deal Generator

Template-based text generation for deals
No external AI APIs - pure template logic
"""
from typing import Dict, Any


def generate_short_post(deal: Dict[str, Any]) -> str:
    """
    Generate short social media post
    
    Args:
        deal: Deal dict with brand, model, payment, etc.
        
    Returns:
        Short post text
    """
    brand = deal.get("brand", "")
    model = deal.get("model", "")
    year = deal.get("year", "")
    payment = int(deal.get("calculated_payment", 0))
    driveoff = int(deal.get("calculated_driveoff", 0))
    
    template = f"""🚗 NEW DEAL ALERT!

{year} {brand} {model}
💰 ${payment}/month
🎯 ${driveoff} drive-off
📅 36 months

Real bank program. Instant approval.
DM for details! 📲"""
    
    return template


def generate_long_description(deal: Dict[str, Any]) -> str:
    """
    Generate detailed deal description
    
    Args:
        deal: Deal dict
        
    Returns:
        Long description text
    """
    brand = deal.get("brand", "")
    model = deal.get("model", "")
    trim = deal.get("trim", "")
    year = deal.get("year", "")
    payment = int(deal.get("calculated_payment", 0))
    driveoff = int(deal.get("calculated_driveoff", 0))
    term = deal.get("term_months", 36)
    miles = int(deal.get("annual_mileage", 10000) / 1000)
    msrp = int(deal.get("msrp", 0))
    selling = int(deal.get("selling_price", 0))
    savings = msrp - selling
    
    template = f"""FEATURED LEASE OFFER

{year} {brand} {model} {trim if trim else ''}

💰 PAYMENT BREAKDOWN:
• Monthly: ${payment} (incl. tax)
• Drive-off: ${driveoff}
• Term: {term} months
• Mileage: {miles}k miles/year

🎯 PRICING:
• MSRP: ${msrp:,}
• Our Price: ${selling:,}
• Your Savings: ${savings:,}

✅ WHAT YOU GET:
• Real bank program (not dealer markup)
• Transparent pricing
• Fast approval process
• Professional service
• Delivery to your door

📞 NEXT STEPS:
Contact us via Telegram for instant quote!
Limited stock - act fast!

Hunter.Lease - Fleet Pricing for Everyone"""
    
    return template


def generate_cta(deal: Dict[str, Any]) -> List[str]:
    """
    Generate 3 CTA variants
    
    Returns:
        List of 3 CTA texts
    """
    brand = deal.get("brand", "")
    model = deal.get("model", "")
    payment = int(deal.get("calculated_payment", 0))
    
    ctas = [
        f"🚗 Get this {brand} {model} for ${payment}/mo - Limited Time!",
        f"💬 Message us now to secure ${payment}/mo deal on {year} {model}",
        f"⚡ Lock in ${payment}/mo payment - {brand} {model} won't last!"
    ]
    
    return ctas


def generate_seo(deal: Dict[str, Any]) -> Dict[str, str]:
    """
    Generate SEO package
    
    Returns:
        Dict with title, description, keywords
    """
    brand = deal.get("brand", "")
    model = deal.get("model", "")
    year = deal.get("year", "")
    payment = int(deal.get("calculated_payment", 0))
    region = deal.get("region", "California")
    
    return {
        "title": f"{year} {brand} {model} Lease - ${payment}/mo | Hunter.Lease {region}",
        "description": f"Lease {year} {brand} {model} starting at ${payment} per month. Real bank programs, transparent pricing, instant approval in {region}.",
        "keywords": f"{brand} lease, {model} lease, {year} {model}, lease deals {region}, best lease rates"
    }


def generate_full_bundle(deal: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate complete marketing bundle
    
    Returns:
        Dict with all generated content
    """
    return {
        "short_post": generate_short_post(deal),
        "long_description": generate_long_description(deal),
        "cta_variants": generate_cta(deal),
        "seo_package": generate_seo(deal),
        "generated_at": datetime.now().isoformat()
    }


from datetime import datetime
