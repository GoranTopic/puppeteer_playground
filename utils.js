async function getText(elementHandler){
		/* this function make my life easier by just printin the txt content of a elementHandler */
		const handleElement = async element => {
				if( elementHandler.constructor.name === 'ElementHandle' ){
						const textContent  = await elementHandler.getProperty('textContent');
						return await textContent.jsonValue();
				}else{
						console.error(`getText: got instance of ${elementHandler.constructor.name} instead of ElementHandle`)
						return null
				}
		}
		if( handleElement instanceof Array ){ // handle multiple elements
				let string = "";
				for( let element of elementHandler)
						string += await handleElement(element)
				return string;
		}else // handle one element
				return await handleElement(elementHandler);
}




export { getText }
