"""
AutoBandit Scraper - Python Version
Works in Emergent deployment environment
"""
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import re
from datetime import datetime
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class AutoBanditScraperPython:
    """Python-based scraper (no Puppeteer needed)"""
    
    def __init__(self):
        self.base_url = "https://autobandit.com"
        self.results = []
    
    async def scrape_listing(self):
        """Scrape AutoBandit deals page"""
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                logger.info("Fetching AutoBandit deals...")
                
                async with session.get(f"{self.base_url}/deals", headers=headers) as response:
                    html = await response.text()
                    
                    logger.info(f"Response status: {response.status}")
                    
                    # Parse HTML
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find all deal cards
                    cards = soup.find_all(['div', 'article'], class_=lambda c: c and ('card' in c.lower() or 'deal' in c.lower()))
                    
                    logger.info(f"Found {len(cards)} potential cards")
                    
                    offers = []
                    
                    for i, card in enumerate(cards):
                        try:
                            text = card.get_text()
                            
                            # Extract data using regex
                            year_match = re.search(r'\b(202[4-9]|203[0-9])\b', text)
                            year = int(year_match.group(1)) if year_match else 2025
                            
                            # Extract make/model
                            title_pattern = rf'{year}\s+([A-Z][a-z]+(?:-[A-Z][a-z]+)?)\s+([A-Za-z0-9\s]+?)(?=MSRP|From|\$|$)'
                            title_match = re.search(title_pattern, text)
                            
                            make = title_match.group(1) if title_match else ''
                            model = title_match.group(2).strip().split()[0:3] if title_match else []
                            model = ' '.join(model) if model else ''
                            
                            # Extract payment
                            payment_match = re.search(r'From\s*\$(\d+)', text, re.IGNORECASE)
                            if not payment_match:
                                payment_match = re.search(r'\$(\d+)[^\d]{0,5}/\s*mo', text, re.IGNORECASE)
                            
                            payment = int(payment_match.group(1)) if payment_match else 0
                            
                            # Extract MSRP
                            msrp_match = re.search(r'MSRP[^\d]*\$?([\d,]+)', text, re.IGNORECASE)
                            msrp = int(msrp_match.group(1).replace(',', '')) if msrp_match else 0
                            
                            # Extract incentives
                            inc_match = re.search(r'\$([\d,]+)\s*in\s*incentives', text, re.IGNORECASE)
                            incentives = int(inc_match.group(1).replace(',', '')) if inc_match else 0
                            
                            # Extract image
                            img = card.find('img')
                            image_url = img.get('src', '') if img else ''
                            
                            # Validate
                            if not make or not model or payment == 0:
                                continue
                            
                            offer = {
                                'id': f'ab-{int(datetime.now().timestamp())}-{i}',
                                'source': 'autobandit',
                                'scrapedAt': datetime.now().isoformat(),
                                'title': f'{year} {make} {model}'.strip(),
                                'make': make,
                                'model': model,
                                'year': year,
                                'msrp': msrp,
                                'monthlyPayment': payment,
                                'incentives': incentives,
                                'termMonths': 36,
                                'mileagePerYear': 10000,
                                'imageUrl': image_url,
                                'sourceId': f'AB-{make}-{model}-{year}'.lower().replace(' ', '-'),
                                'status': 'active'
                            }
                            
                            offers.append(offer)
                            
                        except Exception as e:
                            logger.warning(f"Error parsing card {i}: {e}")
                            continue
                    
                    self.results = offers
                    logger.info(f"Extracted {len(offers)} valid offers")
                    
                    return offers
                    
        except Exception as e:
            logger.error(f"Scraping error: {e}")
            return []
    
    async def import_to_hunter(self, offers, api_url, token):
        """Import offers to Hunter.Lease via API"""
        
        imported = 0
        failed = 0
        
        async with aiohttp.ClientSession() as session:
            for offer in offers:
                try:
                    async with session.post(
                        f"{api_url}/admin/import-offer",
                        json=offer,
                        headers={'Authorization': f'Bearer {token}'}
                    ) as response:
                        if response.status == 200:
                            imported += 1
                            logger.info(f"Imported: {offer['title']}")
                        else:
                            failed += 1
                            logger.error(f"Failed: {offer['title']}")
                            
                except Exception as e:
                    failed += 1
                    logger.error(f"Import error: {e}")
        
        return {'imported': imported, 'failed': failed}


async def run_scraper(api_url=None, token=None):
    """Main scraper function"""
    scraper = AutoBanditScraperPython()
    
    logger.info("Starting Python scraper...")
    
    # Scrape offers
    offers = await scraper.scrape_listing()
    
    logger.info(f"Scraped {len(offers)} offers")
    
    # Save to file
    output_file = Path("/app/backend/scraped_offers.json")
    output_file.write_text(json.dumps(offers, indent=2))
    
    logger.info(f"Saved to {output_file}")
    
    # Import to API if credentials provided
    if api_url and token:
        result = await scraper.import_to_hunter(offers, api_url, token)
        logger.info(f"Import result: {result}")
        return result
    
    return {'scraped': len(offers)}


if __name__ == '__main__':
    import os
    
    api_url = os.getenv('HUNTER_API_URL', 'http://localhost:8001/api')
    token = os.getenv('HUNTER_ADMIN_TOKEN', '')
    
    result = asyncio.run(run_scraper(api_url, token))
    print(f"Result: {result}")
