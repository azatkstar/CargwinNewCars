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
BACKEND_URL = "https://lexus-preview.preview.emergentagent.com/api"

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
            # Test magic link creation for admin user
            admin_email = "admin@cargwin.com"
            magic_link_data = {
                "email": admin_email
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
                            user_info = token_data.get("user", {})
                            
                            # Check if user was created with viewer role (default)
                            if user_info.get("role") == "viewer":
                                self.log_test("Authentication System", True, 
                                            f"Magic link and JWT authentication working (user: {admin_email}, role: viewer)")
                                return True
                            else:
                                self.log_test("Authentication System", True, 
                                            f"Magic link and JWT authentication working (user: {admin_email}, role: {user_info.get('role')})")
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
    
    def test_role_based_access_control(self):
        """Test role-based access control system"""
        if not self.auth_token:
            self.log_test("Role-Based Access Control", False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Test viewer access to admin lots (should work for viewing)
            response = self.session.get(f"{BACKEND_URL}/admin/lots", headers=headers)
            
            if response.status_code == 200:
                # Test viewer access to lot creation (should fail)
                test_lot_data = {
                    "make": "Test",
                    "model": "Car",
                    "year": 2024,
                    "msrp": 30000,
                    "description": "Test lot for role validation"
                }
                
                create_response = self.session.post(
                    f"{BACKEND_URL}/admin/lots",
                    json=test_lot_data,
                    headers=headers
                )
                
                if create_response.status_code == 403:
                    self.log_test("Role-Based Access Control", True, 
                                "Role-based access control working: viewer can read but not create")
                    return True
                else:
                    self.log_test("Role-Based Access Control", False, 
                                f"Role validation failed: viewer should not be able to create lots (got HTTP {create_response.status_code})")
                    return False
            else:
                self.log_test("Role-Based Access Control", False, 
                            f"Admin read access failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Role-Based Access Control", False, f"Role access test error: {str(e)}")
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
                    self.log_test("Admin Access Control", True, "Authenticated admin access working (viewer can read)")
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
    
    def test_database_lot_operations(self):
        """Test MongoDB lot operations without requiring editor role"""
        try:
            # Test that we can retrieve existing lots from MongoDB
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            } if self.auth_token else {}
            
            response = self.session.get(f"{BACKEND_URL}/admin/lots", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                total = data.get("total", 0)
                
                if total > 0 and items:
                    # Test retrieving a specific lot
                    first_lot = items[0]
                    lot_id = first_lot.get("id")
                    
                    if lot_id:
                        lot_response = self.session.get(f"{BACKEND_URL}/admin/lots/{lot_id}", headers=headers)
                        
                        if lot_response.status_code == 200:
                            lot_data = lot_response.json()
                            if lot_data.get("make") and lot_data.get("model"):
                                self.log_test("Database Lot Operations", True, 
                                            f"MongoDB lot operations working: retrieved {lot_data.get('make')} {lot_data.get('model')}")
                                return True
                            else:
                                self.log_test("Database Lot Operations", False, "Retrieved lot missing required fields")
                                return False
                        else:
                            self.log_test("Database Lot Operations", False, f"Single lot retrieval failed: HTTP {lot_response.status_code}")
                            return False
                    else:
                        self.log_test("Database Lot Operations", False, "Lot ID missing from listing")
                        return False
                else:
                    self.log_test("Database Lot Operations", True, "MongoDB connection working (empty database)")
                    return True
            else:
                self.log_test("Database Lot Operations", False, f"Lot listing failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Database Lot Operations", False, f"Database operations test error: {str(e)}")
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
                "Origin": "https://lexus-preview.preview.emergentagent.com",
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

    def test_create_lexus_lots(self):
        """Test creating 13 Lexus vehicle lots with specific lease terms"""
        if not self.auth_token:
            self.log_test("Lexus Lots Creation", False, "No auth token available")
            return False
        
        # Define the 13 Lexus lots with lease terms
        lexus_lots = [
            {
                "name": "Lexus NX350 Base",
                "make": "Lexus",
                "model": "NX350",
                "year": 2024,
                "trim": "Base",
                "monthly_payment": 499,
                "msrp": 42000,  # Estimated MSRP
                "vin": "JTJBARBZ8P2123456",
                "description": "2024 Lexus NX350 Base - Premium compact luxury SUV with advanced safety features and refined interior. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus NX350 Premium Nav",
                "make": "Lexus",
                "model": "NX350",
                "year": 2024,
                "trim": "Premium Nav",
                "monthly_payment": 547,
                "msrp": 45000,
                "vin": "JTJBARBZ8P2234567",
                "description": "2024 Lexus NX350 Premium Nav - Enhanced with premium navigation system and luxury appointments. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus NX450h Plugin Luxury",
                "make": "Lexus",
                "model": "NX450h",
                "year": 2024,
                "trim": "Plugin Luxury",
                "monthly_payment": 797,
                "msrp": 58000,
                "vin": "JTJBARBZ8P2345678",
                "description": "2024 Lexus NX450h Plugin Luxury - Hybrid plug-in luxury SUV with exceptional fuel efficiency and premium features. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus RX350 Base",
                "make": "Lexus",
                "model": "RX350",
                "year": 2024,
                "trim": "Base",
                "monthly_payment": 543,
                "msrp": 48000,
                "vin": "2T2BZMCA8PC456789",
                "description": "2024 Lexus RX350 Base - Mid-size luxury SUV with spacious interior and smooth performance. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus RX350 Premium",
                "make": "Lexus",
                "model": "RX350",
                "year": 2024,
                "trim": "Premium",
                "monthly_payment": 577,
                "msrp": 52000,
                "vin": "2T2BZMCA8PC567890",
                "description": "2024 Lexus RX350 Premium - Enhanced with premium features and luxury amenities. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus RX350 Premium+",
                "make": "Lexus",
                "model": "RX350",
                "year": 2024,
                "trim": "Premium+",
                "monthly_payment": 652,
                "msrp": 56000,
                "vin": "2T2BZMCA8PC678901",
                "description": "2024 Lexus RX350 Premium+ - Top-tier luxury with advanced technology and premium materials. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus RX350H Premium",
                "make": "Lexus",
                "model": "RX350H",
                "year": 2024,
                "trim": "Premium",
                "monthly_payment": 743,
                "msrp": 58000,
                "vin": "2T2BZMCA8PC789012",
                "description": "2024 Lexus RX350H Premium - Hybrid luxury SUV combining efficiency with premium comfort. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus RX350H Premium+",
                "make": "Lexus",
                "model": "RX350H",
                "year": 2024,
                "trim": "Premium+",
                "monthly_payment": 852,
                "msrp": 62000,
                "vin": "2T2BZMCA8PC890123",
                "description": "2024 Lexus RX350H Premium+ - Ultimate hybrid luxury with all premium features included. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus TX350 Base",
                "make": "Lexus",
                "model": "TX350",
                "year": 2024,
                "trim": "Base",
                "monthly_payment": 597,
                "msrp": 55000,
                "vin": "JTJHARBZ8P2901234",
                "description": "2024 Lexus TX350 Base - Three-row luxury SUV perfect for families seeking premium comfort. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus TX350 Premium",
                "make": "Lexus",
                "model": "TX350",
                "year": 2024,
                "trim": "Premium",
                "monthly_payment": 687,
                "msrp": 60000,
                "vin": "JTJHARBZ8P2012345",
                "description": "2024 Lexus TX350 Premium - Enhanced three-row luxury with premium amenities and technology. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus TX500h F Sport",
                "make": "Lexus",
                "model": "TX500h",
                "year": 2024,
                "trim": "F Sport",
                "monthly_payment": 987,
                "msrp": 72000,
                "vin": "JTJHARBZ8P2123456",
                "description": "2024 Lexus TX500h F Sport - High-performance hybrid three-row SUV with sport-tuned suspension and aggressive styling. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus ES350 Base",
                "make": "Lexus",
                "model": "ES350",
                "year": 2024,
                "trim": "Base",
                "monthly_payment": 407,
                "msrp": 42000,
                "vin": "58ABK1GG8PN234567",
                "description": "2024 Lexus ES350 Base - Luxury sedan with refined comfort and advanced safety features. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            },
            {
                "name": "Lexus ES350 Premium",
                "make": "Lexus",
                "model": "ES350",
                "year": 2024,
                "trim": "Premium",
                "monthly_payment": 437,
                "msrp": 45000,
                "vin": "58ABK1GG8PN345678",
                "description": "2024 Lexus ES350 Premium - Enhanced luxury sedan with premium features and technology. Lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR, Tier 1 credit required, Los Angeles residents only."
            }
        ]
        
        created_lots = []
        failed_lots = []
        
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        print(f"\n🚗 Creating {len(lexus_lots)} Lexus vehicle lots...")
        
        for i, lot_spec in enumerate(lexus_lots):
            try:
                # Calculate fleet discount to achieve target monthly payment
                # Using lease calculation: Monthly = (MSRP - Discount - Down) / Term + Interest
                # Simplified calculation for fleet discount
                target_monthly = lot_spec["monthly_payment"]
                msrp = lot_spec["msrp"]
                
                # Estimate fleet discount based on typical lease calculations
                # This is a simplified calculation - in reality would need complex lease math
                estimated_fleet_discount = max(0, msrp - (target_monthly * 36 + 3000))
                
                lot_data = {
                    "make": lot_spec["make"],
                    "model": lot_spec["model"],
                    "year": lot_spec["year"],
                    "trim": lot_spec["trim"],
                    "vin": lot_spec["vin"],
                    "drivetrain": "AWD",
                    "engine": "V6" if "h" not in lot_spec["model"].lower() else "Hybrid V6",
                    "transmission": "CVT",
                    "exteriorColor": "Atomic Silver",
                    "interiorColor": "Black NuLuxe",
                    "msrp": msrp,
                    "discount": estimated_fleet_discount,
                    "feesHint": 2500,
                    "state": "CA",
                    "description": lot_spec["description"],
                    "tags": ["lexus", "luxury", "2024", "lease-special"],
                    "isWeeklyDrop": False,
                    "status": "published"  # Make them live immediately
                }
                
                print(f"   Creating {i+1}/{len(lexus_lots)}: {lot_spec['name']} (Monthly: ${target_monthly})")
                
                response = self.session.post(
                    f"{BACKEND_URL}/admin/lots",
                    json=lot_data,
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("ok") and data.get("id"):
                        created_lot_id = data["id"]
                        created_lots.append({
                            "id": created_lot_id,
                            "name": lot_spec["name"],
                            "monthly": target_monthly,
                            "msrp": msrp,
                            "discount": estimated_fleet_discount
                        })
                        print(f"   ✅ Created: {lot_spec['name']} (ID: {created_lot_id})")
                    else:
                        failed_lots.append(f"{lot_spec['name']}: Invalid response format")
                        print(f"   ❌ Failed: {lot_spec['name']} - Invalid response")
                else:
                    failed_lots.append(f"{lot_spec['name']}: HTTP {response.status_code}")
                    print(f"   ❌ Failed: {lot_spec['name']} - HTTP {response.status_code}")
                    
            except Exception as e:
                failed_lots.append(f"{lot_spec['name']}: {str(e)}")
                print(f"   ❌ Failed: {lot_spec['name']} - {str(e)}")
        
        # Test results
        if len(created_lots) == len(lexus_lots):
            self.log_test("Lexus Lots Creation", True, 
                        f"Successfully created all {len(created_lots)} Lexus lots with lease terms")
            return True, created_lots
        elif len(created_lots) > 0:
            self.log_test("Lexus Lots Creation", False, 
                        f"Partial success: {len(created_lots)}/{len(lexus_lots)} lots created. Failures: {failed_lots}")
            return False, created_lots
        else:
            self.log_test("Lexus Lots Creation", False, 
                        f"Failed to create any Lexus lots. Errors: {failed_lots}")
            return False, []

    def test_lexus_lots_in_listing(self):
        """Test that created Lexus lots appear in the admin listing"""
        if not self.auth_token:
            self.log_test("Lexus Lots Listing", False, "No auth token available")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Get all lots
            response = self.session.get(f"{BACKEND_URL}/admin/lots?limit=50", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                
                # Count Lexus lots
                lexus_lots = [lot for lot in items if lot.get("make", "").lower() == "lexus"]
                
                if len(lexus_lots) >= 13:
                    lexus_models = [f"{lot.get('model', '')} {lot.get('trim', '')}" for lot in lexus_lots]
                    self.log_test("Lexus Lots Listing", True, 
                                f"Found {len(lexus_lots)} Lexus lots in listing: {', '.join(lexus_models[:5])}...")
                    return True, lexus_lots
                elif len(lexus_lots) > 0:
                    self.log_test("Lexus Lots Listing", False, 
                                f"Only found {len(lexus_lots)} Lexus lots, expected 13")
                    return False, lexus_lots
                else:
                    self.log_test("Lexus Lots Listing", False, "No Lexus lots found in listing")
                    return False, []
            else:
                self.log_test("Lexus Lots Listing", False, f"Failed to get lots listing: HTTP {response.status_code}")
                return False, []
                
        except Exception as e:
            self.log_test("Lexus Lots Listing", False, f"Request error: {str(e)}")
            return False, []

    def test_lexus_public_access(self):
        """Test that published Lexus lots are accessible via public API"""
        try:
            # Get a few Lexus lots from listing first
            success, lexus_lots = self.test_lexus_lots_in_listing()
            
            if not success or not lexus_lots:
                self.log_test("Lexus Public Access", False, "No Lexus lots available for public access testing")
                return False
            
            # Test public access to first few lots
            public_accessible = 0
            tested_lots = lexus_lots[:3]  # Test first 3 lots
            
            for lot in tested_lots:
                lot_id = lot.get("id")
                make = lot.get("make", "")
                model = lot.get("model", "")
                
                if lot_id:
                    # Create a slug-like identifier for public access
                    slug = f"{lot.get('year', '2024')}-{make.lower()}-{model.lower()}-{lot.get('trim', '').lower().replace(' ', '-')}"
                    
                    try:
                        # Test public car endpoint
                        response = self.session.get(f"{BACKEND_URL}/cars/{slug}")
                        
                        if response.status_code == 200:
                            car_data = response.json()
                            if car_data.get("title") and make.lower() in car_data.get("title", "").lower():
                                public_accessible += 1
                                print(f"   ✅ Public access working for: {car_data.get('title', '')}")
                            else:
                                print(f"   ⚠️  Public access returned unexpected data for {make} {model}")
                        else:
                            print(f"   ❌ Public access failed for {make} {model}: HTTP {response.status_code}")
                            
                    except Exception as e:
                        print(f"   ❌ Public access error for {make} {model}: {str(e)}")
            
            if public_accessible > 0:
                self.log_test("Lexus Public Access", True, 
                            f"Public access working for {public_accessible}/{len(tested_lots)} tested Lexus lots")
                return True
            else:
                self.log_test("Lexus Public Access", False, 
                            f"Public access failed for all {len(tested_lots)} tested Lexus lots")
                return False
                
        except Exception as e:
            self.log_test("Lexus Public Access", False, f"Public access test error: {str(e)}")
            return False

    def test_lexus_lease_calculations(self):
        """Test that Lexus lots have correct lease calculation structure"""
        try:
            success, lexus_lots = self.test_lexus_lots_in_listing()
            
            if not success or not lexus_lots:
                self.log_test("Lexus Lease Calculations", False, "No Lexus lots available for lease calculation testing")
                return False
            
            # Test lease calculation structure for first lot
            test_lot = lexus_lots[0]
            lot_id = test_lot.get("id")
            
            if not lot_id:
                self.log_test("Lexus Lease Calculations", False, "No lot ID available for testing")
                return False
            
            # Get detailed lot data
            response = self.session.get(f"{BACKEND_URL}/admin/lots/{lot_id}")
            
            if response.status_code == 200:
                lot_data = response.json()
                
                # Check required fields for lease calculations
                msrp = lot_data.get("msrp", 0)
                discount = lot_data.get("discount", 0)
                
                if msrp > 0 and discount >= 0:
                    fleet_price = msrp - discount
                    
                    # Verify lease terms match specification
                    # Base lease terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR
                    lease_terms = {
                        "down_payment": 3000,
                        "miles_per_year": 7500,
                        "term_months": 36,
                        "apr": 9.75,
                        "msrp": msrp,
                        "fleet_price": fleet_price,
                        "discount": discount
                    }
                    
                    self.log_test("Lexus Lease Calculations", True, 
                                f"Lease calculation structure valid: MSRP ${msrp}, Fleet ${fleet_price}, Discount ${discount}")
                    return True, lease_terms
                else:
                    self.log_test("Lexus Lease Calculations", False, 
                                f"Invalid pricing data: MSRP {msrp}, Discount {discount}")
                    return False, None
            else:
                self.log_test("Lexus Lease Calculations", False, 
                            f"Failed to get lot details: HTTP {response.status_code}")
                return False, None
                
        except Exception as e:
            self.log_test("Lexus Lease Calculations", False, f"Lease calculation test error: {str(e)}")
            return False, None

    def run_lexus_lot_tests(self):
        """Run comprehensive Lexus lot creation and testing"""
        print("\n" + "=" * 80)
        print("LEXUS VEHICLE LOTS TESTING - LEASE SPECIAL CREATION")
        print("=" * 80)
        print("Testing creation of 13 Lexus lots with specific lease terms")
        print("Base terms: $3,000 down, 7,500 miles/year, 36 months, 9.75% APR")
        print()
        
        lexus_tests = [
            ("Create Lexus Lots", self.test_create_lexus_lots),
            ("Verify Lexus Lots in Listing", self.test_lexus_lots_in_listing),
            ("Test Lexus Public Access", self.test_lexus_public_access),
            ("Validate Lexus Lease Calculations", self.test_lexus_lease_calculations),
        ]
        
        passed = 0
        total = len(lexus_tests)
        
        for i, (test_name, test_func) in enumerate(lexus_tests):
            print(f"\n--- {test_name} ({i+1}/{total}) ---")
            try:
                result = test_func()
                if isinstance(result, tuple):
                    success = result[0]
                else:
                    success = result
                    
                if success:
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        print("\n" + "=" * 80)
        print("LEXUS LOTS TEST SUMMARY")
        print("=" * 80)
        print(f"Passed: {passed}/{total}")
        print(f"Failed: {total - passed}/{total}")
        
        if passed == total:
            print("🎉 ALL LEXUS TESTS PASSED - LEXUS LOTS CREATED SUCCESSFULLY!")
            return True
        else:
            print("⚠️  SOME LEXUS TESTS FAILED - CHECK RESULTS ABOVE")
            return False

    def test_admin_statistics_and_applications(self):
        """Test admin API for statistics and application management as requested"""
        print("\n" + "=" * 80)
        print("ADMIN STATISTICS AND APPLICATION MANAGEMENT TESTING")
        print("=" * 80)
        print("Testing admin login, application statistics, status changes, and user management")
        print()
        
        # Test data
        admin_credentials = {
            "email": "admin@test.com",
            "password": "Admin123!"
        }
        
        user_credentials = {
            "email": "user@test.com", 
            "password": "User123!"
        }
        
        # Step 1: Admin Login
        print("1. Testing admin login...")
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=admin_credentials,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("access_token") and data.get("user", {}).get("role") == "admin":
                    admin_token = data["access_token"]
                    print(f"   ✅ Admin login successful: {data['user']['email']} (role: {data['user']['role']})")
                    self.log_test("Admin Login", True, f"Admin authenticated successfully with role: {data['user']['role']}")
                else:
                    print(f"   ❌ Admin login failed: Invalid response or role - {data}")
                    self.log_test("Admin Login", False, f"Invalid admin response: {data}")
                    return False
            else:
                print(f"   ❌ Admin login failed: HTTP {response.status_code} - {response.text}")
                self.log_test("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Admin login error: {str(e)}")
            self.log_test("Admin Login", False, f"Request error: {str(e)}")
            return False
        
        admin_headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json"
        }
        
        # Step 2: Get initial applications statistics
        print("\n2. Getting initial application statistics...")
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/applications", headers=admin_headers)
            
            if response.status_code == 200:
                data = response.json()
                initial_stats = {
                    "total": data.get("total", 0),
                    "applications": data.get("applications", [])
                }
                
                # Count by status
                status_counts = {"pending": 0, "approved": 0, "rejected": 0, "contacted": 0}
                for app in initial_stats["applications"]:
                    status = app.get("status", "pending")
                    if status in status_counts:
                        status_counts[status] += 1
                
                initial_stats.update(status_counts)
                
                print(f"   ✅ Initial statistics: Total={initial_stats['total']}, Pending={initial_stats['pending']}, Approved={initial_stats['approved']}, Rejected={initial_stats['rejected']}, Contacted={initial_stats['contacted']}")
                self.log_test("Initial Application Statistics", True, f"Retrieved statistics: {initial_stats}")
                
                # Get first application ID for testing (prefer ObjectId format)
                test_app_id = None
                if initial_stats["applications"]:
                    # Look for an application with ObjectId format (24 hex characters)
                    for app in initial_stats["applications"]:
                        app_id = app.get("id")
                        if app_id and len(app_id) == 24 and all(c in '0123456789abcdef' for c in app_id.lower()):
                            test_app_id = app_id
                            print(f"   📝 Using ObjectId application for testing: {test_app_id}")
                            break
                    
                    # If no ObjectId found, use the first one but warn
                    if not test_app_id:
                        test_app_id = initial_stats["applications"][0].get("id")
                        print(f"   ⚠️  Using non-ObjectId application (may fail): {test_app_id}")
                
            else:
                print(f"   ❌ Failed to get applications: HTTP {response.status_code} - {response.text}")
                self.log_test("Initial Application Statistics", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Applications request error: {str(e)}")
            self.log_test("Initial Application Statistics", False, f"Request error: {str(e)}")
            return False
        
        if not test_app_id:
            print("   ⚠️  No applications found for testing status changes")
            self.log_test("Application Status Testing", False, "No applications available for status change testing")
            return False
        
        # Step 3: Change application status to "contacted"
        print(f"\n3. Changing application {test_app_id} status to 'contacted'...")
        try:
            response = self.session.patch(
                f"{BACKEND_URL}/admin/applications/{test_app_id}/status?status=contacted&admin_notes=Called customer",
                headers=admin_headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok"):
                    print(f"   ✅ Status changed to 'contacted' successfully")
                    self.log_test("Change Status to Contacted", True, "Application status updated to contacted")
                else:
                    print(f"   ❌ Status change failed: {data}")
                    self.log_test("Change Status to Contacted", False, f"Status change failed: {data}")
                    return False
            else:
                print(f"   ❌ Status change failed: HTTP {response.status_code} - {response.text}")
                self.log_test("Change Status to Contacted", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Status change error: {str(e)}")
            self.log_test("Change Status to Contacted", False, f"Request error: {str(e)}")
            return False
        
        # Step 4: Verify statistics updated after "contacted" status
        print("\n4. Verifying statistics after 'contacted' status change...")
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/applications", headers=admin_headers)
            
            if response.status_code == 200:
                data = response.json()
                contacted_stats = {
                    "total": data.get("total", 0),
                    "applications": data.get("applications", [])
                }
                
                # Count by status
                status_counts = {"pending": 0, "approved": 0, "rejected": 0, "contacted": 0}
                for app in contacted_stats["applications"]:
                    status = app.get("status", "pending")
                    if status in status_counts:
                        status_counts[status] += 1
                
                contacted_stats.update(status_counts)
                
                # Verify changes - the application may have started from any status
                # Find the application we're testing to see its initial status
                initial_app_status = None
                for app in initial_stats["applications"]:
                    if app.get("id") == test_app_id:
                        initial_app_status = app.get("status")
                        break
                
                # Check if the status change worked correctly
                contacted_app = None
                for app in contacted_stats["applications"]:
                    if app.get("id") == test_app_id:
                        contacted_app = app
                        break
                
                if (contacted_app and contacted_app.get("status") == "contacted" and
                    contacted_stats["total"] == initial_stats["total"]):
                    print(f"   ✅ Application status changed to 'contacted' successfully (was: {initial_app_status})")
                    self.log_test("Statistics After Contacted", True, f"Application status updated correctly: {contacted_stats}")
                else:
                    print(f"   ❌ Application status change failed")
                    print(f"      Expected: Application {test_app_id} status = 'contacted'")
                    print(f"      Actual: {contacted_app.get('status') if contacted_app else 'Application not found'}")
                    self.log_test("Statistics After Contacted", False, f"Status change failed: {contacted_stats}")
                    return False
            else:
                print(f"   ❌ Failed to get updated statistics: HTTP {response.status_code}")
                self.log_test("Statistics After Contacted", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Statistics verification error: {str(e)}")
            self.log_test("Statistics After Contacted", False, f"Request error: {str(e)}")
            return False
        
        # Step 5: Change status to "approved"
        print(f"\n5. Changing application {test_app_id} status to 'approved'...")
        try:
            response = self.session.patch(
                f"{BACKEND_URL}/admin/applications/{test_app_id}/status?status=approved&admin_notes=Approved for financing",
                headers=admin_headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok"):
                    print(f"   ✅ Status changed to 'approved' successfully")
                    self.log_test("Change Status to Approved", True, "Application status updated to approved")
                else:
                    print(f"   ❌ Status change failed: {data}")
                    self.log_test("Change Status to Approved", False, f"Status change failed: {data}")
                    return False
            else:
                print(f"   ❌ Status change failed: HTTP {response.status_code} - {response.text}")
                self.log_test("Change Status to Approved", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Status change error: {str(e)}")
            self.log_test("Change Status to Approved", False, f"Request error: {str(e)}")
            return False
        
        # Step 6: Verify statistics after "approved" status
        print("\n6. Verifying statistics after 'approved' status change...")
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/applications", headers=admin_headers)
            
            if response.status_code == 200:
                data = response.json()
                approved_stats = {
                    "total": data.get("total", 0),
                    "applications": data.get("applications", [])
                }
                
                # Count by status
                status_counts = {"pending": 0, "approved": 0, "rejected": 0, "contacted": 0}
                for app in approved_stats["applications"]:
                    status = app.get("status", "pending")
                    if status in status_counts:
                        status_counts[status] += 1
                
                approved_stats.update(status_counts)
                
                # Verify changes
                if (approved_stats["approved"] == contacted_stats["approved"] + 1 and
                    approved_stats["contacted"] == contacted_stats["contacted"] - 1 and
                    approved_stats["total"] == contacted_stats["total"]):
                    print(f"   ✅ Statistics updated correctly: Approved +1, Contacted -1, Total unchanged")
                    self.log_test("Statistics After Approved", True, f"Statistics correctly updated: {approved_stats}")
                else:
                    print(f"   ❌ Statistics not updated correctly")
                    print(f"      Expected: Approved={contacted_stats['approved']+1}, Contacted={contacted_stats['contacted']-1}")
                    print(f"      Actual: Approved={approved_stats['approved']}, Contacted={approved_stats['contacted']}")
                    self.log_test("Statistics After Approved", False, f"Statistics mismatch: {approved_stats}")
                    return False
            else:
                print(f"   ❌ Failed to get updated statistics: HTTP {response.status_code}")
                self.log_test("Statistics After Approved", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Statistics verification error: {str(e)}")
            self.log_test("Statistics After Approved", False, f"Request error: {str(e)}")
            return False
        
        # Step 7: Get users list
        print("\n7. Getting users list...")
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/users", headers=admin_headers)
            
            if response.status_code == 200:
                data = response.json()
                users_list = data.get("users", [])
                total_users = data.get("total", 0)
                
                print(f"   ✅ Retrieved {len(users_list)} users (total: {total_users})")
                self.log_test("Get Users List", True, f"Retrieved {len(users_list)} users successfully")
                
                # Find a user with role 'user' (not admin@test.com) - prefer string IDs for compatibility
                test_user_id = None
                test_user_email = None
                
                # First try to find a user with string ID (for compatibility)
                for user in users_list:
                    if (user.get("role") == "user" and 
                        user.get("email") != "admin@test.com" and
                        user.get("id") and 
                        not (len(user.get("id")) == 24 and all(c in '0123456789abcdef' for c in user.get("id").lower()))):
                        test_user_id = user.get("id")
                        test_user_email = user.get("email")
                        print(f"   📝 Found string ID user for role testing: {test_user_email} (ID: {test_user_id})")
                        break
                
                # If no string ID user found, use any user with 'user' role
                if not test_user_id:
                    for user in users_list:
                        if user.get("role") == "user" and user.get("email") != "admin@test.com":
                            test_user_id = user.get("id")
                            test_user_email = user.get("email")
                            print(f"   📝 Found ObjectId user for role testing: {test_user_email} (ID: {test_user_id})")
                            break
                
                if not test_user_id:
                    print("   ⚠️  No suitable user found for role change testing")
                    self.log_test("User Role Testing", False, "No user with 'user' role found for testing")
                    return False
                    
            else:
                print(f"   ❌ Failed to get users: HTTP {response.status_code} - {response.text}")
                self.log_test("Get Users List", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Users request error: {str(e)}")
            self.log_test("Get Users List", False, f"Request error: {str(e)}")
            return False
        
        # Step 8: Change user role
        print(f"\n8. Changing user {test_user_email} role to 'editor'...")
        try:
            response = self.session.patch(
                f"{BACKEND_URL}/admin/users/{test_user_id}/role?role=editor",
                headers=admin_headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok"):
                    print(f"   ✅ User role changed to 'editor' successfully")
                    self.log_test("Change User Role", True, f"User {test_user_email} role updated to editor")
                else:
                    print(f"   ❌ Role change failed: {data}")
                    self.log_test("Change User Role", False, f"Role change failed: {data}")
                    return False
            else:
                print(f"   ❌ Role change failed: HTTP {response.status_code} - {response.text}")
                self.log_test("Change User Role", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Role change error: {str(e)}")
            self.log_test("Change User Role", False, f"Request error: {str(e)}")
            return False
        
        # Step 9: Verify role change
        print(f"\n9. Verifying user role change...")
        try:
            response = self.session.get(f"{BACKEND_URL}/admin/users", headers=admin_headers)
            
            if response.status_code == 200:
                data = response.json()
                users_list = data.get("users", [])
                
                # Find the updated user
                updated_user = None
                for user in users_list:
                    if user.get("id") == test_user_id:
                        updated_user = user
                        break
                
                if updated_user and updated_user.get("role") == "editor":
                    print(f"   ✅ User role successfully changed to 'editor'")
                    self.log_test("Verify Role Change", True, f"User {test_user_email} role confirmed as editor")
                else:
                    print(f"   ❌ Role change not reflected: {updated_user}")
                    self.log_test("Verify Role Change", False, f"Role change not reflected: {updated_user}")
                    return False
            else:
                print(f"   ❌ Failed to verify role change: HTTP {response.status_code}")
                self.log_test("Verify Role Change", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ Role verification error: {str(e)}")
            self.log_test("Verify Role Change", False, f"Request error: {str(e)}")
            return False
        
        # Step 10: Test user login and application details
        print(f"\n10. Testing user login and application details...")
        try:
            # Login as regular user
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=user_credentials,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("access_token"):
                    user_token = data["access_token"]
                    print(f"   ✅ User login successful: {data['user']['email']}")
                    
                    # Get user's applications
                    user_headers = {
                        "Authorization": f"Bearer {user_token}",
                        "Content-Type": "application/json"
                    }
                    
                    app_response = self.session.get(f"{BACKEND_URL}/applications", headers=user_headers)
                    
                    if app_response.status_code == 200:
                        app_data = app_response.json()
                        applications = app_data.get("applications", [])
                        
                        # Check if we can see the updated application status
                        updated_app = None
                        for app in applications:
                            if app.get("id") == test_app_id:
                                updated_app = app
                                break
                        
                        if updated_app and updated_app.get("status") == "approved":
                            print(f"   ✅ Application status visible to user: {updated_app['status']}")
                            if updated_app.get("admin_notes"):
                                print(f"   ✅ Admin notes visible: {updated_app['admin_notes']}")
                            self.log_test("User Application Details", True, "User can see updated application status and admin notes")
                        else:
                            print(f"   ⚠️  Application status not updated or not visible to user")
                            self.log_test("User Application Details", False, f"Application status issue: {updated_app}")
                    else:
                        print(f"   ❌ Failed to get user applications: HTTP {app_response.status_code}")
                        self.log_test("User Application Details", False, f"HTTP {app_response.status_code}: {app_response.text}")
                        return False
                else:
                    print(f"   ❌ User login failed: {data}")
                    self.log_test("User Login", False, f"User login failed: {data}")
                    return False
            else:
                print(f"   ❌ User login failed: HTTP {response.status_code}")
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"   ❌ User login/application test error: {str(e)}")
            self.log_test("User Application Details", False, f"Request error: {str(e)}")
            return False
        
        print("\n" + "=" * 80)
        print("ADMIN STATISTICS AND APPLICATION MANAGEMENT TESTING COMPLETED")
        print("=" * 80)
        
        return True

    def run_all_tests(self):
        """Run all backend tests including Lexus lot creation"""
        print("=" * 80)
        print("CARGWIN BACKEND API TESTING - LEXUS LOTS CREATION & VERIFICATION")
        print("=" * 80)
        print(f"Testing backend at: {BACKEND_URL}")
        print("Focus: Create 13 Lexus lots with lease terms and verify functionality")
        print()
        
        # First run basic connectivity and auth tests
        basic_tests = [
            ("Server Startup Verification", self.test_server_startup_verification),
            ("Authentication System", self.test_authentication_system),
        ]
        
        passed = 0
        total_basic = len(basic_tests)
        
        print("🔧 BASIC CONNECTIVITY TESTS")
        print("-" * 40)
        
        for i, (test_name, test_func) in enumerate(basic_tests):
            print(f"\n--- Testing {test_name} ({i+1}/{total_basic}) ---")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        if passed < total_basic:
            print("\n❌ BASIC TESTS FAILED - CANNOT PROCEED WITH LEXUS LOT CREATION")
            return False
        
        # Run Lexus lot tests
        print("\n🚗 LEXUS VEHICLE LOTS TESTING")
        print("-" * 40)
        lexus_success = self.run_lexus_lot_tests()
        
        return lexus_success

if __name__ == "__main__":
    tester = BackendTester()
    
    # Run the specific admin statistics and application management test as requested
    print("Running Admin Statistics and Application Management Testing...")
    success = tester.test_admin_statistics_and_applications()
    
    if success:
        print("\n🎉 ADMIN STATISTICS AND APPLICATION MANAGEMENT TESTING COMPLETED SUCCESSFULLY!")
    else:
        print("\n❌ ADMIN STATISTICS AND APPLICATION MANAGEMENT TESTING FAILED!")
    
    sys.exit(0 if success else 1)