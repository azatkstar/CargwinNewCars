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
        
        // Extract data from each card
        const offers = [];
        
        for (let i = 0; i < cardElements.length; i++) {
          const card = cardElements[i];
          
          try {
            // Get all text from card
            const allText = await page.evaluate(el => el.textContent, card);
            
            // MSRP using XPath
            let msrp = null;
            try {
              const msrpElements = await card.$x(".//*[contains(translate(text(),'MSRP','msrp'),'msrp') and contains(text(),'$')]");
              if (msrpElements.length > 0) {
                const raw = await page.evaluate(el => el.textContent, msrpElements[0]);
                const match = raw.match(/\$[\d,]+/);
                if (match) msrp = match[0].replace(/[$,]/g, '');
              }
            } catch (err) {
              console.warn(`[Scraper] MSRP parse error for card ${i}:`, err.message);
            }
            
            // Monthly payment
            let monthly = null;
            try {
              const paymentElements = await card.$x(".//*[contains(text(), '/mo')]");
              if (paymentElements.length > 0) {
                const text = await page.evaluate(el => el.textContent, paymentElements[0]);
                const match = text.match(/\$[\d,]+/);
                if (match) monthly = match[0].replace(/[$,]/g, '');
              }
            } catch (err) {
              console.warn(`[Scraper] Monthly payment parse error for card ${i}:`, err.message);
            }
            
            // Term (months)
            let term = null;
            try {
              const termMatch = allText.match(/(\d+)\s*mo(?:nths?)?/i);
              if (termMatch) term = termMatch[1];
            } catch (err) {
              console.warn(`[Scraper] Term parse error for card ${i}:`, err.message);
            }
            
            // Incentives
            let incentives = null;
            try {
              const incElements = await card.$x(".//*[contains(translate(text(),'INCENTIVES','incentives'),'incentives') and contains(text(),'$')]");
              if (incElements.length > 0) {
                const incText = await page.evaluate(el => el.textContent, incElements[0]);
                const match = incText.match(/\$[\d,]+/);
                if (match) incentives = match[0].replace(/[$,]/g, '');
              }
            } catch (err) {
              console.warn(`[Scraper] Incentives parse error for card ${i}:`, err.message);
            }
            
            // Extract year, make, model from text
            const yearMatch = allText.match(/\b(202[4-9]|203[0-9])\b/);
            const year = yearMatch ? parseInt(yearMatch[1]) : 2025;
            
            const titlePattern = new RegExp(`${year}\\s+([A-Z][a-z]+(?:-[A-Z][a-z]+)?)\\s+([A-Za-z0-9\\s]+?)(?=MSRP|From|\\$|$)`);
            const titleMatch = allText.match(titlePattern);
            
            const make = titleMatch?.[1] || '';
            const model = titleMatch?.[2]?.trim().split(/\s+/).slice(0, 3).join(' ') || '';
            
            // Extract image
            const img = await card.$('img');
            const imageUrl = img ? await page.evaluate(el => el.src || el.dataset.src || '', img) : '';
            
            // Validate required fields
            if (!monthly || !msrp || !make || !model) {
              console.warn(`[Scraper] Skipping card ${i} - missing required data`);
              continue;
            }
            
            const offer = {
              id: `ab-${Date.now()}-${i}`,
              source: 'autobandit',
              scrapedAt: new Date().toISOString(),
              url: `https://autobandit.com/deals/${make.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}`,
              title: `${year} ${make} ${model}`.trim(),
              make,
              model,
              trim: '',
              year,
              msrp: parseInt(msrp) || 0,
              monthlyPayment: parseInt(monthly) || 0,
              incentives: incentives ? parseInt(incentives) : 0,
              downPayment: 0,
              termMonths: parseInt(term) || 36,
              mileagePerYear: 10000,
              moneyFactor: null,
              residualPercent: null,
              imageUrl,
              sourceId: `AB-${make}-${model}-${year}`.toLowerCase().replace(/\s+/g, '-'),
              raw: {
                allText: allText.substring(0, 300),
                msrpRaw: msrp,
                monthlyRaw: monthly
              }
            };
            
            offers.push(offer);
            
          } catch (cardErr) {
            console.error(`[Scraper] Error processing card ${i}:`, cardErr.message);
          }
        }
        
        console.log(`[Scraper] Extracted ${offers.length} valid offers`);
        
        // Brand filtering
        const selectedBrands = process.env.SELECTED_BRANDS;
        if (selectedBrands && selectedBrands !== 'all') {
          const brandList = selectedBrands.toLowerCase().split(',').map(b => b.trim());
          const filtered = offers.filter(o => {
            const make = o.make.toLowerCase();
            return brandList.some(brand => make.includes(brand) || brand.includes(make));
          });
          
          console.log(`[Scraper] Brand filter: ${offers.length} → ${filtered.length} offers`);
          this.results = filtered;
        } else {
          this.results = offers;
        }
        
        return this.results;
        
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
