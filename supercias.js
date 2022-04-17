import { 
		getText,
		permutator,
		read_json,
		write_json,
		shuffle,
		save_cookies,
		read_cookies,
		waitForNetworkIdle,
} from './utils.js'
import spanish_alphbet from './resources/spanish_alphabet.js'


const scrap_company_names = async page => {
		/* this function get the auto complete values from when looking for */ 
		let company_names = new Set(),
				new_names = [],
				target_url = 'https://appscvsmovil.supercias.gob.ec/PortalInfor/consultaPrincipal.zul',
				perm_filename = './resources/data/spanish_permutations.json',
				chars = spanish_alphbet,
				length = 5, /// max number without running out of heap space,
				permutations // might have to try with python
		// try to read permutations file
		permutations = read_json(perm_filename);
		// if something has changed ot not found
		if(permutations === null || permutations.length !== length || permutations.chars !== chars){
				// generate new permutations file 
				console.log('generating permutations...')
				permutations = permutator(chars, length);
				permutations = shuffle(permutations);
				console.log(`permutations done.\n${permutations.length} permutations generated`)
				console.log('saving permutations...')
				permutations = { chars, length, permutations };
				write_json(permutations, perm_filename)
		}
		/* ---- start scraping proccess ---- */
		// go to target url
		await page.goto(target_url, {
				waitUntil: 'networkidle0', // wait until the page is fully loaded
		});
		// get the radion name
		const name_radio = (await page.$x("//label[text()='Nombre']/../input"))[0];
		if (name_radio)  // click on the name radio
				await name_radio.click();
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
						await text_input.type(letter, {delay: 200})
						// wati for al networ to tover;
						await waitForNetworkIdle(page, 1000)
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


export { scrap_company_names }
