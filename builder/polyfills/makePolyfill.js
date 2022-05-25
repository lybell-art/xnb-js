const HELPERS = "__polyfiller__.js";
const HELPERS_CODE = `
function __repeatConcat(str, num)
{
	if(!!str && typeof str.repeat === "function") return str.repeat(num);
	if(typeof str === "string")
	{
		var result="";
		for(var i=0; i<num; i++)
		{
			result+=str;
		}
		return result;
	}
	if (str instanceof Array)
	{
		var result=[];
		for(var i=0; i<num; i++)
		{
			result.concat(str);
		}
		return result;
	}
	throw new Error("Invalid Data!");
}

function __includes(str, token)
{
	if(!!str && typeof str.includes === "function") return str.includes(token);
	return str.indexOf(token) !== -1;
}

function __startsWithString(str, token)
{
	if(!!str && typeof str.startsWith === "function") return str.startsWith(token);
	if(typeof str !== "string" || typeof token !== "string") throw new Error("Invalid Data!");
	var regexp = new RegExp("^"+token);
	return regexp.test(str);
}

function __endsWithString(str, token)
{
	if(typeof str.endsWith === "function") return str.endsWith(token);
	if(typeof str !== "string" || typeof token !== "string") throw new Error("Invalid Data!");
	var regexp = new RegExp(token+"$");
	return regexp.test(str);
}

function __arrayMaker(obj, func)
{
	if(!obj || typeof obj !== "object") throw new Error("Invalid Data!");
	var result=[];
	var length = obj.length;
	for(var i=0; i<length; i++)
	{
		result[i] = func(obj[i], i);
	}
	return result;
}

function __trunc(number)
{
	if(number < 0) return Math.ceil(number);
	return Math.floor(number);
}

const __promise_allSettled = Promise.allSettled !== undefined ? Promise.allSettled.bind(Promise) : function (promises) {
	let mappedPromises = promises.map(p => {
		return p.then(value => {
			return {
				status: 'fulfilled',
				value
			};
		}).catch(reason => {
			return {
				status: 'rejected',
				reason
			};
		});
	});
	return Promise.all(mappedPromises);
};

export {__repeatConcat, __includes, __startsWithString, __endsWithString,  __arrayMaker, __trunc, __promise_allSettled};
`;

function exeption(filename)
{
	return filename.includes("rollupPluginBabel");
}

function polyfillReplacer(code, regexp, toReplace)
{
	let included = false;
	if(typeof regexp === "string") included = code.includes(regexp);
	else if(regexp instanceof RegExp) included = regexp.test(code);
	if(!included) return {code, included};

	code = code.replaceAll(regexp, toReplace);
	return {code, included};
}

export default function polyfiller({version="es5"} = {}) {
	let polyfillSet = new Set();

	return {
		resolveId(id) {
			if (!id.endsWith(HELPERS)) {
				return null;
			}
			return id;
		},

		load(id) {
			if (!id.endsWith(HELPERS)) {
				return null;
			}
			return HELPERS_CODE;
		},
		transform(code, filename) {
			if(exeption(filename)) return null;
			if(filename.endsWith(HELPERS)) return null;

			//polyfill list
			let polyfillList = [];
			function polyfill(originCode, polyfillName, regexp, toReplace)
			{
				let {code, included} = polyfillReplacer(originCode, regexp, toReplace);
				if(included) polyfillList.push(polyfillName);
				return code;
			}

			if(version !== "es2017")
			{
				//str.repeat() polyfill
				code = polyfill(code, "__repeatConcat", /(["'`\(\[].*["'`\)\]]|[0-9a-zA-Z_$]+)\.repeat\(([^)]+)/g, "__repeatConcat($1, $2");
				//str.startsWith() polyfill
				code = polyfill(code, "__startsWithString", /(["'`\(].*["'`\)]|[0-9a-zA-Z_$]+)\.startsWith\(([^)]+)/g, "__startsWithString($1, $2");
				//str.endsWith() polyfill
				code = polyfill(code, "__endsWithString", /(["'`\(].*["'`\)]|[0-9a-zA-Z_$]+)\.endsWith\(([^)]+)/g, "__endsWithString($1, $2");
				//str.includes() polyfill
				code = polyfill(code, "__includes", /(["'`\[].*["'`\]]|[0-9a-zA-Z_$]+)\.includes\(([^)]+)/g, "__includes($1, $2");

				//Number.parseInt() polyfill
				code = code.replaceAll("Number.parseInt", "parseInt");
				//Math.trunc() polyfill
				code = polyfill(code, "__trunc", "Math.trunc", "__trunc");

				//Array.from() polyfill
				code = polyfill(code, "__arrayMaker", "Array.from", "__arrayMaker");

				//Object.values & iteration polyfill
				code = code.replace(/for\s*\(\s*(let|var|)\s*([0-9a-zA-Z_$]+)\s*of\s*Object\.values\(\s*([0-9a-zA-Z_$]+)\s*\)\s*\)\s*{/g, 
					"var __keys = Object.keys($3);\nfor(var __i=0; __i<__keys.length; __i++) {\n\tvar __key = __keys[__i], $2 = $3[__key];");
				//Object.entries & iteration polyfill
				code = code.replace(/for\s*\(\s*(let|var|)\s*\[\s*([0-9a-zA-Z_$]+),\s*([0-9a-zA-Z_$]+)\s*\]\s*of\s*Object\.entries\(\s*([0-9a-zA-Z_$]+)\s*\)\s*\)\s*{/g, 
					"var __keys = Object.keys($4);\nfor(var __i=0; __i<__keys.length; __i++) {\n\tvar $2 = __keys[__i], $3 = $4[$2];");
			}

			//Promise.allSettled() polyfill
			code = polyfill(code, "__promise_allSettled", "Promise.allSettled", "__promise_allSettled");

			let includer = `import {${polyfillList.join(", ")}} from "./${HELPERS}"\n`;

			return {
				code: polyfillList.length === 0 ? code : includer+code,
				map: null
			};
		}
	}
}