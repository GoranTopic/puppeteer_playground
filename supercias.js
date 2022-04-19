import { get_permutations } from './permutations.js'
import waitUntilRequestDone from './waitForNetworkIdle.js'
import { getText, read_json, write_json, save_cookies, read_cookies, } from './utils.js'

const scrap_company_names = async page => {
		/* this function get the auto complete values from when looking for */ 
		let company_names = new Set(),
				new_names = [],
				target_url = 'https://appscvsmovil.supercias.gob.ec/PortalInfor/consultaPrincipal.zul',
				permutations = get_permutations()
		/* ---- start scraping proccess ---- */
		// go to target url
		await page.goto(target_url, 
				{ waitUntil: 'networkidle0', } // wait until the page is fully loaded
		);
		// get the radion name
		const name_radio = (await page.$x("//label[text()='Nombre']/../input"))[0];
		// click on the name radio
		if (name_radio)  await name_radio.click();
		// wait a second for page to load
		await page.waitFor(1000)
		// get the main text input
		const text_input = (await page.$x("//span[text()='Parámetro']/../input"))[0];
		const real_text_input = (await page.$x("//span[text()='Parámetro']/../i/input"))[0];
		const text_input_ID = await (await real_text_input.getProperty('id')).jsonValue();
		console.log('input_id:', text_input_ID);
		// type in search bar 
		for (let permutation of permutations.permutations){
				for(let letter of permutation){
						// add a letter
						await text_input.type(letter, {delay: 100})
						// wati for al networ to tover;
						await waitUntilRequestDone(page, 500)
						// get companies names
						new_names = await get_company_names(page);
						// add them to the set
						console.log(new_names)
						new_names.forEach(name => company_names.add(name));
				}
				// save names
				write_json([ ...company_names], './resources/data/company_names.json')
				// clear text input
				await page.$eval( '#'+ text_input_ID, input => input.value = "" );
		}
		// take screen shot
		await page.screenshot({
				path: "./screenshot.png",
				fullPage: true
		});
		return company_names;
}

const get_company_names = async page => {
	/* get all the compnay name if they are found*/	
		// get the elements
		let elements = await page.$x('/html/body/div[2]//td[2]')
		// get the text content
		let names = await getText(elements)
		//trim n' preen
		names = names.map( name => name.trim() );
		return names
}


const get_compnay_ID = async page => {
		// go to target url
		let names = read_json('./resources/data/company_names.json');
		let target_url = 'https://appscvsmovil.supercias.gob.ec/PortalInfor/consultaPrincipal.zul'
		await page.goto( target_url, // wait until the page is fully loaded
				{ waitUntil: 'networkidle0', }
		);
		//radio name button selector
		const radio_selector = '//label[text()="Nombre"]/../input'
		// get the radion 
		const radio_el = (await page.$x(radio_selector))[0];
		// click on the name radio
		if (radio_el) await radio_el.click();
		// until it loads the name
		await page.waitFor(1000) 
		// get the main text input
		const text_input = ( await page.$x("//span[text()='Parámetro']/../input") )[0];
		const real_text_input = ( await page.$x("//span[text()='Parámetro']/../i/input") )[0];
		const text_input_ID = await (await real_text_input.getProperty('id')).jsonValue();

		// get button element  
		const search_button = ( await page.$x("//td[text()='Buscar']/../../.."))[0];
		//for( let name of names){
		//type name of company
		await text_input.type(names[0], {delay: 10})
		// click search 
		search_button.click()
		//}
		
		// take screen shot
		await page.screenshot({
				path: "./screenshot.png",
				fullPage: true           
		});
		return null;
}

export { scrap_company_names, get_compnay_ID }
