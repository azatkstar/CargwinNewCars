/**
 * Smart Scheduler for AutoBandit Scraper
 * Decides when scraping is needed based on changes and staleness
 */

const fs = require('fs').promises;
const path = require('path');

const STATE_DIR = path.join(__dirname, '../state');
const LAST_RUN_FILE = path.join(STATE_DIR, 'lastRun.json');
const INVENTORY_FILE = path.join(STATE_DIR, 'inventorySnapshot.json');
const PROGRAM_HISTORY_FILE = path.join(STATE_DIR, 'programHistory.json');

class SmartScheduler {
  constructor() {
    this.lastRun = null;
    this.inventory = {};
    this.programHistory = [];
  }

  async init() {
    try {
      this.lastRun = JSON.parse(await fs.readFile(LAST_RUN_FILE, 'utf8'));
    } catch {
      this.lastRun = { timestamp: null, scrapedCount: 0 };
    }

    try {
      this.inventory = JSON.parse(await fs.readFile(INVENTORY_FILE, 'utf8'));
    } catch {
      this.inventory = {};
    }

    try {
      this.programHistory = JSON.parse(await fs.readFile(PROGRAM_HISTORY_FILE, 'utf8'));
    } catch {
      this.programHistory = [];
    }
  }

  async shouldScrape(options = {}) {
    const { force = false } = options;

    if (force) {
      console.log('Force flag detected - scraping required');
      return { scrape: true, reason: 'manual_override', targets: 'all' };
    }

    // Check staleness (24 hours)
    if (!this.lastRun.timestamp) {
      return { scrape: true, reason: 'first_run', targets: 'all' };
    }

    const hoursSinceLastRun = (Date.now() - new Date(this.lastRun.timestamp)) / (1000 * 60 * 60);
    
    if (hoursSinceLastRun >= 24) {
      return { scrape: true, reason: 'staleness_24h', targets: 'all' };
    }

    // Check for MF program changes (would require diff engine)
    // Check for new inventory (would require listing comparison)
    
    return { scrape: false, reason: 'no_changes_detected' };
  }

  async recordRun(scrapedCount, updates) {
    this.lastRun = {
      timestamp: new Date().toISOString(),
      scrapedCount,
      updates
    };

    await fs.writeFile(LAST_RUN_FILE, JSON.stringify(this.lastRun, null, 2));
  }

  async updateInventory(newInventory) {
    this.inventory = newInventory;
    await fs.writeFile(INVENTORY_FILE, JSON.stringify(this.inventory, null, 2));
  }
}

module.exports = SmartScheduler;
