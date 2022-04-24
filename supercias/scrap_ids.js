import { get_permutations } from '../permutations.js'
import waitUntilRequestDone from '../waitForNetworkIdle.js'
import { getText, read_json, write_json, save_cookies, read_cookies, } from '../utils.js'


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


// setters and getting for saving state
const state_filename = 'resources/generated/id_scarp_state.js'
const save_last_name_index = num => 
		write_json({ "last_name" : num }, state_filename);
const get_last_name_index = () => {
		try{
				return parseInt(read_json(state_filename)['last_name']);
		}catch(e){
				return "0"
		}
}

const ids_output_file = 'mined_data/company_ids.json';
const save_ids = ids => write_json(ids, ids_output_file);
const get_ids = () => {
		let res =  read_json(ids_output_file);
		return res? res : [];
}

const scrap_ids = async page => {
		/* scrap ids */
		let names = read_json('mined_data/company_names.json'),
				state_index = get_last_name_index(),
				ids = get_ids(),
				search_button,
				text_input,
				radio_el,
				url,
				id,
				backButton;
		// for every company names
		try{ // catch all
				for( let i = state_index; i < names.length; i++){ 
						// get the radion 
						radio_el = await page.waitForXPath('//label[text()="Nombre"]/../input');
						// click on the name radio
						if (radio_el) await radio_el.click();
						// until it loads the name
						await page.mainFrame().waitForTimeout(1000)
						// wait
						await waitUntilRequestDone(page, 1000)
						// get the main text input
						text_input = ( await page.$x("//span[text()='Parámetro']/../i/input") )[0];
						// get button element  
						search_button = ( await page.$x("//td[text()='Buscar']/../../.."))[0];
						// type name of company
						await text_input.type(names[i], {delay: 100});
						// wait until for a little
						await waitUntilRequestDone(page, 1000)
						// click seach button
						await search_button.click();
						// wait until new page loads
						await waitUntilRequestDone(page, 500);
						// get the url value 
						url = page.url();
						// if  something whent wrong
						if(url === "https://appscvsmovil.supercias.gob.ec/PortalInfor/consultaPrincipal.zul?id=1")
								throw "Could not get url"
						// get ids - TODO
						id = url.split("=")[1];
						console.log("page url", url);
						console.log(`${i}/${names.length}`);
						// push to list
						ids.push({ company: names[i], id, url });
						// save colected ids
						save_ids(ids);
						// save the name index
						save_last_name_index(i);
						// get back button 
						backButton = ( await page.$x('//span[@class="z-button"]'))[0];
						//console.log('backButton:', backButton);
						// go back
						await backButton.click();
						// wait until page loads
						await waitUntilRequestDone(page, 1000);
				}
		}catch(e){
				console.error("something whent wrong!", e);
				return false
		}
		conosle.log("done!")
		return true
}

export { scrap_ids, handle_home_page_click }
