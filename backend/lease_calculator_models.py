"""
Lease Calculator Database Models
Professional tier-based MF/Residual system
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone, date
from bson import ObjectId

# ============================================
# Banks
# ============================================

class BankDocument(BaseModel):
    """Financial institution for leasing/financing"""
    name: str
    slug: str  # unique
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), ObjectId: str}

# ============================================
# Credit Tiers (6 levels)
# ============================================

class CreditTierDocument(BaseModel):
    """Credit tier levels for MF calculation"""
    code: str  # SUPER_ELITE, ELITE, etc.
    label: str  # "Super Elite 740+", etc.
    min_score: int
    max_score: Optional[int] = None
    order_index: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), ObjectId: str}

# Seed data
CREDIT_TIERS_SEED = [
    {"code": "SUPER_ELITE", "label": "Super Elite 740+", "min_score": 740, "max_score": None, "order_index": 1},
    {"code": "ELITE", "label": "Elite 700-739", "min_score": 700, "max_score": 739, "order_index": 2},
    {"code": "STANDARD", "label": "Standard 675-699", "min_score": 675, "max_score": 699, "order_index": 3},
    {"code": "STANDARD_PLUS", "label": "Standard Plus 640-674", "min_score": 640, "max_score": 674, "order_index": 4},
    {"code": "PROGRESSIVE", "label": "Progressive 601-639", "min_score": 601, "max_score": 639, "order_index": 5},
    {"code": "FAIR", "label": "Fair 0-600", "min_score": 0, "max_score": 600, "order_index": 6}
]

# ============================================
# MF Programs
# ============================================

class MFProgramDocument(BaseModel):
    """Bank lease program (e.g., 'HMF December 2025')"""
    bank_id: str
    program_name: str
    region: Optional[str] = None  # CA, NY, etc.
    effective_from: date
    effective_to: date
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), date: lambda v: v.isoformat(), ObjectId: str}

# ============================================
# MF Values
# ============================================

class MFValueDocument(BaseModel):
    """Money Factor and Residual for program + tier + vehicle"""
    mf_program_id: str
    credit_tier_id: str
    make: Optional[str] = None
    model: Optional[str] = None
    trim: Optional[str] = None
    year: Optional[int] = None
    term_months: Optional[int] = None
    money_factor: float  # e.g., 0.00228
    residual_percent: float  # e.g., 0.450 = 45%
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), ObjectId: str}

# ============================================
# Residual Overrides
# ============================================

class ResidualOverrideDocument(BaseModel):
    """Mileage adjustments to residual"""
    mf_value_id: str
    annual_mileage: int  # 7500, 10000, etc.
    adjustment: float  # +0.01, 0, -0.02
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), ObjectId: str}

# ============================================
# Deals (Enhanced)
# ============================================

class DealDocument(BaseModel):
    """Professional deal with full MF system"""
    external_deal_id: str  # unique
    make: str
    model: str
    trim: Optional[str] = None
    year: int
    msrp: float
    selling_price: float
    bank_id: str
    mf_program_id: str
    base_residual_percent: float
    default_term_months: int
    default_annual_mileage: int
    tax_rate: float  # 0.1025 = 10.25%
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), ObjectId: str}

# ============================================
# Deal Fees
# ============================================

class DealFeesDocument(BaseModel):
    """Fixed fees for a deal"""
    deal_id: str
    acquisition_fee: float
    registration_fee: float
    doc_fee: float
    other_fees: float
    ab_service_fee: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), ObjectId: str}

# ============================================
# Incentives
# ============================================

class IncentiveDocument(BaseModel):
    """Rebates/incentives for deal"""
    deal_id: str
    name: str
    amount: float
    is_stackable: bool = True
    expires_at: Optional[date] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        arbitrary_types_allowed = True
        json_encoders = {datetime: lambda v: v.isoformat(), date: lambda v: v.isoformat(), ObjectId: str}
