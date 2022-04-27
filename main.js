import puppeteer from 'puppeteer';
import { getText, read_json, write_json, save_cookies, read_cookies, } from '../utils.js'
import browserOptions from './options/browser.js'
import { ProxyRotator } from './proxies.'
import scrap_company from  './supercias/scrap_company.js'


// setters and getting for saving the ids
const save_companies_checklist = checklist => write_json(checklist, companies_checkList_filename);

const get_companies_checklist = () => {
		let res =  read_json(companies_checkList_filename);
		return res? res : [];
}

// make comnpay file tracker
const check_integrity = (names, checkList) => {
		/* check if the name match the id or if the id are present */
		let completed = [].fill({}, 0, names.length);
		let missing = [];
		// find the name of the compnay on the checklist
		const find_company = name => checkList.filter( company => name === company.name )[0];
		console.log("checking file integrity...");
		names.forEach( ( name, index ) => {
				// if found add to complet
				if(find_company(name)) completed[index] = name;
				// esle add index to missing
				else missing.push(index)
		})
		return [ completed , missing ]
}

const start_new_browser = async ( proxy_rotator, options) => {
		options.args = [ `--proxy-server=${proxy_rotator.getNext()}` ];
		console.log(`launching browser with proxy: ${options.args}`);
		return ( await puppeteer.launch(options) );
}

async function main () {
		// let's open a new browser
		const companies_dir = './mined_data/companies';
		const checkList = read_json('./mined_data/companies_checklist.json');
		const names = read_json('./mined_data/company_names.json');
		const concorrent_broswers = 1;
		const browsers = [];
		// get prxy rotator
		const pr = new ProxyRotator();
		// get missin companies
		let [ missing, completed ] = check_integrity(names, checkList);
		// launch browser instances
		for( let i = 0; i < concorrent_broswers; i++)
				browsers.push( await start_new_browser(pr, browserOptions) );

		const promises = browsers.map( browser => {
				// get frist name index
				let name_index = missing.shift();
				// start scraping process
				scrap_company(browser, names[name_index]).then(
						// if compnay was scrap succesfully
						company => { 
								save_company(company) 
						}
				).catch(
						// if there was error
						e 

				)
		})
		
		await Promise.all([ 

		])
		// get already opend page
		page = ( await browser.pages() )[0];
		// start scraping
		await read_cookies(page);
		// handle the home page click
		await scrap_companies(page);
		// save the cookies
		await save_cookies(page);
		// let's close the browser
		console.log('closing browser...')
		await browser.close();
}

main();
