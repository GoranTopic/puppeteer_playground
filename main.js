import puppeteer from 'puppeteer'

async function get_them_proxies(){
		const browser = await puppeteer.launch();
		console.log('Opening browser...')
		const page = await browser.newPage();
		console.log('opened new page..')
		await page.goto('https://free-proxy-list.net/');
		const trs = await page.$$('tr')

		for (const tr of trs) {
				console.log( tr)
		}

		await browser.close();

}

async function main () {
		const proxies = await get_them_proxies();
		console.log('proxies', proxies);
}

main();

