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

const read_json = path => {
		try{
				let str = fs.readFileSync(path);
				return JSON.parse(str)
		}catch(e) {
				console.error('could not read file');
				return null
		}
}

const permutator = (string, length) => {
		let permutations = []
		// Generator object
		const gen = permsWithRepn(string, length);
		// Search without needing to generate whole set:
		let
		nxt = gen.next(),
				i = 0,
				alpha = nxt.value,
				psi = alpha;
		while (!nxt.done && 'crack' !== toLower(concat(nxt.value))) {
				psi = nxt.value;
				permutations.push(psi.join(""));
				nxt = gen.next();
				i++;
		}
		return permutations;
};
// PERMUTATION GENERATOR ------------------------------
// permsWithRepn :: [a] -> Int -> Generator [a]
function* permsWithRepn(xs, intGroup) {
		const
		vs = Array.from(xs),
				intBase = vs.length,
				intSet = Math.pow(intBase, intGroup);
		if (0 < intBase) {
				let index = 0;
				while (index < intSet) {
						const
						ds = unfoldr(
								v => 0 < v ? (() => {
										const rd = quotRem(v, intBase);
										return Just(Tuple(vs[rd[1]], rd[0]))
								})() : Nothing(),
								index++
						);
						yield replicate(
								intGroup - ds.length,
								vs[0]
						).concat(ds);
				};
		}
};
// GENERIC FUNCTIONS ----------------------------------
// Just :: a -> Maybe a
const Just = x => ({
		type: 'Maybe',
		Nothing: false,
		Just: x
});
// Nothing :: Maybe a
const Nothing = () => ({
		type: 'Maybe',
		Nothing: true,
});
// Tuple (,) :: a -> b -> (a, b)
const Tuple = (a, b) => ({
		type: 'Tuple',
		'0': a,
		'1': b,
		length: 2
});
// concat :: [[a]] -> [a]
// concat :: [String] -> String
const concat = xs =>
		0 < xs.length ? (() => {
				const unit = 'string' !== typeof xs[0] ? (
						[]
				) : '';
				return unit.concat.apply(unit, xs);
		})() : [];
// index (!!) :: [a] -> Int -> a
// index (!!) :: String -> Int -> Char
const index = (xs, i) => xs[i];
// quotRem :: Int -> Int -> (Int, Int)
const quotRem = (m, n) =>
		Tuple(Math.floor(m / n), m % n);
// replicate :: Int -> a -> [a]
const replicate = (n, x) =>
		Array.from({
				length: n
		}, () => x);
// show :: a -> String
const show = x => JSON.stringify(x);
// toLower :: String -> String
const toLower = s => s.toLocaleLowerCase();
// unfoldr(x => 0 !== x ? Just([x, x - 1]) : Nothing(), 10);
// --> [10,9,8,7,6,5,4,3,2,1]
// unfoldr :: (b -> Maybe (a, b)) -> b -> [a]
const unfoldr = (f, v) => {
		let
		xr = [v, v],
				xs = [];
		while (true) {
				const mb = f(xr[1]);
				if (mb.Nothing) {
						return xs
				} else {
						xr = mb.Just;
						xs.push(xr[0])
				}
		}
};



export { getText, permutator, read_json, write_json }
