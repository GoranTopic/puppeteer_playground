import { ProxyRotator } from './proxies.js'
import { read_json } form './utils';

const create_promise = async ( name, timeout ) => 
		new Promise( async ( resolve, reject ) => {
				console.log(`created Promise ${name}`);
				setTimeout( () => console.log(`promise ${name}`), timeout);
		});



async function main(){
		let pr = new ProxyRotator();
		let names = read_json('./mined_data/company_names.json');
		let number_of_promises = 5;
		let promises = [];
		Array(number_of_promises).fill().forEach( () => { 
				// something 
				promises.push(create_promise)

				
		});



}
main();

