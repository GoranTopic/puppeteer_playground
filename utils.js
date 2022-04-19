import fs from 'fs'

async function getText(elementHandler){
		/* this function make my life easier by just printin the txt content of a elementHandler */
		const handleElement = async element => {
				//console.log('name:', element.constructor.name)
				if( element.constructor.name === 'ElementHandle' ){
						const textContent  = await element.getProperty('textContent');
						return await textContent.jsonValue();
				}else{
						console.error(`getText: got instance of ${element.constructor.name}
								instead of ElementHandle`)
						return null
				}
		}
		if( elementHandler instanceof Array ){ // handle multiple elements
				let strings = []; // if it is a array of ElementHandle
				for(let i = 0; i < elementHandler.length; i++)
						strings.push( await handleElement(elementHandler[i]) )
				return strings; // return array of strings
		}else // handle just one element
				return await handleElement(elementHandler);
}


const write_json = (obj, path) => {
		try{
				let str = JSON.stringify(obj)
				fs.writeFileSync(path, str);
				return true
		}catch(e) {
				console.error('could not write file');
				console.error(e)
				return false
		}
}

const cookies_filename = 'cookie-jar.json'
// cookie file
const save_cookies = async page =>{
		/* this function save from the browser */
		try{
				const cookies = await page.cookies();
				const cookieJson = JSON.stringify(cookies);
				fs.writeFileSync(cookies_filename, cookieJson);
				return true
		}catch(e) {
				console.error('could not write cookies');
				console.error(e)
				return false
		}
}

const read_cookies = async page => {
		/* this function save from the browser */
		try{
				const cookies = fs.readFileSync(cookies_filename, 'utf8');
				const deserializedCookies = JSON.parse(cookies);
				await page.setCookie(...deserializedCookies);
		}catch(e) {
				console.error('could not read cookies');
				return null
		}
	}

const read_json = path => {
		try{
				let str = fs.readFileSync(path);
				return JSON.parse(str)
		}catch(e) {
				console.error('could not read file');
				return null
		}
}

export { getText, read_json, write_json, save_cookies, read_cookies }
