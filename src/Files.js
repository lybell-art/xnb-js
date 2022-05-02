import XnbError from "./Utils/XnbError.js";
import {toPNG} from "./libs/png.js";
import {stringifyYaml} from "./libs/jsonToYaml.js";
import {toXnbNodeData, fromXnbNodeData} from "./Utils/xnbNodeConverter.js";

function getExtension(dataType)
{
	switch(dataType)
	{
		// json data
		case "JSON": return "json";
		// yaml data
		case "yaml": return "yaml";
		// png image
		case "Texture2D": return "png";
		// compiled effects
		case "Effect": return "cso";
		// tbin map file
		case 'TBin': return "tbin";
		// BmFont Xml
		case 'BmFont': return "xml";
	}
	return "bin";
}

function getMimeType(dataType)
{
	switch(dataType)
	{
		// json data
		case "JSON": return "application/json";
		// yaml data
		case "yaml": return "text/plain";
		// png image
		case "Texture2D": return "image/png";
		// compiled effects
		case "Effect": return "application/x-cso";
		// BmFont Xml
		case 'BmFont': return "application/xml";
	}
	return "application/octet-stream";
}

function makeBlob(data, dataType)
{
	//blob is avaliable
	if(Blob !== undefined) return {
		data : new Blob([data], {type : getMimeType(dataType)}),
		extension : getExtension(dataType)
	};
	return {
		data : data,
		extension : getExtension(dataType)
	};
}

function exportContent(content, jsonContent=false)
{
	if (content.hasOwnProperty('export'))
	{
		let {type:dataType, data} = content.export;
		
		// transform to png
		if(dataType === "Texture2D")
		{
			data = toPNG( content.export.width, content.export.height, new Uint8Array(data) );
		}

		return makeBlob(data, dataType);
	}

	// if contentOnly == true, export json data file
	if(jsonContent)
	{
		let contentJson = JSON.stringify(content, null, 4);
		console.log(contentJson);
		return makeBlob(contentJson, "JSON");
	}

	return null;
}


/**
 * decompressed xnb object to real file blobs.
 * @param {Object} decompressed xnb objects (returned by convertXnbIncludeHeaders() / Xnb.load())
 * @param {Object} config (yaml:export file as yaml, contentOnly:export content file only) (optional)
 * @param {String} exported file's name (optional)
 */
function exportFiles(xnbObject, configs={}, fileName=null)
{
	// set config
	let {yaml:isYaml=false, contentOnly=false} = configs;
	if(isYaml && contentOnly) isYaml = false;

	// ensure we have content field
	if (!xnbObject.hasOwnProperty('content')) throw new XnbError('Invalid object!');

	const blobs = [];
	const {content} = xnbObject;

	// export content files
	let contentBlob = exportContent(content, contentOnly);
	if(contentBlob !== null) blobs.push(contentBlob);

	if(contentOnly) return blobs;

	// export json/yaml header files
	const resultJSON = JSON.stringify(xnbObject, (key, value)=>{
		if(key === "export")
		{
			if(typeof fileName == "string" && fileName !== "")
			{
				return `${fileName}.${getExtension(value.type)}`;
			}
			return value.type;
		}
		return value;
	}, 4);

	let result = resultJSON;
	if(isYaml) result=stringifyYaml( toXnbNodeData(xnbObject) );

	blobs.unshift( makeBlob(result, isYaml ? "yaml" : "JSON") );

	return blobs;
}

export { exportFiles };