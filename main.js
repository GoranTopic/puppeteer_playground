import puppeteer from 'puppeteer';
//import { get_them_proxies } from './proxies.js';
import { get_autocomplete_company_names } from  './supercias.js'


const browserOptions = { 
		/* options to pass to the browser, 
		 idealy read from file */

}

async function main () {
		// let's open a new browser
		console.log('Launching browser...')
		const browser = await puppeteer.launch();

		//const proxies = await get_them_proxies(browser);
		//console.log('proxies', proxies);
		const names = get_autocomplete_company_names(browser);
		console.log('company names', names);

		// let's close the browser
		console.log('closing browser...')
		await browser.close();
}


main();
