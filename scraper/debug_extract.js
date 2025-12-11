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
  
  const sample = await page.evaluate(() => {
    const card = document.querySelector('div[class*="js-offer-card"]');
    if (!card) return null;
    
    const allText = card.textContent;
    
    return {
      fullText: allText,
      yearMatch: allText.match(/\b(202[4-9])\b/)?.[0],
      paymentMatches: [
        allText.match(/From\s*\$(\d+)/)?.[0],
        allText.match(/\$(\d+)\s*\/\s*mo/)?.[0],
      ],
      msrpMatch: allText.match(/MSRP[^\d]*\$?([\d,]+)/)?.[0],
      incentivesMatch: allText.match(/\$([\d,]+)\s*in\s*incentives/)?.[0]
    };
  });
  
  console.log(JSON.stringify(sample, null, 2));
  
  await browser.close();
})();
