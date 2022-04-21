import { get_permutations } from '../permutations.js'
import waitUntilRequestDone from '../waitForNetworkIdle.js'
import { getText, read_json, write_json, save_cookies, read_cookies, } from '../utils.js'

const scrap_companies = async page => {
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
		await page.mainFrame().waitForTimeout(1000)
		// get the main text input
		const text_input = ( await page.$x("//span[text()='Parámetro']/../input") )[0];
		const real_text_input = ( await page.$x("//span[text()='Parámetro']/../i/input") )[0];
		const text_input_ID = await (await real_text_input.getProperty('id')).jsonValue();
		// get button element  
		const search_button = ( await page.$x("//td[text()='Buscar']/../../.."))[0];
		//for( let name of names){
		//type name of company
		for( let letter of names[3] ){
				await real_text_input.type(letter, {delay: 200})
				await waitUntilRequestDone(page, 500)
				console.log(letter);
				if(letter === String.fromCharCode(160))
						console.log('it is nonbreaking space')
		}
		//await text_input.type(names[0], {delay: 10})
		// click search 
		search_button.click()
		// wait after button is pressed
		
		// take screen shot
		await page.screenshot({
				path: "./screenshot.png",
				fullPage: true           
		});
		return null;
}

export default scrap_companies
