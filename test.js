import {convertXnbData} from "./xnbunpacker-clone/xnbUnpacker.js";
import { toPNG } from "./libs/png.js";

const fileImportButton = document.getElementById("fileImport");
const fileImporter = document.getElementById("file");
const outputImageCanvas = document.getElementById("imageResult");

fileImportButton.addEventListener("click", ()=>{fileImporter.click();});

fileImporter.addEventListener("change", handleFiles);

let url;

function handleFiles()
{
	if(!this.files || this.files.length === 0) return;

	window.URL.revokeObjectURL(url);

	const file=this.files[0];
	const isImage = (file.type.search("image/") > -1)
	if(isImage) console.log("this is image!");
	else console.log("this is xnb file!");

	const fileReader = new FileReader();
	fileReader.readAsArrayBuffer(file);
	fileReader.onload = isImage ? pngLoad : xnbLoad;
}

function arrayToImg(buffer)
{
//	console.log(new PNG(buffer));
	const blob = new Blob([buffer], {type: "image/png"});
	console.log(blob);
	url = window.URL.createObjectURL(blob);
	outputImageCanvas.src = url;
//	window.URL.revokeObjectURL(url);
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
	console.log(result);
}

function pngLoad({target})
{
	let result = target.result;
	arrayToImg(result);
	console.log(result);
}