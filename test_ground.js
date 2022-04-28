import { ProxyRotator } from './proxies.js'
import { read_json, write_json } from './utils.js';


class PromiseEngine {
		constructor(concorrent_promises){
				this.concorrent_promises = concorrent_promises;
				this.stopFunction = this.stopFunction;
				this.halt = false;
				this.promises = Array(concorrent_promises).fill(null);
				this.promiseArray = null;
				this.promiseGen = null;
				this.stopFunction = null;
				this.fulfillmentCB = null;
				this.rejectionCB = null;
				this.resolvedCB = null;
		}

		// setters
		setStopFunction = stopFunction =>
				this.stopFunction = stopFunction 
		setPromiseList =  promiseArray  => 
				this.promiseArray = promiseArray;
		setPromiseGen =  promiseGen  => 
				this.promiseGen = promiseGen;
		whenFulfilled = fulfillmentCB => 
				this.fulfillment = fulfillmentCB
		whenRejected = rejectionCB => 
				this.rejectionCB = rejectionCB
		whenResolved = resolvedCB => 
				this.resolvedCB = resolvedCB

		_getNewPromise(){
				let newPromise = null;
				if(this.promiseArray){
						if(this.promiseArray.length === 0.){
								this.halt = true;
								throw  new Error('list has no more values')
						}else 
								newPromise = this.promiseArray.shift();
				}else if(this.promiseGen){
						let next =  this.promiseGen.next();
						if(next.done){
								this.halt = true;
								throw new Error('promise generator reached it end')
						}else 
								newPromise = next.value;
				}else throw new Error('most set a promise source')
				if(newPromise === null) throw new Error('could not get new promise')
				else return newPromise;
		}
		
		_promiseMonitor(promise) {
				/* promise wrapper for promise, a promise condom, if you will... */
				// Don't create a wrapper for promises that can already be queried.
				if (promise.isResolved) return promise;
				var isResolved = false;
				var isRejected = false;
				var value = null;
				// Observe the promise, saving the fulfillment in a closure scope.
				var result = promise.then(
						function(v) { isResolved = true; value = v; return v; }, 
						function(e) { isRejected = true; throw e; }
				);
				// getters
				result.getValue = function() { return value };
				result.isFulfilled = function() { return isResolved || isRejected; };
				result.isResolved = function() { return isResolved; }
				result.isRejected = function() { return isRejected; }
				return result;
		}

		async start(){
				let result;
				// promises container
				this.promises = Array(this.concorrent_promises).fill(null);
				// create promises
				for( let i = 0; i < this.promises.length; i++ )
						this.promises[i] = this._promiseMonitor( this._getNewPromise() )
				//if no stop function as been set run forever 
				if(this.stopFunction === null) this.stopFunction = () => false;
				// start the loop
				while( !this.halt){
						// check all processes
						await Promise.allSettled( this.promises )
								.then(() => { 
										try{ // if all all have settled
												// if there is no process active
												for( let i = 0; i < this.promises.length; i++ ){
														// for every every processes
														if(this.promises[i].isResolved()){
																// set new promise to none
																let newPromise = null;
																// if the promise has been resolved
																if(this.resolvedCB) //if ther is a reolve cb
																		// run it
																		newPromise = this.resolvedCB( this.promises[i].getValue() ); 
																// add it as a new promise
																// if promise if rejected
																if(this.promises[i].isRejected()){
																		// if there was an error
																		if(this.rejectionCB) 
																				// if a new promise has been returned
																				newPromise = this.rejectionCB( this.promises[i].getValue() );
																		// if it was successfull
																}else if(this.promises[i].isFulfilled()){
																		if(this.fulfillmentCB)
																				// if a new promise has been returned
																				newPromise = this.fulfillmentCB( this.promises[i].getValue() );
																}
																// if no new promise has been set 
																if(this.stopFunction()) return // check stop function
																if(newPromise) // if new promise has been passed
																		this.promises[i] = this._promiseMonitor(newPromise);
																else // get new one
																		this.promises[i] = this._promiseMonitor( this._getNewPromise() );
														}
												}
										}catch(e){
												console.error(e);
												this.halt = true;
												return null;
										}
								})
						// run stop function
						//if(this.stopFunction()) this.halt = true; 
				}
		}
}



async function main(){

		// create timeout process
		const create_timeout_process = ( names, missing_index, proxy, retries = 0 ) => {
				let timeout_base = 1000
				let name = names[missing_index];
				let index = missing_index;
				return new Promise( async ( resolve, reject ) => {
						// make promise
						console.log(`created Promise ${name}`);
						setTimeout( () =>{
								console.log(`promise ${name} done`)
								if( Math.random() > 0.2 )
										resolve({ name, index, proxy, retries, })
								else reject({ name, index, proxy, retries,
										error: "flip coin falied",
								})
						}, timeout_base * Math.random() );
				})
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

		let engine = new PromiseEngine(1);
		let proxy_r = new ProxyRotator();
		let checklist = get_checklist();
		let names = read_json('./mined_data/company_names.json');
		let error_max = 5;
		let missing_indexes = [];
		let errored_indexes = [];
		// get missing and check integrity
		[ missing_indexes, checklist ] = check_bummy_integrity(names, checklist)
		// saved checked list
		save_checklist(checklist);

		function* processGen(){
				/* generate new processes */
				if( missing_indexes.length <= 0 ) return null;
				else yield create_timeout_process(names, missing_indexes.shift(), proxy_r.next())
		}

		const isResolved_callback = result => 
				console.log(`promise: ${result.name} it is resolved`);
		

		const isRejected_callback = result => {
				// if there was an error
				console.error("isRejected", result.error);
				// set proxy as dead
				proxy_r.setDead(result.proxy);
				// if there have been many tries before
				if(result.retries > error_max){
						// set new missing value to errored
						errored_indexes.push(result.index);
				}else // same missing value, new proxy, +1 tried  
						return create_timeout_process(
								names, result.index, proxy_r.next(), result.retries + 1 
						)
		}

		const stopFunction = () => {
				if(missing_indexes.length > 0) return false
				else return true
		}

		const isFulfilled_callback = result => {
				// if it was successfull
				console.log("isFulfilled")
				// set proxy as alive
				proxy_r.setAlive(result.proxy);
				// mark name to checklist at index
				if(result === null) throw "result is null"
				checklist[i] = result.name;
				// save checklist( )
				save_checklist(checklist);
		}

		let gen = processGen();
		// set promise generator
		engine.setPromiseGen(gen);
		//set stop function
		engine.setStopFunction(stopFunction);
		// set call backs 
		engine.whenRejected(isRejected_callback);
		engine.whenFulfilled(isFulfilled_callback);
		engine.whenResolved(isResolved_callback);
		// start
		await engine.start();
		//console.log(gen.next())
		//console.log(gen.next())
		//console.log(gen.next())
		//console.log(gen.next())
}


main();

