"""
Parser Router

Routes lease program text to appropriate brand-specific parser
"""
from typing import Optional
import logging
from models_lease_programs import LeaseProgramParsed
from .toyota_parser import parse_toyota
from .honda_parser import parse_honda
from .kia_parser import parse_kia
from .bmw_parser import parse_bmw
from .mercedes_parser import parse_mercedes

logger = logging.getLogger(__name__)


def parse_lease_program(
    brand: str, 
    text: str, 
    model: Optional[str] = None,
    pdf_id: Optional[str] = None
) -> LeaseProgramParsed:
    """
    Route to appropriate brand parser
    
    Args:
        brand: Brand name (Toyota, Honda, Kia, BMW, Mercedes)
        text: Extracted PDF text
        model: Optional model name
        pdf_id: Optional PDF ID to link parsed data
        
    Returns:
        LeaseProgramParsed object
        
    Raises:
        ValueError: If brand is not supported
    """
    brand_lower = brand.lower()
    
    logger.info(f"Routing to parser for brand: {brand}")
    
    # Route to appropriate parser
    if brand_lower in ["toyota", "lexus"]:
        result = parse_toyota(text, model=model)
    elif brand_lower in ["honda", "acura"]:
        result = parse_honda(text, model=model)
    elif brand_lower in ["kia", "hyundai"]:
        result = parse_kia(text, model=model)
    elif brand_lower in ["bmw"]:
        result = parse_bmw(text, model=model)
    elif brand_lower in ["mercedes", "mercedes-benz", "mb", "mbfs"]:
        result = parse_mercedes(text, model=model)
    else:
        raise ValueError(f"Unsupported brand: {brand}. Supported brands: Toyota, Lexus, Honda, Acura, Kia, Hyundai, BMW, Mercedes")
    
    # Set pdf_id if provided
    if pdf_id:
        result.pdf_id = pdf_id
    
    logger.info(f"Successfully parsed {brand} program")
    
    return result
