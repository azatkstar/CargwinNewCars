"""
SEO and AI Summary Auto-Generation

Automatically generates SEO fields and AI-oriented summaries for Featured Deals
"""
from typing import Dict, Any, Optional
import re
import logging

logger = logging.getLogger(__name__)


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def generate_seo_fields(deal_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Auto-generate SEO fields for a Featured Deal
    
    Args:
        deal_data: Deal dictionary with brand, model, year, etc.
        
    Returns:
        SEO fields dict
    """
    brand = deal_data.get('brand', '')
    model = deal_data.get('model', '')
    trim = deal_data.get('trim', '')
    year = deal_data.get('year', '')
    payment = deal_data.get('calculated_payment', 0)
    driveoff = deal_data.get('calculated_driveoff', 0)
    term = deal_data.get('term_months', 36)
    miles = deal_data.get('annual_mileage', 10000)
    region = deal_data.get('region', 'California')
    
    # SEO Title
    title_parts = [
        str(year),
        brand,
        model,
        trim if trim else ''
    ]
    title_parts = [p for p in title_parts if p]
    
    seo_title = (
        f"{' '.join(title_parts)} lease – "
        f"${int(payment)}/mo, ${int(driveoff)} down | "
        f"Hunter.Lease {region}"
    )
    
    # Meta Description
    meta_description = (
        f"Лизинг {year} {brand} {model} {trim if trim else ''} "
        f"от ${int(payment)} в месяц при ${int(driveoff)} down "
        f"на {term} мес и {int(miles/1000)}k миль в год в {region}. "
        f"Tier 1. Онлайн-одобрение."
    )
    
    # Slug
    region_slug = slugify(region)
    slug_parts = [
        str(year),
        slugify(brand),
        slugify(model),
        slugify(trim) if trim else '',
        'lease',
        f"{int(payment)}mo",
        f"{int(driveoff)}down",
        region_slug
    ]
    slug = '-'.join([p for p in slug_parts if p])
    
    # Keywords
    keywords = [
        f"{brand} lease",
        f"{model} lease",
        f"{year} {model}",
        f"lease deals {region}",
        "best lease deals",
        "car lease calculator"
    ]
    
    # Tags
    tags = [
        brand.lower(),
        model.lower(),
        str(year),
        'lease',
        f'{term}months',
        f'{int(miles/1000)}k_miles',
        'tier1',
        region_slug
    ]
    
    # OG fields
    og_title = seo_title
    og_description = meta_description[:200]
    og_image_url = deal_data.get('image_url', '')
    
    # Canonical URL
    canonical_url = f"https://hunter.lease/deal/{slug}"
    
    seo_fields = {
        "title": seo_title,
        "meta_description": meta_description,
        "slug": slug,
        "keywords": keywords,
        "tags": tags,
        "og_title": og_title,
        "og_description": og_description,
        "og_image_url": og_image_url,
        "canonical_url": canonical_url
    }
    
    logger.info(f"Generated SEO fields for {brand} {model}: slug={slug}")
    
    return seo_fields


def generate_ai_summary(deal_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate AI-oriented structured summary
    
    Args:
        deal_data: Deal dictionary
        
    Returns:
        AI summary dict
    """
    # Determine bank from brand
    bank_map = {
        'Toyota': 'TFS',
        'Lexus': 'LFS',
        'Honda': 'AHFC',
        'Acura': 'AHFC',
        'Kia': 'KMF',
        'Hyundai': 'HMF',
        'BMW': 'BMW FS',
        'Mercedes': 'MBFS'
    }
    
    brand = deal_data.get('brand', '')
    bank = deal_data.get('bank') or bank_map.get(brand, 'Bank')
    
    ai_summary = {
        "type": "lease",
        "brand": brand,
        "model": deal_data.get('model', ''),
        "year": deal_data.get('year', 0),
        "trim": deal_data.get('trim', ''),
        "payment_month": deal_data.get('calculated_payment', 0),
        "drive_off": deal_data.get('calculated_driveoff', 0),
        "term_months": deal_data.get('term_months', 36),
        "annual_miles": deal_data.get('annual_mileage', 10000),
        "region": deal_data.get('region', 'California'),
        "credit_tier": "Tier 1",
        "bank": bank,
        "source": "Hunter.Lease PRO calculator",
        "currency": "USD"
    }
    
    logger.info(f"Generated AI summary for {brand} {deal_data.get('model')}")
    
    return ai_summary


def auto_generate_metadata(deal_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Auto-generate both SEO and AI Summary for a deal
    
    Args:
        deal_data: Deal dictionary
        
    Returns:
        Updated deal_data with seo and ai_summary fields
    """
    # Only generate if not already present
    if not deal_data.get('seo'):
        deal_data['seo'] = generate_seo_fields(deal_data)
    
    if not deal_data.get('ai_summary'):
        deal_data['ai_summary'] = generate_ai_summary(deal_data)
    
    return deal_data


def get_image_fallback(brand: str, model: Optional[str] = None) -> str:
    """
    Get fallback image URL when imageUrl is missing
    
    Args:
        brand: Vehicle brand
        model: Vehicle model
        
    Returns:
        Fallback image URL
    """
    # Brand-specific fallbacks from Unsplash
    brand_images = {
        'Toyota': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
        'Honda': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
        'BMW': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
        'Mercedes': 'https://images.unsplash.com/photo-1618843479619-f3d0d3f1b7a4?w=800',
        'Kia': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        'Lexus': 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800'
    }
    
    return brand_images.get(brand, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800')
