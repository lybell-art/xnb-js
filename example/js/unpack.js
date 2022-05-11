import { convertXnbData, unpackToFiles } from "../../dist/xnb.module.js";
import { toPNG } from "./libs/png.js";
import zipDownloadMaker from "./zipDownloadMaker.js";

/******************************************************************************/
/*                             Add Event Listener                             */
/*----------------------------------------------------------------------------*/

function addEventlistener_unpack()
{
	// add file change event handler
	const fileImporter = document.getElementById("toUnpackFile");
	fileImporter.addEventListener("change", handleFiles);

	// add file import button
	const fileImportButton = document.getElementById("fileImport");
	fileImportButton.addEventListener("click", ()=>{fileImporter.click();});
}

/******************************************************************************/
/*                                Handle Files                                */
/*----------------------------------------------------------------------------*/

function handleFiles()
{
	if(!this.files || this.files.length === 0) return;

	// read files, image check
	const file=this.files[0];
	const isImage = (file.type.search("image/") > -1);

	// if the file is xnb file, make zip files
	if(isImage) console.log("this is image!");
	else {
		console.log("this is xnb file!");
		xnbUnpackToZip(file);
	}

	// read files, make preview
	window.URL.revokeObjectURL(previewUrl);
	const fileReader = new FileReader();
	fileReader.readAsArrayBuffer(file);
	fileReader.onload = isImage ? pngLoad : xnbLoad;
}

/******************************************************************************/
/*                            Show Preview Images                             */
/*----------------------------------------------------------------------------*/
const outputImageCanvas = document.getElementById("imageResult");
let previewUrl;


function xnbLoad({target})
{
	let result = convertXnbData(target.result);
	if(result?.extension === "png") arrayToImg(result.data);
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


/******************************************************************************/
/*                        Unpack XNB and Make Zip File                        */
/*----------------------------------------------------------------------------*/
const zipper = new zipDownloadMaker(
	document.getElementById("downloadUnpacked"),
	({data})=>data,
	({extension}, baseName)=>`${baseName}.${extension}`
);

function xnbUnpackToZip(xnbFile)
{
	const [baseName] = extractFileName(xnbFile.name);
	zipper.initialize(baseName);

	unpackToFiles(xnbFile).then(zipper.export.bind(zipper));
}

function extractFileName(fullname)
{
	let matcher = fullname.match(/(.*)\.([^\s.]+)$/);
	if(matcher === null) return [fullname,null];
	return [ matcher[1], matcher[2] ];
}

export {addEventlistener_unpack};