"""
Honda/Acura Financial Services (AHFC) Parser
Extracts lease program data from Honda/Acura PDF text
"""
from typing import Optional, Dict, Any
import re
import logging
from models_lease_programs import LeaseProgramParsed

logger = logging.getLogger(__name__)


def parse_honda(text: str, model: Optional[str] = None) -> LeaseProgramParsed:
    """
    Parse Honda/Acura lease program text
    
    Args:
        text: Extracted PDF text
        model: Optional model name to filter/prioritize
        
    Returns:
        LeaseProgramParsed object with extracted data
    """
    logger.info(f"Parsing Honda/Acura program, model filter: {model}")
    
    # Detect brand
    brand = "Honda"
    if re.search(r"ACURA", text, re.IGNORECASE):
        brand = "Acura"
    
    # Extract data
    month = extract_month(text)
    region = extract_region(text)
    mf = extract_money_factors(text)
    residual = extract_residuals(text)
    incentives = extract_incentives(text)
    constraints = extract_constraints(text)
    
    return LeaseProgramParsed(
        pdf_id="",
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
    """Extract program month"""
    patterns = [
        r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})",
        r"Program\s+Date.*?(\d{1,2}/\d{1,2}/\d{4})"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    
    return None


def extract_region(text: str) -> Optional[str]:
    """Extract region"""
    regions = [
        r"California",
        r"Western\s+Region",
        r"Pacific",
        r"National"
    ]
    
    for region_pattern in regions:
        match = re.search(region_pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    
    return None


def extract_money_factors(text: str) -> Dict[str, float]:
    """Extract money factors"""
    mf_dict = {}
    
    # Honda often uses "MF: .000xx" format
    mf_pattern = r"(?:Money\s*Factor|MF)\s*[:=]?\s*0?\.(\d{3,5})"
    matches = re.finditer(mf_pattern, text, re.IGNORECASE)
    
    for match in matches:
        mf_value = float(f"0.{match.group(1)}")
        mf_dict["36"] = mf_value  # Default term
        logger.info(f"Found MF: {mf_value}")
        break
    
    # Term-specific
    term_mf_pattern = r"(\d{2})\s*(?:months?|mo)\s*.*?0?\.(\d{3,5})"
    term_matches = re.finditer(term_mf_pattern, text, re.IGNORECASE)
    
    for match in term_matches:
        term = match.group(1)
        mf_value = float(f"0.{match.group(2)}")
        mf_dict[term] = mf_value
    
    return mf_dict


def extract_residuals(text: str) -> Dict[str, Dict[str, float]]:
    """Extract residual values"""
    residuals = {}
    
    # Look for "RESIDUAL VALUES" section
    rv_match = re.search(r"RESIDUAL\s+VALUES?", text, re.IGNORECASE)
    if rv_match:
        rv_section = text[rv_match.start():rv_match.start() + 1000]
    else:
        rv_section = text
    
    # Extract mileages
    mileage_pattern = r"(\d+)K"
    mileages = []
    for m in re.finditer(mileage_pattern, rv_section):
        miles = m.group(1) + "00"  # 10K -> 10000
        if len(miles) == 3:  # 100 -> 10000
            miles = miles[0] + "0" + miles[1:]
        mileages.append(miles)
    
    if not mileages:
        mileages = ["10000", "12000", "15000"]
    
    # Extract terms and percentages
    term_pattern = r"(\d{2})\s*(?:MO|months?)"
    for term_match in re.finditer(term_pattern, rv_section, re.IGNORECASE):
        term = term_match.group(1)
        start_pos = term_match.end()
        text_chunk = rv_section[start_pos:start_pos + 150]
        
        # Find percentages
        percent_matches = list(re.finditer(r"\b(\d{2})\b", text_chunk))
        
        if len(percent_matches) >= len(mileages):
            residuals[term] = {}
            for i, mileage in enumerate(mileages):
                if i < len(percent_matches):
                    residuals[term][mileage] = float(percent_matches[i].group(1))
    
    return residuals


def extract_incentives(text: str) -> Dict[str, float]:
    """Extract incentives"""
    incentives = {}
    
    patterns = [
        (r"Flex\s+Cash[:=]?\s*\$?(\d+)", "flex_cash"),
        (r"Cap\s+Cost\s+Reduction[:=]?\s*\$?(\d+)", "cap_cost_reduction"),
        (r"Lease\s+Cash[:=]?\s*\$?(\d+)", "lease_cash"),
        (r"Customer\s+Cash[:=]?\s*\$?(\d+)", "customer_cash"),
        (r"Loyalty[:=]?\s*\$?(\d+)", "loyalty"),
    ]
    
    for pattern, key in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            incentives[key] = float(match.group(1))
    
    return incentives


def extract_constraints(text: str) -> Dict[str, Any]:
    """Extract constraints"""
    constraints = {}
    
    # Credit tier
    if re.search(r"Tier\s+1", text, re.IGNORECASE):
        constraints["tier"] = "Tier 1"
    
    # Credit score
    score_match = re.search(r"(\d{3})\+?\s*credit", text, re.IGNORECASE)
    if score_match:
        constraints["credit_score"] = f"{score_match.group(1)}+"
    
    return constraints
