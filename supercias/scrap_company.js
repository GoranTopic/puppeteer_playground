import waitUntilRequestDone from '../waitForNetworkIdle.js'
import debugging from '../options/debug.js'
import {
		home_page_url, 
		base_url_download,
		isAtHomePage, 
		isAtConsultaPrincipal,
		isAtCompanyDocumentsPage
} from '../urls.js';
import {
		getText, 
		read_json, 
		write_json, 
		save_cookies, 
		read_cookies, 
} from '../utils.js'
import fs from 'fs'

const scrap_company = ( browser, name ) => 
		new Promise( async (resolve, reject) => {
				console.log('name:', name)
				const maximum_tries = 2;
				let tries = 0
				let res;
				while(tries < maximum_tries){
						try{ 
								// handle the home page
								await home_page_state(browser);
								// scarp the ids of the with company names
								await input_name_state(browser, name);
								// handle documents page
								res = await company_documents_state(browser);
								// if we got to get all the files
								if(res) resolve(res);
								else tries++; // add erro
						}catch(e){
								// add tries
								tries++;
								// pinr error
								console.error(`caught error with ${tries} tries`);
								console.error(e);
								if(tries < maximum_tries) 
										console.log("trying again...");
								// if there is a page
								if( await browser.pages() ){
										// get page
										let page = (await browser.pages())[0];
										// wait is there is trafic
										await waitUntilRequestDone(page, 500)
										// wait for some secs
										await page.mainFrame().waitForTimeout(500)
								}
						}
				} // we did not resolve
				console.log(`Errored out with ${tries} tries`);
				// let's close the browser
				console.log('closing browser...')
				// await browser.close();
				reject( { name, error: "too many tries", } )
		});

const make_state = (condition, script) => 
		async (browser, name, debuging) => { 
				if(await condition(browser, debuging)) 
						await script(browser, name, debuging) 
		}

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

// script to handle the home page
const home_page_click_script = async browser => {
		//get page 
		let page = ( await browser.pages() )[0];
		// go to initial login page 
		await page.goto( home_page_url, // wait until the page is fully loaded
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
		const button = 
				await frame.waitForXPath('//span[text()="CONSULTA DE COMPAÑÍAS"]');
		// click on button to go to company consulatas
		await button.click();
		// select button
		// wait until request is rendered
		await waitUntilRequestDone(page, 1000)
		// wait for a while
		if( (await browser.pages()).length  <= 1 )
				throw new Error('new page did not open')
		// close page after being done
		await page.close()
}
// make home page condition
const home_page_condition = async browser => 
		// if it dow not have a page yet, and it is at null url
		( await browser.pages() ).length === 1 &&
				(( await browser.pages() )[0].url)
// make home handle state
const home_page_state =  make_state( 
		home_page_condition,
		home_page_click_script
)

/* scraps a id from a single company name */
const input_name_script = async (browser, name, debug=false) => {
		// for page to load
		let [ page ] = await browser.pages();
		//console.log("getting radio element")
		await waitUntilRequestDone(page, 2000)
		// get the radion 
		let radio_el = 
				await page.waitForXPath('//label[text()="Nombre"]/../input');
		// click on the name radio
		if(radio_el) await radio_el.click();
		else throw new Error('could not radion element')
		// until it loads the name
		debugging && console.log("getting text input")
		await waitUntilRequestDone(page, 1000)
		// get the main text input
		let text_input = ( 
				await page.$x("//span[text()='Parámetro']/../i/input")
		)[0];
		// get button element  
		debugging && console.log("getting search button")
		let search_button = (
				await page.$x("//td[text()='Buscar']/../../..")
		)[0];
		// type name of company
		debugging && console.log("typing name")
		await text_input.type(name, {delay: 10});
		await waitUntilRequestDone(page, 1000)
		// get from options
		await page.keyboard.press('ArrowLeft');
		// remove suggestion
		await page.keyboard.press('Enter');
		// wait until for a little
		await waitUntilRequestDone(page, 1000)
		// click seach button
		debugging && console.log("clicking search_button")
		await search_button.click({delay: 1});
		// wait until new page loads
		debugging && console.log("waiting for new page to load")
		await waitUntilRequestDone(page, 1000);
		// get the url value 
		let url = page.url();
		// get ids 
		let id = extract_id(url);
		if( !id ) throw "Could not get id"
		// save id
		save_id({ company: name, id, url });
		// wait until page loads
		debugging && console.log("clicking on documents online")
		let [ document_button ] =
				await page.$x('//span[text()="Documentos Online"]/../..');
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
// condition for entering input name state
const input_name_condition = async browser => 
		// if it dow not have a page yet, and the page is at consulta principal
		( await browser.pages() ).length === 1 &&
				isAtConsultaPrincipal(( await browser.pages() )[0])
// make state
const input_name_state = make_state( 
		input_name_condition,
		input_name_script
)
/* scrap the documents */
const company_documents_script = async (browser, debuging=false) => {
		// get page
		let [ page ] = await browser.pages();
		// wait until request is rendered
		await waitUntilRequestDone(page, 100)
		// all get economic documents
		await scrap_economic_documents(browser, debuging);
		// wait
		//await page.mainFrame().waitForTimeout(30000)

		//return { res: true }
}
//hande the economic tab
const scrap_economic_documents = async (browser) => {
		let [ page ] = await browser.pages();
		if(debugging && page) 
				console.log('got page in scrap_economic_documents')
		// get page
		let doc = {}; 
		// wai until page is done
		debugging && console.log('waitin for traffic to settle')
		await waitUntilRequestDone(page, 1500)
		// get economic tabs 
		//let economic_tab = 
		//( await page.$x('//span[text()="Documentos Económicos"]/../../../..'))[0];
		// select economic tab
		//await economic_tab.click()
		// get table 
		debugging && console.log('getting tableBox..');
		let [ tableBox ] = 
				await page.$x('//div[@class="z-listbox-body"]/table/tbody[2]/tr');
		// get all items
		let items = 
				await page.$x('//div[@class="z-listbox-body"]/table/tbody[2]/tr');
		//...( await tableBox.$x('/tr[@class="z-listitem"]') ),
		//...( await tableBox.$x('/tr[@class="z-listitem z-listbox-odd"]') ) 
		//]
		debugging && console.log(`got ${items.length} douments}`);
		if(items.length > 0){ 
				// if there is at least one element
				let elements = await items[3].$x('/td[@class="z-listcell"]');
				doc['expedient'] = await getText(elements[0])
				doc['description'] = await getText(elements[1])
				doc['date'] = await getText(elements[2])
				doc['button'] = elements[3]
				// click on document download
				debugging && console.log('got document')
				await waitUntilRequestDone(page, 1000)
				debugging && console.log('clicking on document donwload page')
				await doc['button'].click()
				// wait until new page is open
				await waitUntilRequestDone(page, 2000)
				// new page did not open
				if( (await browser.pages()).length === 1 ) 
						throw new Error('Did not open new page');
				//console.log(await browser.pages())
				// switch tabs 
				page = ( await browser.pages() )[1];
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
// handle the ecuadorian id input
const handle_id_input = async page => {
		if(page){
				console.log("got page in handle_id_input");
				//console.log(page)
		}else{
				console.log("did not get page on handle_id_input");
				console.log(page);
		}
		await waitUntilRequestDone(page, 2000)
		// handeling the inputting of id
		let [ ecuadorian_radio ] =
				await page.$x('//input[@type="radio"]');
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
		await submit_button.click();
		// download document
		await page.mainFrame().waitForTimeout(1000)
		await download_document(page);
}

const download_document = async page => {
		let [ iframe ] = await page.$x('//iframe');
		let pdf_url = await page.evaluate( iframe => iframe.src, iframe)
		//await page._client.send('Page.setDownloadBehavior', 
		//		{behavior: 'allow', downloadPath: '/home/telix/puppeteer_playground'}
		//);
		console.log('got filename:', pdf_url)
		/*
		await page.exposeFunction("writeABString", async (strbuf, targetFile) => {
				const str2ab = function _str2ab(str) { // Convert a UTF-8 String to an ArrayBuffer
						let buf = new ArrayBuffer(str.length); // 1 byte for each char
						let bufView = new Uint8Array(buf);
						for (let i=0, strLen=str.length; i < strLen; i++) {
								bufView[i] = str.charCodeAt(i);
						}
						return buf;
				}
				return new Promise((resolve, reject) => {
						// Convert the ArrayBuffer string back to an ArrayBufffer, which in turn is converted to a Buffer
						let buf = Buffer.from(str2ab(strbuf));
						// Try saving the file.        
						fs.writeFile(targetFile, buf, (err, text) => {
								if(err) reject(err);
								else resolve(targetFile);
						});
				});
		});
		// res
		let res = await page.evaluate( async () => { 
				function arrayBufferToString(buffer){ 
						// Convert an ArrayBuffer to an UTF-8 String
						var bufView = new Uint8Array(buffer);
						var length = bufView.length;
						var result = '';
						var addition = Math.pow(2,8)-1;
						for(var i = 0;i<length;i+=addition){
								if(i + addition > length){
										addition = length - i;
								}
								result += String.fromCharCode.apply(null, bufView.subarray(i,i+addition));
						}
						return result;
				}
				let [ iframe ] = await $x('//iframe')
				let geturl = iframe.src;
				return fetch(geturl, {
						credentials: 'same-origin', // usefull when we are logged into a website and want to send cookies
						responseType: 'arraybuffer', // get response as an ArrayBuffer
				})
						.then(response => response.arrayBuffer())
						.then( arrayBuffer => {
								var bufstring = arrayBufferToString(arrayBuffer);
								return window.writeABString(bufstring, '/home/telix/puppeteer_playground/somepdf.pdf');
						})
						.catch(function (error) {
								console.error('Request failed: ', error);
								return error;
						}); 
		});
		*/
		let res = await page.evaluate( async url => 
				await fetch(url, {
						method: 'GET',
						credentials: 'same-origin', // usefull when we are logged into a website and want to send cookies
						responseType: 'arraybuffer', // get response as an ArrayBuffer
				}).then(response => response.text()), 
				pdf_url 
		)
		console.log('res:', res);
		//const response = await page.goto(pdf);
		fs.writeFileSync('somepdf.pdf', res);
		/*
		const file = await page.evaluate(async pdf => {
				let res = await fetch( pdf, {
						method: 'GET',
						credentials: 'include'
				});
				return JSON.stringify(res);
		}, pdf );
		if(file){
				console.log('got file', file)
				let r = fs.writeFileSync("test.pdf", file);
				if(r) 
						console.log("The file was saved!");
				else 
						console.error('could not save file', r);
		}
		*/
}

// condition
const company_documents_condition = async browser => 
		// if it dow not have a page yet,
		// and the page is at compnay documents page
		( await browser.pages() ).length === 1 &&
				isAtCompanyDocumentsPage(( await browser.pages() )[0])
// state 
const company_documents_state = make_state( 
		company_documents_condition,
		company_documents_script
)

const timeoutAfter = timeout => {
  return new Promise((resolve, reject) => {
		setTimeout(() => reject(`timed out after ${timeout}ms`), timeout);
  });
};

export { scrap_company }
