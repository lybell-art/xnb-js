import XnbError from "./Utils/XnbError.js";
import {fixPNG} from "./Utils/fixPNG.js";
import {toPNG, fromPNG} from "./libs/png.js";
import {stringifyYaml, parseYaml} from "./libs/jsonToYaml.js";
import {toXnbNodeData, fromXnbNodeData} from "./Utils/xnbNodeConverter.js";


function searchElement(parent, element)
{
	// ensure object is defined and is an object
	if (!parent || typeof parent != 'object') return;

	// if property exists then return it
	if (parent.hasOwnProperty(element)) {
		return { parent, value: parent[element] };
	}

	// search the objects for keys
	for(let child of Object.values(parent)) {
		if (!!child || typeof child == 'object') {
			let found = searchElement(child, element);
			if(found) return found;
		}
	}

	return null;
}

function extractFileName(fullname)
{
	let matcher = fullname.match(/(.*)\.([^\s.]+)$/);
	if(matcher === null) return [fullname,null];
	return [ matcher[1], matcher[2] ];
}

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
	if(typeof Blob === "function") return {
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
	let found = searchElement(content, "export");
	if (found)
	{
		const {value} = found;
		let {type:dataType, data} = value;
		
		// transform to png
		if(dataType === "Texture2D")
		{
			data = toPNG( value.width, value.height, new Uint8Array(data) );
		}

		return makeBlob(data, dataType);
	}

	// if contentOnly == true, export json data file
	if(jsonContent)
	{
		let contentJson = JSON.stringify(content, null, 4);
		return makeBlob(contentJson, "JSON");
	}

	return null;
}


/** @api
 * decompressed xnb object to real file blobs.
 * @param {XnbData} decompressed xnb objects (returned by bufferToXnb() / Xnb.load())
 * @param {Object} config (yaml:export file as yaml, 
 * 					contentOnly:export content file only, 
 * 					fileName:exported files's name) (optional)
 */
function exportFiles(xnbObject, {yaml:isYaml=false, contentOnly=false, fileName=null}={})
{
	// set config
	if(isYaml && contentOnly) isYaml = false;

	// ensure we have content field
	if (!xnbObject.hasOwnProperty('content')) throw new XnbError('Invalid object!');

	const blobs = [];
	const {content} = xnbObject;

	// export content files
	const contentBlob = exportContent(content, contentOnly);
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
			return `${value.type}.${getExtension(value.type)}`;
		}
		return value;
	}, 4);

	let result = resultJSON;
	if(isYaml) result=stringifyYaml( toXnbNodeData(xnbObject) );

	blobs.unshift( makeBlob(result, isYaml ? "yaml" : "JSON") );

	return blobs;
}


function resolveCompression(compressionString)
{
	let str=compressionString.toLowerCase();
	if(str === "none") return 0;
	if(str === "lz4") return 0x40;
//	if(str === "lzx") return 0x80;
	return null;
}

/**
 * @param {Blob/Buffer} input Blob/Buffer
 * @return {Promise} promise returns text
 */
async function readBlobasText(blob)
{
	if(typeof Blob === "function" && blob instanceof Blob) return blob.text();
	else if(typeof Buffer === "function" && blob instanceof Buffer) return blob.toString();
	else return blob;
}

/**
 * @param {Blob/Buffer} input Blob/Buffer
 * @return {Promise} promise returns text
 */
async function readBlobasArrayBuffer(blob)
{
	if(typeof Blob === "function" && blob instanceof Blob) return blob.arrayBuffer();
	else if(typeof Buffer === "function" && blob instanceof Buffer) return blob.buffer;
}


async function readExternFiles(extension, files)
{
	// Texture2D to PNG
	if(extension === "png")
	{
		// get binary file
		const rawPng = await readBlobasArrayBuffer(files.png);

		// get the png data
		let png = fromPNG(new Uint8Array(rawPng) );

		// if the png data is not 32bit-rgba, fix it
		if(png.channel !== 4 || png.depth !== 8 || png.palette !== undefined) png.data = fixPNG(png);
		
		return {
			type: "Texture2D",
			data: png.data,
			width: png.width,
			height: png.height
		};
	}

	// Compiled Effects
	if(extension === "cso")
	{
		const data = await readBlobasArrayBuffer(files.cso);
		return {
			type: "Effect",
			data
		};
	}

	// TBin Map
	if(extension === "tbin")
	{
		const data = await readBlobasArrayBuffer(files.tbin);
		return {
			type: "TBin",
			data
		};
	}

	// BmFont Xml
	if(extension === "xml")
	{
		const data = await readBlobasText(files.xml);
		return {
			type: "BmFont",
			data
		};
	}	
}


/**
 * file objects to json file to compress.
 * @param {Object} to compress files
 * @param {Object} config (compression:default, none, LZ4, LZX(currently unsupported)) (optional)
 */
async function resolveImports(files, configs={})
{
	const {compression="default"} = configs;

	const jsonFile = files.json || files.yaml;
	if(!jsonFile) throw new XnbError("There is no JSON or YAML file to pack!");

	//parse json/yaml data
	const rawText = await readBlobasText(jsonFile);
	let jsonData = null;
	if(files.json) jsonData = JSON.parse(rawText);
	else jsonData = fromXnbNodeData( parseYaml(rawText) );

	// apply configuration data
	let compressBits = resolveCompression(compression);
	if(compressBits !== null) jsonData.header.compressed = compressBits;

	// need content
	if (!jsonData.hasOwnProperty('content')) {
		throw new XnbError(`${jsonFile.name} does not have "content".`);
	}

	const found = searchElement(jsonData.content, "export");

	if(found)
	{
		const {parent, value} = found;
		const [,extension] = extractFileName(value);
		parent.export = await readExternFiles(extension, files);
	}

	return jsonData;
}


function getReaderAssembly(extension)
{
	if(extension === "png") return "Microsoft.Xna.Framework.Content.Texture2DReader, Microsoft.Xna.Framework.Graphics, Version=4.0.0.0, Culture=neutral, PublicKeyToken=842cf8be1de50553";
	if(extension === "tbin") return "xTile.Pipeline.TideReader, xTile";
	if(extension === "xml") return "BmFont.XmlSourceReader, BmFont, Version=2012.1.7.0, Culture=neutral, PublicKeyToken=null";
}

/**
 * make header json for png/tbin file only.
 * @param {String} file name
 * @return {Object} header json data
 */
function makeHeader(fileName)
{
	const [, extension] = extractFileName(fileName);

	const readerType = getReaderAssembly(extension);

	let content = {
		export : fileName
	};
	if(extension === "png") content.format = 0;

	const result = {
		header : {
			target : "w",
			formatVersion : 5,
			hidef: true,
			compressed: true
		},
		readers : [{
			type: readerType,
			version: 0
		}],
		content
	};

	return JSON.stringify(result);
}


export { exportContent, exportFiles, resolveImports, extractFileName, makeBlob, makeHeader };