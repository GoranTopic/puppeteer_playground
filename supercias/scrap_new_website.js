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
		
// setters and getting for saving the ids
const ids_output_file = 'mined_data/company_ids.json';
const save_ids = ids => write_json(ids, ids_output_file);
const get_ids = () => {
		let res =  read_json(ids_output_file);
		return res? res : [];
}

// extract id
const extract_id = url => url.split("param=")[1]


// time out function 
const timeoutAfter = timeout => {
  return new Promise((resolve, reject) => {
		setTimeout(() => reject(`timed out after ${timeout}ms`), timeout);
  });
};

export { scrap_company }
