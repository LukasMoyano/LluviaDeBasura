const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        console.log(`[BROWSER LOG] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
        console.log(`[BROWSER ERROR] ${error.message}`);
    });
    
    page.on('requestfailed', request => {
        console.log(`[BROWSER REQ FAILED] ${request.url()} - ${request.failure().errorText}`);
    });

    console.log("Navigating to http://localhost:8081");
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
    
    // Check if canvas is drawn
    const canvasData = await page.evaluate(() => {
        const c = document.getElementById('gameCanvas');
        if (!c) return "No canvas";
        const ctx = c.getContext('2d');
        const data = ctx.getImageData(0,0,c.width,c.height).data;
        let hasPixels = false;
        for (let i = 0; i < data.length; i+=4) {
            if (data[i] !== 0 || data[i+1] !== 0 || data[i+2] !== 0) {
                hasPixels = true;
                break;
            }
        }
        return { 
            width: c.width, 
            height: c.height, 
            hasPixels,
            currentState: window.currentState,
            imagesLoaded: window.imagesLoaded,
            imagesToLoad: window.imagesToLoad
        };
    });
    console.log("Canvas Info:", canvasData);
    
    await browser.close();
})();
