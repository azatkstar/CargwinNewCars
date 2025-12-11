// Test AutoBandit селекторов
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
  console.log('Connecting to AutoBandit...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  
  await page.goto('https://autobandit.com/deals', { waitUntil: 'networkidle2', timeout: 30000 });
  
  console.log('Page loaded. Analyzing structure...');
  
  // Analyze page structure
  const structure = await page.evaluate(() => {
    // Find all possible card containers
    const possibleSelectors = [
      'article', 'div[class*="card"]', 'div[class*="deal"]', 
      'div[class*="vehicle"]', 'div[data-testid]', 'a[href*="/deal/"]'
    ];
    
    const found = {};
    
    for (const selector of possibleSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        found[selector] = {
          count: elements.length,
          sample: elements[0]?.className || elements[0]?.outerHTML?.substring(0, 200)
        };
      }
    }
    
    return found;
  });
  
  console.log('Found selectors:', JSON.stringify(structure, null, 2));
  
  await browser.close();
})();
