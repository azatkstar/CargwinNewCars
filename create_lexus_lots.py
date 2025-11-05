#!/usr/bin/env python3
import requests
import json
import uuid
from datetime import datetime, timezone
import time

# Backend URL
BACKEND_URL = "https://cargwin-newcar.preview.emergentagent.com/api"

# Admin email for authentication
ADMIN_EMAIL = "admin@cargwin.com"

# Lexus lots data based on the provided specifications
lexus_lots = [
    {
        "make": "Lexus",
        "model": "NX350", 
        "trim": "Base",
        "year": 2024,
        "monthly_payment": 499,
        "msrp": 42000,
    },
    {
        "make": "Lexus",
        "model": "NX350",
        "trim": "Premium Navigation",
        "year": 2024,
        "monthly_payment": 547,
        "msrp": 45000,
    },
    {
        "make": "Lexus", 
        "model": "NX450h",
        "trim": "Plugin Luxury",
        "year": 2024,
        "monthly_payment": 797,
        "msrp": 58000,
    },
    {
        "make": "Lexus",
        "model": "RX350",
        "trim": "Base", 
        "year": 2024,
        "monthly_payment": 543,
        "msrp": 48000,
    },
    {
        "make": "Lexus",
        "model": "RX350",
        "trim": "Premium",
        "year": 2024, 
        "monthly_payment": 577,
        "msrp": 52000,
    },
    {
        "make": "Lexus",
        "model": "RX350", 
        "trim": "Premium+",
        "year": 2024,
        "monthly_payment": 652,
        "msrp": 58000,
    },
    {
        "make": "Lexus",
        "model": "RX350H",
        "trim": "Premium",
        "year": 2024,
        "monthly_payment": 743,
        "msrp": 62000,
    },
    {
        "make": "Lexus",
        "model": "RX350H",
        "trim": "Premium+", 
        "year": 2024,
        "monthly_payment": 852,
        "msrp": 68000,
    },
    {
        "make": "Lexus",
        "model": "TX350",
        "trim": "Base",
        "year": 2024,
        "monthly_payment": 597,
        "msrp": 55000,
    },
    {
        "make": "Lexus",
        "model": "TX350",
        "trim": "Premium",
        "year": 2024,
        "monthly_payment": 687,
        "msrp": 62000,
    },
    {
        "make": "Lexus", 
        "model": "TX500h",
        "trim": "F Sport",
        "year": 2024,
        "monthly_payment": 987,
        "msrp": 75000,
    },
    {
        "make": "Lexus",
        "model": "ES350",
        "trim": "Base", 
        "year": 2024,
        "monthly_payment": 407,
        "msrp": 42000,
    },
    {
        "make": "Lexus",
        "model": "ES350",
        "trim": "Premium",
        "year": 2024,
        "monthly_payment": 437,
        "msrp": 46000,
    }
]

def generate_vin():
    """Generate a realistic Lexus VIN"""
    return f"JTJBARBZ{str(uuid.uuid4().hex[:9]).upper()}"

def create_lot_data(lot_info):
    """Create complete lot data structure"""
    
    # Calculate discount to achieve target monthly payment
    # Using lease formula approximation
    target_monthly = lot_info["monthly_payment"]
    msrp = lot_info["msrp"]
    
    # Rough calculation: discount needed to hit target payment
    # Based on $3000 down, 36 months, 7500 miles/year
    estimated_discount = msrp - (target_monthly * 36 + 3000) + 5000
    discount = max(0, int(estimated_discount))
    
    fleet_price = msrp - discount
    
    # Generate description
    description = f"Experience the luxury and reliability of the {lot_info['year']} Lexus {lot_info['model']} {lot_info['trim']}. This exceptional vehicle offers premium features, advanced safety technology, and the renowned Lexus quality you expect. Perfect for Los Angeles drivers who demand both performance and luxury. Special fleet pricing available for qualified buyers with Tier 1 credit approval. Lease terms: $3,000 down, 7,500 miles/year, 36 months at 9.75% APR with all taxes included. Available exclusively for Los Angeles residents."
    
    return {
        "id": str(uuid.uuid4()),
        "make": lot_info["make"],
        "model": lot_info["model"], 
        "year": lot_info["year"],
        "trim": lot_info["trim"],
        "vin": generate_vin(),
        "drivetrain": "AWD" if "h" in lot_info["model"] else "FWD",
        "engine": "2.4L Turbo I4" if "350" in lot_info["model"] else "2.5L Hybrid I4",
        "transmission": "CVT",
        "exteriorColor": "Atomic Silver",
        "interiorColor": "Black", 
        "msrp": msrp,
        "discount": discount,
        "feesHint": 2500,
        "state": "CA",
        "description": description,
        "tags": ["Lexus", "Luxury", "Fleet", "Lease", "Los Angeles", lot_info["model"], lot_info["trim"]],
        "isWeeklyDrop": True,
        "status": "published",
        "images": [
            {
                "url": f"https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800",
                "alt": f"{lot_info['year']} {lot_info['make']} {lot_info['model']} {lot_info['trim']}",
                "type": "hero"
            }
        ],
        "lease": {
            "monthly": target_monthly,
            "dueAtSigning": 3000,
            "termMonths": 36,
            "milesPerYear": 7500,
            "incentives": discount
        },
        "finance": {
            "apr": 9.75,
            "termMonths": 60,
            "downPayment": 3000
        },
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }

def get_auth_token():
    """Get authentication token via magic link"""
    print("🔐 Authenticating...")
    
    try:
        # Step 1: Request magic link
        response = requests.post(
            f"{BACKEND_URL}/auth/magic",
            json={"email": ADMIN_EMAIL},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to request magic link: {response.status_code} - {response.text}")
            return None
        
        data = response.json()
        magic_token = data.get("debug_token") or data.get("token")
        
        if not magic_token:
            print(f"❌ No magic token received. Response: {data}")
            return None
            
        print(f"✅ Magic link token received")
        
        # Step 2: Verify magic link to get JWT
        time.sleep(1)  # Small delay
        
        response = requests.post(
            f"{BACKEND_URL}/auth/verify",
            json={"token": magic_token},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to verify token: {response.status_code} - {response.text}")
            return None
        
        auth_data = response.json()
        access_token = auth_data.get("access_token")
        
        if not access_token:
            print(f"❌ No access token received")
            return None
        
        user = auth_data.get("user", {})
        print(f"✅ Authenticated as {user.get('email')} ({user.get('role')})")
        return access_token
        
    except Exception as e:
        print(f"❌ Authentication error: {str(e)}")
        return None

def create_lots():
    """Create all Lexus lots via API"""
    # First, get authentication token
    access_token = get_auth_token()
    
    if not access_token:
        print("\n❌ Authentication failed. Cannot create lots.")
        return []
    
    created_lots = []
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
    
    print(f"\n📦 Creating {len(lexus_lots)} Lexus lots...")
    
    for i, lot_info in enumerate(lexus_lots, 1):
        try:
            lot_data = create_lot_data(lot_info)
            
            print(f"\n{i}. Creating {lot_data['year']} {lot_data['make']} {lot_data['model']} {lot_data['trim']}")
            print(f"   Monthly: ${lot_data['lease']['monthly']} | MSRP: ${lot_data['msrp']:,} | Fleet: ${lot_data['msrp'] - lot_data['discount']:,}")
            
            # Create lot via API with authentication
            response = requests.post(
                f"{BACKEND_URL}/admin/lots",
                json=lot_data,
                headers=headers,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                created_lots.append(result)
                print(f"   ✅ Created successfully - ID: {result.get('id', 'N/A')}")
            else:
                print(f"   ❌ Failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print(f"\n🎉 Successfully created {len(created_lots)} out of {len(lexus_lots)} Lexus lots!")
    return created_lots

if __name__ == "__main__":
    created_lots = create_lots()
    
    if created_lots:
        print("\n📋 Created Lots Summary:")
        for lot in created_lots:
            monthly = lot.get('lease', {}).get('monthly', 'N/A')
            print(f"- {lot.get('year')} {lot.get('make')} {lot.get('model')} {lot.get('trim')}: ${monthly}/month")