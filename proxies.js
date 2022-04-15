import puppeteer from 'puppeteer';
import { getText } from './utils.js';

const initBrowserDecorator = func =>
		/*@ decorator to create a browser is it has been not passed*/
		async function(browser=null) {
				let browserNotPassed = (browser)? false : true
				// if browser is not passed
				if( browserNotPassed ){
						console.log('Opening browser...');
						browser = await puppeteer.launch();
				}
				// wrap function
				const result = await func(browser);
				// close browser if we opened it 
				if( browserNotPassed ) await browser.close();
				return result;
		}


const free_proxy_list_net = async page => {
		/* this functions parse the proxies form https://free-proxy-list.net/*/
		// waitin for selectos method and then for evey elemene, get the textContent?
		let proxies = []
		let selector = 'textarea' // they are a area wher they have the 
		await page.goto('https://free-proxy-list.net/');
		// raw txt fo the proxies, got this by printing the text from the entire page
		let element = await page.waitForSelector(selector)
		//let txtEls = await element.evaluate( el => el.textContent )
		proxies = await getText(element) 
		// split by newline
		proxies = proxies.split("\n")
		// remove unwanted debries
		Array(3).fill()
				.map(() =>
						proxies.shift() );
		return proxies
}

const scrapingant_free_proxies = async page => {
		/* this functions parse the proxies form https://scrapingant.com/free-proxies/*/
		// waitin for selectos method and then for evey elemene, get the textContent?
		let proxies = []
		await page.goto('https://scrapingant.com/free-proxies');
		let elements = await page.$$('tr')
		console.log('this ran')
		console.log(elements);
		//proxies = await getText(element) 
		// split by newline
		return proxies
}

const get_them_proxies = 
		initBrowserDecorator( 
				/* parses the proxies form various websites */
				async browser => {
						const proxies = new Set()
						const addToSet = new_proxy => proxies.add(new_proxy)
						let new_proxies = []
						// make new page
						const page = await browser.newPage();
						console.log('opened new page..')
						// get from free-proxy-list.net
						//await free_proxy_list_net(page)
						//		.then( new_proxies => // add them to set
						//				new_proxies.forEach(addToSet) )
						// get from scrapingant.com/free-proxies
						await scrapingant_free_proxies(page)
								.then( new_proxies => // add them to set
										new_proxies.forEach(addToSet) )
						// add them to st
						return proxies
				}
		)

//https://scrapingant.com/free-proxies/

const testProxies = async browser => {
				// make new page
				const page = await browser.newPage();
				console.log('opened new page..')
				// go to website
				await page.goto('');
		}
		


export { get_them_proxies }
