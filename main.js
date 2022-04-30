import puppeteer from 'puppeteer';
import { getText, read_json, write_json, save_cookies, read_cookies, } from './utils.js'
import browserOptions from './options/browser.js'
import { ProxyRotator } from './proxies.js'
import { scrap_company } from  './supercias/scrap_company.js'

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
		if(!checkList) checkList = [];
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
		return [ missing, completed ]
}

const start_new_browser = async ( options, proxy=null ) => {
		if(proxy)
				options.args = [ `--proxy-server=${proxy}` ];
		console.log(`launching browser ${ 
				proxy? `with proxy: ${ options.args}` : '' 
		}`);
		options.headless = false;
		return await puppeteer.launch(options) ;
}

async function main () {
		// let's open a new browser
		const companies_dir = './mined_data/companies';
		const checkList = read_json('./mined_data/companies_checklist.json');
		const names = read_json('./mined_data/company_names.json');
		const concorrent_broswers = 1;
		const browsers = [];
		// TODO
		const id = '0916576796';

		// get prxy rotator
		const pr = new ProxyRotator();
		// get missin companies
		let [ missing, completed ] = check_integrity(names, checkList);
		console.log(names)
		console.log(missing)
		// launch browser instances
		let browser = await start_new_browser(browserOptions);
		// stat script
		await scrap_company(browser, names[missing.shift()], id);
}

main();
