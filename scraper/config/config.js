/**
 * Scraper Configuration
 */

module.exports = {
  // AutoBandit settings
  autobandit: {
    baseUrl: 'https://autobandit.com',
    dealsUrl: 'https://autobandit.com/deals',
    timeout: 30000,
    retries: 3
  },

  // Hunter.Lease API
  hunterLease: {
    apiUrl: process.env.HUNTER_API_URL || 'http://localhost:8001/api',
    adminToken: process.env.HUNTER_ADMIN_TOKEN || ''
  },

  // Puppeteer settings
  browser: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  },

  // Scraping behavior
  scraping: {
    concurrency: 3,
    delayBetweenPages: 2000,
    maxRetries: 3,
    stalenessThreshold: 24 * 60 * 60 * 1000, // 24 hours
    lightweightRecheckDays: 7
  },

  // Image processing
  images: {
    downloadImages: true,
    convertToWebP: true,
    quality: 85,
    maxWidth: 1200,
    outputDir: './output/images'
  },

  // Scheduler
  scheduler: {
    dailyScanTime: '04:00',
    hourlyCheck: true,
    enableSmartScheduling: true
  },

  // Logging
  logging: {
    level: 'info',
    dir: './logs',
    maxFiles: 30
  }
};
