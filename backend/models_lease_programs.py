"""
Pydantic models for parsed lease programs
"""
from typing import Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class LeaseProgramParsed(BaseModel):
    """
    Parsed lease program data extracted from PDF
    """
    id: Optional[str] = None  # MongoDB _id as string
    pdf_id: str  # reference to raw_program_pdfs.id
    brand: str  # "Toyota", "Lexus", "Honda", "Kia", "BMW", "Mercedes"
    model: Optional[str] = None  # "Camry", "RAV4", etc.
    month: Optional[str] = None  # e.g. "March 2025"
    region: Optional[str] = None  # e.g. "California", "Western Region"

    # Money factor by term (e.g. {"36": 0.00035, "39": 0.00039})
    mf: Dict[str, float] = Field(default_factory=dict)

    # Residual values, nested: term -> mileage -> percent
    # Example: {"36": {"7500": 76, "10000": 75, "12000": 74, "15000": 72}}
    residual: Dict[str, Dict[str, float]] = Field(default_factory=dict)

    # Incentives like lease cash, loyalty, etc.
    incentives: Dict[str, float] = Field(default_factory=dict)

    # Constraints (tier, credit score notes, etc.)
    constraints: Dict[str, Any] = Field(default_factory=dict)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }



# ==========================================
# CALCULATOR MODELS
# ==========================================

class LeaseCalculationRequest(BaseModel):
    """
    Request model for lease payment calculation
    """
    brand: str
    model: Optional[str] = None
    trim: Optional[str] = None
    region: Optional[str] = None  # e.g. "California", "Western Region"

    # Vehicle pricing
    msrp: float  # Retail MSRP
    selling_price: float  # Agreed selling price (cap cost before incentives)
    
    # Lease terms
    term_months: int  # e.g. 24, 36, 39, 42
    annual_mileage: int  # e.g. 7500, 10000, 12000, 15000
    
    # Money factor & residual overrides (optional)
    override_mf: Optional[float] = None
    override_residual_percent: Optional[float] = None
    
    # Taxes & fees
    tax_rate: float = 0.0925  # default 9.25% (California)
    acquisition_fee: float = 895.0  # can be overridden per brand
    doc_fee: float = 85.0
    registration_fee: float = 400.0
    other_fees: float = 0.0

    # Down payment / drive-off
    down_payment: float = 0.0  # cap cost reduction from customer cash
    drive_off_mode: str = "standard"  # "standard" or "zero" (zero drive-off structure)

    # Incentives
    apply_incentives: bool = True
    # Optional manual override if needed:
    manual_incentives: Optional[Dict[str, float]] = None


class LeaseCalculationResult(BaseModel):
    """
    Detailed lease calculation breakdown
    """
    brand: str
    model: Optional[str] = None
    trim: Optional[str] = None
    region: Optional[str] = None

    term_months: int
    annual_mileage: int

    msrp: float
    selling_price: float

    mf_used: float
    residual_percent_used: float
    residual_value: float

    cap_cost_before_incentives: float
    total_incentives_applied: float
    adjusted_cap_cost: float

    acquisition_fee: float
    doc_fee: float
    registration_fee: float
    other_fees: float
    total_fees_capitalized: float

    depreciation_fee: float
    finance_fee: float
    base_payment_before_tax: float

    tax_rate: float
    tax_amount: float
    monthly_payment_with_tax: float

    down_payment: float
    estimated_drive_off: float

    one_pay_estimated: float  # rough estimate using MF discount

    # "Savings" vs a naive dealer offer
    estimated_savings_vs_msrp_deal: float

