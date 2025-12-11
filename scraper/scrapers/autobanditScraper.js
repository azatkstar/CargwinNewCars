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
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--single-process'
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
      
      // AutoBandit uses MUI Grid with specific card classes
      const cardSelector = 'div[class*="js-offer-card"]';
      
      console.log(`[Scraper] Waiting for cards: ${cardSelector}`);
      
      await page.waitForSelector(cardSelector, { timeout: 10000 });
      
      const cardCount = await page.evaluate((sel) => {
        return document.querySelectorAll(sel).length;
      }, cardSelector);
      
      console.log(`[Scraper] Found ${cardCount} deal cards`);
      
      // Extract all offer cards with AutoBandit-specific selectors
      const offers = await page.evaluate((cardSelector) => {
        const cards = Array.from(document.querySelectorAll(cardSelector));
        
        return cards.map((card, index) => {
          // Helper: safe text extraction
          const getText = (...selectors) => {
            for (const sel of selectors) {
              const el = card.querySelector(sel);
              if (el) return el.textContent.trim();
            }
            return '';
          };
          
          // Helper: extract number
          const getNum = (text) => {
            if (!text) return 0;
            const cleaned = text.replace(/[$,\s]/g, '');
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
          };
          
          // AutoBandit specific extraction
          // Title format: "2026 Hyundai Kona"
          const allText = card.textContent;
          
          // Extract year (20XX format)
          const yearMatch = allText.match(/\b(20[2-9][0-9])\b/);
          const year = yearMatch ? parseInt(yearMatch[1]) : 2025;
          
          // Extract make and model (after year)
          const afterYear = allText.substring(allText.indexOf(yearMatch?.[0] || '') + 4);
          const titleMatch = afterYear.match(/^([A-Z][a-z]+)\s+([A-Za-z0-9\s]+?)(?:MSRP|From|\$)/);
          const make = titleMatch?.[1] || '';
          const model = titleMatch?.[2]?.trim() || '';
          
          const title = `${year} ${make} ${model}`.trim();
          
          // Extract payment ($XXX/mo format)
          const paymentMatch = allText.match(/\$(\d+,?\d*)\s*\/\s*mo/i);
          const payment = paymentMatch ? getNum(paymentMatch[0]) : 0;
          
          // Extract MSRP
          const msrpMatch = allText.match(/MSRP.*?\$(\d+,?\d+)/);
          const msrp = msrpMatch ? getNum(msrpMatch[0]) : 0;
          
          // Extract incentives
          const incentivesMatch = allText.match(/\$(\d+,?\d+)\s*in\s*incentives/);
          const incentives = incentivesMatch ? getNum(incentivesMatch[0]) : 0;
          
          // Image
          const img = card.querySelector('img');
          const imageUrl = img ? (img.src || '') : '';
          
          // Link
          const link = card.querySelector('a, button');
          const dealUrl = link ? (link.href || `https://autobandit.com/deal/${make}-${model}`) : '';
          
          return {
            id: `ab-${index}`,
            source: 'autobandit',
            scrapedAt: new Date().toISOString(),
            url: dealUrl,
            title,
            make,
            model,
            trim: '',
            year,
            msrp,
            payment,
            incentives,
            image: imageUrl,
            raw: {
              allText: allText.substring(0, 200)
            }
          };
        }).filter(o => o.title && o.payment > 0);
      }, cardSelector);
      
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
