/**
 * Main Runner - Orchestrates scraping workflow
 */

const AutoBanditScraper = require('./scrapers/autobanditScraper');
const DiffEngine = require('./scrapers/diffEngine');
const HunterLeaseAPI = require('./scrapers/hunterLeaseAPI');
const SmartScheduler = require('./scheduler/smartScheduler');
const ImageProcessor = require('./scrapers/imageProcessor');
const MFCalculator = require('./scrapers/mfCalculator');
const fs = require('fs').promises;
const path = require('path');

class ScraperRunner {
  constructor() {
    this.scraper = new AutoBanditScraper();
    this.diffEngine = new DiffEngine();
    this.scheduler = new SmartScheduler();
    this.imageProcessor = new ImageProcessor();
    this.mfCalculator = new MFCalculator();
    this.api = new HunterLeaseAPI({
      apiUrl: process.env.HUNTER_API_URL || 'http://localhost:8001/api',
      adminToken: process.env.HUNTER_ADMIN_TOKEN
    });
    
    this.hunterIdMap = {};
  }

  async loadHunterIdMap() {
    try {
      const file = path.join(__dirname, 'state/hunterIdMap.json');
      const data = await fs.readFile(file, 'utf8');
      this.hunterIdMap = JSON.parse(data);
    } catch {
      this.hunterIdMap = {};
    }
  }

  async saveHunterIdMap() {
    const file = path.join(__dirname, 'state/hunterIdMap.json');
    await fs.writeFile(file, JSON.stringify(this.hunterIdMap, null, 2));
  }

  async run(options = {}) {
    console.log('[Runner] Starting scrape workflow...');
    
    try {
      // Initialize
      await this.scheduler.init();
      await this.loadHunterIdMap();
      
      // Check if scraping needed
      const decision = await this.scheduler.shouldScrape(options);
      
      if (!decision.scrape) {
        console.log(`[Runner] Scraping skipped: ${decision.reason}`);
        return { skipped: true, reason: decision.reason };
      }
      
      console.log(`[Runner] Scraping required: ${decision.reason}`);
      
      // Load previous snapshot
      const previousOffers = await this.diffEngine.loadPreviousSnapshot();
      
      // Scrape current data
      const rawOffers = await this.scraper.run();
      
      // Enrich with MF calculations
      console.log('[Runner] Enriching offers with MF calculations...');
      const enrichedOffers = rawOffers.map(offer => 
        this.mfCalculator.enrichOffer(offer)
      );
      
      // Process images
      console.log('[Runner] Processing images...');
      for (const offer of enrichedOffers) {
        const processedImages = await this.imageProcessor.processOfferImages(offer);
        if (processedImages.length > 0) {
          offer.images = processedImages.map(img => img.url);
        }
      }
      
      // Detect changes
      const changes = this.diffEngine.detectChanges(
        Object.values(previousOffers),
        enrichedOffers
      );
      
      console.log(`[Runner] Changes: +${changes.added.length} -${changes.removed.length} ~${changes.modified.length}`);
      
      // Save diff log
      await this.diffEngine.saveDiffLog(changes);
      
      // Sync with Hunter.Lease
      const offersToSync = [...changes.added, ...changes.modified.map(m => m.new)];
      
      console.log(`[Runner] Syncing ${offersToSync.length} offers to Hunter.Lease...`);
      
      const syncResults = await this.api.syncOffers(offersToSync, this.hunterIdMap);
      
      console.log(`[Runner] Sync: ${syncResults.imported} imported, ${syncResults.updated} updated`);
      
      // Mark removed as inactive
      for (const removed of changes.removed) {
        const hunterId = this.hunterIdMap[removed.id];
        if (hunterId) {
          await this.api.markInactive(hunterId);
        }
      }
      
      // Save state
      await this.scheduler.updateInventory(
        enrichedOffers.reduce((map, offer) => {
          map[offer.id] = offer;
          return map;
        }, {})
      );
      
      await this.scheduler.recordRun(enrichedOffers.length, syncResults);
      await this.saveHunterIdMap();
      
      console.log('[Runner] Workflow complete');
      
      return {
        scraped: enrichedOffers.length,
        changes,
        syncResults
      };
      
    } catch (error) {
      console.error('[Runner] Workflow error:', error);
      throw error;
    }
  }
}

// CLI support
if (require.main === module) {
  const runner = new ScraperRunner();
  const force = process.argv.includes('--force');
  
  // Wrap in try/catch with logging
  (async () => {
    const fs = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, 'logs/scraper.log');
    
    const writeLog = (entry) => {
      try {
        fs.mkdirSync(path.dirname(logFile), { recursive: true });
        fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
      } catch (err) {
        console.error('Log write error:', err);
      }
    };
    
    try {
      writeLog({
        timestamp: new Date().toISOString(),
        action: 'start',
        message: `Scraper started (force=${force})`
      });
      
      const result = await runner.run({ force });
      
      writeLog({
        timestamp: new Date().toISOString(),
        action: 'complete',
        message: 'Scraper completed successfully',
        scraped: result.scraped || 0,
        imported: result.syncResults?.imported || 0
      });
      
      console.log('✅ Scraper complete:', result);
      process.exit(0);
      
    } catch (error) {
      writeLog({
        timestamp: new Date().toISOString(),
        action: 'error',
        message: error.message,
        stack: error.stack
      });
      
      console.error('❌ Scraper error:', error);
      process.exit(1);
    }
  })();
}

module.exports = ScraperRunner;
