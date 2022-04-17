import { PendingXHR } from 'pending-xhr-puppeteer'
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
				write_json({ chars, length, permutations }, perm_filename)
		}
		/* ---- start scraping proccess ---- */
		// go to target url
		const pendingXHR = new PendingXHR(page);
		await page.goto(target_url, {
				waitUntil: 'networkidle0', // wait until the page is fully loaded
		});

		/*
		const payload = { 
				dtid: 'z_8q90',
				cmd_0: 'onChanging',
				opt_0: 'i',
				uuid_0: 'xZ2Yp',
				data_0: { 
						"value": "j",
						"start": 1
				}
		}	
		await gotoExtended(page, { 
				url: 'https://appscvsmovil.supercias.gob.ec/PortalInfor/zkau', 
				method: 'POST', 
				postData: JSON.stringify(payload), 
				headers 
		});
		*/
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

		await text_input.type(permutations.permutations[0], {delay: 100})
		// wait
		//await pendingXHR.waitForAllXhrFinished();
		await waitForNetworkIdle(page, 2000)
		// take screen shot
		//await page.evaluate( id => document.getElementById(id).value = "something" , text_input_ID )

		await page.$eval('#'+ text_input_ID, el => {
				console.log("is this even running?"),
				el.value = 'test@example.com'
		});

		await page.waitFor(2000)

		await page.screenshot({                      
				path: "./screenshot.png",               
				fullPage: true                           
		});

		return company_names;
}

async function gotoExtended(page, request) {
		const { url, method, headers, postData } = request;
    if (method !== 'GET' || postData || headers) {
        let wasCalled = false;
        await page.setRequestInterception(true);
        const interceptRequestHandler = async (request) => {
            try {
                if (wasCalled) {
                    return await request.continue();
                }
                wasCalled = true;
                const requestParams = {};
                if (method !== 'GET') requestParams.method = method;
                if (postData) requestParams.postData = postData;
                if (headers) requestParams.headers = headers;
                await request.continue(requestParams);
                await page.setRequestInterception(false);
            } catch (error) {
                log.debug('Error while request interception', { error });
            }
        };
        await page.on('request', interceptRequestHandler);
    }
    return page.goto(url);
}


export { scrap_company_names }
