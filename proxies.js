import { initBrowserDecorator } from './decorators.js'
import { getText } from './utils.js';

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
		// remove 3 upper unwanted debries
		Array(3).fill().map( () => proxies.shift() );
		// remove 1 lower unwanted debries
		proxies.pop();

		return proxies
}

const scrapingant_free_proxies = async page => {
		/* this functions parse the proxies form https://scrapingant.com/free-proxies/*/
		let proxies = []
		// waitin for selectos method and then for evey elemene, get the textContent?
		await page.goto('https://scrapingant.com/free-proxies', {
				waitUntil: 'networkidle0', // wait until the page is fully loaded
		});
		// nice trick to see the whole content of the page
		let html = await page.content()
		// get the ip and port elements in the html table
		let elements = await page.$$('tbody > tr > td:nth-child(1), tbody > tr > td:nth-child(2)')
		// add ip address and port togetherj
		let texts = await getText(elements) 
		for (let i = 0; i < texts.length; i+=2) 
				proxies.push( texts[i] + ':' + texts[i + 1] )
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
						await free_proxy_list_net(page)
								.then( new_proxies => // add them to set
										new_proxies.forEach(addToSet) )
						// get from scrapingant.com/free-proxies
						await scrapingant_free_proxies(page)
								.then( new_proxies => // add them to set
										new_proxies.forEach(addToSet) )
						// add them to st
						return proxies
				}
		)

const testProxies = async browser => {
				// make new page
				const page = await browser.newPage();
				console.log('opened new page..')
				// go to website
				await page.goto('');
		}
		


export { get_them_proxies }
