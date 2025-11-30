# PDF Import Module - Step 1 Complete ✅

## Overview
This module provides automated PDF import functionality for lease and finance programs. It extracts text from PDF files using two methods:
1. **Direct extraction** (pdfminer.six) - for text-based PDFs
2. **OCR extraction** (pytesseract + pdf2image) - for scanned documents

## Features Implemented

### 1. PDF Text Extraction Service (`pdf_import_service.py`)
- **extract_pdf_text()**: Main function to extract text from PDF bytes
- **validate_pdf_file()**: Validates PDF format and size (max 50MB)
- **clean_extracted_text()**: Normalizes and cleans extracted text
- **save_pdf_to_database()**: Saves extracted text to MongoDB

### 2. API Endpoints

#### POST `/api/admin/lease-programs/import-pdf`
Upload and process a PDF file containing lease/finance program data.

**Authentication**: Required (Admin role)

**Request**:
- Content-Type: `multipart/form-data`
- Body: PDF file

**Response**:
```json
{
  "success": true,
  "text": "TOYOTA FINANCIAL SERVICES...",
  "page_count": 1,
  "char_count": 152,
  "extraction_method": "direct",
  "warnings": [],
  "pdf_id": "uuid-here",
  "filename": "program.pdf"
}
```

#### GET `/api/admin/raw-pdfs`
List all uploaded PDFs.

**Authentication**: Required (Editor role)

**Response**:
```json
{
  "ok": true,
  "pdfs": [...],
  "count": 10
}
```

#### GET `/api/admin/raw-pdfs/{pdf_id}`
Get specific PDF content by ID.

#### DELETE `/api/admin/raw-pdfs/{pdf_id}`
Delete uploaded PDF.

**Authentication**: Required (Admin role)

### 3. Database Schema

**Collection**: `raw_program_pdfs`

```javascript
{
  id: "uuid",
  filename: "toyota_march_2025.pdf",
  text: "Extracted text content...",
  page_count: 3,
  extraction_method: "direct" | "ocr",
  file_size_bytes: 1024000,
  char_count: 5000,
  uploaded_at: ISODate("2025-11-30T21:46:17.490Z"),
  status: "pending_parse" | "parsed" | "failed"
}
```

## Dependencies

### Python Packages
- `pdfminer.six` - Direct PDF text extraction
- `pytesseract` - OCR engine wrapper
- `pdf2image` - Convert PDF pages to images
- `Pillow` - Image processing

### System Packages
- `tesseract-ocr` - OCR engine
- `poppler-utils` - PDF utilities for pdf2image

## Testing

### Test API with curl

```bash
# Get admin token
TOKEN=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hunter.lease","password":"yourpass"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Upload PDF
curl -X POST "$BACKEND_URL/api/admin/lease-programs/import-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/program.pdf" \
  | python3 -m json.tool

# List PDFs
curl -X GET "$BACKEND_URL/api/admin/raw-pdfs" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

## Next Steps (Step 2)

The next phase will implement:

1. **Intelligent Parser**: Extract structured data from text
   - Money Factor (MF) values
   - Residual Value tables
   - Incentives and rebates
   - Regional variations (West/Pacific/NorCal/SoCal)

2. **Auto-population**: Automatically create LeaseProgram and FinanceProgram records from parsed data

3. **Multi-brand Support**: Parsers for:
   - Toyota Financial Services (TFS)
   - Honda Financial Services (HMF)
   - BMW Financial Services (BMWFS)
   - Kia Finance
   - And more...

## Status: ✅ Complete

All Step 1 requirements implemented:
- ✅ PDF upload API
- ✅ Text extraction (direct + OCR)
- ✅ Database storage
- ✅ CRUD endpoints for raw PDFs
- ✅ Error handling and validation
- ✅ Tested successfully

Ready for Step 2: Parser implementation.
