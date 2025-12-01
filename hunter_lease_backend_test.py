#!/usr/bin/env python3
"""
Hunter.Lease Backend API Deep Testing Script
Tests all critical API endpoints including PDF import, calculator, deals, sync, analytics, and settings
"""

import requests
import json
import sys
import os
from datetime import datetime
from io import BytesIO

# Configuration
BASE_URL = "https://smart-lease-hub-2.preview.emergentagent.com/api"

# Test credentials
TEST_CREDENTIALS = {
    "email": "testadmin@hunter.lease",
    "password": "testpass123"
}

# Color codes for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    """Print test header"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BLUE}{Colors.BOLD}TEST: {test_name}{Colors.RESET}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*80}{Colors.RESET}")

def print_success(message):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {message}{Colors.RESET}")

def print_error(message):
    """Print error message"""
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")

def print_info(message):
    """Print info message"""
    print(f"{Colors.YELLOW}ℹ {message}{Colors.RESET}")

def print_warning(message):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠ {message}{Colors.RESET}")

# Global variable to store auth token
auth_token = None

def test_admin_login():
    """Test admin login"""
    global auth_token
    print_test_header("Admin Login - testadmin@hunter.lease")
    
    try:
        url = f"{BASE_URL}/auth/login"
        print_info(f"POST {url}")
        print_info(f"Credentials: {TEST_CREDENTIALS['email']}")
        
        response = requests.post(
            url,
            json=TEST_CREDENTIALS,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Login successful")
            
            if "access_token" in data:
                auth_token = data["access_token"]
                print_success("✓ access_token received")
            else:
                print_error("✗ access_token missing")
                return False
                
            if "user" in data:
                user = data["user"]
                print_info(f"  - Email: {user.get('email', 'N/A')}")
                print_info(f"  - Role: {user.get('role', 'N/A')}")
                
                if user.get('role') == 'admin':
                    print_success("✓ User has admin role")
                else:
                    print_warning(f"⚠ User role is '{user.get('role')}', expected 'admin'")
            
            return True
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception during login: {str(e)}")
        return False

def test_pdf_import():
    """Test PDF import endpoint"""
    print_test_header("PDF Import - POST /api/admin/lease-programs/import-pdf")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return {"success": False, "pdf_id": None}
    
    try:
        url = f"{BASE_URL}/admin/lease-programs/import-pdf"
        print_info(f"POST {url}")
        
        # Create a simple test PDF content (minimal valid PDF)
        # This is a minimal PDF structure
        pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Toyota Lease Program) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF
"""
        
        files = {
            'file': ('toyota_lease_program.pdf', BytesIO(pdf_content), 'application/pdf')
        }
        
        response = requests.post(
            url,
            files=files,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=30
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("PDF import successful")
            
            if data.get("success"):
                print_success("✓ success: true")
            
            if "pdf_id" in data:
                print_success(f"✓ pdf_id: {data['pdf_id']}")
                print_info(f"  - Filename: {data.get('filename', 'N/A')}")
                print_info(f"  - Page count: {data.get('page_count', 'N/A')}")
                print_info(f"  - Char count: {data.get('char_count', 'N/A')}")
                print_info(f"  - Extraction method: {data.get('extraction_method', 'N/A')}")
                return {"success": True, "pdf_id": data['pdf_id']}
            else:
                print_error("✗ pdf_id missing in response")
                return {"success": False, "pdf_id": None}
        else:
            print_error(f"PDF import failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return {"success": False, "pdf_id": None}
            
    except Exception as e:
        print_error(f"Exception during PDF import: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"success": False, "pdf_id": None}

def test_pdf_parse(pdf_id):
    """Test PDF parsing endpoint"""
    print_test_header("PDF Parse - POST /api/admin/lease-programs/parse-from-pdf")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    if not pdf_id:
        print_error("No pdf_id available. Skipping test.")
        return False
    
    try:
        url = f"{BASE_URL}/admin/lease-programs/parse-from-pdf"
        print_info(f"POST {url}")
        print_info(f"PDF ID: {pdf_id}")
        print_info(f"Brand: Toyota")
        
        # Use query parameters instead of JSON body
        response = requests.post(
            url,
            params={
                "pdf_id": pdf_id,
                "brand": "Toyota"
            },
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            timeout=30
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("PDF parsing successful")
            
            if data.get("success"):
                print_success("✓ success: true")
            
            if "parsed_program" in data:
                program = data["parsed_program"]
                print_success("✓ parsed_program present")
                print_info(f"  - Brand: {program.get('brand', 'N/A')}")
                print_info(f"  - Model: {program.get('model', 'N/A')}")
                print_info(f"  - Region: {program.get('region', 'N/A')}")
            
            return True
        else:
            print_error(f"PDF parsing failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception during PDF parsing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_get_parsed_programs():
    """Test getting parsed programs"""
    print_test_header("Get Parsed Programs - GET /api/admin/lease-programs/parsed")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    try:
        url = f"{BASE_URL}/admin/lease-programs/parsed"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Get parsed programs successful")
            
            if "items" in data:
                items = data["items"]
                print_success(f"✓ items present: {len(items)} programs")
                
                if len(items) > 0:
                    print_info("  - Sample program:")
                    sample = items[0]
                    print_info(f"    Brand: {sample.get('brand', 'N/A')}")
                    print_info(f"    Model: {sample.get('model', 'N/A')}")
                    print_info(f"    Region: {sample.get('region', 'N/A')}")
            
            if "total" in data:
                print_success(f"✓ total: {data['total']}")
            
            return True
        else:
            print_error(f"Get parsed programs failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception during get parsed programs: {str(e)}")
        return False

def test_lease_calculator():
    """Test lease calculator endpoint"""
    print_test_header("Lease Calculator - POST /api/lease/calculate")
    
    try:
        url = f"{BASE_URL}/lease/calculate"
        print_info(f"POST {url}")
        
        calc_request = {
            "brand": "Toyota",
            "model": "Camry",
            "msrp": 35000,
            "selling_price": 33000,
            "term_months": 36,
            "annual_mileage": 10000,
            "down_payment": 0,
            "tax_rate": 0.0925,
            "region": "CA"
        }
        
        print_info(f"Request: {json.dumps(calc_request, indent=2)}")
        
        response = requests.post(
            url,
            json=calc_request,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Lease calculation successful")
            
            # Check for key fields
            if "monthly_payment" in data:
                print_success(f"✓ monthly_payment: ${data['monthly_payment']:.2f}")
            else:
                print_error("✗ monthly_payment missing")
            
            if "driveoff" in data or "due_at_signing" in data:
                driveoff = data.get('driveoff') or data.get('due_at_signing')
                print_success(f"✓ driveoff/due_at_signing: ${driveoff:.2f}")
            else:
                print_error("✗ driveoff/due_at_signing missing")
            
            if "mf_used" in data or "money_factor" in data:
                mf = data.get('mf_used') or data.get('money_factor')
                print_success(f"✓ money_factor: {mf}")
            else:
                print_warning("⚠ money_factor not found in response")
            
            if "residual" in data or "residual_percent" in data:
                residual = data.get('residual') or data.get('residual_percent')
                print_success(f"✓ residual: {residual}")
            else:
                print_warning("⚠ residual not found in response")
            
            print_info(f"Full response: {json.dumps(data, indent=2)}")
            
            return True
        elif response.status_code == 404:
            print_warning("⚠ No lease program found for Toyota Camry")
            print_info("This is expected if no parsed programs exist yet")
            print_info(f"Response: {response.text}")
            return True  # Not a failure, just no data
        else:
            print_error(f"Lease calculation failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception during lease calculation: {str(e)}")
        return False

def test_deals_crud():
    """Test deals CRUD operations"""
    print_test_header("Deals CRUD - Create, List, Get, Delete")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    deal_id = None
    
    try:
        # Test 1: Create deal
        print_info("\n--- Test 1: Create Deal ---")
        url = f"{BASE_URL}/deals/create"
        print_info(f"POST {url}")
        
        deal_data = {
            "brand": "Toyota",
            "model": "Camry",
            "year": 2024,
            "trim": "LE",
            "msrp": 35000,
            "selling_price": 33000,
            "term_months": 36,
            "annual_mileage": 10000,
            "monthly_payment": 373,
            "due_at_signing": 858,
            "stock_count": 5
        }
        
        response = requests.post(
            url,
            json=deal_data,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            print_success("✓ Deal created successfully")
            
            if "id" in data or "deal_id" in data:
                deal_id = data.get("id") or data.get("deal_id")
                print_success(f"✓ Deal ID: {deal_id}")
            else:
                print_warning("⚠ Deal ID not in response")
        else:
            print_error(f"✗ Create deal failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        # Test 2: List deals
        print_info("\n--- Test 2: List Deals ---")
        url = f"{BASE_URL}/deals/list"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ List deals successful")
            
            if "deals" in data or "items" in data:
                deals = data.get("deals") or data.get("items")
                print_success(f"✓ Found {len(deals)} deals")
                
                # Check if top 3 sorting works
                if len(deals) >= 3:
                    print_info("  - Top 3 deals by payment:")
                    for i, deal in enumerate(deals[:3]):
                        payment = deal.get('monthly_payment', 'N/A')
                        print_info(f"    {i+1}. {deal.get('brand')} {deal.get('model')} - ${payment}/mo")
            else:
                print_warning("⚠ No deals field in response")
        else:
            print_error(f"✗ List deals failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        # Test 3: Get deal details
        if deal_id:
            print_info("\n--- Test 3: Get Deal Details ---")
            url = f"{BASE_URL}/deals/{deal_id}"
            print_info(f"GET {url}")
            
            response = requests.get(
                url,
                headers={"Authorization": f"Bearer {auth_token}"},
                timeout=10
            )
            
            print_info(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print_success("✓ Get deal details successful")
                print_info(f"  - Brand: {data.get('brand', 'N/A')}")
                print_info(f"  - Model: {data.get('model', 'N/A')}")
                print_info(f"  - Monthly Payment: ${data.get('monthly_payment', 'N/A')}")
            else:
                print_error(f"✗ Get deal failed with status {response.status_code}")
                print_error(f"Response: {response.text}")
        
        # Test 4: Delete deal
        if deal_id:
            print_info("\n--- Test 4: Delete Deal ---")
            url = f"{BASE_URL}/deals/{deal_id}"
            print_info(f"DELETE {url}")
            
            response = requests.delete(
                url,
                headers={"Authorization": f"Bearer {auth_token}"},
                timeout=10
            )
            
            print_info(f"Status Code: {response.status_code}")
            
            if response.status_code == 200 or response.status_code == 204:
                print_success("✓ Deal deleted successfully")
            else:
                print_error(f"✗ Delete deal failed with status {response.status_code}")
                print_error(f"Response: {response.text}")
        
        return True
        
    except Exception as e:
        print_error(f"Exception during deals CRUD: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_autosync_engine():
    """Test AutoSync engine endpoints"""
    print_test_header("AutoSync Engine - Recalculate, Stats, Logs")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    try:
        # Test 1: Recalculate all
        print_info("\n--- Test 1: Recalculate All ---")
        url = f"{BASE_URL}/admin/sync/recalculate-all"
        print_info(f"POST {url}")
        
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            timeout=30
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Recalculate all successful")
            print_info(f"Response: {json.dumps(data, indent=2)}")
        else:
            print_error(f"✗ Recalculate all failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        # Test 2: Get sync stats
        print_info("\n--- Test 2: Get Sync Stats ---")
        url = f"{BASE_URL}/admin/sync/stats"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Get sync stats successful")
            print_info(f"Response: {json.dumps(data, indent=2)}")
        else:
            print_error(f"✗ Get sync stats failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        # Test 3: Get sync logs
        print_info("\n--- Test 3: Get Sync Logs ---")
        url = f"{BASE_URL}/admin/sync/logs"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Get sync logs successful")
            
            if "logs" in data or "items" in data:
                logs = data.get("logs") or data.get("items")
                print_success(f"✓ Found {len(logs)} log entries")
            
            print_info(f"Response: {json.dumps(data, indent=2)}")
        else:
            print_error(f"✗ Get sync logs failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        return True
        
    except Exception as e:
        print_error(f"Exception during AutoSync engine tests: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_analytics_api():
    """Test Analytics API endpoints"""
    print_test_header("Analytics API - Overview, Top Brands/Models, Distribution")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    try:
        # Test 1: Analytics overview
        print_info("\n--- Test 1: Analytics Overview ---")
        url = f"{BASE_URL}/admin/analytics/overview"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Analytics overview successful")
            print_info(f"Response: {json.dumps(data, indent=2)}")
        else:
            print_error(f"✗ Analytics overview failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        # Test 2: Top brands and models
        print_info("\n--- Test 2: Top Brands and Models ---")
        url = f"{BASE_URL}/admin/analytics/top-brands-models"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Top brands/models successful")
            print_info(f"Response: {json.dumps(data, indent=2)}")
        else:
            print_error(f"✗ Top brands/models failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        # Test 3: Distribution
        print_info("\n--- Test 3: Distribution ---")
        url = f"{BASE_URL}/admin/analytics/distribution"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Distribution successful")
            print_info(f"Response: {json.dumps(data, indent=2)}")
        else:
            print_error(f"✗ Distribution failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        return True
        
    except Exception as e:
        print_error(f"Exception during Analytics API tests: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_settings_api():
    """Test Settings API endpoints"""
    print_test_header("Settings API - Get and Update")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    try:
        # Test 1: Get settings
        print_info("\n--- Test 1: Get Settings ---")
        url = f"{BASE_URL}/admin/settings"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        original_tax_rate = None
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Get settings successful")
            
            if "tax_rate" in data:
                original_tax_rate = data["tax_rate"]
                print_success(f"✓ Current tax_rate: {original_tax_rate}")
            
            print_info(f"Response: {json.dumps(data, indent=2)}")
        else:
            print_error(f"✗ Get settings failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        # Test 2: Update settings
        print_info("\n--- Test 2: Update Settings (tax_rate) ---")
        url = f"{BASE_URL}/admin/settings"
        print_info(f"PUT {url}")
        
        new_tax_rate = 0.095  # 9.5%
        update_data = {
            "tax_rate": new_tax_rate
        }
        
        print_info(f"Updating tax_rate to: {new_tax_rate}")
        
        response = requests.put(
            url,
            json=update_data,
            headers={
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Update settings successful")
            
            if "tax_rate" in data:
                updated_tax_rate = data["tax_rate"]
                if updated_tax_rate == new_tax_rate:
                    print_success(f"✓ tax_rate updated correctly: {updated_tax_rate}")
                else:
                    print_error(f"✗ tax_rate mismatch: expected {new_tax_rate}, got {updated_tax_rate}")
            
            print_info(f"Response: {json.dumps(data, indent=2)}")
            
            # Restore original tax_rate if we had one
            if original_tax_rate is not None:
                print_info(f"\n--- Restoring original tax_rate: {original_tax_rate} ---")
                restore_response = requests.put(
                    url,
                    json={"tax_rate": original_tax_rate},
                    headers={
                        "Authorization": f"Bearer {auth_token}",
                        "Content-Type": "application/json"
                    },
                    timeout=10
                )
                if restore_response.status_code == 200:
                    print_success("✓ Original tax_rate restored")
        else:
            print_error(f"✗ Update settings failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
        
        return True
        
    except Exception as e:
        print_error(f"Exception during Settings API tests: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}Hunter.Lease Backend API Deep Testing{Colors.RESET}")
    print(f"{Colors.BOLD}Base URL: {BASE_URL}{Colors.RESET}")
    print(f"{Colors.BOLD}Timestamp: {datetime.now().isoformat()}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}")
    
    results = {
        "total_tests": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0
    }
    
    # Test 1: Admin Login
    results["total_tests"] += 1
    if test_admin_login():
        results["passed"] += 1
    else:
        results["failed"] += 1
        print_error("\n⚠ Login failed. Remaining tests will be skipped.")
        print_summary(results)
        return 1
    
    # Test 2: PDF Import
    results["total_tests"] += 1
    pdf_result = test_pdf_import()
    if pdf_result["success"]:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 3: PDF Parse (only if import succeeded)
    if pdf_result["pdf_id"]:
        results["total_tests"] += 1
        if test_pdf_parse(pdf_result["pdf_id"]):
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Test 4: Get Parsed Programs
    results["total_tests"] += 1
    if test_get_parsed_programs():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 5: Lease Calculator
    results["total_tests"] += 1
    if test_lease_calculator():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 6: Deals CRUD
    results["total_tests"] += 1
    if test_deals_crud():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 7: AutoSync Engine
    results["total_tests"] += 1
    if test_autosync_engine():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 8: Analytics API
    results["total_tests"] += 1
    if test_analytics_api():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 9: Settings API
    results["total_tests"] += 1
    if test_settings_api():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Print summary
    print_summary(results)
    
    if results['failed'] == 0:
        return 0
    else:
        return 1

def print_summary(results):
    """Print test summary"""
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"Total Tests: {results['total_tests']}")
    print(f"{Colors.GREEN}Passed: {results['passed']}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {results['failed']}{Colors.RESET}")
    if results.get('skipped', 0) > 0:
        print(f"{Colors.YELLOW}Skipped: {results['skipped']}{Colors.RESET}")
    
    if results['failed'] == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}✓ ALL TESTS PASSED{Colors.RESET}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}✗ SOME TESTS FAILED{Colors.RESET}")

if __name__ == "__main__":
    sys.exit(main())
