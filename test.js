import { convertXnbData, unpackToFiles } from "./src/xnbUnpacker.js";
import { toPNG } from "./src/libs/png.js";

const fileImportButton = document.getElementById("fileImport");
const fileImporter = document.getElementById("file");
const outputImageCanvas = document.getElementById("imageResult");
const downloadUnpackedLink = document.getElementById("downloadUnpacked");

fileImportButton.addEventListener("click", ()=>{fileImporter.click();});

fileImporter.addEventListener("change", handleFiles);

let previewUrl, downloadUnpackedUrl;
const zip = new JSZip();

function extractFileName(fullname)
{
	let matcher = fullname.match(/(.*)\.([^\s.]+)$/);
	if(matcher === null) return [fullname,null];
	return [ matcher[1], matcher[2] ];
}

function handleFiles()
{
	if(!this.files || this.files.length === 0) return;

	window.URL.revokeObjectURL(previewUrl);

	const file=this.files[0];
	const isImage = (file.type.search("image/") > -1);
	if(isImage) console.log("this is image!");
	else
	{
		window.URL.revokeObjectURL(downloadUnpackedUrl);

		console.log("this is xnb file!");

		let [baseName] = extractFileName(file.name);
		unpackToFiles(file, {yaml:true})
			.then(blobs=>blobToZip(blobs, baseName))
			.then(blobs=>downloadZipUrl(blobs, baseName))
			.then(flushZip);
	}

	const fileReader = new FileReader();
	fileReader.readAsArrayBuffer(file);
	fileReader.onload = isImage ? pngLoad : xnbLoad;
}

function xnbLoad({target})
{
	let result = convertXnbData(target.result);
	if(result?.type === "Texture2D")
	{
		let rawImgData = new Uint8Array(result.data);
		let png = toPNG(result.width, result.height, rawImgData)
		arrayToImg(png);
	}
}

function pngLoad({target})
{
	let result = target.result;
	arrayToImg(result);
}

function arrayToImg(buffer)
{
	const blob = new Blob([buffer], {type: "image/png"});
	previewUrl = window.URL.createObjectURL(blob);
	outputImageCanvas.src = previewUrl;
}

function blobToZip(blobs, fileName="result")
{
	blobs.forEach( ( {data, extension} )=>{
		zip.file(fileName+"."+extension, data);
	});
	return zip.generateAsync({type:"blob"});
}

function downloadZipUrl(zipped, fileName="result")
{
	downloadUnpackedUrl = window.URL.createObjectURL(zipped);

	downloadUnpackedLink.href = downloadUnpackedUrl;
	downloadUnpackedLink.download = `${fileName}.zip`;
	downloadUnpackedLink.classList.remove("hidden");
}

function flushZip()
{
	zip.forEach((path)=>zip.remove(path));
}