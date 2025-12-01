"""
Advanced Analytics Engine

Extended analytics for Featured Deals with trends and distributions
"""
from typing import Dict, List, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta, timezone
import logging

logger = logging.getLogger(__name__)


async def get_payments_distribution(db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
    """
    Get distribution of payments in ranges
    
    Returns:
        List of {range, count} for pie chart
    """
    ranges = [
        ("$0-$299", 0, 299),
        ("$300-$399", 300, 399),
        ("$400-$499", 400, 499),
        ("$500+", 500, 10000)
    ]
    
    distribution = []
    
    for label, min_val, max_val in ranges:
        count = await db.featured_deals.count_documents({
            "calculated_payment": {"$gte": min_val, "$lte": max_val}
        })
        
        if count > 0:
            distribution.append({
                "range": label,
                "count": count,
                "value": count  # For recharts
            })
    
    return distribution


async def get_avg_payment_per_brand(db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
    """
    Get average payment per brand for bar chart
    
    Returns:
        List of {brand, avg_payment}
    """
    pipeline = [
        {
            "$group": {
                "_id": "$brand",
                "avg_payment": {"$avg": "$calculated_payment"},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"avg_payment": 1}}
    ]
    
    results = await db.featured_deals.aggregate(pipeline).to_list(length=None)
    
    return [
        {
            "brand": r["_id"],
            "avg_payment": round(r.get("avg_payment", 0), 2),
            "count": r["count"]
        }
        for r in results
    ]


async def get_deals_created_over_time(
    db: AsyncIOMotorDatabase,
    days: int = 30
) -> List[Dict[str, Any]]:
    """
    Get deals created over time for line chart
    
    Args:
        days: Number of days to analyze
        
    Returns:
        List of {date, count}
    """
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    pipeline = [
        {"$match": {"created_at": {"$gte": start_date}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.featured_deals.aggregate(pipeline).to_list(length=None)
    
    return [
        {
            "date": r["_id"],
            "count": r["count"]
        }
        for r in results
    ]


async def get_program_changes_trend(
    db: AsyncIOMotorDatabase,
    days: int = 30
) -> List[Dict[str, Any]]:
    """
    Get program changes trend for area chart
    
    Args:
        days: Number of days to analyze
        
    Returns:
        List of {date, changes}
    """
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$timestamp"
                    }
                },
                "changes": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.auto_sync_logs.aggregate(pipeline).to_list(length=None)
    
    return [
        {
            "date": r["_id"],
            "changes": r["changes"]
        }
        for r in results
    ]


async def get_full_analytics_summary(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Get complete analytics summary for dashboard
    
    Returns:
        Dict with all analytics sections
    """
    # Run all analytics in parallel
    payments_dist = await get_payments_distribution(db)
    avg_per_brand = await get_avg_payment_per_brand(db)
    deals_timeline = await get_deals_created_over_time(db, days=30)
    program_changes = await get_program_changes_trend(db, days=30)
    
    # Get totals
    total_deals = await db.featured_deals.count_documents({})
    total_programs = await db.lease_programs_parsed.count_documents({})
    
    return {
        "payments_distribution": payments_dist,
        "avg_payment_per_brand": avg_per_brand,
        "deals_timeline": deals_timeline,
        "program_changes_trend": program_changes,
        "totals": {
            "deals": total_deals,
            "programs": total_programs
        }
    }
