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
		let errored = [];
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
								// create new promise if there was no process to be found, create it 
								process = create_process(names, missing.shift(), proxy_r.next())
						}else if(process.promise.isRejected) {
								// if there was an error
								// set proxy as dead
								proxy_r.setDead(process.proxy);
								// if there have been many tries before
								if(process.retries > error_max){
										// set new missing value to errored
										errored.push(process.index);
										// make new process with a new missing value and new proxy
										process = create_process(names, missing.shift(), proxy_r.next())
								}else
										// make new promise with same missing value and new proxy +1 tried  
										let tries = process.tried + 1;
										process = create_process(
												names, process.index, proxy_r.next(), process.tried + 1 
										)
						}else if(process.promise.isResolved) {
								// if it was successfull
								// set proxy as alive
								proxy_r.setAlive(process.proxy);
								// get result from promise
								let result = process.promise.isResolved;
								// mark name to checklist at index
								checklist[i] = result.company;
								// save checklist( )
								save_checklist(checklist);
								// make new process with next missing value and next proxy
								process = create_process(names, missing.shift(), proxy_r.next())
						}
				}
		}
}


main();

