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
