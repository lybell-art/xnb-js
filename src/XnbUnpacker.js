import XnbConverter from "./App/Xnb.js";
import XnbData from "./App/XnbData.js";
import {exportFiles, exportContent, resolveImports, extractFileName} from "./Files.js";


/******************************************************************************/
/*                                Unpack XNB                                  */
/*----------------------------------------------------------------------------*/

/**
 * Asynchronously reads the file into binary and then unpacks the json data.
 * XNB -> arrayBuffer -> XnbData
 * @param {File / Buffer} file
 * @return {XnbData} JSON data with headers
 */
async function unpackToXnbData(file)
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
		return bufferToXnb(buffer);
	}
	// node.js
	return bufferToXnb(file.buffer);
}

/**
 * Asynchronously reads the file into binary and then return content file.
 * XNB -> arrayBuffer -> XnbData -> Content
 * @param {File / Buffer} file
 * @return {Object} the loaded contents
 */
function unpackToContent(file)
{
	return unpackToXnbData(file).then(xnbDataToContent);
}

/**
 * Asynchronously reads the file into binary and then unpacks the contents and remake to Blobs array.
 * XNB -> arrayBuffer -> XnbData -> Files
 * @param {File / Buffer} file
 * @param {Object} config (yaml:export file as yaml, contentOnly:export content file only)
 * @return {Array<Blobs>} exported Files Blobs
 */
function unpackToFiles(file, configs={})
{
	let [fileName] = extractFileName(file.name);
	const exporter = xnbObject => exportFiles(xnbObject, configs, fileName);
	return unpackXnb(file).then(exporter);
}



/**
 * reads the buffer and then unpacks.
 * arrayBuffer -> XnbData
 * @param {ArrayBuffer} buffer
 * @return {XnbData} the loaded XNB json
 */
function bufferToXnb(buffer)
{
	const xnb = new XnbConverter();
	return xnb.load(buffer);
}

/**
 * reads the buffer and then unpacks the contents.
 * arrayBuffer -> XnbData -> Content
 * @param {ArrayBuffer} buffer
 * @return {Object} the loaded XNB object(not include headers)
 */
function bufferToContents(buffer)
{
	const xnb = new XnbConverter();
	const xnbData = xnb.load(buffer);
	return xnbDataToContent(xnbData);
}

/**
 * remove header from the loaded XNB Object
 * XnbData -> Content
 * @param {XnbData} the loaded XNB object include headers
 * @return {Array<Blobs>} exported Files Blobs
 */
function xnbDataToContent(loadedXnb)
{
	const {content} = loadedXnb;
	return exportContent(content, true);
}



/******************************************************************************/
/*                                 Pack XNB                                   */
/*----------------------------------------------------------------------------*/

function fileMapper(files)
{
	let returnMap = {};
	for(let i=0; i<files.length; i++)
	{
		const file = files[i];

		// extract file name & extension
		let [fileName, extension] = extractFileName(file.name);
		if(extension === null) continue;

		if(returnMap[fileName] === undefined) returnMap[fileName]={};
		const namedFileObj = returnMap[fileName];
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
	const xnb = new XnbConverter();
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
	for(let [fileName, filePack] of Object.entries(groupedFiles) )
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


export {unpackToXnbData, 
	unpackToContent, 
	unpackToFiles, 

	bufferToXnb, 
	bufferToContents, 

	xnbDataToContent, 
	exportFiles as xnbDataToFiles,
	pack,
	XnbData
};
