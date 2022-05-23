import XnbError from "../../Utils/XnbError.js";

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
			return `Array<${simplifyType(simple.slice(0, -2))}>`;
		if (simple === 'Microsoft.Xna.Framework.Content.ReflectiveReader') //reflective
		{
			let reflectiveType = TypeReader.parseSubtypes(type).map( TypeReader.simplifyType.bind(TypeReader) );
			return `${reflectiveType}`;
		}

		for(let reader of Object.values(TypeReader.readers))
		{
			let result = TypeReader.makeSimplied(type, reader);
			if(result !== null) return result;
		}

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
	    // loop over subtypes and resolve readers for them
	    subtypes = subtypes.map(TypeReader.getReader.bind(TypeReader));

	    // if we have a reader then use one
	    if (TypeReader.readers.hasOwnProperty(`${type}Reader`))
	        return new (TypeReader.readers[`${type}Reader`])(...subtypes);

	    // throw an error as type is not supported
	    throw new XnbError(`Invalid reader type "${typeString}" passed, unable to resolve!`);
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



export default TypeReader;