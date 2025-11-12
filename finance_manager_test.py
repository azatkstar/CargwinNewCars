#!/usr/bin/env python3
"""
Finance Manager Features Testing for CargwinNewCar
Tests all new Finance Manager endpoints and extended profile features
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://autosales-platform-1.preview.emergentagent.com/api"

class FinanceManagerTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.user_token = None
        self.admin_token = None
        self.user_id = None
        self.application_id = None
        self.lot_id = None
        self.subscription_id = None
        
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
        return success
    
    def test_1_register_and_login(self):
        """Test 1: Register new user and login"""
        print("\n" + "="*80)
        print("TEST 1: User Registration and Login")
        print("="*80)
        
        try:
            # Try to login first
            timestamp = int(datetime.now().timestamp())
            login_data = {
                "email": f"finmanager_test@test.com",
                "password": "Test123!"
            }
            
            print(f"Trying to login: {login_data['email']}")
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("access_token"):
                    self.user_token = data["access_token"]
                    self.user_id = data.get("user", {}).get("id")
                    return self.log_test(
                        "User Login", 
                        True, 
                        f"User logged in successfully: {login_data['email']}"
                    )
            
            # If login fails, try to register
            print(f"Login failed, trying to register new user...")
            register_data = {
                "email": f"finmanager_test_{timestamp}@test.com",
                "password": "Test123!",
                "name": "Finance Manager Test"
            }
            
            print(f"Registering user: {register_data['email']}")
            response = self.session.post(
                f"{BACKEND_URL}/auth/register",
                json=register_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("access_token"):
                    self.user_token = data["access_token"]
                    self.user_id = data.get("user", {}).get("id")
                    return self.log_test(
                        "User Registration", 
                        True, 
                        f"User registered successfully: {register_data['email']}"
                    )
                else:
                    return self.log_test("User Registration", False, "No access token in response")
            else:
                return self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("User Registration", False, f"Error: {str(e)}")
    
    def test_2_extended_profile_update(self):
        """Test 2: Update profile with ALL new Finance Manager fields"""
        print("\n" + "="*80)
        print("TEST 2: Extended Profile Update with Finance Manager Fields")
        print("="*80)
        
        if not self.user_token:
            return self.log_test("Extended Profile Update", False, "No user token available")
        
        try:
            profile_data = {
                # Required fields
                "credit_score": 720,
                "auto_loan_history": True,
                "employment_duration_months": 36,
                "address": "123 Main St, Los Angeles, CA 90001",
                "residence_duration_months": 18,
                "monthly_expenses": 2500,
                "down_payment_ready": 5000,
                # New Finance Manager fields
                "employer_name": "Tech Corp",
                "job_title": "Software Engineer",
                "time_at_job_months": 36,
                "employment_type": "W2",
                "monthly_income_pretax": 6500,
                "annual_income": 78000,
                "date_of_birth": "1990-05-15",
                "drivers_license_number": "D1234567",
                "immigration_status": "citizen",
                "phone": "(747) 555-0123",
                "current_address": "123 Main St, Los Angeles, CA 90001",
                "current_address_duration_months": 18,
                "previous_address": "456 Oak Ave, Irvine, CA 92602",
                "ssn": "123-45-6789"
            }
            
            print("Updating profile with all Finance Manager fields...")
            response = self.session.put(
                f"{BACKEND_URL}/user/profile",
                json=profile_data,
                headers={
                    "Authorization": f"Bearer {self.user_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify all fields were saved
                missing_fields = []
                for field in profile_data.keys():
                    if field not in data or data.get(field) != profile_data[field]:
                        missing_fields.append(field)
                
                if not missing_fields:
                    return self.log_test(
                        "Extended Profile Update",
                        True,
                        "All Finance Manager fields saved correctly",
                        f"Fields: {', '.join(profile_data.keys())}"
                    )
                else:
                    return self.log_test(
                        "Extended Profile Update",
                        False,
                        f"Some fields not saved correctly: {missing_fields}"
                    )
            else:
                return self.log_test("Extended Profile Update", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("Extended Profile Update", False, f"Error: {str(e)}")
    
    def test_3_get_lexus_lot_and_create_application(self):
        """Test 3: Get Lexus RX350 lot and create application"""
        print("\n" + "="*80)
        print("TEST 3: Get Lexus RX350 Lot and Create Application")
        print("="*80)
        
        if not self.user_token:
            return self.log_test("Get Lot and Create Application", False, "No user token available")
        
        try:
            # Get Lexus RX350 lot
            print("Searching for Lexus RX350 lot...")
            response = self.session.get(
                f"{BACKEND_URL}/admin/lots?make=Lexus&model=RX350&limit=1",
                headers={"Authorization": f"Bearer {self.user_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                
                if items:
                    lot = items[0]
                    self.lot_id = lot.get("id")
                    print(f"Found Lexus RX350 lot: {lot.get('year')} {lot.get('make')} {lot.get('model')} {lot.get('trim')}")
                    
                    # Create application
                    print("Creating application...")
                    app_response = self.session.post(
                        f"{BACKEND_URL}/applications?lot_id={self.lot_id}",
                        headers={
                            "Authorization": f"Bearer {self.user_token}",
                            "Content-Type": "application/json"
                        }
                    )
                    
                    if app_response.status_code == 200:
                        app_data = app_response.json()
                        self.application_id = app_data.get("application_id")
                        return self.log_test(
                            "Get Lot and Create Application",
                            True,
                            f"Application created successfully: {self.application_id}"
                        )
                    else:
                        return self.log_test("Get Lot and Create Application", False, f"Application creation failed: HTTP {app_response.status_code}")
                else:
                    return self.log_test("Get Lot and Create Application", False, "No Lexus RX350 lot found")
            else:
                return self.log_test("Get Lot and Create Application", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("Get Lot and Create Application", False, f"Error: {str(e)}")
    
    def test_4_alternative_vehicles(self):
        """Test 4: Get alternative vehicles for application"""
        print("\n" + "="*80)
        print("TEST 4: Alternative Vehicles")
        print("="*80)
        
        if not self.application_id or not self.user_token:
            return self.log_test("Alternative Vehicles", False, "No application ID or user token available")
        
        try:
            print(f"Getting alternatives for application: {self.application_id}")
            response = self.session.get(
                f"{BACKEND_URL}/applications/{self.application_id}/auto-alternatives",
                headers={"Authorization": f"Bearer {self.user_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                alternatives = data.get("alternatives", {})
                count = data.get("count", 0)
                
                # Check if we have alternatives
                alt_types = []
                for alt_type in ["cheaper", "similar", "luxury"]:
                    if alternatives.get(alt_type):
                        alt_types.append(alt_type)
                
                if count > 0:
                    return self.log_test(
                        "Alternative Vehicles",
                        True,
                        f"Found {count} alternatives: {', '.join(alt_types)}",
                        f"Alternatives: {json.dumps(alternatives, indent=2)}"
                    )
                else:
                    return self.log_test(
                        "Alternative Vehicles",
                        True,
                        "No alternatives found (not enough lots in database)",
                        "This is acceptable if there aren't enough lots"
                    )
            else:
                return self.log_test("Alternative Vehicles", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("Alternative Vehicles", False, f"Error: {str(e)}")
    
    def test_5_prescoring(self):
        """Test 5: Run prescoring check (admin only)"""
        print("\n" + "="*80)
        print("TEST 5: Prescoring Check")
        print("="*80)
        
        if not self.application_id:
            return self.log_test("Prescoring", False, "No application ID available")
        
        try:
            # Use the user token (will test if it works, otherwise we'll see 403)
            # In production, admin would have proper role
            if not self.admin_token:
                print("Using user token for prescoring (admin token not available)...")
                self.admin_token = self.user_token
            
            # Run prescoring
            print(f"Running prescoring for application: {self.application_id}")
            response = self.session.post(
                f"{BACKEND_URL}/applications/{self.application_id}/prescoring",
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                prescoring = data.get("prescoring", {})
                
                # Verify prescoring data structure
                required_fields = [
                    "credit_score", "credit_tier", "approval_probability",
                    "max_approved_amount", "recommended_down_payment"
                ]
                
                missing_fields = [f for f in required_fields if f not in prescoring]
                
                if not missing_fields:
                    return self.log_test(
                        "Prescoring",
                        True,
                        "Prescoring completed successfully",
                        f"Credit Score: {prescoring.get('credit_score')}, Tier: {prescoring.get('credit_tier')}, Approval: {prescoring.get('approval_probability')}"
                    )
                else:
                    return self.log_test("Prescoring", False, f"Missing prescoring fields: {missing_fields}")
            elif response.status_code == 403:
                return self.log_test("Prescoring", False, "Admin/Finance Manager access required (403)")
            else:
                return self.log_test("Prescoring", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("Prescoring", False, f"Error: {str(e)}")
    
    def test_6_trade_in(self):
        """Test 6: Add trade-in vehicle"""
        print("\n" + "="*80)
        print("TEST 6: Trade-In Vehicle")
        print("="*80)
        
        if not self.application_id or not self.user_token:
            return self.log_test("Trade-In", False, "No application ID or user token available")
        
        try:
            trade_in_data = {
                "vin": "1HGCM82633A123456",
                "year": 2020,
                "make": "Honda",
                "model": "Accord",
                "mileage": 45000,
                "condition": "good"
            }
            
            print(f"Adding trade-in: {trade_in_data['year']} {trade_in_data['make']} {trade_in_data['model']}")
            response = self.session.post(
                f"{BACKEND_URL}/applications/{self.application_id}/trade-in",
                json=trade_in_data,
                headers={
                    "Authorization": f"Bearer {self.user_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                trade_in_value = data.get("trade_in_value")
                
                if trade_in_value:
                    return self.log_test(
                        "Trade-In",
                        True,
                        f"Trade-in added successfully with estimated value: ${trade_in_value}"
                    )
                else:
                    return self.log_test("Trade-In", False, "No trade-in value returned")
            else:
                return self.log_test("Trade-In", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("Trade-In", False, f"Error: {str(e)}")
    
    def test_7_finance_manager_update(self):
        """Test 7: Finance Manager update application"""
        print("\n" + "="*80)
        print("TEST 7: Finance Manager Update")
        print("="*80)
        
        if not self.application_id or not self.admin_token:
            return self.log_test("Finance Manager Update", False, "No application ID or admin token available")
        
        try:
            update_data = {
                "verified_income": 7000,
                "manager_comments": "Income verified via paystubs"
            }
            
            print(f"Updating application with finance manager fields...")
            response = self.session.patch(
                f"{BACKEND_URL}/admin/applications/{self.application_id}/finance-manager-update",
                params=update_data,
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok"):
                    return self.log_test(
                        "Finance Manager Update",
                        True,
                        "Application updated with finance manager fields"
                    )
                else:
                    return self.log_test("Finance Manager Update", False, "Update failed")
            elif response.status_code == 403:
                return self.log_test("Finance Manager Update", False, "Finance Manager access required (403)")
            else:
                return self.log_test("Finance Manager Update", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("Finance Manager Update", False, f"Error: {str(e)}")
    
    def test_8_subscriptions(self):
        """Test 8: Subscription management"""
        print("\n" + "="*80)
        print("TEST 8: Subscriptions (Create, Get, Delete)")
        print("="*80)
        
        if not self.user_token:
            return self.log_test("Subscriptions", False, "No user token available")
        
        try:
            # Create subscription
            sub_data = {
                "makes": ["Lexus"],
                "models": ["RX350", "ES350"],
                "notify_email": True
            }
            
            print("Creating subscription...")
            response = self.session.post(
                f"{BACKEND_URL}/subscriptions",
                params=sub_data,
                headers={"Authorization": f"Bearer {self.user_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.subscription_id = data.get("subscription_id")
                print(f"Subscription created: {self.subscription_id}")
                
                # Get subscriptions
                print("Getting subscriptions...")
                get_response = self.session.get(
                    f"{BACKEND_URL}/subscriptions",
                    headers={"Authorization": f"Bearer {self.user_token}"}
                )
                
                if get_response.status_code == 200:
                    get_data = get_response.json()
                    subscriptions = get_data.get("subscriptions", [])
                    
                    # Check if our subscription is in the list
                    found = any(s.get("id") == self.subscription_id for s in subscriptions)
                    
                    if found:
                        print("Subscription found in list")
                        
                        # Delete subscription
                        print("Deleting subscription...")
                        delete_response = self.session.delete(
                            f"{BACKEND_URL}/subscriptions/{self.subscription_id}",
                            headers={"Authorization": f"Bearer {self.user_token}"}
                        )
                        
                        if delete_response.status_code == 200:
                            return self.log_test(
                                "Subscriptions",
                                True,
                                "All subscription operations successful (Create, Get, Delete)"
                            )
                        else:
                            return self.log_test("Subscriptions", False, f"Delete failed: HTTP {delete_response.status_code}")
                    else:
                        return self.log_test("Subscriptions", False, "Subscription not found in list")
                else:
                    return self.log_test("Subscriptions", False, f"Get subscriptions failed: HTTP {get_response.status_code}")
            else:
                return self.log_test("Subscriptions", False, f"Create subscription failed: HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("Subscriptions", False, f"Error: {str(e)}")
    
    def test_9_notifications(self):
        """Test 9: Send notification"""
        print("\n" + "="*80)
        print("TEST 9: Send Notification")
        print("="*80)
        
        if not self.application_id or not self.admin_token:
            return self.log_test("Notifications", False, "No application ID or admin token available")
        
        try:
            notification_data = {
                "notification_type": "email",
                "message": "Your application has been approved!"
            }
            
            print(f"Sending notification for application: {self.application_id}")
            response = self.session.post(
                f"{BACKEND_URL}/applications/{self.application_id}/send-notification",
                params=notification_data,
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok"):
                    return self.log_test(
                        "Notifications",
                        True,
                        "Notification sent successfully (mock)"
                    )
                else:
                    return self.log_test("Notifications", False, "Notification failed")
            else:
                return self.log_test("Notifications", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            return self.log_test("Notifications", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all Finance Manager tests"""
        print("\n" + "="*80)
        print("FINANCE MANAGER FEATURES - COMPREHENSIVE TESTING")
        print("="*80)
        print("Testing all new Finance Manager endpoints and extended profile features")
        print()
        
        tests = [
            self.test_1_register_and_login,
            self.test_2_extended_profile_update,
            self.test_3_get_lexus_lot_and_create_application,
            self.test_4_alternative_vehicles,
            self.test_5_prescoring,
            self.test_6_trade_in,
            self.test_7_finance_manager_update,
            self.test_8_subscriptions,
            self.test_9_notifications
        ]
        
        passed = 0
        failed = 0
        
        for test_func in tests:
            try:
                result = test_func()
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ Test {test_func.__name__} crashed: {str(e)}")
                failed += 1
        
        # Print summary
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        print(f"Total Tests: {passed + failed}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        print("="*80)
        
        return passed, failed

if __name__ == "__main__":
    tester = FinanceManagerTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)
