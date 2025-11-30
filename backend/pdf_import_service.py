"""
PDF Import Service
Handles PDF upload, text extraction, and OCR for lease/finance program imports
"""
import io
import logging
from typing import Dict, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def extract_pdf_text(file_bytes: bytes, filename: str = "document.pdf") -> Dict:
    """
    Extract text from PDF file using multiple methods:
    1. Try direct text extraction with pdfminer.six
    2. If insufficient text, use OCR with pytesseract + pdf2image
    
    Args:
        file_bytes: PDF file content as bytes
        filename: Original filename for logging
        
    Returns:
        dict with:
            - text: Extracted text content
            - page_count: Number of pages processed
            - warnings: List of warning messages
            - method: Extraction method used ('direct' or 'ocr')
    """
    warnings = []
    text_content = ""
    page_count = 0
    method = "unknown"
    
    try:
        # Method 1: Try direct text extraction with pdfminer
        logger.info(f"Attempting direct text extraction from {filename}")
        text_content, page_count = _extract_with_pdfminer(file_bytes)
        method = "direct"
        
        # Check if we got meaningful text (at least 100 characters)
        if len(text_content.strip()) < 100:
            logger.warning(f"Direct extraction yielded insufficient text ({len(text_content)} chars). Trying OCR...")
            warnings.append("Direct text extraction yielded little text. Using OCR method.")
            
            # Method 2: Use OCR
            text_content, page_count = _extract_with_ocr(file_bytes, filename)
            method = "ocr"
        
        logger.info(f"Successfully extracted {len(text_content)} characters from {page_count} pages using {method}")
        
        return {
            "text": text_content,
            "page_count": page_count,
            "warnings": warnings,
            "method": method,
            "char_count": len(text_content)
        }
        
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")


def _extract_with_pdfminer(file_bytes: bytes) -> tuple[str, int]:
    """
    Extract text directly from PDF using pdfminer.six
    
    Returns:
        (text_content, page_count)
    """
    try:
        from pdfminer.high_level import extract_text_to_fp
        from pdfminer.layout import LAParams
        from io import BytesIO, StringIO
        
        input_file = BytesIO(file_bytes)
        output_string = StringIO()
        
        # Extract text with layout analysis
        laparams = LAParams(
            line_margin=0.5,
            word_margin=0.1,
            char_margin=2.0,
            detect_vertical=True
        )
        
        extract_text_to_fp(input_file, output_string, laparams=laparams)
        text = output_string.getvalue()
        
        # Count pages by analyzing PDF structure
        from pdfminer.pdfpage import PDFPage
        input_file.seek(0)
        pages = list(PDFPage.get_pages(input_file))
        page_count = len(pages)
        
        return text, page_count
        
    except Exception as e:
        logger.error(f"pdfminer extraction failed: {e}")
        raise


def _extract_with_ocr(file_bytes: bytes, filename: str) -> tuple[str, int]:
    """
    Extract text from PDF using OCR (pytesseract + pdf2image)
    Useful for scanned documents
    
    Returns:
        (text_content, page_count)
    """
    try:
        import pytesseract
        from pdf2image import convert_from_bytes
        from PIL import Image
        
        logger.info(f"Converting PDF to images for OCR: {filename}")
        
        # Convert PDF pages to images
        images = convert_from_bytes(file_bytes, dpi=300)
        page_count = len(images)
        
        logger.info(f"Processing {page_count} pages with OCR...")
        
        # OCR each page
        all_text = []
        for i, image in enumerate(images, 1):
            logger.info(f"OCR processing page {i}/{page_count}")
            
            # Run OCR with custom config for better accuracy
            custom_config = r'--oem 3 --psm 6'
            page_text = pytesseract.image_to_string(image, config=custom_config)
            
            if page_text.strip():
                all_text.append(f"\n--- Page {i} ---\n{page_text}")
        
        full_text = "\n".join(all_text)
        
        logger.info(f"OCR completed: {len(full_text)} characters extracted")
        
        return full_text, page_count
        
    except ImportError as e:
        error_msg = f"OCR dependencies not installed: {e}. Please install: pytesseract, pdf2image, and Pillow"
        logger.error(error_msg)
        raise ImportError(error_msg)
    except Exception as e:
        logger.error(f"OCR extraction failed: {e}")
        raise


def clean_extracted_text(raw_text: str) -> str:
    """
    Clean and normalize extracted text
    - Remove excessive whitespace
    - Normalize line breaks
    - Remove special characters that may cause issues
    """
    import re
    
    # Replace multiple spaces with single space
    text = re.sub(r' +', ' ', raw_text)
    
    # Replace multiple newlines with double newline
    text = re.sub(r'\n\n+', '\n\n', text)
    
    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    
    return text.strip()


async def save_pdf_to_database(
    db,
    filename: str,
    text: str,
    page_count: int,
    method: str,
    original_file_size: int
) -> str:
    """
    Save extracted PDF text to database
    
    Returns:
        Document ID
    """
    try:
        from uuid import uuid4
        
        doc_id = str(uuid4())
        
        document = {
            "id": doc_id,
            "filename": filename,
            "text": text,
            "page_count": page_count,
            "extraction_method": method,
            "file_size_bytes": original_file_size,
            "char_count": len(text),
            "uploaded_at": datetime.now(timezone.utc),
            "status": "pending_parse"  # Can be: pending_parse, parsed, failed
        }
        
        await db.raw_program_pdfs.insert_one(document)
        
        logger.info(f"Saved PDF text to database: {doc_id} ({filename})")
        
        return doc_id
        
    except Exception as e:
        logger.error(f"Failed to save PDF to database: {e}")
        raise


def validate_pdf_file(file_bytes: bytes, filename: str) -> None:
    """
    Validate that uploaded file is a valid PDF
    
    Raises:
        ValueError if validation fails
    """
    # Check file signature (PDF magic bytes)
    if not file_bytes.startswith(b'%PDF'):
        raise ValueError(f"File '{filename}' is not a valid PDF (missing PDF signature)")
    
    # Check minimum size (1KB)
    if len(file_bytes) < 1024:
        raise ValueError(f"File '{filename}' is too small to be a valid PDF")
    
    # Check maximum size (50MB)
    max_size = 50 * 1024 * 1024  # 50MB
    if len(file_bytes) > max_size:
        raise ValueError(f"File '{filename}' exceeds maximum size of 50MB")
    
    logger.info(f"PDF validation passed: {filename} ({len(file_bytes)} bytes)")
