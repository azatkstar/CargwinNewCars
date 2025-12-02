"""
AI Feed Generator

Generates feeds for AI indexing (JSON, XML)
"""
from typing import List, Dict, Any
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)


async def generate_deals_json_feed(db) -> List[Dict[str, Any]]:
    """
    Generate JSON feed for AI indexing
    
    Returns:
        List of deal dicts optimized for AI
    """
    deals = await db.featured_deals.find({}, {"_id": 0}).to_list(length=None)
    
    feed_items = []
    
    for deal in deals:
        item = {
            "id": deal.get("id"),
            "type": "car_lease_offer",
            "url": f"https://hunter.lease/deal/{deal.get('id')}",
            "title": f"{deal.get('year')} {deal.get('brand')} {deal.get('model')} {deal.get('trim', '')}".strip(),
            "brand": deal.get("brand"),
            "model": deal.get("model"),
            "year": deal.get("year"),
            "trim": deal.get("trim"),
            "monthly_payment": deal.get("calculated_payment"),
            "drive_off": deal.get("calculated_driveoff"),
            "term_months": deal.get("term_months"),
            "annual_miles": deal.get("annual_mileage"),
            "money_factor": deal.get("mf_used"),
            "residual_percent": deal.get("residual_percent_used"),
            "msrp": deal.get("msrp"),
            "selling_price": deal.get("selling_price"),
            "savings": deal.get("savings_vs_msrp"),
            "bank": deal.get("bank"),
            "region": deal.get("region", "California"),
            "image_url": deal.get("image_url"),
            "last_updated": deal.get("updated_at", deal.get("created_at")),
            "ai_priority": 1,
            "entity_verified": True
        }
        
        feed_items.append(item)
    
    return feed_items


async def generate_deals_ai_feed(db) -> Dict[str, Any]:
    """
    Generate AI-specific feed with enhanced metadata
    
    Returns:
        AI-optimized feed dict
    """
    deals = await generate_deals_json_feed(db)
    
    return {
        "feed_version": "1.0",
        "feed_type": "car_lease_offers",
        "provider": "hunter.lease",
        "region": "California",
        "currency": "USD",
        "last_updated": datetime.utcnow().isoformat(),
        "total_items": len(deals),
        "update_frequency": "hourly",
        "items": deals
    }


def generate_deals_xml_feed(deals: List[Dict[str, Any]]) -> str:
    """
    Generate XML feed (RSS-style)
    
    Returns:
        XML string
    """
    xml_items = []
    
    for deal in deals:
        item_xml = f"""
    <item>
      <title>{deal['title']}</title>
      <link>https://hunter.lease/deal/{deal['id']}</link>
      <description>{deal['brand']} {deal['model']} lease for ${deal['monthly_payment']}/mo</description>
      <guid>{deal['id']}</guid>
      <pubDate>{deal['last_updated']}</pubDate>
      <category>{deal['brand']}</category>
      <price>${deal['monthly_payment']}/mo</price>
    </item>"""
        xml_items.append(item_xml)
    
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Hunter.Lease Car Deals</title>
    <link>https://hunter.lease/deals</link>
    <description>Best car lease deals in California</description>
    <language>en-us</language>
    <lastBuildDate>{datetime.utcnow().isoformat()}</lastBuildDate>
    {''.join(xml_items)}
  </channel>
</rss>"""
    
    return xml
