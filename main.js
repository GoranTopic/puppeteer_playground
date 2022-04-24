import puppeteer from 'puppeteer';
import { save_cookies, read_cookies, clean_company_names } from './utils.js'
import spanish_alphbet from './resources/spanish_alphabet.js'
import { scrap_ids, handle_home_page_click  } from  './supercias/scrap_ids.js'
import browserOptions from './options/browser_options.js'

async function main () {
		// let's open a new browser
		/* replace non breaking paces in scraped names */
		let isScraping = true,
				page;
		// scraping 
		const browser = await puppeteer.launch(browserOptions);
		// get already opend page
		page = (await browser.pages())[0];
		// start scraping
		while(isScraping){
				// read the cookies 
				await read_cookies(page);
				// handle the home page click
				await handle_home_page_click(page);
				// get new page opened
				page = (await browser.pages())[0];
				// scarp the ids of the with company names
				isScraping = ! await scrap_ids(page);
		}
		// save the cookies
		await save_cookies(page);
		// let's close the browser
		console.log('closing browser...')
		await browser.close();
}

main();
