#!/usr/bin/env python3
"""
Update all Lexus lots with dealer_addons and ensure lease payments are set
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

# Dealer add-ons by model type (research-based estimates)
DEALER_ADDONS_MAP = {
    'es350': 4500,    # Luxury sedan
    'rx350': 5500,    # Popular SUV
    'rx350h': 5500,   # Hybrid SUV
    'tx350': 6000,    # Large 3-row SUV
    'tx500h': 6500,   # Hybrid large SUV
    'nx350': 4800,    # Compact SUV
    'nx450h': 5200,   # Plug-in hybrid
}

async def update_lots():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'cargwin_production')
    
    print(f"🔌 Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    lots_collection = db['lots']
    
    # Get all Lexus lots
    lexus_lots = await lots_collection.find({"make": "Lexus"}).to_list(length=None)
    
    print(f"📊 Found {len(lexus_lots)} Lexus lots\n")
    
    updated = 0
    for lot in lexus_lots:
        model_key = lot.get('model', '').lower().replace(' ', '')
        dealer_addons = DEALER_ADDONS_MAP.get(model_key, 5000)  # Default 5000
        
        update_data = {
            'dealer_addons': dealer_addons
        }
        
        # Ensure lease object exists
        if not lot.get('lease') or lot.get('lease', {}).get('monthly', 0) == 0:
            # Calculate based on existing data
            msrp = lot.get('msrp', 50000)
            discount = lot.get('discount', 0)
            fleet_price = msrp - discount
            
            # Simple lease calculation (36 months, $3000 due at signing)
            # Rough estimate: (fleet_price * 0.024) for 36mo lease
            estimated_monthly = int((fleet_price * 0.024) / 10) * 10  # Round to nearest $10
            
            update_data['lease'] = {
                'monthly': estimated_monthly,
                'dueAtSigning': 3000,
                'termMonths': 36,
                'milesPerYear': 7500,
                'incentives': discount
            }
        
        # Ensure finance object exists
        if not lot.get('finance'):
            update_data['finance'] = {
                'apr': 9.75,
                'termMonths': 60,
                'downPayment': 3000
            }
        
        result = await lots_collection.update_one(
            {'_id': lot['_id']},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            slug = lot.get('slug', 'unknown')
            print(f"✅ {slug}: dealer_addons=${dealer_addons}, lease=${update_data.get('lease', {}).get('monthly', 'existing')}/mo")
            updated += 1
        else:
            print(f"⚠️  {lot.get('slug', 'unknown')}: No changes needed")
    
    print(f"\n✅ Updated {updated}/{len(lexus_lots)} lots")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_lots())
