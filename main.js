import puppeteer from 'puppeteer'

async function get_them_proxies(){
		const browser = await puppeteer.launch();
		console.log('Opening browser...')
		const page = await browser.newPage();
		console.log('opened new page..')
		await page.goto('https://free-proxy-list.net/');

		// with xpath 
		//let els = await page.$x('//tr/td[1]');
		//for (let el of els)
		//		console.log( await ( await el.getProperty('textContent') ).jsonValue() );

		// waitin for selectos method and then for evey elemene, get the textContent?
		let selector = 'textarea' // they are a area wher they have the 
		//raw txt fo the proxies, got this by printing the text from the entire page
		let element = await page.waitForSelector(selector)
		let  txtEls = await element.evaluate( el => el.textContent )
		let proxies = txtEls.split("\n")
		//for (let proxy of proxies) console.log(proxy)

		await browser.close();

		return proxies;
}

async function main () {
		const proxies = await get_them_proxies();
		console.log('proxies', proxies);
}

main();

