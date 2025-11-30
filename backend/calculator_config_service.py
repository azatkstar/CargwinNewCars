"""
Calculator Config Service
Automatically generates calculator configuration for deals based on:
- LeaseProgram
- FinanceProgram  
- TaxConfig
"""
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase


class CalculatorConfigService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        
    async def generate_calculator_config(self, deal_id: str) -> Dict[str, Any]:
        """
        Generate calculator configuration for a deal
        Returns complete CalculatorConfig object
        """
        # Get deal
        deal = await self.db.lots.find_one({"id": deal_id})
        if not deal:
            raise ValueError(f"Deal {deal_id} not found")
        
        # Extract deal info
        brand = deal.get("make", "")
        model = deal.get("model", "")
        trim = deal.get("trim", "")
        year = deal.get("year", 2024)
        msrp = deal.get("msrp", 0)
        state = deal.get("state", "CA")
        zip_code = deal.get("zip", "")
        
        # Find matching programs
        lease_program = await self._find_lease_program(brand, model, trim, year, state)
        finance_program = await self._find_finance_program(brand, model, trim, year, state)
        tax_config = await self._find_tax_config(state, zip_code)
        
        # Build config
        config = {
            "lease_available": lease_program is not None,
            "finance_available": finance_program is not None,
            "credit_tiers": [
                {"code": "tier1", "label": "Super Elite 740+"},
                {"code": "tier2", "label": "Elite 720-739"},
                {"code": "tier3", "label": "Excellent 700-719"},
                {"code": "tier4", "label": "Good 680-699"}
            ]
        }
        
        # Add lease config
        if lease_program:
            residual_value = round(msrp * (lease_program.get("residual_percent", 56) / 100))
            config.update({
                "lease_terms": lease_program.get("lease_terms", [36]),
                "default_lease_term": lease_program.get("default_term", 36),
                "lease_mileages": lease_program.get("mileage_options", [10000]),
                "default_mileage": lease_program.get("default_mileage", 10000),
                "money_factor_by_tier": {
                    "tier1": lease_program.get("money_factor", 0.00182),
                    "tier2": lease_program.get("money_factor", 0.00182) * 1.08,
                    "tier3": lease_program.get("money_factor", 0.00182) * 1.16,
                    "tier4": lease_program.get("money_factor", 0.00182) * 1.25
                },
                "lease_residuals": self._build_residual_table(
                    lease_program.get("lease_terms", [36]),
                    lease_program.get("mileage_options", [10000]),
                    lease_program.get("residual_percent", 56)
                ),
                "residual_percent": lease_program.get("residual_percent", 56),
                "residual_value": residual_value,
                "acquisition_fee": lease_program.get("acquisition_fee", 695),
                "doc_fee": lease_program.get("doc_fee", 85),
                "dmv_fee": lease_program.get("registration_fee_base", 540),
                "dealer_fees": lease_program.get("other_fees", 0),
                "due_at_signing_type": lease_program.get("due_at_signing_type", "first_plus_fees"),
                "fixed_due_at_signing": lease_program.get("fixed_due_at_signing"),
                "lender_name": lease_program.get("lender_name", "Manufacturer Financial"),
                "default_lease_down_payments": [0, 1000, 1500, 2000, 2500, 3000, 4000, 5000],
                "rebates_taxable": sum(i.get("amount", 0) for i in lease_program.get("incentives", []) if i.get("stackable")),
                "rebates_non_taxable": 0
            })
            
            # Add incentives info
            if lease_program.get("incentives"):
                config["incentives"] = [
                    {
                        "name": inc.get("name", ""),
                        "amount": inc.get("amount", 0),
                        "stackable": inc.get("stackable", True),
                        "expires_at": inc.get("end_date")
                    }
                    for inc in lease_program.get("incentives", [])
                ]
        
        # Add finance config
        if finance_program:
            config.update({
                "finance_available": True,
                "finance_terms": finance_program.get("terms", [60]),
                "default_finance_term": finance_program.get("default_term", 60),
                "apr_by_tier": {
                    "tier1": finance_program.get("default_apr", 5.99),
                    "tier2": finance_program.get("default_apr", 5.99) + 1.0,
                    "tier3": finance_program.get("default_apr", 5.99) + 2.0,
                    "tier4": finance_program.get("default_apr", 5.99) + 3.0
                },
                "default_finance_down_payments": finance_program.get("down_payment_options", [0, 1000, 2500, 5000]),
                "finance_fees": 0,
                "finance_lender_name": finance_program.get("lender_name", "Manufacturer Financial")
            })
        
        # Add tax config
        if tax_config:
            config.update({
                "tax_rate": tax_config.get("tax_rate", 0.075),
                "tax_on_fees": tax_config.get("tax_on_fees", True),
                "breakdown": {
                    "tax_rate": tax_config.get("tax_rate", 0.075),
                    "tax_on_fees": tax_config.get("tax_on_fees", True),
                    "acquisition_tax_rate": tax_config.get("acquisition_tax_rate", 0),
                    "doc_tax_rate": tax_config.get("doc_tax_rate", 0),
                    "registration_tax_rate": tax_config.get("registration_tax_rate", 0),
                    "other_tax_rate": tax_config.get("other_tax_rate", 0)
                }
            })
        else:
            # Default tax for CA
            config.update({
                "tax_rate": 0.0775,
                "tax_on_fees": True,
                "breakdown": {
                    "tax_rate": 0.0775,
                    "tax_on_fees": True,
                    "acquisition_tax_rate": 0,
                    "doc_tax_rate": 0,
                    "registration_tax_rate": 0,
                    "other_tax_rate": 0
                }
            })
        
        # Incentives toggle
        config["allow_incentives_toggle"] = bool(lease_program and lease_program.get("incentives"))
        config["incentives_default_on"] = True
        
        return config
    
    async def _find_lease_program(
        self, 
        brand: str, 
        model: str, 
        trim: str, 
        year: int, 
        state: str
    ) -> Optional[Dict[str, Any]]:
        """Find matching lease program"""
        now = datetime.now(timezone.utc)
        
        # Query active programs
        query = {
            "brand": {"$regex": f"^{re.escape(brand)}$", "$options": "i"},
            "year_from": {"$lte": year},
            "year_to": {"$gte": year},
            "is_active": True,
            "program_start": {"$lte": now},
            "program_end": {"$gte": now}
        }
        
        # State filter
        query["$or"] = [
            {"states": "ALL"},
            {"states": state}
        ]
        
        programs = await self.db.lease_programs.find(query).to_list(length=100)
        
        if not programs:
            return None
        
        # Score and sort by specificity
        scored_programs = []
        for prog in programs:
            score = 0
            
            # Model pattern match
            model_pattern = prog.get("model_pattern", "")
            if model_pattern:
                if re.search(model_pattern, model, re.IGNORECASE):
                    score += 10
                else:
                    continue  # Skip if model doesn't match
            
            # Trim pattern match (bonus)
            trim_pattern = prog.get("trim_pattern", "")
            if trim_pattern and trim:
                if re.search(trim_pattern, trim, re.IGNORECASE):
                    score += 5
            
            scored_programs.append((score, prog))
        
        if not scored_programs:
            return None
        
        # Return highest scoring
        scored_programs.sort(key=lambda x: x[0], reverse=True)
        return scored_programs[0][1]
    
    async def _find_finance_program(
        self,
        brand: str,
        model: str,
        trim: str,
        year: int,
        state: str
    ) -> Optional[Dict[str, Any]]:
        """Find matching finance program (same logic as lease)"""
        now = datetime.now(timezone.utc)
        
        query = {
            "brand": {"$regex": f"^{re.escape(brand)}$", "$options": "i"},
            "year_from": {"$lte": year},
            "year_to": {"$gte": year},
            "is_active": True,
            "program_start": {"$lte": now},
            "program_end": {"$gte": now}
        }
        
        query["$or"] = [
            {"states": "ALL"},
            {"states": state}
        ]
        
        programs = await self.db.finance_programs.find(query).to_list(length=100)
        
        if not programs:
            return None
        
        scored_programs = []
        for prog in programs:
            score = 0
            model_pattern = prog.get("model_pattern", "")
            if model_pattern:
                if re.search(model_pattern, model, re.IGNORECASE):
                    score += 10
                else:
                    continue
            
            trim_pattern = prog.get("trim_pattern", "")
            if trim_pattern and trim:
                if re.search(trim_pattern, trim, re.IGNORECASE):
                    score += 5
            
            scored_programs.append((score, prog))
        
        if not scored_programs:
            return None
        
        scored_programs.sort(key=lambda x: x[0], reverse=True)
        return scored_programs[0][1]
    
    async def _find_tax_config(self, state: str, zip_code: str) -> Optional[Dict[str, Any]]:
        """Find matching tax configuration"""
        # Try zip prefix match first
        if zip_code and len(zip_code) >= 2:
            zip_prefix = zip_code[:2]
            tax_config = await self.db.tax_configs.find_one({
                "state": state,
                "zip_prefixes": zip_prefix,
                "is_active": True
            })
            if tax_config:
                return tax_config
        
        # Fall back to state-wide
        tax_config = await self.db.tax_configs.find_one({
            "state": state,
            "zip_prefixes": {"$size": 0},
            "is_active": True
        })
        
        return tax_config
    
    def _build_residual_table(
        self,
        terms: List[int],
        mileages: List[int],
        base_residual: float
    ) -> Dict[str, Dict[str, float]]:
        """Build residual percentage table"""
        table = {}
        
        for term in terms:
            table[str(term)] = {}
            
            # Decrease residual by term (longer term = lower residual)
            term_factor = 1.0 - ((term - 24) * 0.02)
            
            for mileage in mileages:
                # Decrease residual by mileage (higher miles = lower residual)
                mileage_factor = 1.0 - ((mileage - 7500) / 1000 * 0.01)
                
                residual = base_residual * term_factor * mileage_factor / 100
                residual = max(0.40, min(0.70, residual))  # Clamp between 40% and 70%
                
                table[str(term)][str(mileage)] = round(residual, 4)
        
        return table
    
    async def regenerate_all_auto_configs(self):
        """Regenerate calculator configs for all deals with auto-generation enabled"""
        deals = await self.db.lots.find({"calculator_config_auto": True}).to_list(length=None)
        
        regenerated = 0
        for deal in deals:
            try:
                config = await self.generate_calculator_config(deal["id"])
                await self.db.lots.update_one(
                    {"id": deal["id"]},
                    {"$set": {"calculator_config": config}}
                )
                regenerated += 1
            except Exception as e:
                print(f"Failed to regenerate config for deal {deal['id']}: {e}")
        
        return regenerated
