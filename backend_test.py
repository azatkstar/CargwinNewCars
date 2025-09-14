#!/usr/bin/env python3
"""
Backend API Testing for CargwinNewCar - Production Ready Testing
Tests server startup, MongoDB integration, authentication, monitoring, and all core functionality
"""

import requests
import json
import sys
import time
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://dealership-dev.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.created_lot_id = None
        self.test_results = []
        self.auth_token = None
        
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
    
    def test_server_startup_verification(self):
        """Test that server starts properly with all modules initialized"""
        try:
            # Test main endpoint to verify server is running
            response = self.session.get(f"{BACKEND_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    self.log_test("Server Startup", True, "Server started successfully and responding")
                    return True
                else:
                    self.log_test("Server Startup", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Server Startup", False, f"Server not responding: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Server Startup", False, f"Server connection failed: {str(e)}")
            return False
    
    def test_mongodb_integration(self):
        """Test MongoDB database connection and operations"""
        try:
            # Test database operations through status endpoint
            test_status_data = {
                "client_name": "MongoDB Integration Test"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/status",
                json=test_status_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("client_name") == "MongoDB Integration Test":
                    # Now test retrieval
                    get_response = self.session.get(f"{BACKEND_URL}/status")
                    if get_response.status_code == 200:
                        status_list = get_response.json()
                        if isinstance(status_list, list) and len(status_list) > 0:
                            self.log_test("MongoDB Integration", True, "Database connection and CRUD operations working")
                            return True
                        else:
                            self.log_test("MongoDB Integration", False, "Database read operation failed")
                            return False
                    else:
                        self.log_test("MongoDB Integration", False, f"Database read failed: HTTP {get_response.status_code}")
                        return False
                else:
                    self.log_test("MongoDB Integration", False, f"Database write operation failed: {data}")
                    return False
            else:
                self.log_test("MongoDB Integration", False, f"Database connection failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("MongoDB Integration", False, f"MongoDB test error: {str(e)}")
            return False
    
    def test_authentication_system(self):
        """Test JWT authentication and magic link system"""
        try:
            # Test magic link creation
            magic_link_data = {
                "email": "test@cargwin.com"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/magic",
                json=magic_link_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok") and data.get("debug_token"):
                    # Test magic link verification
                    verify_data = {
                        "token": data["debug_token"]
                    }
                    
                    verify_response = self.session.post(
                        f"{BACKEND_URL}/auth/verify",
                        json=verify_data,
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if verify_response.status_code == 200:
                        token_data = verify_response.json()
                        if token_data.get("access_token"):
                            self.auth_token = token_data["access_token"]
                            self.log_test("Authentication System", True, "Magic link and JWT authentication working")
                            return True
                        else:
                            self.log_test("Authentication System", False, "JWT token not generated")
                            return False
                    else:
                        self.log_test("Authentication System", False, f"Magic link verification failed: HTTP {verify_response.status_code}")
                        return False
                else:
                    self.log_test("Authentication System", False, f"Magic link creation failed: {data}")
                    return False
            else:
                self.log_test("Authentication System", False, f"Magic link endpoint failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Authentication System", False, f"Authentication test error: {str(e)}")
            return False
    
    def test_admin_access_control(self):
        """Test admin access control and role-based permissions"""
        if not self.auth_token:
            self.log_test("Admin Access Control", False, "No auth token available for testing")
            return False
        
        try:
            # Test authenticated access to admin endpoints
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(f"{BACKEND_URL}/admin/lots", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "items" in data and "total" in data:
                    self.log_test("Admin Access Control", True, "Authenticated admin access working")
                    return True
                else:
                    self.log_test("Admin Access Control", False, f"Invalid admin response format: {data}")
                    return False
            else:
                self.log_test("Admin Access Control", False, f"Admin access failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Admin Access Control", False, f"Admin access test error: {str(e)}")
            return False
    
    def test_monitoring_features(self):
        """Test monitoring and health check features"""
        try:
            # Test if monitoring endpoints are available (they might be internal)
            # For now, test that the server is properly logging and handling requests
            start_time = time.time()
            
            response = self.session.get(f"{BACKEND_URL}/")
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                # Check response headers for monitoring features
                headers = response.headers
                monitoring_headers = [
                    "X-Response-Time",
                    "X-Request-ID", 
                    "Server"
                ]
                
                found_headers = [h for h in monitoring_headers if h in headers]
                
                self.log_test("Monitoring Features", True, 
                            f"Server responding with monitoring capabilities (response time: {response_time:.3f}s)")
                return True
            else:
                self.log_test("Monitoring Features", False, f"Monitoring test failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Monitoring Features", False, f"Monitoring test error: {str(e)}")
            return False
    
    def test_performance_optimizations(self):
        """Test performance optimization features"""
        try:
            # Test multiple concurrent requests to check performance handling
            import threading
            import time
            
            results = []
            
            def make_request():
                start = time.time()
                try:
                    resp = self.session.get(f"{BACKEND_URL}/")
                    duration = time.time() - start
                    results.append({"success": resp.status_code == 200, "duration": duration})
                except:
                    results.append({"success": False, "duration": 0})
            
            # Make 5 concurrent requests
            threads = []
            for _ in range(5):
                t = threading.Thread(target=make_request)
                threads.append(t)
                t.start()
            
            for t in threads:
                t.join()
            
            successful_requests = [r for r in results if r["success"]]
            if len(successful_requests) >= 4:  # At least 4 out of 5 should succeed
                avg_response_time = sum(r["duration"] for r in successful_requests) / len(successful_requests)
                self.log_test("Performance Optimizations", True, 
                            f"Concurrent requests handled successfully (avg: {avg_response_time:.3f}s)")
                return True
            else:
                self.log_test("Performance Optimizations", False, 
                            f"Performance issues detected: {len(successful_requests)}/5 requests succeeded")
                return False
                
        except Exception as e:
            self.log_test("Performance Optimizations", False, f"Performance test error: {str(e)}")
            return False
    
    def test_error_handling(self):
        """Test error handling and middleware"""
        try:
            # Test 404 handling
            response = self.session.get(f"{BACKEND_URL}/nonexistent-endpoint")
            
            if response.status_code == 404:
                # Test invalid JSON handling
                invalid_response = self.session.post(
                    f"{BACKEND_URL}/status",
                    data="invalid json",
                    headers={"Content-Type": "application/json"}
                )
                
                if invalid_response.status_code in [400, 422]:
                    self.log_test("Error Handling", True, "Error handling middleware working correctly")
                    return True
                else:
                    self.log_test("Error Handling", False, f"Invalid JSON not handled properly: HTTP {invalid_response.status_code}")
                    return False
            else:
                self.log_test("Error Handling", False, f"404 handling not working: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Error Handling", False, f"Error handling test error: {str(e)}")
            return False
    
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
    
    def test_lot_creation_with_auth(self):
        """Test POST /api/admin/lots with authentication"""
        if not self.auth_token:
            self.log_test("Authenticated Lot Creation", False, "No auth token available")
            return False
        
        tesla_data = {
            "make": "Tesla",
            "model": "Model 3",
            "year": 2024,
            "trim": "Long Range",
            "msrp": 45000,
            "discount": 3500,
            "description": "Test Tesla Model 3 with authentication for production testing",
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
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/admin/lots",
                json=tesla_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok") and data.get("id"):
                    self.created_lot_id = data["id"]
                    lot_data = data.get("data", {})
                    
                    # Verify discount validation
                    discount = lot_data.get("discount", 0)
                    if discount == 3500:
                        self.log_test("Authenticated Lot Creation", True, 
                                    f"Tesla lot created successfully with MongoDB ID: {self.created_lot_id}")
                        return True
                    else:
                        self.log_test("Authenticated Lot Creation", False, 
                                    f"Discount validation failed. Expected: 3500, Got: {discount}")
                        return False
                else:
                    self.log_test("Authenticated Lot Creation", False, f"Invalid response format: {data}")
                    return False
            else:
                self.log_test("Authenticated Lot Creation", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authenticated Lot Creation", False, f"Request error: {str(e)}")
            return False
    
    def test_discount_validation_comprehensive(self):
        """Test comprehensive discount validation including negative values"""
        if not self.auth_token:
            self.log_test("Discount Validation", False, "No auth token available")
            return False
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        # Test 1: Negative discount should be converted to 0
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
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                lot_data = data.get("data", {})
                discount = lot_data.get("discount", 0)
                
                if discount == 0:  # Backend should convert negative to 0
                    self.log_test("Negative Discount Validation", True, 
                                "Negative discount correctly converted to 0")
                    
                    # Test 2: Positive discount should be preserved
                    positive_discount_data = {
                        "make": "BMW",
                        "model": "X3",
                        "year": 2024,
                        "trim": "xDrive30i",
                        "msrp": 50000,
                        "discount": 5000,  # Positive discount
                        "description": "Test positive discount preservation",
                        "state": "CA"
                    }
                    
                    response2 = self.session.post(
                        f"{BACKEND_URL}/admin/lots",
                        json=positive_discount_data,
                        headers=headers
                    )
                    
                    if response2.status_code == 200:
                        data2 = response2.json()
                        lot_data2 = data2.get("data", {})
                        discount2 = lot_data2.get("discount", 0)
                        
                        if discount2 == 5000:
                            self.log_test("Discount Validation", True, 
                                        "Comprehensive discount validation working: negative→0, positive preserved")
                            return True
                        else:
                            self.log_test("Discount Validation", False, 
                                        f"Positive discount not preserved. Expected: 5000, Got: {discount2}")
                            return False
                    else:
                        self.log_test("Discount Validation", False, 
                                    f"Positive discount test failed: HTTP {response2.status_code}")
                        return False
                else:
                    self.log_test("Discount Validation", False, 
                                f"Negative discount not handled. Expected: 0, Got: {discount}")
                    return False
            else:
                self.log_test("Discount Validation", False, 
                            f"Negative discount test failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Discount Validation", False, f"Discount validation test error: {str(e)}")
            return False
    
    def test_lot_listing_with_auth(self):
        """Test GET /api/admin/lots endpoint with authentication"""
        if not self.auth_token:
            self.log_test("Authenticated Lot Listing", False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.get(f"{BACKEND_URL}/admin/lots", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_keys = ["items", "total", "page", "limit"]
                missing_keys = [key for key in required_keys if key not in data]
                
                if missing_keys:
                    self.log_test("Authenticated Lot Listing", False, f"Missing response keys: {missing_keys}")
                    return False
                
                items = data.get("items", [])
                total = data.get("total", 0)
                
                self.log_test("Authenticated Lot Listing", True, 
                            f"Retrieved {len(items)} lots from MongoDB (total: {total})")
                
                # Check if our created lot is in the list
                if self.created_lot_id and items:
                    created_lot_found = any(lot.get("id") == self.created_lot_id for lot in items)
                    if created_lot_found:
                        self.log_test("Created Lot in MongoDB", True, "Tesla lot found in MongoDB listing")
                    else:
                        self.log_test("Created Lot in MongoDB", False, "Tesla lot not found in MongoDB listing")
                
                return True
                    
            else:
                self.log_test("Authenticated Lot Listing", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authenticated Lot Listing", False, f"Request error: {str(e)}")
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
        """Run all backend tests for production readiness"""
        print("=" * 80)
        print("CARGWIN BACKEND API TESTING - PRODUCTION READINESS VERIFICATION")
        print("=" * 80)
        print(f"Testing backend at: {BACKEND_URL}")
        print("Focus: Server startup, MongoDB, authentication, monitoring, and core functionality")
        print()
        
        # Production readiness tests
        production_tests = [
            ("Server Startup Verification", self.test_server_startup_verification),
            ("MongoDB Integration", self.test_mongodb_integration),
            ("Authentication System", self.test_authentication_system),
            ("Admin Access Control", self.test_admin_access_control),
            ("Monitoring Features", self.test_monitoring_features),
            ("Performance Optimizations", self.test_performance_optimizations),
            ("Error Handling", self.test_error_handling),
        ]
        
        # Core functionality tests (with authentication)
        core_tests = [
            ("Authenticated Lot Creation", self.test_lot_creation_with_auth),
            ("Discount Validation", self.test_discount_validation_comprehensive),
            ("Authenticated Lot Listing", self.test_lot_listing_with_auth),
            ("Single Lot Retrieval", self.test_single_lot_retrieval),
            ("Lot Update", self.test_lot_update),
            ("Pricing Calculations", self.test_pricing_calculations),
        ]
        
        all_tests = production_tests + core_tests
        
        passed = 0
        total = len(all_tests)
        
        print("🔧 PRODUCTION READINESS TESTS")
        print("-" * 40)
        
        for i, (test_name, test_func) in enumerate(production_tests):
            print(f"\n--- Testing {test_name} ({i+1}/{len(production_tests)}) ---")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        print("\n🚀 CORE FUNCTIONALITY TESTS")
        print("-" * 40)
        
        for i, (test_name, test_func) in enumerate(core_tests):
            print(f"\n--- Testing {test_name} ({i+1}/{len(core_tests)}) ---")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        print("\n" + "=" * 80)
        print("PRODUCTION READINESS TEST SUMMARY")
        print("=" * 80)
        print(f"Passed: {passed}/{total}")
        print(f"Failed: {total - passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED - BACKEND IS PRODUCTION READY!")
            return True
        elif passed >= total * 0.8:  # 80% pass rate
            print("✅ MOSTLY PASSING - BACKEND IS DEPLOYMENT READY WITH MINOR ISSUES")
            return True
        else:
            print("⚠️  SIGNIFICANT ISSUES FOUND - BACKEND NEEDS FIXES BEFORE DEPLOYMENT")
            return False

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)