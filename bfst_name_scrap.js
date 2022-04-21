import puppeteer from 'puppeteer';
import { save_cookies, read_cookies, clean_company_names } from './utils.js'
import { scrap_bfst_company_names } from  './supercias/scrap_names.js'
import browserOptions from './options/browser_options.js'

async function random_name_scrap () {
		// let's open a new browser
		/* replace non breaking paces in scraped names */
		console.log('Launching browser...')
		const browser = await puppeteer.launch(browserOptions);
		// get already opend page
		const page = (await browser.pages())[0];
		// read the cookies 
		await read_cookies(page)
		// scrapt comanies names at with random permutations
		const names = await scrap_bfst_company_names(page);
		//console.log('company names', names);
		// save the cookies
		await save_cookies(page)
		// let's close the browser
		console.log('closing browser...')
		await browser.close();
}

random_name_scrap();
