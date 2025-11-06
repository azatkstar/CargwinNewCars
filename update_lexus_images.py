#!/usr/bin/env python3
"""
Script to update Lexus lot images with proper model-specific images
"""
import os
import sys
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

# Image mapping for each Lexus model
LEXUS_IMAGES = {
    # ES350 models - luxury sedan
    "2024-lexus-es350-base": "https://images.pexels.com/photos/8737951/pexels-photo-8737951.png",
    "2024-lexus-es350-premium": "https://images.pexels.com/photos/8737951/pexels-photo-8737951.png",
    
    # RX350 models - SUV
    "2024-lexus-rx350-premium": "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
    "2024-lexus-rx350-premium-plus": "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
    
    # RX350H models - hybrid SUV
    "2024-lexus-rx350h-premium": "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
    "2024-lexus-rx350h-premium-plus": "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
    
    # TX350 models - three-row SUV
    "2024-lexus-tx350-base": "https://images.unsplash.com/photo-1693532332351-78bb9c88fc5a3",
    "2024-lexus-tx350-premium": "https://images.unsplash.com/photo-1693532332351-78bb9c88fc5a3",
    
    # TX500h - hybrid three-row SUV
    "2024-lexus-tx500h-f-sport": "https://images.unsplash.com/photo-1693532332351-78bb9c88fc5a3",
    
    # NX350 models - compact SUV
    "2024-lexus-nx350-premium": "https://images.unsplash.com/photo-1650938949085-03847f5b1b63",
    "2024-lexus-nx350-premium-plus": "https://images.unsplash.com/photo-1650938949085-03847f5b1b63",
    
    # NX450h - plugin hybrid compact SUV
    "2024-lexus-nx450h-plugin-luxury": "https://images.unsplash.com/photo-1650938949085-03847f5b1b63",
}

async def update_images():
    """Update Lexus lot images in MongoDB"""
    
    # Get MongoDB URL
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'cargwin')
    
    print(f"🔌 Connecting to MongoDB: {mongo_url}")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    lots_collection = db['lots']
    
    print(f"📊 Connected to database: {db_name}")
    
    # Update each lot
    updated_count = 0
    not_found_count = 0
    
    for slug, image_url in LEXUS_IMAGES.items():
        print(f"\n🔄 Updating {slug}...")
        
        # Find and update the lot
        result = await lots_collection.update_one(
            {"slug": slug},
            {"$set": {"image": image_url}}
        )
        
        if result.matched_count > 0:
            print(f"   ✅ Updated successfully")
            updated_count += 1
        else:
            print(f"   ⚠️  Lot not found in database")
            not_found_count += 1
    
    # Print summary
    print("\n" + "="*50)
    print(f"📊 Update Summary:")
    print(f"   ✅ Updated: {updated_count} lots")
    print(f"   ⚠️  Not found: {not_found_count} lots")
    print("="*50)
    
    # Close connection
    client.close()
    print("\n✅ Done!")

if __name__ == "__main__":
    print("🚗 Lexus Image Update Script")
    print("="*50)
    asyncio.run(update_images())
