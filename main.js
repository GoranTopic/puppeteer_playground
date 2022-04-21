import puppeteer from 'puppeteer';
import { save_cookies, read_cookies, clean_company_names } from './utils.js'
import spanish_alphbet from './resources/spanish_alphabet.js'
import scrap_companies_ids from  './supercias/scrap_ids.js'
import browserOptions from './options/browser_options.js'

async function main () {
		// let's open a new browser
		/* replace non breaking paces in scraped names */
		const sort = str => str.split('').sort((a, b) => a.localeCompare(b)).join('');
		clean_company_names('./mined_data/company_names.json')
		console.log(sort(spanish_alphbet))
		console.log( "00" > "0" )
						
		//console.log('Launching browser...')
		//const browser = await puppeteer.launch(browserOptions);
		// get already opend page
		//const page = (await browser.pages())[0];
		// read the cookies 
		//await read_cookies(page)
		//const proxies = await get_them_proxies(browser);
		//console.log('proxies', proxies);
		//const names = await scrap_company_names(page);
		//console.log('company names', names);
		//const ids = await scrap_companies_ids(page)
		//console.log('ids:', ids)
		// save the cookies
		//await save_cookies(page)
		// let's close the browser
		//console.log('closing browser...')
		//await browser.close();
}


main();
