async function getText(elementHandler){
		/* this function make my life easier by just printin the txt content of a elementHandler */
		const handleElement = async element => {
				//console.log('name:', element.constructor.name)
				if( element.constructor.name === 'ElementHandle' ){
						const textContent  = await element.getProperty('textContent');
						return await textContent.jsonValue();
				}else{
						console.error(`getText: got instance of ${element.constructor.name} instead of ElementHandle`)
						return null
				}
		}
		if( elementHandler instanceof Array ){ // handle multiple elements
				let string = "";
				for(let i = 0; i < elementHandler.length; i++){
						//console.log(elementHandler[i])
						string += await handleElement(elementHandler[i])
				}
				return string;
		}else{ // handle one element
				console.log('this ran')
				return await handleElement(elementHandler);
		}
}




export { getText }
