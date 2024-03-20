import XnbError from "../../Utils/XnbError.js";
import ReflectiveReader from "./ReflectiveReader.js";

// remove first bracket
function removeExternBracket(str)
{
	let bracketStack = [];
	let result = [];
	for(let i=0; i<str.length; i++)
	{
		let c=str[i];
		if(c === "[") bracketStack.push(i);
		else if(c === "]")
		{
			let startPoint=bracketStack.pop();
			if(startPoint === undefined) throw new Error("Invalid Bracket Form!");
			if(bracketStack.length === 0) result.push(str.slice(startPoint+1, i));
		}
	}

	return result;
}

class TypeReader
{
	static readers = {};
	static schemes = {};
	/**
	 * Used to set readers plugin.
	 * @function setReaders
	 * @param  {Object<Class(BaseReader)>} BaseReader Class object
	 */
	static setReaders(readers)
	{
		TypeReader.readers = {...readers};
	}
	/**
	 * Used to add readers plugin.
	 * @function setReaders
	 * @param  {Object<Class(BaseReader)>} BaseReader Class object
	 */
	static addReaders(readers)
	{
		TypeReader.readers = {...(TypeReader.readers), ...readers};
	}

	/**
	 * Used to set custom schemes.
	 * @function setSchemes
	 * @param  {Object<String, Object>} 
	 * 	@key c# class name
	 * 	@value scheme object
	 */
	static setSchemes(schemes)
	{
		const subReaders = convertSchemesToReaders(schemes);
		TypeReader.schemes = {...subReaders};
	}
	/**
	 * Used to add custom schemes.
	 * @function addReaders
	 * @param  {Object<String, Object>}
	 * 	@key c# class name
	 * 	@value scheme object
	 */
	static addSchemes(schemes)
	{
		const subReaders = convertSchemesToReaders(schemes);
		TypeReader.schemes = {...(TypeReader.schemes), ...schemes};
	}

	static makeSimplied(type, reader)
	{
		let simple = type.split(/`|,/)[0];
		if(reader.isTypeOf(simple))
		{
			if(reader.hasSubType())
			{
				let subtypes = TypeReader.parseSubtypes(type).map( TypeReader.simplifyType.bind(TypeReader) );
				return `${reader.type()}<${subtypes.join(",")}>`;
			}
			else return reader.type();
		}
		return null;
	}

	static simplifyReflectiveType(subType)
	{
		// split subtype, and check readers for match subtype
		let simple = subType.split(/`|,/)[0];
		for(let reader of Object.values(TypeReader.readers))
		{
			if(reader.isTypeOf(simple)) return reader.type();
		}
		// check scheme
		if(TypeReader.schemes.hasOwnProperty(simple)) return `ReflectiveScheme<${simple}>`;

		throw new XnbError(`Non-implemented scheme found, cannot resolve scheme "${simple}", "${subType}".`);
	}

	/**
	 * Used to simplify type from XNB file.
	 * @function simplifyType
	 * @param  {String} type The long verbose type read from XNB file.
	 * @returns {String} returns shorthand simplified type for use within this tool.
	 */
	static simplifyType(type)
	{
		// gets the first part of the type
		let simple = type.split(/`|,/)[0];

		// check if its an array or not
		let isArray = simple.endsWith('[]');
		// if its an array then get the array type
		if (isArray)
			return `Array<${TypeReader.simplifyType(simple.slice(0, -2))}>`;

		// reflective
		if (simple === 'Microsoft.Xna.Framework.Content.ReflectiveReader') 
			return TypeReader.simplifyReflectiveType(TypeReader.parseSubtypes(type)[0]);

		// traverse readers and match type
		for(let reader of Object.values(TypeReader.readers))
		{
			let result = TypeReader.makeSimplied(type, reader);
			if(result !== null) return result;
		}

		// check scheme
		console.log(type, TypeReader.schemes);
		if(TypeReader.schemes.hasOwnProperty(simple)) return `ReflectiveScheme<${simple}>`;

		throw new XnbError(`Non-implemented type found, cannot resolve type "${simple}", "${type}".`);
	}

	/**
	 * Parses subtypes from a type like Dictionary or List
	 * @function parseSubtypes
	 * @param  {String} type The type to parse with subtypes in.
	 * @returns {String[]} returns an array of subtypes
	 */
	static parseSubtypes(type){
		// split the string by the ` after the type
		let subtype = type.slice(type.search("`")+1);

		// get the number of types following the ` in type string
		let count = subtype[0];

		// get the contents of the wrapped array
		subtype = removeExternBracket(subtype)[0];

		let matches = removeExternBracket(subtype);

		// return the matches
		return matches;
	}


	/**
	 * Get type info from simple type
	 * @param   {String} type Simple type to get info from.
	 * @returns {Object} returns an object containing information about the type.
	 */
	static getTypeInfo(type){
	    // get type before angle brackets for complex types
	    let mainType = type.match(/[^<]+/)[0];
	    // get the subtypes within brackets
	    let subtypes = type.match(/<(.+)>/);

	    // if we do have subtypes then split and trim them
	    subtypes = subtypes ? subtypes[1].split(',').map(type => type.trim()) : [];

	    // return info object
	    return { type: mainType, subtypes };
	}


	/**
	 * Gets an type structure array for yaml convertion.
	 * @function getReaderTypeList
	 * @param {String} type The simplified type to get reader based off of.
	 * @returns {Array} returns an type structure array for yaml convertion.
	 */
	static getReaderTypeList(typeString){
		let reader = TypeReader.getReader(typeString);
		return reader.parseTypeList();
	}


	/**
	 * Gets an XnbReader instance based on type.
	 * @function getReader
	 * @param {String} type The simplified type to get reader based off of.
	 * @returns {BaseReader} returns an instance of BaseReader for given type.
	 */
	static getReader(typeString){
	    // get type info for complex types
	    let {type, subtypes} = TypeReader.getTypeInfo(typeString);

	    // if type is new reflective
	    if(type === "ReflectiveScheme")
	    {
	    	return new ReflectiveReader(subtypes[0], TypeReader.schemes[subtypes[0]]);
	    }

	    // loop over subtypes and resolve readers for them
	    subtypes = subtypes.map(TypeReader.getReader.bind(TypeReader));

	    // if we have a reader then use one
	    if (TypeReader.readers.hasOwnProperty(`${type}Reader`))
	        return new (TypeReader.readers[`${type}Reader`])(...subtypes);

	    if (TypeReader.schemes.hasOwnProperty(type))
	    	return new ReflectiveReader(type, TypeReader.schemes[type]);

	    // throw an error as type is not supported
	    throw new XnbError(`Invalid reader type "${typeString}" passed, unable to resolve!`);
	}

	/**
	 * Gets an XnbReader class based on type.
	 * @function getReader
	 * @param {String} reader class name to get reader.
	 * @returns {Class BaseReader} returns an class of BaseReader for given type.
	 */
	static getReaderClass(typeString){
		if (TypeReader.readers.hasOwnProperty(typeString))
			return TypeReader.readers[typeString];
		throw new XnbError(`There is no "${typeString}" class in reader list!`);
	}

	/**
	 * Gets an XnbReader instance based on type.
	 * @function getReader
	 * @param {String} The raw type to get reader based off of.
	 * @returns {BaseReader} returns an instance of BaseReader for given type.
	 */
	static getReaderFromRaw(typeString){
	    const simplified = TypeReader.simplifyType(typeString);
	    return TypeReader.getReader(simplified);
	}
}

/**
 * Reflective Scheme Reader maker 
 */

function convertSchemeEntryToReader(scheme)
{
	if(typeof scheme === "string") return TypeReader.getReader(scheme);

	if(Array.isArray(scheme)) {
		const ListReader = TypeReader.getReaderClass("ListReader");
		return new ListReader(convertSchemeEntryToReader(scheme[0]));
	}
	if(typeof scheme === "object") {
		const keyCount = Object.keys(scheme).length;
		if(keyCount === 1) {
			const DictionaryReader = TypeReader.getReaderClass("DictionaryReader");
			const [key, value] = Object.entries(scheme)[0];

			return new DictionaryReader(
				convertSchemeEntryToReader(key),
				convertSchemeEntryToReader(value)
			);
		}
		else if(keyCount > 1) {
			return convertSchemeToReader(scheme);
		}
	}
	throw new XnbError(`Invalid Scheme to convert! : ${scheme}`);
}

function convertSchemeToReader(scheme)
{
	const result = new Map();
	for(let [key, type] of Object.entries(scheme))
	{
		let reader = convertSchemeEntryToReader(type);
		
		if(key.startsWith("@")) {
			key = key.slice(1);
			if(!reader.isValueType()) {
				try {
					reader = new TypeReader.readers.NullableReader(reader);
				}
				catch {
					throw new XnbError("There is no NullableReader from reader list!");
				}
			}
		}
		result.set(key, reader);
	}
	return result;
}


function convertSchemesToReaders(schemes)
{
	const result = {};
	for(let [key, type] of Object.entries(schemes))
	{
		let reader = convertSchemeToReader(type);
		result[key] = reader;
	}
	console.log(result);
	return result;
}

export default TypeReader;