import { ProxyRotator } from './proxies.js'
import { read_json } from './utils.js';



const create_process = async ( index, names, proxy, retries = 0 ) => {
		let name = names[index];
		return { 
				proxy: proxy,
				index: index,
				name: name,
				retries: retries,
				// warp the promise ins querable layer
				promise: MakeQueryablePromise( 
						// make promise
						new Promise( async ( resolve, reject ) => {
								let timeout_base = 10000
								console.log(`created Promise ${name}`);
								setTimeout( () =>{
										if( Math.random > 0.5 ) resolve({ company: name })
										else reject("could not get all data")
										console.log(`promise ${name} done`)
								}, timeout_base * Math.random());
						})
				)
		}
}

function MakeQueryablePromise(promise) {
		// Don't create a wrapper for promises that can already be queried.
		if (promise.isResolved) return promise;
    var isResolved = false;
    var isRejected = false;
    // Observe the promise, saving the fulfillment in a closure scope.
    var result = promise.then(
       function(v) { isResolved = true; return v; }, 
       function(e) { isRejected = true; throw e; });
    result.isFulfilled = function() { return isResolved || isRejected; };
    result.isResolved = function() { return isResolved; }
    result.isRejected = function() { return isRejected; }
    return result;
}


// setters and getting for saving the checklist
const checklist_filename = 'mined_data/dummy_checklist.json';
const save_checklist = checklist => write_json(checklist, checklist_filename);
const get_checklist = () => read_json(checklist_filename) ?? [];

// start and check integiry of the missing items
const check_bummy_integrity = (names, checklist) => {
		let missing = [];
		let checklist = Array(names.length).fill(null);
		// for every name
		names.forEach( ( name, index ) => { 
				// check if it is checklist 
				if(checklist.includes(name)) checklist[i] = name;
				// save index as missing
				else missing.push(index) 
		})
}



async function main(){
		let concorrent_browsers = 5;
		let proxy_r = new ProxyRotator();
		let checklist = get_checklist();
		let names = read_json('./mined_data/company_names.json');
		let [ missing, checklist ] = check_bummy_integrity(names, checklist)
		save_checklist(checklist);
		// promises container
		let processes = Array(concorrent_browsers).fill({
				proxy: null,
				name: null,
				index: null,
				promise: null,
		});
		
		// create promises
		while(missing){ // while we still have files
				// check all processes
				for( let process of processes ){
						// if there is no process active
						if(process.name === null){
								process = create_process(names, missing.shift(), proxy_r.next())
						}else if(process.promise.isRejected) {
						}else if(process.promise.isResolved) {
						}
				}
		}

						create_promise(
								missing_gen, 
								proxy_r
						).then( company => { // if the scrap was successfull
								// add to checklist
								company.name
								// save checklist
								// set proxy as alive
								// start new promise and add it to the same spot in out promise array: promise[i]
						}).catch( error => {
								console.error(error)
								// if there was an error
								// put back into the missing, at front
								// set proxy as dead
								// make new promise
						})
				);
		}
}


main();

