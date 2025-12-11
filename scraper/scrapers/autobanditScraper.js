/**
 * AutoBandit Core Scraper
 * Production-ready distributed scraping system
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

puppeteer.use(StealthPlugin());

class AutoBanditScraper {
  constructor(config = {}) {
    this.config = {
      targetUrl: 'https://autobandit.com/deals',
      headless: true,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...config
    };
    
    this.browser = null;
    this.results = [];
  }

  async init() {
    console.log('[Scraper] Initializing browser...');
    
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    console.log('[Scraper] Browser ready');
  }

  async scrapeListing() {
    const page = await this.browser.newPage();
    
    try {
      // Set realistic viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set user agent
      await page.setUserAgent(this.config.userAgent);
      
      // Navigate to deals page
      console.log('[Scraper] Navigating to AutoBandit...');
      await page.goto(this.config.targetUrl, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout
      });
      
      // Try multiple selectors (fallback logic)
      const cardSelectors = [
        '.deal-card',
        '.offer-card', 
        '[data-testid="deal"]',
        '.vehicle-card',
        'article.deal',
        'div[class*="deal"]'
      ];
      
      let selector = null;
      for (const sel of cardSelectors) {
        const found = await page.$(sel);
        if (found) {
          selector = sel;
          break;
        }
      }
      
      if (!selector) {
        throw new Error('Could not find deal cards on page');
      }
      
      console.log(`[Scraper] Using selector: ${selector}`);
      
      // Wait for listings
      await page.waitForSelector(selector, { timeout: 10000 });
      
      console.log('[Scraper] Page loaded, extracting data...');
      
      // Extract all offer cards with comprehensive selectors
      const offers = await page.evaluate((cardSelector) => {
        const cards = Array.from(document.querySelectorAll(cardSelector));
        
        return cards.map((card, index) => {
          // Helper function to extract text from multiple possible selectors
          const getText = (...selectors) => {
            for (const sel of selectors) {
              const el = card.querySelector(sel);
              if (el) return el.textContent.trim();
            }
            return '';
          };
          
          // Helper to extract number from text
          const extractNumber = (text) => {
            const match = text.match(/[\d,]+/);
            return match ? parseInt(match[0].replace(/,/g, '')) : 0;
          };
          
          // Extract data with fallbacks
          const title = getText('h2', 'h3', '.title', '[class*="title"]', '[data-field="title"]');
          
          const priceText = getText(
            '.price', '.monthly-payment', '[data-field="payment"]',
            '[class*="payment"]', '[class*="price"]'
          );
          const payment = extractNumber(priceText);
          
          const msrpText = getText(
            '.msrp', '[data-field="msrp"]', '[class*="msrp"]'
          );
          const msrp = extractNumber(msrpText);
          
          const termText = getText(
            '.term', '[data-field="term"]', '[class*="term"]', '[class*="month"]'
          );
          const term = extractNumber(termText);
          
          const mileageText = getText(
            '.mileage', '.miles', '[data-field="miles"]', '[class*="mile"]'
          );
          const mileage = extractNumber(mileageText);
          
          // Extract image
          const imgEl = card.querySelector('img');
          const image = imgEl ? (imgEl.src || imgEl.dataset.src || '') : '';
          
          // Extract link
          const linkEl = card.querySelector('a');
          const link = linkEl ? linkEl.href : '';
          
          // Parse title to extract make/model/year
          const titleParts = title.split(' ');
          const year = titleParts.find(p => /^20(2[0-9]|3[0-9])$/.test(p)) || '';
          const make = titleParts[titleParts.indexOf(year) + 1] || '';
          const model = titleParts.slice(titleParts.indexOf(make) + 1).join(' ') || '';
          
          return {
            id: `ab-${index}`,
            title,
            year: parseInt(year) || 2025,
            make,
            model,
            payment,
            msrp,
            term: term || 36,
            mileage: mileage || 10000,
            image,
            link,
            scrapedAt: new Date().toISOString()
          };
        });
      }, selector);
      
      // Filter out empty results
      this.results = offers.filter(o => o.title && o.payment > 0);
      
      console.log(`[Scraper] Extracted ${this.results.length} valid offers`);
      
      return this.results;
      
    } catch (error) {
      console.error('[Scraper] Error:', error.message);
      throw error;
    } finally {
      await page.close();
    }
  }

  async scrapeDetailPage(dealUrl) {
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent(this.config.userAgent);
      await page.goto(dealUrl, { waitUntil: 'networkidle2', timeout: this.config.timeout });
      
      // Extract detailed data
      const detailData = await page.evaluate(() => {
        return {
          title: document.querySelector('h1')?.textContent?.trim() || '',
          msrp: document.querySelector('[data-field="msrp"]')?.textContent || '',
          payment: document.querySelector('[data-field="payment"]')?.textContent || '',
          term: document.querySelector('[data-field="term"]')?.textContent || '',
          mileage: document.querySelector('[data-field="mileage"]')?.textContent || '',
          mf: document.querySelector('[data-field="mf"]')?.textContent || '',
          residual: document.querySelector('[data-field="residual"]')?.textContent || '',
          images: Array.from(document.querySelectorAll('.gallery img')).map(img => img.src)
        };
      });
      
      return detailData;
      
    } catch (error) {
      console.error(`[Scraper] Detail page error: ${error.message}`);
      return null;
    } finally {
      await page.close();
    }
  }

  async downloadImage(imageUrl, outputPath) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      
      // Convert to WebP
      await sharp(buffer)
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      console.log(`[Scraper] Image saved: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error(`[Scraper] Image download error: ${error.message}`);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('[Scraper] Browser closed');
    }
  }

  async run() {
    try {
      await this.init();
      const offers = await this.scrapeListing();
      
      // Save results
      const outputFile = path.join(__dirname, '../output/json/scraped_offers.json');
      await fs.writeFile(outputFile, JSON.stringify(offers, null, 2));
      
      console.log(`[Scraper] Results saved to ${outputFile}`);
      
      return offers;
      
    } finally {
      await this.close();
    }
  }
}

module.exports = AutoBanditScraper;
