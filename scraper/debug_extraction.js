const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto('https://autobandit.com/deals', { waitUntil: 'networkidle2', timeout: 30000 });
  
  const data = await page.evaluate(() => {
    const card = document.querySelector('div[class*="js-offer-card"]');
    if (!card) return { error: 'No card found' };
    
    return {
      innerHTML: card.innerHTML.substring(0, 1000),
      h2Text: card.querySelector('h2')?.textContent,
      h3Text: card.querySelector('h3')?.textContent,
      allText: card.textContent.substring(0, 500)
    };
  });
  
  console.log(JSON.stringify(data, null, 2));
  
  await browser.close();
})();
