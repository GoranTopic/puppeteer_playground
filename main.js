import puppeteer from 'puppeteer';
import { get_them_proxies } from './proxies.js';

async function main () {
		const browser = await puppeteer.launch();
		const proxies = await get_them_proxies();
		console.log('proxies', proxies);
		await browser.close();
}

main();

