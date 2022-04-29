import { ProxyRotator } from './proxies.js'
import { read_json, write_json } from './utils.js';
import PromiseEngine from './PromiseEngine.js';

// create timeout process
const create_timeout_promise = async ( names, missing_index, proxy, retries = 0 ) => {
		let timeout_base = 10
		let name = names[missing_index];
		let index = missing_index;
		//console.log( 'created proomise:', { name, index, proxy, retries, } )
		if(name) 
				return new Promise( async ( resolve, reject ) => 
						// make promise
						setTimeout( () => {
								if( Math.random() < 0.2 ) resolve({ name, index, proxy, retries, })
								else reject({ name, index, proxy, retries, error: "coin flip falied", })
						}, timeout_base * Math.random() )
				).catch(e => { throw e })
}

// setters and getting for saving the checklist
const checklist_filename = 'mined_data/dummy_checklist.json';
const save_checklist = checklist => write_json(checklist, checklist_filename);
const get_checklist = () => read_json(checklist_filename) ?? [];

// start and check integiry of the missing items
const check_bummy_integrity = (names, checklist) => {
		let missing = [];
		let table = Array(names.length).fill(null);
		// for every name
		names.forEach( ( name, index ) => { 
				// check if it is checklist 
				if(checklist.includes(name)) table[index] = name;
				// save index as missing
				else missing.push(index);
		})
		return [ missing, table ];
}


async function main(){
		let engine = new PromiseEngine(1);
		let proxy_r = new ProxyRotator();
		let checklist = get_checklist();
		let names = read_json('./mined_data/company_names_sample.json');
		let error_max = 5;
		let missing_indexes = [];
		let errored_indexes = [];
		// get missing and check integrity
		[ missing_indexes, checklist ] = check_bummy_integrity(names, checklist)
		console.log(missing_indexes);
		// saved checked list
		save_checklist(checklist);

		const isResolved_callback = result => 
				console.log(`resolved: ${result.index}`);

		const isRejected_callback = result => {
				// if there was an error
				console.log(errored_indexes);
				console.log(`rejected: ${result.name}.\n   retries: ${result.retries} with error: ${result.error}`);
				// set proxy as dead
				proxy_r.setDead(result.proxy);
				// if there have been many tries before
				if(result.retries > error_max){
						// set new missing value to errored
						errored_indexes.push(result.index);
				}else // same missing value, new proxy, +1 tried  
						return create_timeout_promise(
								names, result.index, proxy_r.next(), result.retries + 1 
						)
		}

		const stopFunction = () => {
				if(missing_indexes.length === 0) return true
				else return false
		}

		const isFulfilled_callback = result => {
				// if it was successfull
				console.log(`fulfilled: ${result.name}: returned: ${result}`);
				// set proxy as alive
				proxy_r.setAlive(result.proxy);
				// mark name to checklist at index
				if(result === null) throw new Error("result is null")
				checklist[result.index] = result.name;
				// save checklist
				save_checklist(checklist);
		}

		//let gen = processGen();
		// set promise generator
		//engine.setPromiseGen(gen);
		engine.setNextPromise( () => 
				create_timeout_promise(
						names, missing_indexes.shift(), proxy_r.next()
				)
		);
		//set stop function
		engine.setStopFunction(stopFunction);
		// set call backs 
		engine.whenRejected(isRejected_callback);
		engine.whenFulfilled(isFulfilled_callback);
		//engine.whenResolved(isResolved_callback);
		// start
		await engine.start();
}


main();

