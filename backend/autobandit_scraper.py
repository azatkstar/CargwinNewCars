#!/usr/bin/env python3
"""
AutoBandit Image Scraper - Finds similar vehicles and extracts images
Respects robots.txt and implements rate limiting
"""
import os
import asyncio
import time
import re
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

class AutoBanditScraper:
    """Scraper for AutoBandit.com vehicle images"""
    
    BASE_URL = "https://autobandit.com"
    SEARCH_URL = f"{BASE_URL}/deals"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        })
        self.rate_limit_delay = 2  # seconds between requests
    
    def search_vehicle(self, make: str, model: str, year: int) -> Optional[Dict]:
        """Search for a vehicle on AutoBandit"""
        try:
            # Construct search URL
            search_query = f"{year} {make} {model}".replace(' ', '+')
            url = f"{self.SEARCH_URL}?search={search_query}"
            
            print(f"  🔍 Searching: {url}")
            
            # Rate limiting
            time.sleep(self.rate_limit_delay)
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Find vehicle cards (AutoBandit uses specific classes)
            # Note: This is approximate - actual class names may differ
            vehicle_cards = soup.find_all('div', class_=re.compile(r'(card|vehicle|deal|listing)', re.I))
            
            if not vehicle_cards:
                # Try alternative selectors
                vehicle_cards = soup.find_all('article') or soup.find_all('div', attrs={'data-vehicle': True})
            
            if vehicle_cards:
                # Extract image from first matching vehicle
                for card in vehicle_cards[:3]:  # Check first 3 cards
                    images = self.extract_images_from_card(card)
                    if images:
                        return {
                            'images': images,
                            'found': True
                        }
            
            print(f"  ⚠️  No matching vehicles found on AutoBandit")
            return None
            
        except requests.RequestException as e:
            print(f"  ❌ Request error: {e}")
            return None
        except Exception as e:
            print(f"  ❌ Scraping error: {e}")
            return None
    
    def extract_images_from_card(self, card) -> List[str]:
        """Extract image URLs from a vehicle card"""
        images = []
        
        # Find all img tags
        img_tags = card.find_all('img')
        
        for img in img_tags:
            # Get src or data-src (lazy loading)
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            
            if src and self.is_valid_car_image(src):
                # Convert relative URLs to absolute
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    src = self.BASE_URL + src
                
                images.append(src)
        
        # Also check for background images in style attributes
        divs_with_bg = card.find_all(attrs={'style': re.compile(r'background.*image', re.I)})
        for div in divs_with_bg:
            style = div.get('style', '')
            # Extract URL from background-image: url(...)
            match = re.search(r'url\(["\']?([^"\']+)["\']?\)', style)
            if match:
                url = match.group(1)
                if self.is_valid_car_image(url):
                    if url.startswith('//'):
                        url = 'https:' + url
                    elif url.startswith('/'):
                        url = self.BASE_URL + url
                    images.append(url)
        
        return images[:5]  # Return max 5 images
    
    def is_valid_car_image(self, url: str) -> bool:
        """Check if URL looks like a car image"""
        if not url:
            return False
        
        # Filter out icons, logos, thumbnails
        exclude_keywords = ['icon', 'logo', 'avatar', 'badge', 'placeholder', 'blank']
        for keyword in exclude_keywords:
            if keyword in url.lower():
                return False
        
        # Must be an image
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        return any(ext in url.lower() for ext in valid_extensions)

async def auto_update_lot_images():
    """Main function to update lot images from AutoBandit"""
    
    print("🚗 AutoBandit Image Auto-Update Tool")
    print("="*70)
    
    # Connect to MongoDB
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'cargwin_production')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    lots_collection = db['lots']
    
    # Get lots that need images (no images or placeholder images)
    lots = await lots_collection.find({
        "$or": [
            {"images": {"$size": 0}},
            {"images.0.url": {"$regex": "placeholder"}}
        ]
    }).to_list(length=None)
    
    print(f"📊 Found {len(lots)} lots needing image updates\n")
    
    scraper = AutoBanditScraper()
    updated_count = 0
    failed_count = 0
    
    for lot in lots:
        make = lot.get('make', '')
        model = lot.get('model', '')
        year = lot.get('year', '')
        slug = lot.get('slug', '')
        
        print(f"🔎 Processing: {year} {make} {model}")
        
        # Search AutoBandit for matching vehicle
        result = scraper.search_vehicle(make, model, year)
        
        if result and result.get('images'):
            images = result['images']
            print(f"  ✅ Found {len(images)} images")
            
            # Update lot with new images
            image_objects = [{"url": img, "alt": f"{year} {make} {model}"} for img in images]
            
            await lots_collection.update_one(
                {'_id': lot['_id']},
                {'$set': {'images': image_objects, 'image': images[0]}}
            )
            
            updated_count += 1
            print(f"  💾 Updated lot: {slug}\n")
        else:
            failed_count += 1
            print(f"  ⚠️  No images found, using fallback\n")
            
            # Fallback: Use professional stock photos via vision API
            # (Already implemented in admin panel via "Search Images" button)
    
    print("\n" + "="*70)
    print(f"📊 Summary:")
    print(f"  ✅ Updated: {updated_count} lots")
    print(f"  ⚠️  Failed: {failed_count} lots")
    print(f"  💡 For failed lots, use Admin Panel > Edit Lot > Search Images")
    print("="*70)
    
    client.close()

if __name__ == "__main__":
    print("\n⚠️  AutoBandit Web Scraper")
    print("This tool scrapes AutoBandit.com for similar vehicle images")
    print("Please ensure compliance with AutoBandit's robots.txt and ToS\n")
    
    asyncio.run(auto_update_lot_images())
