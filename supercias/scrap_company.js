import waitUntilRequestDone from '../waitForNetworkIdle.js'
import { getText, read_json, write_json, save_cookies, read_cookies, } from '../utils.js'
import { consulta_principal_url, home_page_url } from '../urls.js';
import debuging from '../options/debug.js'

const scrap_company = async ( browser, name ) => 
		new Promise( (resolve, reject) => {
				/* replace non breaking paces in scraped names */
				let scrapingError = 0,
						max_errors = 5,
						page,
						res
				// get already opend page
				page = ( await browser.pages() )[0];
				// start scraping
				while(scrapingError < max_errors){
						// read the cookies 
						await read_cookies(page);
						// handle the home page click
						await handle_home_page_click(page);
						// get new opened page
						page = ( await browser.pages() )[0];
						// scarp the ids of the with company names
						res = await scrap_files(page, name);
						if(res) resolve(res);
						else scrapingError++; // add error
				}
				// save the cookies
				// let's close the browser
				console.log('closing browser...')
				await browser.close();
				reject("too many errors");
		});

const handle_home_page_click = async page => {
		let home_url = 'https://www.supercias.gob.ec/portalscvs/'
		// go to initial login page 
		await page.goto( home_url, // wait until the page is fully loaded
				{ waitUntil: 'networkidle0', }
		);
		// get frame 
		const iframeElement = await page.waitForSelector('iframe');
		// get inside the frame
		const frame = await iframeElement.contentFrame();
		// check if there is a popup
		//const popup_cancel = ( await frame.$x('//div[@id="ventanaPopup1"]/a') )[0]
		// close popup
		//console.log('popup_cancel', popup_cancel);
		//if(popup_cancel) await popup_cancel.click();
		// selecte button
		const button = await frame.waitForXPath('//span[text()="CONSULTA DE COMPAÑÍAS"]');
		// click on button to go to company consulatas
		button.click();
		// select button
		// wait until request is rendered
		await waitUntilRequestDone(page, 500)
		// wait for a while
		await page.mainFrame().waitForTimeout(1000)
		// close page after being done
		await page.close()
}

// setters and getting for saving the ids
const ids_output_file = 'mined_data/company_ids.json';
const save_ids = ids => write_json(ids, ids_output_file);
const get_ids = () => {
		let res =  read_json(ids_output_file);
		return res? res : [];
}

const extract_id = url => url.split("param=")[1]

/* scraps a id from a single company name */
const scrap_files = async (page, name, debug=false) => {
		// for page to load
		//console.log("getting radio element")
		await waitUntilRequestDone(page, 1000)
		// get the radion 
		let radio_el = ( await page.$x('//label[text()="Nombre"]/../input') )[0];
		// click on the name radio
		if (radio_el) await radio_el.click();
		// until it loads the name
		debuging && console.log("getting text input")
		await waitUntilRequestDone(page, 1000)
		// get the main text input
		let text_input = ( await page.$x("//span[text()='Parámetro']/../i/input") )[0];
		// get button element  
		debuging && console.log("getting search button")
		let search_button = ( await page.$x("//td[text()='Buscar']/../../..") )[0];
		// type name of company
		debuging && console.log("typing name")
		await text_input.type(name, {delay: 10});
		await waitUntilRequestDone(page, 1000)
		// get from options
		await page.keyboard.press('ArrowLeft');
		// remove suggestion
		await page.keyboard.press('Enter');
		// wait until for a little
		await waitUntilRequestDone(page, 1000)
		// click seach button
		debuging && console.log("clicking search_button")
		await search_button.click({delay: 1});
		// wait until new page loads
		debuging && console.log("waiting for new page to load")
		await waitUntilRequestDone(page, 1000);
		//await page.waitForTimeout(10000);
		// get the url value 
		let url = page.url();
		// if  something whent wrong
		if( !url || url === home_page_url ) 
				throw "Could not get url"
		// get ids 
		let id = extract_id(url);
		if( !id ) throw "Could not get id"
		// get back button 
		debuging && console.log("getting back button")
		let backButton = ( await page.$x('//span[@class="z-button"]'))[0];
		// go back
		debuging && console.log("clicking back button")
		await backButton.click();
		// wait until page loads
		debuging && console.log("waiting for new page to load")
		await waitUntilRequestDone(page, 1000);
		// return scraped id
		return { company: name, id, url };
}

const timeoutAfter = timeout => {
  return new Promise((resolve, reject) => {
		setTimeout(() => reject(`${timeout}ms timer timed out`), timeout);
  });
};

const scrap_ids = async page => {
		/* scrap ids */
		let names = read_json('mined_data/company_names.json'),
				// 1000ms * 60s  * 2 =  2m
				timeout = 1000 * 60 * 2, 
				id;
		// check the integriy of the id file
		let [ ids, missing_ids ] = check_integrity( names, get_ids() );
		console.log(missing_ids);
		console.log(`missing ${missing_ids.length} out of ${names.length} names`)
		// saved checked ids 
		save_ids( ids );
		// for every company names
		try{ // catch all
				for (let i of missing_ids){
						// scrap the id from name
						const id = await Promise.race([
								scrap_id(page, names[i]),
								timeoutAfter(timeout)
						]);
						// add  id to list
						ids[i] = id;
						// save colected ids
						save_ids(ids);
						// print result
						console.log(`${id.company}\n> ${id.id}`);
						console.log(`${i}/${missing_ids.length} missing\n`);
				}
		}catch(e){
				console.error("Something went wrong!", e);
				return false
		}
		conosle.log("done!")
		return true
}

export { scrap_ids, handle_home_page_click }
