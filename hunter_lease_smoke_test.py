#!/usr/bin/env python3
"""
Hunter.Lease Final Smoke Test After Cleanup
Quick smoke test - only checking availability and correctness of critical endpoints
"""

import requests
import json
import sys
from datetime import datetime

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

# Global variable to store auth token
auth_token = None

def test_admin_login():
    """Test admin login"""
    global auth_token
    print_test_header("1. Admin Login - testadmin@hunter.lease")
    
    try:
        url = f"{BASE_URL}/auth/login"
        print_info(f"POST {url}")
        
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
            
            return True
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception during login: {str(e)}")
        return False

def test_pro_calculator():
    """Test PRO Calculator - главный endpoint"""
    print_test_header("2. PRO Calculator - POST /api/lease/calculate")
    
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
        
        print_info(f"Parameters: brand=Toyota, model=Camry, msrp=35000, selling_price=33000")
        
        response = requests.post(
            url,
            json=calc_request,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Calculator endpoint returns 200 OK")
            
            # Check for monthly_payment_with_tax
            if "monthly_payment_with_tax" in data:
                print_success(f"✓ monthly_payment_with_tax: ${data['monthly_payment_with_tax']:.2f}")
            elif "monthly_payment" in data:
                print_success(f"✓ monthly_payment: ${data['monthly_payment']:.2f}")
            else:
                print_error("✗ monthly_payment_with_tax missing")
            
            # Check for mf_used
            if "mf_used" in data:
                print_success(f"✓ mf_used: {data['mf_used']}")
            elif "money_factor" in data:
                print_success(f"✓ money_factor: {data['money_factor']}")
            else:
                print_error("✗ mf_used missing")
            
            # Check for residual_percent_used
            if "residual_percent_used" in data:
                print_success(f"✓ residual_percent_used: {data['residual_percent_used']}%")
            elif "residual_percent" in data:
                print_success(f"✓ residual_percent: {data['residual_percent']}%")
            elif "residual" in data:
                print_success(f"✓ residual: {data['residual']}")
            else:
                print_error("✗ residual_percent_used missing")
            
            print_info(f"Full response keys: {list(data.keys())}")
            
            return True
        elif response.status_code == 404:
            print_error("✗ 404 - No lease program found for Toyota Camry")
            print_error(f"Response: {response.text}")
            return False
        else:
            print_error(f"✗ Calculator failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Exception during calculator test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_featured_deals():
    """Test Featured Deals endpoints"""
    print_test_header("3. Featured Deals - GET /api/deals/list")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    try:
        # Test 1: List deals
        url = f"{BASE_URL}/deals/list"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        first_deal_id = None
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Deals list endpoint returns 200 OK")
            
            if "deals" in data or "items" in data:
                deals = data.get("deals") or data.get("items")
                deal_count = len(deals)
                print_success(f"✓ Found {deal_count} deals")
                
                if deal_count == 5:
                    print_success("✓ Correct number of deals (5)")
                else:
                    print_error(f"✗ Expected 5 deals, got {deal_count}")
                
                if deal_count > 0:
                    first_deal_id = deals[0].get('id') or deals[0].get('deal_id')
                    print_info(f"  - First deal ID: {first_deal_id}")
                    print_info(f"  - First deal: {deals[0].get('brand')} {deals[0].get('model')} - ${deals[0].get('monthly_payment')}/mo")
            else:
                print_error("✗ No deals field in response")
                return False
        else:
            print_error(f"✗ List deals failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        # Test 2: Get first deal details
        if first_deal_id:
            print_info(f"\n--- Get Deal Details: {first_deal_id} ---")
            url = f"{BASE_URL}/deals/{first_deal_id}"
            print_info(f"GET {url}")
            
            response = requests.get(
                url,
                timeout=10
            )
            
            print_info(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print_success("✓ Deal details endpoint returns 200 OK")
                print_info(f"  - Brand: {data.get('brand', 'N/A')}")
                print_info(f"  - Model: {data.get('model', 'N/A')}")
                print_info(f"  - Monthly Payment: ${data.get('monthly_payment', 'N/A')}")
                return True
            else:
                print_error(f"✗ Get deal failed with status {response.status_code}")
                print_error(f"Response: {response.text}")
                return False
        else:
            print_error("✗ No first deal ID available")
            return False
        
    except Exception as e:
        print_error(f"Exception during deals test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_autosync():
    """Test AutoSync endpoints"""
    print_test_header("4. AutoSync - Stats and Recalculate")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    try:
        # Test 1: Get sync stats
        print_info("--- Test 1: GET /api/admin/sync/stats ---")
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
            print_success("✓ Sync stats endpoint returns 200 OK")
            print_info(f"  - Response: {json.dumps(data, indent=2)}")
        else:
            print_error(f"✗ Sync stats failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
        # Test 2: Recalculate all
        print_info("\n--- Test 2: POST /api/admin/sync/recalculate-all ---")
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
            print_success("✓ Recalculate all endpoint returns 200 OK")
            print_info(f"  - Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print_error(f"✗ Recalculate all failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
    except Exception as e:
        print_error(f"Exception during AutoSync test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_analytics():
    """Test Analytics endpoint"""
    print_test_header("5. Analytics - GET /api/admin/analytics/overview")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    try:
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
            print_success("✓ Analytics overview endpoint returns 200 OK")
            print_info(f"  - Response: {json.dumps(data, indent=2)}")
            
            # Check for expected fields
            if "total_deals" in data:
                print_success(f"✓ total_deals: {data['total_deals']}")
            
            if "avg_payment" in data:
                print_success(f"✓ avg_payment: ${data['avg_payment']:.2f}")
            
            return True
        else:
            print_error(f"✗ Analytics overview failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
    except Exception as e:
        print_error(f"Exception during analytics test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_settings():
    """Test Settings endpoint"""
    print_test_header("6. Settings - GET /api/admin/settings")
    
    if not auth_token:
        print_error("No auth token available. Skipping test.")
        return False
    
    try:
        url = f"{BASE_URL}/admin/settings"
        print_info(f"GET {url}")
        
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("✓ Settings endpoint returns 200 OK")
            print_info(f"  - Response: {json.dumps(data, indent=2)}")
            
            # Check for expected fields
            if "default_tax_rate" in data or "tax_rate" in data:
                tax_rate = data.get("default_tax_rate") or data.get("tax_rate")
                print_success(f"✓ tax_rate: {tax_rate}")
            
            return True
        else:
            print_error(f"✗ Settings endpoint failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
        
    except Exception as e:
        print_error(f"Exception during settings test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all smoke tests"""
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}Hunter.Lease Final Smoke Test After Cleanup{Colors.RESET}")
    print(f"{Colors.BOLD}Base URL: {BASE_URL}{Colors.RESET}")
    print(f"{Colors.BOLD}Timestamp: {datetime.now().isoformat()}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}")
    
    results = {
        "total_tests": 0,
        "passed": 0,
        "failed": 0
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
    
    # Test 2: PRO Calculator
    results["total_tests"] += 1
    if test_pro_calculator():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 3: Featured Deals
    results["total_tests"] += 1
    if test_featured_deals():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 4: AutoSync
    results["total_tests"] += 1
    if test_autosync():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 5: Analytics
    results["total_tests"] += 1
    if test_analytics():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 6: Settings
    results["total_tests"] += 1
    if test_settings():
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
    print(f"{Colors.BOLD}SMOKE TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"Total Tests: {results['total_tests']}")
    print(f"{Colors.GREEN}Passed: {results['passed']}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {results['failed']}{Colors.RESET}")
    
    if results['failed'] == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}✓ ALL SMOKE TESTS PASSED{Colors.RESET}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}✗ SOME SMOKE TESTS FAILED{Colors.RESET}")

if __name__ == "__main__":
    sys.exit(main())
