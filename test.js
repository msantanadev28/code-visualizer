const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));
    
    await page.goto('http://localhost:4200/', { waitUntil: 'networkidle0' });
    
    await new Promise(r => setTimeout(r, 2000));
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('BODY HTML LENGTH:', bodyHTML.length);
    
    await browser.close();
  } catch(e) {
    console.error('SCRIPT ERROR:', e);
  }
})();
