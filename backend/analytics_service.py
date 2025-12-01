"""
Analytics Service

Provides analytics and metrics for Featured Deals
"""
from typing import Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)


async def get_deals_overview(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
    """
    Get overview statistics for Featured Deals
    
    Returns:
        Overview metrics dict
    """
    # Total deals
    total_deals = await db.featured_deals.count_documents({})
    
    # Total by brand
    brand_pipeline = [
        {"$group": {"_id": "$brand", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    brands = await db.featured_deals.aggregate(brand_pipeline).to_list(length=None)
    
    # Average payment
    avg_pipeline = [
        {"$group": {
            "_id": None,
            "avg_payment": {"$avg": "$calculated_payment"},
            "min_payment": {"$min": "$calculated_payment"},
            "max_payment": {"$max": "$calculated_payment"}
        }}
    ]
    avg_result = await db.featured_deals.aggregate(avg_pipeline).to_list(length=1)
    avg_stats = avg_result[0] if avg_result else {}
    
    return {
        "total_deals": total_deals,
        "brands": brands,
        "avg_payment": avg_stats.get("avg_payment", 0),
        "min_payment": avg_stats.get("min_payment", 0),
        "max_payment": avg_stats.get("max_payment", 0)
    }


async def get_top_brands_models(db: AsyncIOMotorDatabase, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get top brands and models by deal count
    
    Returns:
        List of {brand, model, count, avg_payment}
    """
    pipeline = [
        {
            "$group": {
                "_id": {"brand": "$brand", "model": "$model"},
                "count": {"$sum": 1},
                "avg_payment": {"$avg": "$calculated_payment"},
                "min_payment": {"$min": "$calculated_payment"},
                "max_payment": {"$max": "$calculated_payment"}
            }
        },
        {"$sort": {"count": -1}},
        {"$limit": limit}
    ]
    
    results = await db.featured_deals.aggregate(pipeline).to_list(length=limit)
    
    return [
        {
            "brand": r["_id"]["brand"],
            "model": r["_id"]["model"],
            "count": r["count"],
            "avg_payment": r.get("avg_payment", 0),
            "min_payment": r.get("min_payment", 0),
            "max_payment": r.get("max_payment", 0)
        }
        for r in results
    ]


async def get_distribution_by_banks(db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
    """
    Get distribution of deals by bank
    
    Returns:
        List of {bank, count, avg_payment}
    """
    pipeline = [
        {
            "$group": {
                "_id": "$bank",
                "count": {"$sum": 1},
                "avg_payment": {"$avg": "$calculated_payment"}
            }
        },
        {"$sort": {"count": -1}}
    ]
    
    results = await db.featured_deals.aggregate(pipeline).to_list(length=None)
    
    return [
        {
            "bank": r["_id"] or "Unknown",
            "count": r["count"],
            "avg_payment": r.get("avg_payment", 0)
        }
        for r in results
    ]


async def get_distribution_by_terms(db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
    """
    Get distribution of deals by lease terms
    
    Returns:
        List of {term_months, count, avg_payment}
    """
    pipeline = [
        {
            "$group": {
                "_id": "$term_months",
                "count": {"$sum": 1},
                "avg_payment": {"$avg": "$calculated_payment"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.featured_deals.aggregate(pipeline).to_list(length=None)
    
    return [
        {
            "term_months": r["_id"],
            "count": r["count"],
            "avg_payment": r.get("avg_payment", 0)
        }
        for r in results
    ]


async def get_distribution_by_mileage(db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
    """
    Get distribution of deals by annual mileage
    
    Returns:
        List of {annual_mileage, count, avg_payment}
    """
    pipeline = [
        {
            "$group": {
                "_id": "$annual_mileage",
                "count": {"$sum": 1},
                "avg_payment": {"$avg": "$calculated_payment"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.featured_deals.aggregate(pipeline).to_list(length=None)
    
    return [
        {
            "annual_mileage": r["_id"],
            "count": r["count"],
            "avg_payment": r.get("avg_payment", 0)
        }
        for r in results
    ]


async def get_payment_trends(
    db: AsyncIOMotorDatabase,
    days: int = 30
) -> List[Dict[str, Any]]:
    """
    Get payment trends over time
    
    Args:
        days: Number of days to analyze
        
    Returns:
        List of {date, avg_payment, count}
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
                "count": {"$sum": 1},
                "avg_payment": {"$avg": "$calculated_payment"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.featured_deals.aggregate(pipeline).to_list(length=None)
    
    return [
        {
            "date": r["_id"],
            "count": r["count"],
            "avg_payment": r.get("avg_payment", 0)
        }
        for r in results
    ]
