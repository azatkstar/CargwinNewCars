"""
System Settings Models

Global application settings
"""
from typing import Optional, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class SEOTemplates(BaseModel):
    """SEO templates with placeholders"""
    title_template: str = "{year} {brand} {model} {trim} lease – ${payment}/mo, ${driveoff} down | Hunter.Lease {region}"
    meta_template: str = "Лизинг {year} {brand} {model} {trim} от ${payment} в месяц при ${driveoff} down на {term} мес и {miles}k миль в год в {region}. Tier 1. Онлайн-одобрение."
    slug_template: str = "{year}-{brand}-{model}-{trim}-lease-{payment}mo-{driveoff}down-{region}"


class AutoSyncSettings(BaseModel):
    """AutoSync Engine settings"""
    enabled: bool = True
    auto_run_schedule: Optional[str] = None
    recalc_on_program_update: bool = True
    log_retention_days: int = 90


class SystemSettings(BaseModel):
    """
    Global system settings
    """
    id: str = "system_settings"
    
    default_region: str = "California"
    default_tax_rate: float = 0.0925
    default_term_months: int = 36
    default_annual_mileage: int = 10000
    
    seo_templates: SEOTemplates = Field(default_factory=SEOTemplates)
    auto_sync: AutoSyncSettings = Field(default_factory=AutoSyncSettings)
    
    global_disclaimer: str = "All payments are estimates. Final figures depend on credit approval, bank program changes, and exact fees. Subject to change without notice."
    contact_telegram: str = "https://t.me/SalesAzatAuto"
    contact_email: str = "info@hunter.lease"
    
    allowed_image_domains: List[str] = Field(default_factory=lambda: [
        "images.unsplash.com",
        "images.pexels.com",
        "cdn.hunter.lease"
    ])
    
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_by: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
