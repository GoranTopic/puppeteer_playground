import { initBrowserDecorator } from './decorators.js';
import { getText } from './utils.js';
import fs from 'fs';

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

const get_free_online_proxies = 
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
		
const get_premium_proxies = () => {
		let filename =  './resources/proxies/proxyscrape_premium_http_proxies.txt',
				proxies = [];
		fs.readFile(filename, 'utf-8', (err, data) => {
				if (err) throw err;
				// Converting Raw Buffer to text
				// data using tostring function.
				proxies = data.split(/\r?\n/);
		})
		return proxies
}

class ProxyRotator {
		constructor(){
				let initial_proxy_pool = [
						...get_premium_proxies()
				];
				// 1000ms * 60s * 60m = 1h
				this.timeout_rate = 1000 * 60 * 60;
				this.alive = [];
				this.dead = [];
				this.unknown = [];
				this.ui = 0;
				this.ai = 0;
				this.di = 0;
				this.add_new_proxies(initial_proxy_pool);
				console.log( get_premium_proxies() )
		}

		find_proxy_by_str(str){
				let proxy_pool = [ ...this.alive, ...this.dead, ...this.unknown ];
				return proxy_pool.filter( proxy => str === proxy )[0];
		}

		remove_proxy_by_str(str){
				let pools = [ this.alive, this.dead, this.unknown ];
				pools.forEach( pool => 
						pool = pool.filter( proxy => proxy.proxy !== str )
				)
		}

		add_new_proxies(proxies){
				proxies.forEach( proxy => 
						this.unknown.push({
								status:'unknown', 
								timeoutID: null,
								times_resurected: null,
								ip: proxy.split(':')[0],
								port: proxy.split(':')[1],
								proxy
						})
				)
		}

		str_param_decorator = func => 
				function(proxy){
						if( proxy instanceof String )
								proxy = find_proxy_by_str( proxy );
						return func(proxy)
				}

		async getOnlineFreeProxies() {
				let new_proxies = await get_free_online_proxies();
				this.add_new_proxies(new_proxies);
		}

		getNext = () => {
				if(this.unknown.length === 0) return null
				else if(this.ui <= this.unknown.length) this.ui = 0;
				return  this.unknown[ui++];
		}

		getAlive = () => {
				if(this.alive.length === 0) return null
				else if(this.ai <= this.alive.length) this.ai = 0;
				return  this.alive[ai++];
		}

		setAlive = this.str_param_decorator( proxy =>  {
				// remove from 
				this.remove_proxy_by_str(proxy.proxy);
				proxy.status = 'Alive';
				if(proxy.timeoutID){
						clearTimeout(proxy.timeoutID)
						proxy.timeoutID = null;
				}
				this.alive.push(proxy);
		})

		setDead = this.str_param_decorator( proxy =>  {
				this.remove_proxy_by_str(proxy.proxy);
				proxy.status = 'Dead';
				if(proxy.timeoutID){
						clearTimeout(proxy.timeoutID)
						proxy.timeoutID = setTimeout( 
								this.resurect_proxy(proxy), 
								this.timeout_rate * ( proxy.times_resurected ?? 1 )
						);
				}
				this.dead.push(proxy);
		})

		resurect_proxy( proxy ){
				// remove from 
				this.remove_proxy_by_str(proxy.proxy);
				proxy.status = 'Alive';
				proxy.times_resurected += 1;
				proxy.timeoutID = null;
				this.alive.push(proxy);
		}

}

const rotator = new ProxyRotator();

//console.log(rotator.getNext())
  

export { ProxyRotator, get_free_online_proxies, get_premium_proxies }
