#!/usr/bin/env python3
"""
Backend API Testing for CargwinNewCar
Tests lot creation, management, and discount validation functionality
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://dealership-dev.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.created_lot_id = None
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
    
    def test_main_endpoint(self):
        """Test GET /api/ endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    self.log_test("Main API Endpoint", True, "Root endpoint working correctly")
                    return True
                else:
                    self.log_test("Main API Endpoint", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Main API Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Main API Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_lot_creation(self):
        """Test POST /api/admin/lots with Tesla sample data"""
        tesla_data = {
            "make": "Tesla",
            "model": "Model 3",
            "year": 2024,
            "trim": "Long Range",
            "msrp": 45000,
            "discount": 3500,
            "description": "Test Tesla Model 3 with all basic features for testing discount validation",
            "state": "CA",
            "status": "draft",
            "drivetrain": "AWD",
            "engine": "Electric",
            "transmission": "Single-speed",
            "exteriorColor": "Pearl White",
            "interiorColor": "Black Premium",
            "vin": "5YJ3E1EA8PF123456",
            "feesHint": 3200,
            "tags": ["electric", "tesla", "2024"],
            "isWeeklyDrop": False
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/admin/lots",
                json=tesla_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok") and data.get("id"):
                    self.created_lot_id = data["id"]
                    lot_data = data.get("data", {})
                    
                    # Verify discount is positive
                    discount = lot_data.get("discount", 0)
                    if discount == 3500:
                        self.log_test("Lot Creation", True, f"Tesla lot created successfully with ID: {self.created_lot_id}")
                        
                        # Verify all key fields
                        expected_fields = ["make", "model", "year", "trim", "msrp", "discount", "state"]
                        missing_fields = [field for field in expected_fields if field not in lot_data]
                        if missing_fields:
                            self.log_test("Lot Data Validation", False, f"Missing fields: {missing_fields}")
                        else:
                            self.log_test("Lot Data Validation", True, "All required fields present")
                        
                        return True
                    else:
                        self.log_test("Lot Creation", False, f"Discount validation failed. Expected: 3500, Got: {discount}")
                        return False
                else:
                    self.log_test("Lot Creation", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Lot Creation", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Lot Creation", False, f"Request error: {str(e)}")
            return False
    
    def test_negative_discount_validation(self):
        """Test that negative discounts are converted to positive"""
        negative_discount_data = {
            "make": "Honda",
            "model": "Civic",
            "year": 2024,
            "trim": "LX",
            "msrp": 25000,
            "discount": -2500,  # Negative discount
            "description": "Test negative discount validation",
            "state": "CA"
        }
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/admin/lots",
                json=negative_discount_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                lot_data = data.get("data", {})
                discount = lot_data.get("discount", 0)
                
                if discount == 0:  # Backend should convert negative to 0 using max(0, value)
                    self.log_test("Negative Discount Validation", True, "Negative discount correctly converted to 0")
                    return True
                else:
                    self.log_test("Negative Discount Validation", False, f"Expected discount: 0, Got: {discount}")
                    return False
            else:
                self.log_test("Negative Discount Validation", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Negative Discount Validation", False, f"Request error: {str(e)}")
            return False
    
    def test_lot_listing(self):
        """Test GET /api/admin/lots endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/lots")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_keys = ["items", "total", "page", "limit"]
                missing_keys = [key for key in required_keys if key not in data]
                
                if missing_keys:
                    self.log_test("Lot Listing", False, f"Missing response keys: {missing_keys}")
                    return False
                
                items = data.get("items", [])
                total = data.get("total", 0)
                
                if total > 0 and len(items) > 0:
                    # Check if our created lot is in the list
                    created_lot_found = False
                    if self.created_lot_id:
                        created_lot_found = any(lot.get("id") == self.created_lot_id for lot in items)
                    
                    self.log_test("Lot Listing", True, f"Retrieved {len(items)} lots (total: {total})")
                    
                    if created_lot_found:
                        self.log_test("Created Lot in List", True, "Tesla lot found in listing")
                    elif self.created_lot_id:
                        self.log_test("Created Lot in List", False, "Tesla lot not found in listing")
                    
                    return True
                else:
                    self.log_test("Lot Listing", True, "Empty lot list (expected for fresh system)")
                    return True
                    
            else:
                self.log_test("Lot Listing", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Lot Listing", False, f"Request error: {str(e)}")
            return False
    
    def test_single_lot_retrieval(self):
        """Test GET /api/admin/lots/{lot_id} endpoint"""
        if not self.created_lot_id:
            self.log_test("Single Lot Retrieval", False, "No lot ID available for testing")
            return False
        
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/lots/{self.created_lot_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify it's our Tesla lot
                if (data.get("make") == "Tesla" and 
                    data.get("model") == "Model 3" and 
                    data.get("discount") == 3500):
                    self.log_test("Single Lot Retrieval", True, "Tesla lot retrieved successfully")
                    return True
                else:
                    self.log_test("Single Lot Retrieval", False, f"Retrieved lot doesn't match expected data: {data}")
                    return False
                    
            else:
                self.log_test("Single Lot Retrieval", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Single Lot Retrieval", False, f"Request error: {str(e)}")
            return False
    
    def test_lot_update(self):
        """Test PATCH /api/admin/lots/{lot_id} endpoint"""
        if not self.created_lot_id:
            self.log_test("Lot Update", False, "No lot ID available for testing")
            return False
        
        update_data = {
            "discount": 4000,  # Update discount
            "description": "Updated Tesla Model 3 description for testing",
            "exteriorColor": "Midnight Silver Metallic"
        }
        
        try:
            response = self.session.patch(
                f"{BACKEND_URL}/admin/lots/{self.created_lot_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("ok"):
                    updated_lot = data.get("data", {})
                    
                    # Verify updates
                    if (updated_lot.get("discount") == 4000 and 
                        "Updated Tesla Model 3" in updated_lot.get("description", "")):
                        self.log_test("Lot Update", True, "Lot updated successfully")
                        return True
                    else:
                        self.log_test("Lot Update", False, f"Update not reflected in data: {updated_lot}")
                        return False
                else:
                    self.log_test("Lot Update", False, f"Update failed: {data}")
                    return False
                    
            else:
                self.log_test("Lot Update", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Lot Update", False, f"Request error: {str(e)}")
            return False
    
    def test_pricing_calculations(self):
        """Test MSRP and discount calculations"""
        if not self.created_lot_id:
            self.log_test("Pricing Calculations", False, "No lot ID available for testing")
            return False
        
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/lots/{self.created_lot_id}")
            
            if response.status_code == 200:
                data = response.json()
                msrp = data.get("msrp", 0)
                discount = data.get("discount", 0)
                
                # Verify pricing logic
                if msrp > 0 and discount >= 0:
                    fleet_price = msrp - discount
                    if fleet_price > 0:
                        self.log_test("Pricing Calculations", True, f"MSRP: ${msrp}, Discount: ${discount}, Fleet: ${fleet_price}")
                        return True
                    else:
                        self.log_test("Pricing Calculations", False, f"Invalid fleet price calculation: {fleet_price}")
                        return False
                else:
                    self.log_test("Pricing Calculations", False, f"Invalid pricing values - MSRP: {msrp}, Discount: {discount}")
                    return False
                    
            else:
                self.log_test("Pricing Calculations", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Pricing Calculations", False, f"Request error: {str(e)}")
            return False
    
    def test_chevrolet_colorado_exists(self):
        """Test that Chevrolet Colorado lot exists in storage"""
        chevrolet_id = "ef4cdb7f-1bca-4076-b059-5063e41770dd"
        
        try:
            # First check in lot listing
            response = self.session.get(f"{BACKEND_URL}/admin/lots")
            
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                
                # Look for Chevrolet Colorado in the list
                chevrolet_found = False
                chevrolet_lot = None
                
                for lot in items:
                    if (lot.get("make", "").lower() == "chevrolet" and 
                        lot.get("model", "").lower() == "colorado"):
                        chevrolet_found = True
                        chevrolet_lot = lot
                        break
                    elif lot.get("id") == chevrolet_id:
                        chevrolet_found = True
                        chevrolet_lot = lot
                        break
                
                if chevrolet_found:
                    self.log_test("Chevrolet Colorado Exists", True, 
                                f"Found Chevrolet Colorado: {chevrolet_lot.get('year', '')} {chevrolet_lot.get('make', '')} {chevrolet_lot.get('model', '')} {chevrolet_lot.get('trim', '')}")
                    return True, chevrolet_lot
                else:
                    self.log_test("Chevrolet Colorado Exists", False, "Chevrolet Colorado not found in lot listing")
                    return False, None
            else:
                self.log_test("Chevrolet Colorado Exists", False, f"Failed to get lot listing: HTTP {response.status_code}")
                return False, None
                
        except Exception as e:
            self.log_test("Chevrolet Colorado Exists", False, f"Request error: {str(e)}")
            return False, None
    
    def test_specific_chevrolet_lot_retrieval(self):
        """Test GET /api/admin/lots/ef4cdb7f-1bca-4076-b059-5063e41770dd"""
        chevrolet_id = "ef4cdb7f-1bca-4076-b059-5063e41770dd"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/lots/{chevrolet_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if this returns Chevrolet Colorado data or Honda Accord data
                make = data.get("make", "").lower()
                model = data.get("model", "").lower()
                
                if make == "chevrolet" and model == "colorado":
                    self.log_test("Specific Chevrolet Lot Retrieval", True, 
                                f"Correctly returned Chevrolet Colorado data: {data.get('year', '')} {data.get('make', '')} {data.get('model', '')} {data.get('trim', '')}")
                    return True, data
                elif make == "honda" and model == "accord":
                    self.log_test("Specific Chevrolet Lot Retrieval", False, 
                                f"BUG CONFIRMED: Requested Chevrolet Colorado but got Honda Accord data instead")
                    return False, data
                else:
                    self.log_test("Specific Chevrolet Lot Retrieval", False, 
                                f"Unexpected data returned: {data.get('make', '')} {data.get('model', '')}")
                    return False, data
                    
            elif response.status_code == 404:
                self.log_test("Specific Chevrolet Lot Retrieval", False, 
                            f"Chevrolet Colorado lot not found (404) - lot may not exist in storage")
                return False, None
            else:
                self.log_test("Specific Chevrolet Lot Retrieval", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_test("Specific Chevrolet Lot Retrieval", False, f"Request error: {str(e)}")
            return False, None
    
    def test_chevrolet_lot_update(self):
        """Test PATCH /api/admin/lots/ef4cdb7f-1bca-4076-b059-5063e41770dd"""
        chevrolet_id = "ef4cdb7f-1bca-4076-b059-5063e41770dd"
        
        # First check if lot exists
        exists, lot_data = self.test_specific_chevrolet_lot_retrieval()
        if not exists:
            self.log_test("Chevrolet Lot Update", False, "Cannot test update - lot doesn't exist or returns wrong data")
            return False
        
        # Test update with some modified data
        update_data = {
            "discount": 4200,
            "description": "Updated 2025 Chevrolet Colorado Z71 - Test Update",
            "exteriorColor": "Summit White"
        }
        
        try:
            response = self.session.patch(
                f"{BACKEND_URL}/admin/lots/{chevrolet_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("ok"):
                    updated_lot = data.get("data", {})
                    
                    # Verify the update worked and still returns Chevrolet data
                    if (updated_lot.get("make", "").lower() == "chevrolet" and 
                        updated_lot.get("model", "").lower() == "colorado" and
                        updated_lot.get("discount") == 4200):
                        self.log_test("Chevrolet Lot Update", True, 
                                    "Chevrolet Colorado updated successfully with correct data")
                        return True
                    else:
                        self.log_test("Chevrolet Lot Update", False, 
                                    f"Update failed or returned wrong data: {updated_lot.get('make', '')} {updated_lot.get('model', '')}")
                        return False
                else:
                    self.log_test("Chevrolet Lot Update", False, f"Update failed: {data}")
                    return False
                    
            elif response.status_code == 404:
                self.log_test("Chevrolet Lot Update", False, "Lot not found for update (404)")
                return False
            else:
                self.log_test("Chevrolet Lot Update", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Chevrolet Lot Update", False, f"Request error: {str(e)}")
            return False
    
    def test_data_structure_for_frontend(self):
        """Test that lot data structure is correct for frontend form consumption"""
        chevrolet_id = "ef4cdb7f-1bca-4076-b059-5063e41770dd"
        
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/lots/{chevrolet_id}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for all required fields that frontend form needs
                required_fields = [
                    "make", "model", "year", "trim", "msrp", "discount", 
                    "drivetrain", "engine", "transmission", "exteriorColor", 
                    "interiorColor", "state", "description", "vin", "feesHint"
                ]
                
                missing_fields = []
                type_issues = []
                
                for field in required_fields:
                    if field not in data:
                        missing_fields.append(field)
                    else:
                        # Check data types
                        value = data[field]
                        if field in ["year", "msrp", "discount", "feesHint"] and not isinstance(value, (int, float)):
                            type_issues.append(f"{field}: expected number, got {type(value)}")
                        elif field in ["make", "model", "trim", "drivetrain", "engine", "transmission", 
                                     "exteriorColor", "interiorColor", "state", "description", "vin"] and not isinstance(value, str):
                            type_issues.append(f"{field}: expected string, got {type(value)}")
                
                if missing_fields:
                    self.log_test("Data Structure Validation", False, 
                                f"Missing required fields: {missing_fields}")
                    return False
                elif type_issues:
                    self.log_test("Data Structure Validation", False, 
                                f"Data type issues: {type_issues}")
                    return False
                else:
                    self.log_test("Data Structure Validation", True, 
                                "All required fields present with correct data types")
                    return True
                    
            else:
                self.log_test("Data Structure Validation", False, 
                            f"Cannot validate structure - HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Data Structure Validation", False, f"Request error: {str(e)}")
            return False
    
    def test_cors_and_request_handling(self):
        """Test CORS headers and request handling"""
        try:
            # Test with OPTIONS request (preflight)
            response = self.session.options(f"{BACKEND_URL}/admin/lots")
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
                "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials")
            }
            
            # Check if CORS headers are present
            cors_configured = any(header for header in cors_headers.values())
            
            if cors_configured:
                self.log_test("CORS Configuration", True, 
                            f"CORS headers present: {cors_headers}")
            else:
                self.log_test("CORS Configuration", False, 
                            "No CORS headers found - may cause frontend issues")
            
            # Test actual GET request with custom headers
            headers = {
                "Origin": "https://dealership-dev.preview.emergentagent.com",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(f"{BACKEND_URL}/admin/lots", headers=headers)
            
            if response.status_code == 200:
                self.log_test("Request Handling", True, "Backend handles requests with custom headers correctly")
                return True
            else:
                self.log_test("Request Handling", False, f"Request failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("CORS and Request Handling", False, f"Request error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("CARGWIN BACKEND API TESTING - CHEVROLET COLORADO FOCUS")
        print("=" * 60)
        print(f"Testing backend at: {BACKEND_URL}")
        print("Focus: Admin lot editing functionality for Chevrolet Colorado")
        print()
        
        tests = [
            ("Main API Endpoint", self.test_main_endpoint),
            ("Chevrolet Colorado Exists", lambda: self.test_chevrolet_colorado_exists()[0]),
            ("Specific Chevrolet Lot Retrieval", lambda: self.test_specific_chevrolet_lot_retrieval()[0]),
            ("Chevrolet Lot Update", self.test_chevrolet_lot_update),
            ("Data Structure Validation", self.test_data_structure_for_frontend),
            ("CORS and Request Handling", self.test_cors_and_request_handling),
            ("Lot Listing", self.test_lot_listing),
            ("Lot Creation", self.test_lot_creation),
            ("Negative Discount Validation", self.test_negative_discount_validation),
            ("Pricing Calculations", self.test_pricing_calculations)
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
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Passed: {passed}/{total}")
        print(f"Failed: {total - passed}/{total}")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
            return True
        else:
            print("⚠️  SOME TESTS FAILED")
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)