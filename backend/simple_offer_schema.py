"""
Simple Offers Schema - Manual Only
No calculators, no auto-generation
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SimpleOffer(BaseModel):
    """Simple manual offer - no calculator logic"""
    
    # Basic Info
    title: str
    year: int
    make: str
    model: str
    trim: Optional[str] = ""
    
    # Deal Type
    dealType: str = "Lease"  # Lease | Finance | Cash
    
    # Pricing (manual)
    sellingPrice: float
    msrp: Optional[float] = None
    monthlyPayment: Optional[float] = None
    downPayment: Optional[float] = None
    
    # Terms (manual)
    termMonths: Optional[int] = 36
    mileage: Optional[int] = 10000
    
    # Location
    region: Optional[str] = "California"
    zip: Optional[str] = ""
    
    # Media
    images: List[str] = []
    
    # Status
    published: bool = False
    
    # Metadata
    createdAt: datetime = datetime.utcnow()
    updatedAt: datetime = datetime.utcnow()
    
    # Source
    source: str = "manual"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
