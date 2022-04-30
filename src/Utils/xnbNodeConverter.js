// convert json file to yaml compatible with XnbExtract
function toXnbNodeData(json)
{
	const toYamlJson = {};
	const {compressed, formatVersion, hidef:hiDef, target} = json.header;
	let readerData = deepCopy(json.readers);

	// set header
	toYamlJson.xnbData = {
		target,
		conpressed:!!compressed,
		hiDef,
		numSharedResources : 0,
		readerData
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
	else toYamlJson.content = deepCopy(rawContent);

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
	else result.content = deepCopy(rawContent);

	return result;
}

export {toXnbNodeData, fromXnbNodeData};