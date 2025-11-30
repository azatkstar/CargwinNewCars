"""
Featured Deals Models

Models for showcasing best lease deals on the platform
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


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
    image_url: Optional[str] = None
    description: Optional[str] = None
    stock_count: Optional[int] = 1
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Calculated fields (populated by PRO calculator)
    calculated_payment: Optional[float] = None
    calculated_driveoff: Optional[float] = None
    calculated_onepay: Optional[float] = None
    mf_used: Optional[float] = None
    residual_percent_used: Optional[float] = None
    savings_vs_msrp: Optional[float] = None
    
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
