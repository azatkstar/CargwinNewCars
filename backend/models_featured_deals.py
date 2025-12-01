"""
Featured Deals Models

Models for showcasing best lease deals on the platform
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class SEOFields(BaseModel):
    """SEO metadata for Featured Deal"""
    title: Optional[str] = None
    meta_description: Optional[str] = None
    slug: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image_url: Optional[str] = None
    canonical_url: Optional[str] = None


class AISummary(BaseModel):
    """AI-oriented structured summary for Featured Deal"""
    type: str = "lease"
    brand: str
    model: str
    year: int
    trim: Optional[str] = None
    payment_month: Optional[float] = None
    drive_off: Optional[float] = None
    term_months: int
    annual_miles: int
    region: str
    credit_tier: str = "Tier 1"
    bank: Optional[str] = None
    source: str = "Hunter.Lease PRO calculator"
    currency: str = "USD"


class FeaturedDeal(BaseModel):
    """
    Featured lease deal model
    """
    id: Optional[str] = None
    brand: str
    model: str
    trim: Optional[str] = None
    year: int
    msrp: float
    selling_price: float
    term_months: int
    annual_mileage: int
    region: str = "California"
    bank: Optional[str] = None  # e.g., "TFS", "AHFC", "BMW FS"
    
    # Media (optional)
    image_url: Optional[str] = None
    description: Optional[str] = None
    
    # Inventory
    stock_count: Optional[int] = 1
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Calculated fields (populated by PRO calculator)
    calculated_payment: Optional[float] = None
    calculated_driveoff: Optional[float] = None
    calculated_onepay: Optional[float] = None
    mf_used: Optional[float] = None
    residual_percent_used: Optional[float] = None
    savings_vs_msrp: Optional[float] = None
    tax_rate: Optional[float] = 0.0925
    fees: Optional[Dict[str, float]] = Field(default_factory=dict)
    
    # SEO & AI
    seo: Optional[SEOFields] = None
    ai_summary: Optional[AISummary] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CreateDealRequest(BaseModel):
    """
    Request model for creating a featured deal
    """
    brand: str
    model: str
    trim: Optional[str] = None
    year: int
    msrp: float
    selling_price: float
    term_months: int = 36
    annual_mileage: int = 10000
    region: str = "California"
    image_url: Optional[str] = None
    description: Optional[str] = None
    stock_count: Optional[int] = 1
    expires_at: Optional[datetime] = None
