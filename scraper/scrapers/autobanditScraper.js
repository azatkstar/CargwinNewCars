/**
 * AutoBandit Core Scraper
 * Production-ready distributed scraping system
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const sharp = require('sharp');
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
      
      // Wait for listings to load
      await page.waitForSelector('.deal-card, .offer-card, [data-testid="deal"]', {
        timeout: 10000
      });
      
      console.log('[Scraper] Page loaded, extracting data...');
      
      // Extract all offer cards
      const offers = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.deal-card, .offer-card, [data-testid="deal"]'));
        
        return cards.map(card => {
          // Extract basic data
          const title = card.querySelector('h2, h3, .title')?.textContent?.trim() || '';
          const price = card.querySelector('.price, .monthly-payment')?.textContent?.trim() || '';
          const image = card.querySelector('img')?.src || '';
          const link = card.querySelector('a')?.href || '';
          
          // Extract additional data
          const msrp = card.querySelector('.msrp, [data-field="msrp"]')?.textContent?.trim() || '';
          const term = card.querySelector('.term, [data-field="term"]')?.textContent?.trim() || '';
          const mileage = card.querySelector('.mileage, [data-field="miles"]')?.textContent?.trim() || '';
          
          return {
            title,
            price,
            image,
            link,
            msrp,
            term,
            mileage,
            scrapedAt: new Date().toISOString()
          };
        });
      });
      
      this.results = offers;
      console.log(`[Scraper] Extracted ${offers.length} offers`);
      
      return offers;
      
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
