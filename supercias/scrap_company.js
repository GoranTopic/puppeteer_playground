import waitUntilRequestDone from '../waitForNetworkIdle.js'
import { getText, read_json, write_json, save_cookies, read_cookies, } from '../utils.js'
import { consulta_principal_url, home_page_url } from '../urls.js';
import debuging from '../options/debug.js'

const scrap_company = ( browser, name, id_num) => 
		new Promise( async (resolve, reject) => {
				console.log('name:', name)
				/* replace non breaking paces in scraped names */
				let scrapingError = 0,
						max_errors = 5,
						res
				// read the cookies 
				// await read_cookies(page);
				// handle the home page click
				await handle_home_page_click(browser);
				// scarp the ids of the with company names
				await handle_name_input(browser, name, true);
				// handle documents page
				res = await scrap_documents(browser, true);
				// if we got to get al the files
				if(res) resolve(res);
				else scrapingError++; // add error
				//}
				// save the cookies
				// let's close the browser
				console.log('closing browser...')
				//await browser.close();
				reject("too many errors");
		});

// setters and getting for saving the ids
const ids_output_file = 'mined_data/company_ids.json';
const save_ids = ids => write_json(ids, ids_output_file);
const get_ids = () => {
		let res =  read_json(ids_output_file);
		return res? res : [];
}
const ids = get_ids();
const save_id = id => {
		ids.push(id);
		save_ids(ids);
}
// extract id
const extract_id = url => url.split("param=")[1]

const handle_home_page_click = async browser => {
		let home_url = 'https://www.supercias.gob.ec/portalscvs/'
		//get page 
		let page = ( await browser.pages() )[0];
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
		await button.click();
		// select button
		// wait until request is rendered
		await waitUntilRequestDone(page, 500)
		// wait for a while
		while( (await browser.pages()).length  <= 1 )
				await page.mainFrame().waitForTimeout(100)
		// close page after being done
		await page.close()
}

/* scraps a id from a single company name */
const handle_name_input = async (browser, name, debug=false) => {
		// for page to load
		let page = ( await browser.pages() )[0];
		//console.log("getting radio element")
		await waitUntilRequestDone(page, 2000)
		// get the radion 
		let radio_el = await page.waitForXPath('//label[text()="Nombre"]/../input');
		// click on the name radio
		if(radio_el) await radio_el.click();
		else throw new Error('could not radion element')
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
		// get the url value 
		let url = page.url();
		// get ids 
		let id = extract_id(url);
		if( !id ) throw "Could not get id"
		// save id
		save_id({ company: name, id, url });
		// wait until page loads
		debuging && console.log("clicking on documents online")
		let document_button = ( await page.$x('//span[text()="Documentos Online"]/../..'))[0];
		// click the document
		await document_button.click();
		// wait for a while
		await waitUntilRequestDone(page, 2000)
		// wait until request is rendered
		while( (await browser.pages()).length  <= 1 )
				await page.mainFrame().waitForTimeout(100)
		// close page after being done
		await page.close()
}

/* scrap the documents */
const scrap_documents = async (browser, debuging=false) => {
		// get page
		//let page = ( await browser.pages() )[0];
		// wait until request is rendered
		//await waitUntilRequestDone(page, 100)
		// all get economic documents
		await scrap_economic_documents(browser, debuging);
		// wait
		await page.mainFrame().waitForTimeout(30000)

		return { res: true }
	}

const scrap_economic_documents = async (browser, debugging=false) => {
		let page = ( await browser.pages() )[0];
		if(page) console.log('got page in scrap_economic_documents')
		// get page
		let doc = {}; 
		// wai until page is done
		await waitUntilRequestDone(page, 1500)
		// get economic tabs 
		//let economic_tab = ( await page.$x('//span[text()="Documentos Económicos"]/../../../..'))[0];
		// select economic tab
		//await economic_tab.click()
		// get table 
		let tableBox = ( await page.$x('//div[@class="z-tabbox"]'))[0];
		// get all items
		let items = [ 
				...( await tableBox.$x('//tr[@class="z-listitem"]') ),
				...( await tableBox.$x('//tr[@class="z-listitem z-listbox-odd"]') ) 
		]
		
		if(items.length > 1){ 
				// if there is at least one element
				let elements = await items[0].$x('//td[@class="z-listcell"]');
				doc['expedient'] = await getText(elements[0])
				doc['description'] = await getText(elements[1])
				doc['date'] = await getText(elements[2])
				doc['button'] = elements[3]
				// click on document download
				await waitUntilRequestDone(page, 1000)
				await doc['button'].click()
				// wait until new page is open
				while( (await browser.pages()).length === 1 ) 
						await page.mainFrame().waitForTimeout(100)
				// switch tabs 
				//console.log(await browser.pages())
				page = (await browser.pages())[1];
				//console.log(page)
				
				await handle_id_input(page);
		}

		/*
		for( let item of items ){
				let elements = await item.$x('//td[@class="z-listcell"]');
				doc['expedient'] = await getText(elements[0])
				doc['description'] = await getText(elements[1])
				doc['date'] = await getText(elements[2])
				doc['button'] = elements[3]
//let doc_buttton = ( await item.$x('//td[@class="z-listcell"][4]'))[0];
				console.log('doc:', doc );
//await doc_buttton.click()
				await waitUntilRequestDone(page, 1000)
				await doc['button'].click()
		}
		*/
		
}

const handle_id_input = async (page, debuging) => {
		await waitUntilRequestDone(page, 1000)
		// handeling the inputting of id
		let ecuadorian_radio = await page.waitForXPath('//input[@type="radio"]');
		if(ecuadorian_radio){ 
				console.log("got ecuadorian radio")
				ecuadorian_radio.click()
		}
		await page.mainFrame().waitForTimeout(1000)
		// type the id
		let id_input = ( await page.$x('//input[@type="text"]') )[0];
		await id_input.type("0916576796", {delay: 10} )
		// press search 
		await page.mainFrame().waitForTimeout(1000)
		let submit_button = ( await page.$x('//span[@class="z-button"]') )[0];
		submit_button.click();
}


const timeoutAfter = timeout => {
  return new Promise((resolve, reject) => {
		setTimeout(() => reject(`${timeout}ms timer timed out`), timeout);
  });
};

export { scrap_company }
