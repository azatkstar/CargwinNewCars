#!/usr/bin/env python3
"""
Add 5 Real Images to All 100 Offers
Uses Pexels/Unsplash public car images
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Реальные изображения автомобилей (Pexels - бесплатные, высокое качество)
CAR_IMAGES_BY_TYPE = {
    # Toyota images
    "toyota_sedan": [
        "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg",
        "https://images.pexels.com/photos/575386/pexels-photo-575386.jpeg",
        "https://images.pexels.com/photos/575386/pexels-photo-575386.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/575386/pexels-photo-575386.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg"
    ],
    "toyota_suv": [
        "https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg",
        "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
        "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg",
        "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg",
        "https://images.pexels.com/photos/1319839/pexels-photo-1319839.jpeg"
    ],
    "toyota_truck": [
        "https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg",
        "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg",
        "https://images.pexels.com/photos/2449452/pexels-photo-2449452.jpeg",
        "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/2449452/pexels-photo-2449452.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    
    # Lexus images (luxury)
    "lexus_sedan": [
        "https://images.pexels.com/photos/8737951/pexels-photo-8737951.png",
        "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg",
        "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg",
        "https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg",
        "https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg"
    ],
    "lexus_suv": [
        "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
        "https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg",
        "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg",
        "https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg",
        "https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg"
    ],
    
    # Generic sedan
    "sedan": [
        "https://images.pexels.com/photos/100653/pexels-photo-100653.jpeg",
        "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg",
        "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg",
        "https://images.pexels.com/photos/575386/pexels-photo-575386.jpeg",
        "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg"
    ],
    
    # Generic SUV
    "suv": [
        "https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg",
        "https://images.pexels.com/photos/1319839/pexels-photo-1319839.jpeg",
        "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg",
        "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg",
        "https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg"
    ],
    
    # Generic truck
    "truck": [
        "https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg",
        "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg",
        "https://images.pexels.com/photos/2449452/pexels-photo-2449452.jpeg",
        "https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg",
        "https://images.pexels.com/photos/2449452/pexels-photo-2449452.jpeg"
    ],
    
    # Luxury sedan
    "luxury_sedan": [
        "https://images.pexels.com/photos/3972755/pexels-photo-3972755.jpeg",
        "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg",
        "https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg",
        "https://images.pexels.com/photos/2127037/pexels-photo-2127037.jpeg",
        "https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg"
    ],
    
    # Luxury SUV
    "luxury_suv": [
        "https://images.pexels.com/photos/34549770/pexels-photo-34549770.jpeg",
        "https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg",
        "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg",
        "https://images.pexels.com/photos/1319839/pexels-photo-1319839.jpeg",
        "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg"
    ]
}

def get_image_category(make, model):
    """Determine image category based on make/model"""
    make_lower = make.lower()
    model_lower = model.lower()
    
    # Toyota
    if make_lower == 'toyota':
        if 'camry' in model_lower or 'corolla' in model_lower:
            return 'toyota_sedan'
        elif 'tacoma' in model_lower or 'tundra' in model_lower:
            return 'toyota_truck'
        else:
            return 'toyota_suv'
    
    # Lexus
    elif make_lower == 'lexus':
        if 'es' in model_lower:
            return 'lexus_sedan'
        else:
            return 'lexus_suv'
    
    # Luxury brands
    elif make_lower in ['bmw', 'mercedes-benz', 'genesis', 'audi']:
        if 'x' in model_lower or 'suv' in model_lower or 'gv' in model_lower or 'gle' in model_lower or 'q' in model_lower:
            return 'luxury_suv'
        else:
            return 'luxury_sedan'
    
    # Ford trucks
    elif make_lower == 'ford' and 'f-' in model_lower:
        return 'truck'
    
    # Generic
    elif 'suv' in model_lower or 'rav' in model_lower or 'cr-v' in model_lower or 'rogue' in model_lower or 'outback' in model_lower or 'forester' in model_lower or 'sportage' in model_lower or 'tucson' in model_lower or 'cx' in model_lower:
        return 'suv'
    else:
        return 'sedan'

async def add_images_to_all_offers():
    """Add 5 images to each of 100 offers"""
    
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['cargwin_production']
    
    print("📸 Adding 5 Images to Each Offer")
    print("="*60)
    
    # Get all published lots
    lots = await db.lots.find({"status": "published"}).to_list(length=200)
    
    print(f"Found {len(lots)} published lots\n")
    
    updated = 0
    
    for lot in lots:
        make = lot.get('make', '')
        model = lot.get('model', '')
        
        # Determine image category
        category = get_image_category(make, model)
        
        # Get 5 images for this category
        image_urls = CAR_IMAGES_BY_TYPE.get(category, CAR_IMAGES_BY_TYPE['sedan'])
        
        # Create image array
        images = [
            {"url": img, "alt": f"{lot['year']} {make} {model} {lot.get('trim', '')} - view {i+1}"}
            for i, img in enumerate(image_urls[:5])
        ]
        
        # Update lot
        result = await db.lots.update_one(
            {"_id": lot['_id']},
            {"$set": {
                "images": images,
                "image": images[0]['url']  # Primary image
            }}
        )
        
        if result.modified_count > 0:
            updated += 1
            if updated % 20 == 0:
                print(f"✅ Updated {updated} lots...")
    
    print(f"\n🎉 Added images to {updated} offers")
    print(f"📊 Each offer now has 5 professional images")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_images_to_all_offers())
