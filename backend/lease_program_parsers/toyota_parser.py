"""
Toyota/Lexus Financial Services (TFS/LFS) Parser
Extracts lease program data from Toyota/Lexus PDF text
"""
from typing import Optional, Dict, Any
import re
import logging
from models_lease_programs import LeaseProgramParsed

logger = logging.getLogger(__name__)


def parse_toyota(text: str, model: Optional[str] = None) -> LeaseProgramParsed:
    """
    Parse Toyota/Lexus lease program text
    
    Args:
        text: Extracted PDF text
        model: Optional model name to filter/prioritize
        
    Returns:
        LeaseProgramParsed object with extracted data
    """
    logger.info(f"Parsing Toyota/Lexus program, model filter: {model}")
    
    # Detect brand
    brand = "Toyota"
    if re.search(r"LEXUS\s+FINANCIAL", text, re.IGNORECASE):
        brand = "Lexus"
    
    # Extract month
    month = extract_month(text)
    
    # Extract region
    region = extract_region(text)
    
    # Extract money factors
    mf = extract_money_factors(text)
    
    # Extract residual values
    residual = extract_residuals(text)
    
    # Extract incentives
    incentives = extract_incentives(text)
    
    # Extract constraints
    constraints = extract_constraints(text)
    
    return LeaseProgramParsed(
        pdf_id="",  # Will be set by caller
        brand=brand,
        model=model,
        month=month,
        region=region,
        mf=mf,
        residual=residual,
        incentives=incentives,
        constraints=constraints
    )


def extract_month(text: str) -> Optional[str]:
    """Extract program month/date from text"""
    # Pattern: "March 2025", "PROGRAM - March 2025", "03/01/2025 - 03/31/2025"
    patterns = [
        r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})",
        r"PROGRAM.*?(\d{1,2}/\d{1,2}/\d{4})",
        r"EFFECTIVE.*?(\d{1,2}/\d{1,2}/\d{4})"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    
    return None


def extract_region(text: str) -> Optional[str]:
    """Extract region from text"""
    # Common patterns
    regions = [
        r"WESTERN\s+REGION",
        r"CALIFORNIA",
        r"NORTHERN\s+CALIFORNIA",
        r"NORCAL",
        r"SOUTHERN\s+CALIFORNIA",
        r"SOCAL",
        r"PACIFIC\s+REGION",
        r"WEST\s+REGION"
    ]
    
    for region_pattern in regions:
        match = re.search(region_pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    
    return None


def extract_money_factors(text: str) -> Dict[str, float]:
    """
    Extract money factors by term
    
    Returns dict like: {"36": 0.00032, "39": 0.00039}
    """
    mf_dict = {}
    
    # Pattern 1: "Money Factor: .00032" or "MF: 0.00032"
    mf_pattern = r"(?:Money\s*Factor|MF|Base\s*MF|Rate)\s*[:=]?\s*0?\.(\d{3,5})"
    matches = re.finditer(mf_pattern, text, re.IGNORECASE)
    
    for match in matches:
        mf_value = float(f"0.{match.group(1)}")
        # If no term specified, assume default 36 month
        mf_dict["36"] = mf_value
        logger.info(f"Found MF: {mf_value}")
        break  # Take first match for now
    
    # Pattern 2: Term-specific MF (e.g. "36 MO: .00032")
    term_mf_pattern = r"(\d{2})\s*MO.*?0?\.(\d{3,5})"
    term_matches = re.finditer(term_mf_pattern, text, re.IGNORECASE)
    
    for match in term_matches:
        term = match.group(1)
        mf_value = float(f"0.{match.group(2)}")
        mf_dict[term] = mf_value
        logger.info(f"Found term-specific MF: {term} months = {mf_value}")
    
    return mf_dict


def extract_residuals(text: str) -> Dict[str, Dict[str, float]]:
    """
    Extract residual values by term and mileage
    
    Returns nested dict: {"36": {"7500": 76, "10000": 75, ...}}
    """
    residuals = {}
    
    # Look for residual value table section
    rv_section = extract_rv_section(text)
    if not rv_section:
        logger.warning("No residual value section found")
        return residuals
    
    # Extract mileage columns (7.5K, 10K, 12K, 15K)
    mileage_pattern = r"(\d+\.?\d*)\s*K"
    mileage_matches = re.finditer(mileage_pattern, rv_section, re.IGNORECASE)
    mileages = []
    for m in mileage_matches:
        miles = m.group(1).replace('.', '')
        if len(miles) == 2:  # 75 -> 7500
            miles = miles + "00"
        elif len(miles) == 1:  # 7 -> 7000
            miles = miles + "000"
        mileages.append(miles)
    
    if not mileages:
        # Fallback to standard mileages
        mileages = ["7500", "10000", "12000", "15000"]
    
    logger.info(f"Found mileages: {mileages}")
    
    # Extract term rows (24, 36, 39, 48)
    term_pattern = r"(\d{2})\s*MO"
    term_matches = list(re.finditer(term_pattern, rv_section, re.IGNORECASE))
    
    for term_match in term_matches:
        term = term_match.group(1)
        # Find percentage values after this term
        # Look for pattern like "76  75  74  72" (4 values for 4 mileages)
        start_pos = term_match.end()
        # Get text after term, limited to next 200 chars
        text_chunk = rv_section[start_pos:start_pos + 200]
        
        # Extract percentages (2-digit numbers, possibly followed by %)
        percent_pattern = r"\b(\d{2})\s*%?"
        percent_matches = list(re.finditer(percent_pattern, text_chunk))
        
        if len(percent_matches) >= len(mileages):
            residuals[term] = {}
            for i, mileage in enumerate(mileages):
                if i < len(percent_matches):
                    residuals[term][mileage] = float(percent_matches[i].group(1))
            
            logger.info(f"Found residuals for {term} months: {residuals[term]}")
    
    return residuals


def extract_rv_section(text: str) -> Optional[str]:
    """Extract the residual value table section"""
    # Look for section headers
    rv_headers = [
        r"RESIDUAL\s+VALUE",
        r"RV\s+TABLE",
        r"LEASE\s+RESIDUAL",
        r"\d{2}\s*MO.*?\d{2}\s*MO"  # Pattern with multiple "XX MO"
    ]
    
    for header_pattern in rv_headers:
        match = re.search(header_pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            # Extract section (next 1000 chars after match)
            start = match.start()
            return text[start:start + 1000]
    
    # Fallback: return full text
    return text


def extract_incentives(text: str) -> Dict[str, float]:
    """
    Extract incentives (lease cash, loyalty, etc.)
    
    Returns dict like: {"lease_cash": 500, "loyalty": 250}
    """
    incentives = {}
    
    incentive_patterns = [
        (r"Lease\s+Cash[:=]?\s*\$?(\d+)", "lease_cash"),
        (r"Lease\s+Bonus[:=]?\s*\$?(\d+)", "lease_bonus"),
        (r"Customer\s+Cash[:=]?\s*\$?(\d+)", "customer_cash"),
        (r"Loyalty[:=]?\s*\$?(\d+)", "loyalty"),
        (r"Conquest[:=]?\s*\$?(\d+)", "conquest"),
        (r"TFS\s+Lease\s+Credit[:=]?\s*\$?(\d+)", "tfs_lease_credit"),
        (r"Subvention[:=]?\s*\$?(\d+)", "subvention"),
    ]
    
    for pattern, key in incentive_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            amount = float(match.group(1))
            incentives[key] = amount
            logger.info(f"Found incentive: {key} = ${amount}")
    
    return incentives


def extract_constraints(text: str) -> Dict[str, Any]:
    """Extract constraints like tier, credit score requirements"""
    constraints = {}
    
    # Tier
    tier_pattern = r"Tier\s+(\d+\+?|[A-Z]+)"
    tier_match = re.search(tier_pattern, text, re.IGNORECASE)
    if tier_match:
        constraints["tier"] = tier_match.group(0).strip()
    
    # Credit score
    score_pattern = r"(\d{3})\+?\s*(FICO|Credit\s+Score)"
    score_match = re.search(score_pattern, text, re.IGNORECASE)
    if score_match:
        constraints["credit_score"] = f"{score_match.group(1)}+"
    
    # Additional notes
    if "Tier 1" in text or "TIER 1" in text:
        constraints["tier_note"] = "Tier 1 or higher required"
    
    return constraints
