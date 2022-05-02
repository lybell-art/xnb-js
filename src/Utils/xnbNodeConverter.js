import {simplifyType, parseSubtypes} from "../App/TypeReader.js";

function deepCopy(obj)
{
	let newObj;
	if(Array.isArray(obj))
	{
		newObj=[];
		for(let item of obj)
		{
			newObj.push(deepCopy(item));
		}
		return newObj;
	}

	if(!!obj && typeof obj === "object")
	{
		newObj={};
		for(let [key, value] of Object.entries(obj))
		{
			newObj[key] = deepCopy(value);
		}
		return newObj;
	}

	return obj;
}

// convert inner json content to XnbExtract
function convertJsonContentsToXnbNode(obj, mainType)
{
	let type0 = simplifyType(mainType);
	//Dictionary<...>
	if(type0.startsWith("Dictionary"))
	{
		let newObj={type:type0, data:{}};
		let [,subType] = parseSubtypes(mainType).map(simplifyType);
		for(let [key, value] of Object.entries(obj))
		{
			newObj.data[key] = {
				type:subType,
				data:value
			};
		}
		return newObj;
	}
	//List / Array
	if(type0.startsWith("Array") || type0.startsWith("List"))
	{
		let newObj={type:type0, data:[]};
		let [subType] = parseSubtypes(mainType).map(simplifyType);
		for(let value of obj)
		{
			newObj.data.push({
				type:subType,
				data:value
			});
		}
		return newObj;
	}
	return {
		type:type0,
		data:deepCopy(obj)
	};
}

// convert from inner json content of XnbExtract
// remove {type:"aaa" data:"..."} and pick only "..."
function convertJsonContentsFromXnbNode(obj)
{
	if( !(!!obj && typeof obj === "object") ) return obj;
	if(typeof obj === "object" && obj.hasOwnProperty("data"))
	{
		return convertJsonContentsFromXnbNode(obj.data);
	}

	let newObj;
	if(Array.isArray(obj))
	{
		newObj=[];
		for(let item of obj)
		{
			newObj.push(convertJsonContentsFromXnbNode(item));
		}
		return newObj;
	}

	if(!!obj && typeof obj === "object")
	{
		newObj={};
		for(let [key, value] of Object.entries(obj))
		{
			newObj[key] = convertJsonContentsFromXnbNode(value);
		}
		return newObj;
	}
}

// convert json file to yaml compatible with XnbExtract
function toXnbNodeData(json)
{
	const toYamlJson = {};
	const {compressed, formatVersion, hidef:hiDef, target} = json.header;
	let readerData = deepCopy(json.readers);

	// set header
	toYamlJson.xnbData = {
		target,
		compressed:!!compressed,
		hiDef,
		readerData,
		numSharedResources : 0
	};

	// set contents
	let {content:rawContent} = json;
	if(rawContent.hasOwnProperty('export'))
	{
		let {type} = rawContent.export;
		// texture2d content
		if(type === "Texture2D")
		{
			toYamlJson.content = {
				type,
				data:{
					format : rawContent.format
				}
			};
			toYamlJson.extractedImages=[{path:""}];
		}
		else if(type === "TBin")
		{
			toYamlJson.content = {
				type,
				data:{}
			};
			toYamlJson.extractedMaps = [{path:""}];
		}
		else
		{
			toYamlJson.content = {
				type,
				data:{}
			};
		}
	}
	else
	{
		toYamlJson.content = convertJsonContentsToXnbNode(rawContent, readerData[0].type);
	}

	return toYamlJson;
}

function fromXnbNodeData(json)
{
	const result = {};

	// set header data
	const {compressed, readerData, hiDef:hidef, target} = json.xnbData;
	result.header = {
		target,
		formatVersion : 5,
		compressed : compressed ? ( (target === 'a' || target === 'i') ? 0x40 : 0x80 ) : 0,
		hidef
	}
	result.readerData = deepCopy(readerData);

	// set content data
	const {content:rawContent} = json;
	if(rawContent.hasOwnProperty('export'))
	{
		let {type} = rawContent;
		// texture2d content
		if(type === "Texture2D")
		{
			result.content = {
				format : rawContent.data.format,
				export:{
					type,
					data:null,
					width:null,
					height:null
				}
			};
		}
		else
		{
			result.content = {
				export:{
					type,
					data:null
				}
			};
		}
	}
	else result.content = convertJsonContentsFromXnbNode(rawContent);

	return result;
}

export {toXnbNodeData, fromXnbNodeData};