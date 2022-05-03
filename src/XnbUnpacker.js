import Xnb from "./App/Xnb.js";
import {exportFiles, exportContent, resolveImports, extractFileName} from "./Files.js";

/**
 * Asynchronously reads the file into binary and then unpacks the contents.
 * @param {File / Buffer} file
 */
async function unpackXnb(file)
{
	// browser
	if( typeof window !== "undefined" ) {
		// ensure that the input file has the right extension
		const [,extension] = extractFileName(file.name);

		if(extension !== "xnb") {
			return new Error("Invalid XNB File!");
		}

		//read the file as a binary file
		const buffer = await file.arrayBuffer();
		return convertXnbIncludeHeaders(buffer);
	}
	// node.js
	return convertXnbIncludeHeaders(file.buffer);
}

function unpackData(file)
{
	return unpackXnb(file).then(({content})=>{
		return exportContent(content, true);
	});
}

/**
 * Asynchronously reads the file into binary and then unpacks the contents and remake to Blobs array.
 * @param {File / Buffer} file
 * @param {Object} config (yaml:export file as yaml, contentOnly:export content file only)
 */
function unpackToFiles(file, configs={})
{
	let [fileName] = extractFileName(file.name);
	const exporter = xnbObject => exportFiles(xnbObject, configs, fileName);
	return unpackXnb(file).then(exporter);
}


/**
 * reads the buffer and then unpacks.
 * @param {ArrayBuffer} buffer
 * @return {Object} the loaded XNB object include headers
 */
function convertXnbIncludeHeaders(buffer)
{
	const xnb = new Xnb();
	return xnb.load(buffer);
}

/**
 * reads the buffer and then unpacks the contents.
 * @param {ArrayBuffer} buffer
 * @return {Object} the loaded XNB object(not include headers)
 */
function convertXnbData(buffer)
{
	const xnb = new Xnb();
	const {content} = xnb.load(buffer);
	return exportContent(content, true);
}



function fileMapper(files)
{
	let returnMap = new Map();
	for(let i=0; i<files.length; i++)
	{
		const file = files[i];

		// extract file name & extension
		let [fileName, extension] = extractFileName(file.name);
		if(extension === null) continue;

		if(!returnMap.has(fileName)) returnMap.set(fileName, {});
		const namedFileObj = returnMap.get(fileName);
		namedFileObj[extension] = file;
	}
	return returnMap;
}


/**
 * reads the json and then unpacks the contents.
 * @param {json} to pack json data
 * @return {ArrayBuffer} packed XNB Array Buffer
 */
function packJsonToBinary(json)
{
	const xnb = new Xnb();
	const buffer = xnb.convert(json);
	return buffer;
}

/**
 * Asynchronously reads the file into binary and then pack xnb files.
 * @param {FlieList} files
 * @param {Object} configs(compression:default, none, LZ4, LZX / debug)
 * @return {Array(Blobs)} 
 */
function pack(files, configs={})
{
	const groupedFiles = fileMapper(files);
	let promises = [];
	for(let [fileName, filePack] of groupedFiles)
	{
		promises.push(
			resolveImports(filePack, configs)
				.then(packJsonToBinary)
				.then((buffer)=>{
					//blob is avaliable
					if(Blob !== undefined) return {
						name:fileName,
						data:new Blob([buffer], {type : "application/octet-stream"})
					};
					return {
						name:fileName,
						data:buffer
					};
				})
		);
	}
	return Promise.allSettled(promises).then(blobArray => {
		if(configs.debug === true) return blobArray;

		return blobArray.filter( ({status, value})=>status === "fulfilled" )
			.map( ({value})=>value );
	});
}


export {unpackXnb, unpackData, convertXnbData, unpackToFiles, fileMapper, pack};