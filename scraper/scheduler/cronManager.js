/**
 * Cron Jobs Configuration
 * Schedules scraper runs
 */

const cron = require('node-cron');
const ScraperRunner = require('../run');

class CronManager {
  constructor() {
    this.jobs = [];
    this.runner = new ScraperRunner();
  }

  start() {
    console.log('[Cron] Starting scheduled jobs...');

    // Daily full scan at 04:00 AM
    const dailyScan = cron.schedule('0 4 * * *', async () => {
      console.log('[Cron] Running daily differential scan...');
      try {
        await this.runner.run({ force: false });
      } catch (error) {
        console.error('[Cron] Daily scan error:', error);
      }
    });

    this.jobs.push(dailyScan);

    // Hourly MF check
    const hourlyCheck = cron.schedule('0 * * * *', async () => {
      console.log('[Cron] Running hourly MF check...');
      try {
        // Lightweight check - only MF changes
        await this.runner.run({ checkMFOnly: true });
      } catch (error) {
        console.error('[Cron] Hourly check error:', error);
      }
    });

    this.jobs.push(hourlyCheck);

    console.log('[Cron] Jobs scheduled:');
    console.log('  - Daily scan: 04:00 AM');
    console.log('  - Hourly MF check: Every hour');
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    console.log('[Cron] All jobs stopped');
  }
}

// CLI
if (require.main === module) {
  const manager = new CronManager();
  manager.start();
  
  console.log('[Cron] Manager running. Press CTRL+C to stop.');
  
  process.on('SIGINT', () => {
    manager.stop();
    process.exit(0);
  });
}

module.exports = CronManager;
