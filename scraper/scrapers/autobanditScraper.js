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
    
    // Retry logic (3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Set realistic viewport
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent(this.config.userAgent);
        
        console.log(`[Scraper] Attempt ${attempt}: Navigating to AutoBandit...`);
        await page.goto(this.config.targetUrl, {
          waitUntil: 'networkidle2',
          timeout: this.config.timeout
        });
        
        await page.waitForSelector('body', { timeout: 5000 });
        
        // Find all deal cards using XPath
        const cardElements = await page.$x("//div[contains(@class, 'js-offer-card')]");
        
        if (cardElements.length === 0) {
          throw new Error('No deal cards found');
        }
        
        console.log(`[Scraper] Found ${cardElements.length} deal cards`);
        
        // Extract data using evaluate (browser context)
        const offers = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('div[class*="js-offer-card"]'));
          
          return cards.map((card, index) => {
            const allText = card.textContent || '';
            
            // Extract year
            const yearMatch = allText.match(/\b(202[4-9]|203[0-9])\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : 2025;
            
            // Extract make/model
            const titlePattern = new RegExp(`${year}\\s+([A-Z][a-z]+(?:-[A-Z][a-z]+)?)\\s+([A-Za-z0-9\\s]+?)(?=MSRP|From|\\$|Best|Up|$)`);
            const titleMatch = allText.match(titlePattern);
            const make = titleMatch?.[1] || '';
            const model = titleMatch?.[2]?.trim().split(/\s+/).slice(0, 3).join(' ') || '';
            
            // Extract payment (handle zero-width joiners and various formats)
            let payment = 0;
            const paymentPatterns = [
              /From\s*\$(\d+)/i,           // "From$169"
              /\$(\d+)[^\d]{0,3}\/\s*mo/i, // "$169‍/mo" with zero-width chars
              /month.*?\$(\d+)/i,          // "month $169"
              /\$(\d+)\s*per\s*mo/i        // "$169 per mo"
            ];
            
            for (const pattern of paymentPatterns) {
              const match = allText.match(pattern);
              if (match && match[1]) {
                payment = parseInt(match[1]);
                if (payment > 0) break;
              }
            }
            
            // Extract MSRP
            let msrp = 0;
            const msrpMatch = allText.match(/MSRP[^\d]*\$?([\d,]+)/i);
            if (msrpMatch) {
              msrp = parseInt(msrpMatch[1].replace(/,/g, ''));
            }
            
            // Extract incentives
            let incentives = 0;
            const incMatch = allText.match(/\$([\d,]+)\s*in\s*incentives/i);
            if (incMatch) {
              incentives = parseInt(incMatch[1].replace(/,/g, ''));
            }
            
            // Image
            const img = card.querySelector('img');
            const imageUrl = img ? (img.src || img.dataset.src || '') : '';
            
            // Term
            const termMatch = allText.match(/(\d+)\s*mo(?:nth)?s?/i);
            const term = termMatch ? parseInt(termMatch[1]) : 36;
            
            return {
              make,
              model,
              year,
              payment,
              msrp,
              incentives,
              term,
              imageUrl,
              allText: allText.substring(0, 200)
            };
          });
        });
        
        console.log(`[Scraper] Evaluated ${offers.length} cards`);
        
        // Map to full offer format
        const fullOffers = offers.map((o, i) => ({
          id: `ab-${Date.now()}-${i}`,
          source: 'autobandit',
          scrapedAt: new Date().toISOString(),
          url: `https://autobandit.com/deals/${o.make.toLowerCase()}-${o.model.toLowerCase().replace(/\s+/g, '-')}`,
          title: `${o.year} ${o.make} ${o.model}`.trim(),
          make: o.make,
          model: o.model,
          trim: '',
          year: o.year,
          msrp: o.msrp,
          monthlyPayment: o.payment,
          incentives: o.incentives,
          downPayment: 0,
          termMonths: o.term,
          mileagePerYear: 10000,
          moneyFactor: null,
          residualPercent: null,
          imageUrl: o.imageUrl,
          sourceId: `AB-${o.make}-${o.model}-${o.year}`.toLowerCase().replace(/\s+/g, '-'),
          raw: { allText: o.allText }
        }));
        
      } catch (error) {
        console.error(`[Scraper] Attempt ${attempt} failed:`, error.message);
        
        if (attempt < 3) {
          console.log('[Scraper] Retrying in 2 seconds...');
          await page.waitForTimeout(2000);
          continue;
        }
        
        throw error;
      }
    }
    
    // If all retries failed
    throw new Error('All 3 scraping attempts failed');
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
