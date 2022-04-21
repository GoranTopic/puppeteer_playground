import { get_permutations } from '../permutations.js'
import spanish_alphabet from '../resources/spanish_alphabet.js'
import waitUntilRequestDone from '../waitForNetworkIdle.js'
import { getText,
		read_json, write_json,
		save_cookies, read_cookies,
		replace_nonbreak_spaces } from '../utils.js'


const target_url = 'https://appscvsmovil.supercias.gob.ec/PortalInfor/consultaPrincipal.zul'
const company_names_filename = 'mined_data/company_names.json'

const scrap_random_company_names = async page => {
		/* this function get the auto complete values from when looking for */ 
		let company_names = create_company_names(),
				permutations = get_permutations(),
				new_names = []
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
		await page.mainFrame().waitForTimeout(1000)
		// get the main text input
		const text_input = (await page.$x("//span[text()='Parámetro']/../input"))[0];
		const real_text_input = (await page.$x("//span[text()='Parámetro']/../i/input"))[0];
		const text_input_ID = await (await real_text_input.getProperty('id')).jsonValue();
		// type in search bar 
		for (let permutation of permutations.permutations){
				for(let letter of permutation){
						// add a letter
						await text_input.type(letter, {delay: 100})
						// wati for al network to over;
						await waitUntilRequestDone(page, 500)
						// get companies names
						new_names = await get_company_names(page);
						// print to view
						console.log(new_names)
						// add them to the set
						new_names.forEach(name => company_names.add(name));
				}
				// save names
				write_json([ ...company_names], company_names_filename)
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
		names = names.map( name => {
				// remove extra space
				name = name.trim(); 
				// remove difrent space char
				name = replace_nonbreak_spaces(name);
				// return 
				return name
		});
		return names
}

const create_company_names = () => {
		/* if there is already some company_names file, don't make a new one */
		let array = read_json(company_names_filename)
		if(array) return new Set(array)
		return new Set()
		
}

// setters and getting
const last_rec_path = 'resources/generated/last_recursion.js'
const save_last_recursion = str => 
		write_json({ "last_rec" : str }, last_rec_path);
const get_last_recursion = () => {
		try{
				return read_json(last_rec_path)['last_rec'];
		}catch(e){
				return "0"
		}
}


const scrap_dfst_company_names = async (page, depth) => {
    /* this function scraps the name of the companie using a depth first search tree aproach */
    let company_names = create_company_names(),
        permutations = get_permutations(),
        last_recursion = get_last_recursion(),
        new_names = [],
        max_rec = 4
    // define recursive function
    const recursive_search = async (str="", depth=0) => {
        /* this is a recusrive function thath goes though all posible letter combination
         * based on the result that we find*/
        // if we have alread seach those
        //console.log('str:', str);
        //console.log('last_recursion:', last_recursion);
        // for every letter in the spanish alphabet
        for( let i = 0; i < spanish_alphabet.length; i++ ){
            let letter = spanish_alphabet.charAt(i);
            //console.log(`(${str + letter} < ${last_recursion} ):`, (str + letter < last_recursion ));
            if( str + letter < last_recursion ){
                while(letter < last_recursion.charAt(depth)){
                    letter = spanish_alphabet.charAt(i++)
                    console.log(`getting new letter: ${letter}`)
                }
            }
            // type letter
            await text_input.type(letter, {delay: 100})
            // wati for al network to over;
            await waitUntilRequestDone(page, 500)
            // see the result from new string
            new_names = await get_company_names(page);
            // print to view
            await waitUntilRequestDone(page, 500)
            console.log(`got this names with ${str+letter}`)
            console.log(new_names)
            // save names to the set
            new_names.forEach(name => company_names.add(name));
            // if there where few results
            if( new_names.length <= 1 ){
                // and the search string is very short
                if( (str + letter).length === 1 ){ 
                    //console.log('str:', str)
                    //console.log('letter:', letter)
                    //console.log('str+letter:', str+letter)
                    // there must be an error, ABORT
                    console.error(`Error, got ${new_names.length} company names, with string ${str}`)
                    throw 'NameScrapingError'
                }
                // delete added charated
                await page.keyboard.press('Backspace');
                await waitUntilRequestDone(page, 500)
                //console.log('few results found');
                //console.log('EXITING recusiton');
                return; // end recursion
            }else { // good amount of names
                // save names
                write_json([ ...company_names], 'mined_data/company_names.json');
                // continue recursion
                //console.log("ENTERING recusrion");
                //console.log('saving last recursion')
                save_last_recursion(str + letter)
                await recursive_search( str + letter, depth + 1 );
                await page.keyboard.press('Backspace');
                await waitUntilRequestDone(page, 500)
            }
        }
    }
    /* ---- start scraping proccess ---- */
    // go to target url
    await page.goto(target_url, { waitUntil: 'networkidle0', } );
    // wait until the page is fully loaded
    // get the radion name
    const name_radio = (await page.$x("//label[text()='Nombre']/../input"))[0];
    // click on the name radio
    if (name_radio)  await name_radio.click();
    // wait a second for page to load
    await waitUntilRequestDone(page, 1000)
    // get the main text input
    const text_input = (await page.$x("//span[text()='Parámetro']/../input"))[0];
    const real_text_input = (await page.$x("//span[text()='Parámetro']/../i/input"))[0];
    const text_input_ID = await (await real_text_input.getProperty('id')).jsonValue();
    // start recursive search
    await recursive_search();
    // take screen shot
    await page.screenshot({
        path: "./screenshot.png",
        fullPage: true
    });
    return company_names;
}

export { scrap_random_company_names, scrap_dfst_company_names }
