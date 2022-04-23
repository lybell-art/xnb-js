import Xnb from "./App/Xnb.js";

/**
 * Asynchronously reads the file into binary and then unpacks.
 * @param {File} file
 */
function unpack(file)
{
	return new Promise((resolve, reject)=>{
		// ensure that the input file has the right extension
		const extension = file.match(/\.([^\s.]+)$/);
		if(!extension || extension[1] !== "xnb") {
			reject(file);
			return;
		}

		//read the file as a binary file
		const fileReader = new FileReader();
		fileReader.readAsArrayBuffer(file);
		fileReader.onload = function() {
			const result = convertXnbData(fileReader.result);
			resolve(result);
		};
	});
}

/**
 * Asynchronously reads the file into binary and then unpacks.
 * @param {ArrayBuffer} buffer
 * @return {Object} the loaded XNB object
 */
function convertXnbData(buffer)
{
	const xnb = new Xnb();
	const result = xnb.load(buffer);
	return result;
}

export {unpack, convertXnbData};