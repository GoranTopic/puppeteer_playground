import { permutator, read_json, write_json } from './utils.js'
import spanish_alphbet from './resources/spanish_alphabet.js'


const get_autocomplete_company_names = async Browser => {
		/* this function get the auto complete values from when looking for */ 
		let company_names = new Set(),
				target_url = 'https://appscvsmovil.supercias.gob.ec/PortalInfor/consultaPrincipal.zul',
				perm_filename = './resources/data/spanish_permutations.json',
				chars = spanish_alphbet,
				length = 5, /// max number without running out of heap space the program, 
				permutations // might have to try with python
		// try to read permutations file
		permutations = read_json(perm_filename);
		// if something has changed ot not found
		if(permutations === null || permutations.length !== length || permutations.chars !== chars){
				// generate new permutations file 
				console.log('generating permutations...')
				permutations = permutator(chars, length)
				console.log(`permutations done.\n${permutations.length} permutations generated`)
				console.log('saving permutations...')
				write_json({ chars, length, permutations }, perm_filename)
		}
		// start scraping proccess


		return company_names;
}

export { get_autocomplete_company_names }
