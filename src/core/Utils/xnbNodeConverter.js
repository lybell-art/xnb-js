import TypeReader from "../App/Readers/TypeReader.js";

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

function isPrimitiveReaderType(reader)
{
	switch(reader)
	{
		case 'Boolean':
		case 'Int32':
		case 'UInt32':
		case 'Single':
		case 'Double':
		case 'Char':
		case 'String':
		case '':

		case 'Vector2':
		case 'Vector3':
		case 'Vector4':
		case 'Rectangle':
		case 'Rect':
		return true;
		default: return false;
	}
}

function isExportReaderType(reader)
{
	switch(reader)
	{
		case 'Texture2D':
		case 'TBin':
		case 'Effect':
		case 'BmFont':
		return true;
		default: return false;
	}
}

function convertJsonContentsToXnbNode(raw, readers)
{
	let extractedImages = [];
	let extractedMaps = [];

	const {converted} = (function recursiveConvert(obj, path, index=0)
	{
		const reader = readers[index];

		//primitive
		if(isPrimitiveReaderType(reader))
		{
			return {
				converted : { type:reader, data:obj }, 
				traversed : index
			};
		}

		//null reader
		if(reader === null)
		{
			return {
				converted : obj, 
				traversed : index
			};
		}

		//nullable
		//Nullable format is Nullable<subtype>:(traversed block size)
		if(reader.startsWith('Nullable'))
		{
			let nullableData, trav;
			let [readerType, blockTraversed=1] = reader.split(":");
			blockTraversed = +blockTraversed;
			if(obj === null)
			{
				nullableData = null;
				trav = index + blockTraversed;
			}
			else
			{
				let {converted, traversed} = recursiveConvert( obj, [...path], index+1 );
				nullableData = converted;
				trav = traversed;
			}

			return {
				converted: { 
					type: readerType, 
					data: {data:nullableData}
				}, 
				traversed: trav
			};
		}

		//exportable
		if(isExportReaderType(reader))
		{
			//texture2D
			if(reader === 'Texture2D')
			{
				extractedImages.push( {path:path.join('.')} );
				return {
					converted : { type:reader, data:{format : obj.format} },
					traversed : index
				};
			}
			//tbin
			if(reader === 'TBin')
			{
				extractedMaps.push( {path:path.join('.')} );
			}
			return {
				converted: { type:reader, data:{} }, 
				traversed: index
			};
		}

		// complex data(list, dictionary, spritefont, etc...)
		let data;
		if(Array.isArray(obj)) data=[];
		else data={};

		let traversed = index;
		let first = true;
		let isComplex = ( !reader.startsWith("Dictionary") && !reader.startsWith("Array") && !reader.startsWith("List") );

		for(let [key, value] of Object.entries(obj))
		{
			let newIndex;
			if( reader.startsWith("Dictionary") ) newIndex = index+2;
			else if( reader.startsWith("Array") || reader.startsWith("List")) newIndex = index+1;
			else newIndex = traversed + 1;

			const {converted, traversed:nexter} = recursiveConvert( obj[key], [...path, key], newIndex );
			data[key] = converted;
			if(isComplex) traversed = nexter;
			else if(first)
			{
				traversed = nexter;
				first = false;
			}
		}

		return {
			converted : { type:reader, data },
			traversed
		};
	})(raw, []);

	return { converted, extractedImages, extractedMaps };
}

// convert from inner json content of XnbExtract
// remove {type:"aaa" data:"..."} and pick only "..."
function convertJsonContentsFromXnbNode(obj)
{
	if( !obj || typeof obj !== "object" ) return obj;
	if(typeof obj === "object" && obj.hasOwnProperty("data"))
	{
		let {type, data} = obj;

		if(isPrimitiveReaderType(type)) return deepCopy(data);
		if(isExportReaderType(type))
		{
			data = deepCopy(data);
			if(type === "Texture2D") data.export = "Texture2D.png";
			else if(type === "Effect") data.export = "Effect.cso";
			else if(type === "TBin") data.export = "TBin.tbin";
			else if(type === "BmFont") data.export = "BmFont.xml";

			return data;
		}
		if(type.startsWith("Nullable"))
		{
			if(data === null || data.data === null) return null;
			return convertJsonContentsFromXnbNode(data.data);
		}
		
		obj = deepCopy(data);
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

	return null;
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
	const rawContent = deepCopy(json.content);

	const mainReader = TypeReader.simplifyType( readerData[0].type );
	let readersTypeList = TypeReader.getReaderTypeList( mainReader );
	if(readersTypeList[0] === 'SpriteFont')
	{
		readersTypeList = ['SpriteFont', 
		'Texture2D', 
		'List<Rectangle>', 'Rectangle', 
		'List<Rectangle>', 'Rectangle', 
		'List<Char>', 'Char',
		null, 
		'List<Vector3>', 'Vector3',
		'Nullable<Char>', 'Char',
		null];

		rawContent.verticalSpacing = rawContent.verticalLineSpacing;
		delete rawContent.verticalLineSpacing;
	}

	const { converted, extractedImages, extractedMaps } = convertJsonContentsToXnbNode(rawContent, readersTypeList);

	toYamlJson.content = converted;
	if(extractedImages.length > 0) toYamlJson.extractedImages = extractedImages;
	if(extractedMaps.length > 0) toYamlJson.extractedMaps = extractedMaps;

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
	result.readers = deepCopy(readerData);

	// set content data
	result.content = convertJsonContentsFromXnbNode(json.content);

	// this program uses verticalLineSpacing, not verticalSpacing
	if( TypeReader.simplifyType(result.readers[0].type) === 'SpriteFont' )
	{
		result.content.verticalLineSpacing = result.content.verticalSpacing;
		delete result.content.verticalSpacing;
	}

	return result;
}

export {toXnbNodeData, fromXnbNodeData};