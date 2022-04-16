import puppeteer from 'puppeteer';
//import { get_them_proxies } from './proxies.js';
import { scrap_company_names } from  './supercias.js'
import { save_cookies, read_cookies } from './utils.js'

const browserOptions = { 
		/* options to pass to the browser, 
		 idealy read from file */
		//executablePath: "/snap/bin/chromium",
		headless: false,
		slowMo: 1,
		// excludeSwitches: 'enable-automation',
		//args: [ '--user-data-dir=./.config/google-chrome/' ],
}

async function main () {
		// let's open a new browser
		console.log('Launching browser...')
		const browser = await puppeteer.launch(browserOptions);
		// get already opned page
		const page = (await browser.pages())[0];
		// read the cookies 
		read_cookies(page)
		//const proxies = await get_them_proxies(browser);
		//console.log('proxies', proxies);
		const names = await scrap_company_names(page);
		console.log('company names', names);
		// save the cookies
		save_cookies(page)
		// let's close the browser
		console.log('closing browser...')
		await browser.close();
}


main();
