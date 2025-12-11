/**
 * Mock Scraper - Works in Sandboxed Environment
 * Returns generated data without Puppeteer
 */

const fs = require('fs').promises;
const path = require('path');

class MockScraper {
  constructor() {
    this.generatedOffersFile = path.join(__dirname, '../../backend/generated_offers_100.json');
  }

  async run() {
    console.log('[MockScraper] Running mock scrape...');
    
    // Load generated offers
    let offers = [];
    try {
      const data = await fs.readFile(this.generatedOffersFile, 'utf8');
      offers = JSON.parse(data);
      console.log(`[MockScraper] Loaded ${offers.length} generated offers`);
    } catch (error) {
      console.error('[MockScraper] Failed to load offers:', error.message);
      
      // Generate minimal mock data
      offers = this.generateMockOffers(10);
    }
    
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add scraping metadata
    const scrapedOffers = offers.map((offer, index) => ({
      id: `mock-${index}`,
      title: `${offer.year} ${offer.make} ${offer.model} ${offer.trim}`,
      year: offer.year,
      make: offer.make,
      model: offer.model,
      trim: offer.trim,
      payment: offer.paymentTable?.['740+'] || Math.floor(Math.random() * 300) + 300,
      msrp: offer.msrp,
      term: offer.termTable?.['740+'] || 36,
      mileage: 10000,
      image: offer.images?.[0] || 'https://via.placeholder.com/400x300',
      images: offer.images || [],
      link: `https://autobandit.com/mock/${index}`,
      scrapedAt: new Date().toISOString(),
      mfTable: offer.mfTable,
      residualPercent: offer.residualPercent,
      fees: offer.fees,
      source: 'mock'
    }));
    
    console.log(`[MockScraper] Mock scrape complete: ${scrapedOffers.length} offers`);
    
    return scrapedOffers;
  }

  generateMockOffers(count) {
    const brands = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Lexus'];
    const models = ['Camry', 'Accord', '3 Series', 'C-Class', 'ES'];
    const years = [2024, 2025, 2026];
    
    const offers = [];
    
    for (let i = 0; i < count; i++) {
      const brand = brands[i % brands.length];
      const model = models[i % models.length];
      const year = years[i % years.length];
      
      offers.push({
        id: `mock-gen-${i}`,
        year,
        make: brand,
        model,
        trim: 'LE',
        msrp: 30000 + Math.floor(Math.random() * 20000),
        paymentTable: { '740+': 350 + Math.floor(Math.random() * 200) },
        termTable: { '740+': 36 },
        residualPercent: 60,
        images: [`https://via.placeholder.com/400x300?text=${brand}+${model}`],
        mfTable: { '740+': 0.00150 },
        fees: { acquisition: 695, doc: 85, registration: 450 }
      });
    }
    
    return offers;
  }
}

module.exports = MockScraper;
