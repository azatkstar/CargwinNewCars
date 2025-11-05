#!/usr/bin/env python3
"""
Preview Functionality Testing for CargwinNewCar
Tests the preview endpoints with Chevrolet Colorado data
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://cargwin-newcar.preview.emergentagent.com/api"

class PreviewTester:
    def __init__(self):
        self.session = requests.Session()
        self.preview_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
    
    def test_preview_unsaved_endpoint(self):
        """Test POST /api/admin/lots/preview-unsaved with Chevrolet Colorado data"""
        chevrolet_data = {
            "make": "Chevrolet",
            "model": "Colorado", 
            "year": 2025,
            "trim": "Z71",
            "vin": "1GCGSCEC5N1234567",
            "engine": "2.7L Turbo I4",
            "msrp": 38500,
            "discount": 4200,
            "description": "Новый пикап Chevrolet Colorado 2025 года в комплектации Z71. Мощный и надежный грузовик с современными технологиями безопасности и отличной проходимостью.",
            "state": "CA",
            "drivetrain": "AWD",
            "transmission": "AT",
            "exteriorColor": "Black",
            "interiorColor": "Jet Black",
            "feesHint": 3200,
            "tags": ["pickup", "chevrolet", "2025", "z71"],
            "isWeeklyDrop": False
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/admin/lots/preview-unsaved",
                json=chevrolet_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok") and data.get("token"):
                    self.preview_token = data["token"]
                    expires_at = data.get("expires_at")
                    self.log_test("Preview Token Creation", True, f"Preview token created: {self.preview_token}")
                    self.log_test("Preview Token Expiry", True, f"Token expires at: {expires_at}")
                    return True
                else:
                    self.log_test("Preview Token Creation", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Preview Token Creation", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Preview Token Creation", False, f"Request error: {str(e)}")
            return False
    
    def test_preview_retrieval(self):
        """Test GET /api/preview/{token} endpoint"""
        if not self.preview_token:
            self.log_test("Preview Retrieval", False, "No preview token available for testing")
            return False
        
        try:
            response = self.session.get(f"{BACKEND_URL}/preview/{self.preview_token}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify it's Chevrolet Colorado data (not Honda Accord)
                specs = data.get("specs", {})
                make = specs.get("make", "")
                model = specs.get("model", "")
                year = specs.get("year", "")
                trim = specs.get("trim", "")
                
                if make == "Chevrolet" and model == "Colorado":
                    self.log_test("Preview Data Verification", True, f"Correct vehicle data: {year} {make} {model} {trim}")
                    
                    # Verify fleet price calculation
                    msrp = data.get("msrp", 0)
                    fleet = data.get("fleet", 0)
                    savings = data.get("savings", 0)
                    
                    expected_fleet = 38500 - 4200  # 34300
                    if fleet == expected_fleet and savings == 4200:
                        self.log_test("Fleet Price Calculation", True, f"MSRP: ${msrp}, Fleet: ${fleet}, Savings: ${savings}")
                    else:
                        self.log_test("Fleet Price Calculation", False, f"Expected Fleet: ${expected_fleet}, Got: ${fleet}")
                    
                    # Verify all Chevrolet data is preserved
                    expected_specs = {
                        "make": "Chevrolet",
                        "model": "Colorado",
                        "year": "2025",
                        "trim": "Z71",
                        "engine": "2.7L Turbo I4",
                        "drivetrain": "AWD",
                        "transmission": "AT",
                        "exteriorColor": "Black",
                        "interiorColor": "Jet Black",
                        "vin": "1GCGSCEC5N1234567"
                    }
                    
                    missing_specs = []
                    incorrect_specs = []
                    
                    for key, expected_value in expected_specs.items():
                        actual_value = specs.get(key, "")
                        if not actual_value:
                            missing_specs.append(key)
                        elif actual_value != expected_value:
                            incorrect_specs.append(f"{key}: expected '{expected_value}', got '{actual_value}'")
                    
                    if missing_specs:
                        self.log_test("Spec Data Preservation", False, f"Missing specs: {missing_specs}")
                    elif incorrect_specs:
                        self.log_test("Spec Data Preservation", False, f"Incorrect specs: {incorrect_specs}")
                    else:
                        self.log_test("Spec Data Preservation", True, "All Chevrolet specs preserved correctly")
                    
                    # Verify preview-specific fields
                    if data.get("isPreview") == True:
                        self.log_test("Preview Flag", True, "Preview flag set correctly")
                    else:
                        self.log_test("Preview Flag", False, f"Preview flag incorrect: {data.get('isPreview')}")
                    
                    if data.get("previewToken") == self.preview_token:
                        self.log_test("Preview Token Match", True, "Preview token matches in response")
                    else:
                        self.log_test("Preview Token Match", False, f"Token mismatch: expected {self.preview_token}, got {data.get('previewToken')}")
                    
                    # Check description
                    description = data.get("description", "")
                    if "Chevrolet Colorado" in description and "Z71" in description:
                        self.log_test("Description Preservation", True, "Chevrolet description preserved")
                    else:
                        self.log_test("Description Preservation", False, f"Description doesn't contain expected Chevrolet info: {description}")
                    
                    return True
                    
                else:
                    self.log_test("Preview Data Verification", False, f"CRITICAL: Shows {make} {model} instead of Chevrolet Colorado!")
                    self.log_test("Full Preview Response", False, f"Complete response: {json.dumps(data, indent=2)}")
                    return False
                    
            else:
                self.log_test("Preview Retrieval", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Preview Retrieval", False, f"Request error: {str(e)}")
            return False
    
    def test_preview_token_validation(self):
        """Test preview token validation with invalid token"""
        try:
            invalid_token = "invalid_token_123"
            response = self.session.get(f"{BACKEND_URL}/preview/{invalid_token}")
            
            if response.status_code == 404:
                self.log_test("Invalid Token Handling", True, "Invalid token correctly returns 404")
                return True
            else:
                self.log_test("Invalid Token Handling", False, f"Expected 404, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Invalid Token Handling", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all preview tests"""
        print("=" * 60)
        print("CARGWIN PREVIEW FUNCTIONALITY TESTING")
        print("=" * 60)
        print(f"Testing backend at: {BACKEND_URL}")
        print("Testing with Chevrolet Colorado 2025 Z71 data")
        print()
        
        tests = [
            ("Preview Token Creation", self.test_preview_unsaved_endpoint),
            ("Preview Data Retrieval", self.test_preview_retrieval),
            ("Invalid Token Handling", self.test_preview_token_validation)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n--- Testing {test_name} ---")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        print("\n" + "=" * 60)
        print("PREVIEW TEST SUMMARY")
        print("=" * 60)
        print(f"Passed: {passed}/{total}")
        print(f"Failed: {total - passed}/{total}")
        
        if passed == total:
            print("🎉 ALL PREVIEW TESTS PASSED!")
            return True
        else:
            print("⚠️  SOME PREVIEW TESTS FAILED")
            
            # Check for the critical issue
            failed_tests = [result for result in self.test_results if not result["success"]]
            critical_issue = any("Shows" in result["message"] and "instead of Chevrolet Colorado" in result["message"] 
                               for result in failed_tests)
            
            if critical_issue:
                print("\n🚨 CRITICAL ISSUE DETECTED:")
                print("   Preview is showing wrong vehicle data (Honda Accord instead of Chevrolet Colorado)")
                print("   This confirms the reported bug!")
            
            return False

if __name__ == "__main__":
    tester = PreviewTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)