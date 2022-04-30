import Xnb from "./App/Xnb.js";
import {exportFiles/*, resolveImports*/} from "./Files.js";

function extractFileName(fullname)
{
	let matcher = fullname.match(/(.*)\.([^\s.]+)$/);
	if(matcher === null) return [fullname,null];
	return [ matcher[1], matcher[2] ];
}

/**
 * Asynchronously reads the file into binary and then unpacks the contents.
 * @param {File / Buffer} file
 */
function unpackXnb(file)
{
	// browser
	if( typeof window !== "undefined" ) {
		return new Promise((resolve, reject)=>{
			// ensure that the input file has the right extension
			const [,extension] = extractFileName(file.name);
			if(extension !== "xnb") {
				reject(file);
				return;
			}

			//read the file as a binary file
			const fileReader = new FileReader();
			fileReader.readAsArrayBuffer(file);
			fileReader.onload = function() {
				const result = convertXnbIncludeHeaders(fileReader.result);
				console.log(result);
				resolve(result);
			};
		});
	}
	// node.js
	return new Promise((resolve, reject)=>{
		const result = convertXnbIncludeHeaders(file.buffer);
		resolve(result);
	});
}

function unpackData(file)
{
	return unpackXnb(file).then(({content})=>{
		if(content.hasOwnProperty("export")) return content.export;
		return content;
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
	if(content.hasOwnProperty("export")) return content.export;
	return content;
}



function fileMapper(files)
{
	let returnMap = new Map();
	for(let i=0; i<files.length; i++)
	{
		const file = files[i];

		// extract file name & extension
		let [filename, extension] = extractFileName(file.name);
		if(extension === null) continue;

		if(!returnMap.has(fileName)) returnMap.set(fileName, {});
		const namedFileObj = returnMap.get(fileName);
		namedFileObj[extension] = file;
	}
	return returnMap;
}

/**
 * Asynchronously reads the file into binary and then pack xnb files.
 * @param {FlieList} files
 */

/*
function pack(files)
{
	return new Promise((resolve, reject)=>{
		// Group files with the same base name
		const grouppedFiles = fileMapper(files);

		//read the file as a binary file
		const fileReader = new FileReader();
		fileReader.readAsArrayBuffer(file);
		fileReader.onload = function() {
			const result = convertXnbData(fileReader.result);
			resolve(result);
		};
	});
}
*/


export {unpackData, convertXnbData, unpackToFiles};