#!/usr/bin/env python3
"""
Fix remaining Lexus lots with correct model-specific images
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

# Additional image mappings
ADDITIONAL_LEXUS_IMAGES = {
    # RX models with + symbol
    "2024-lexus-rx350h-premium+": "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
    "2024-lexus-rx350-premium+": "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
    "2024-lexus-rx350-base": "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
    
    # NX models
    "2024-lexus-nx350-base": "https://images.unsplash.com/photo-1650938949085-03847f5b1b63",
    "2024-lexus-nx350-premium-navigation": "https://images.unsplash.com/photo-1650938949085-03847f5b1b63",
}

async def update_images():
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'cargwin')
    
    print(f"🔌 Connecting to MongoDB...")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    lots_collection = db['lots']
    
    updated_count = 0
    for slug, image_url in ADDITIONAL_LEXUS_IMAGES.items():
        print(f"🔄 Updating {slug}...")
        
        result = await lots_collection.update_one(
            {"slug": slug},
            {"$set": {
                "image": image_url,
                "images": [{"url": image_url, "alt": f"Professional photo of {slug}"}]
            }}
        )
        
        if result.matched_count > 0:
            print(f"   ✅ Updated successfully")
            updated_count += 1
        else:
            print(f"   ⚠️  Lot not found")
    
    print(f"\n✅ Updated {updated_count} additional lots")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_images())
