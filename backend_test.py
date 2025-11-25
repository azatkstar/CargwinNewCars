#!/usr/bin/env python3
"""
Backend API Testing Script for CargwinNewCar
Tests authentication flow and protected endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://carlease-pro.preview.emergentagent.com/api"

# Test credentials
ADMIN_TEST_CREDENTIALS = {
    "email": "admin@test.com",
    "password": "Admin123!"
}

ADMIN_HUNTER_CREDENTIALS = {
    "email": "admin@hunter.lease",
    "password": "Hunter2025!"
}

INVALID_CREDENTIALS = {
    "email": "admin@test.com",
    "password": "WrongPassword123!"
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

def test_login(credentials, test_name):
    """Test login endpoint"""
    print_test_header(f"Login Test: {test_name}")
    
    try:
        url = f"{BASE_URL}/auth/login"
        print_info(f"POST {url}")
        print_info(f"Credentials: {credentials['email']}")
        
        response = requests.post(
            url,
            json=credentials,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Login successful for {credentials['email']}")
            
            # Check response structure
            if "access_token" in data:
                print_success("✓ access_token present")
            else:
                print_error("✗ access_token missing")
                
            if "refresh_token" in data:
                print_success("✓ refresh_token present")
            else:
                print_error("✗ refresh_token missing")
                
            if "user" in data:
                print_success("✓ user data present")
                user = data["user"]
                print_info(f"  - Email: {user.get('email', 'N/A')}")
                print_info(f"  - Name: {user.get('name', 'N/A')}")
                print_info(f"  - Role: {user.get('role', 'N/A')}")
                
                # Check if role is admin
                if user.get('role') == 'admin':
                    print_success("✓ User has admin role")
                else:
                    print_error(f"✗ User role is '{user.get('role')}', expected 'admin'")
            else:
                print_error("✗ user data missing")
            
            return {
                "success": True,
                "access_token": data.get("access_token"),
                "user": data.get("user")
            }
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return {"success": False}
            
    except Exception as e:
        print_error(f"Exception during login: {str(e)}")
        return {"success": False}

def test_protected_endpoint(access_token, test_name):
    """Test protected endpoint with Bearer token"""
    print_test_header(f"Protected Endpoint Test: {test_name}")
    
    try:
        url = f"{BASE_URL}/admin/model-templates"
        print_info(f"GET {url}")
        print_info(f"Using Bearer token: {access_token[:20]}...")
        
        response = requests.get(
            url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Protected endpoint accessible with token")
            
            # Check response structure
            if "templates" in data:
                templates = data["templates"]
                template_count = len(templates)
                print_success(f"✓ templates field present")
                print_info(f"  - Template count: {template_count}")
                
                if template_count == 43:
                    print_success("✓ Correct number of templates (43)")
                else:
                    print_error(f"✗ Expected 43 templates, got {template_count}")
                
                # Show first few templates
                if template_count > 0:
                    print_info("  - Sample templates:")
                    for i, template_name in enumerate(list(templates.keys())[:5]):
                        print_info(f"    {i+1}. {template_name}")
                    if template_count > 5:
                        print_info(f"    ... and {template_count - 5} more")
            else:
                print_error("✗ templates field missing")
            
            if "count" in data:
                count = data["count"]
                print_success(f"✓ count field present: {count}")
                if count == 43:
                    print_success("✓ Count matches expected value (43)")
                else:
                    print_error(f"✗ Expected count 43, got {count}")
            else:
                print_error("✗ count field missing")
            
            return {"success": True, "template_count": len(data.get("templates", {}))}
        elif response.status_code == 401:
            print_error("Unauthorized - token invalid or expired")
            print_error(f"Response: {response.text}")
            return {"success": False}
        elif response.status_code == 403:
            print_error("Forbidden - insufficient permissions")
            print_error(f"Response: {response.text}")
            return {"success": False}
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return {"success": False}
            
    except Exception as e:
        print_error(f"Exception during protected endpoint test: {str(e)}")
        return {"success": False}

def test_invalid_credentials():
    """Test login with invalid credentials"""
    print_test_header("Invalid Credentials Test")
    
    try:
        url = f"{BASE_URL}/auth/login"
        print_info(f"POST {url}")
        print_info(f"Credentials: {INVALID_CREDENTIALS['email']} (wrong password)")
        
        response = requests.post(
            url,
            json=INVALID_CREDENTIALS,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print_success("✓ Correctly rejected invalid credentials with 401")
            try:
                data = response.json()
                if "detail" in data:
                    print_info(f"  - Error message: {data['detail']}")
            except:
                pass
            return {"success": True}
        else:
            print_error(f"✗ Expected 401, got {response.status_code}")
            print_error(f"Response: {response.text}")
            return {"success": False}
            
    except Exception as e:
        print_error(f"Exception during invalid credentials test: {str(e)}")
        return {"success": False}

def main():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}Backend Authentication Testing{Colors.RESET}")
    print(f"{Colors.BOLD}Base URL: {BASE_URL}{Colors.RESET}")
    print(f"{Colors.BOLD}Timestamp: {datetime.now().isoformat()}{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}")
    
    results = {
        "total_tests": 0,
        "passed": 0,
        "failed": 0
    }
    
    # Test 1: Login with admin@test.com
    results["total_tests"] += 1
    test1_result = test_login(ADMIN_TEST_CREDENTIALS, "admin@test.com")
    if test1_result["success"]:
        results["passed"] += 1
        
        # Test 3: Protected endpoint with token from test 1
        if test1_result.get("access_token"):
            results["total_tests"] += 1
            test3_result = test_protected_endpoint(
                test1_result["access_token"],
                "GET /api/admin/model-templates with admin@test.com token"
            )
            if test3_result["success"] and test3_result.get("template_count") == 43:
                results["passed"] += 1
            else:
                results["failed"] += 1
        else:
            print_error("Cannot test protected endpoint - no access token from login")
    else:
        results["failed"] += 1
    
    # Test 2: Login with admin@hunter.lease
    results["total_tests"] += 1
    test2_result = test_login(ADMIN_HUNTER_CREDENTIALS, "admin@hunter.lease")
    if test2_result["success"]:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 4: Invalid credentials
    results["total_tests"] += 1
    test4_result = test_invalid_credentials()
    if test4_result["success"]:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Print summary
    print(f"\n{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}TEST SUMMARY{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*80}{Colors.RESET}")
    print(f"Total Tests: {results['total_tests']}")
    print(f"{Colors.GREEN}Passed: {results['passed']}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {results['failed']}{Colors.RESET}")
    
    if results['failed'] == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}✓ ALL TESTS PASSED{Colors.RESET}")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}✗ SOME TESTS FAILED{Colors.RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
