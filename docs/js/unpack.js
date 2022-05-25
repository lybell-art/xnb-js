import { bufferToXnb } from "./workerHelper.js";
import { xnbDataToContent, xnbDataToFiles } from "./libs/xnb.js";
import zipDownloadMaker from "./zipDownloadMaker.js";

const options = {yaml:false, contentOnly:false};

/******************************************************************************/
/*                             Add Event Listener                             */
/*----------------------------------------------------------------------------*/

function addEventlistener_unpack()
{
	// add file change event handler
	const fileImporter = document.getElementById("toUnpackFile");
	fileImporter.addEventListener("change", handleFiles);

	// add file import button
	const fileImportButton = document.getElementById("unpackButton");
	fileImportButton.addEventListener("click", ()=>{fileImporter.click();});

	// add checkbox event handler
	const yamlChecker = document.getElementById("check_yaml");
	const contentOnlyChecker = document.getElementById("check_content");

	yamlChecker.addEventListener("change", function(){
		options.yaml = this.checked;
		if(this.checked && contentOnlyChecker.checked)
		{
			contentOnlyChecker.checked = false;
			options.contentOnly = false;
		}
		showCode();
		handleFiles.call(fileImporter);
	});
	contentOnlyChecker.addEventListener("change", function(){
		options.contentOnly = this.checked;
		if(this.checked && yamlChecker.checked)
		{
			yamlChecker.checked = false;
			options.yaml = false;
		} 
		showCode();
		handleFiles.call(fileImporter);
	});
}

/******************************************************************************/
/*                                Handle Files                                */
/*----------------------------------------------------------------------------*/
const loadingSpinner = document.getElementById("unpack_loading");

function handleFiles()
{
	if(!this.files || this.files.length === 0) return;

	// read files, image check
	const file=this.files[0];
	const isImage = (file.type.search("image/") > -1);

	// if the file is xnb file, make zip files
	if(isImage) {
		console.log("this is image!");
		const fileReader = new FileReader();
		fileReader.readAsArrayBuffer(file);
		fileReader.onload = pngLoad;
	}
	else {
		console.log("this is xnb file!");
		const [baseName] = extractFileName(file.name);
		const exportFiles = xnbData => xnbDataToFiles(xnbData, {...options, fileName:baseName});

		loadingSpinner.classList.add("shown");
		showCode();

		zipper.initialize(baseName);
		file.arrayBuffer()
			.then(bufferToXnb)
			.then(showXnbData)
			.then(exportFiles)
			.then(zipper.export.bind(zipper))
			.catch(closeButton)
			.finally(()=>{loadingSpinner.classList.remove("shown")});
	}
}

/******************************************************************************/
/*                            Show Preview Images                             */
/*----------------------------------------------------------------------------*/
const outputImageCanvas = document.getElementById("imageResult");
const outputTextBox = document.getElementById("textResult");
let previewUrl;


function showXnbData(xnbData)
{
	if(xnbData.contentType === "Texture2D")
	{
		const {content} = xnbDataToContent(xnbData);
		arrayToImg(content);
		outputTextBox.textContent = "";
	}
	else if(xnbData.contentType === "JSON")
	{
		outputTextBox.textContent = xnbData.rawContent;
		outputImageCanvas.src="assets/blank.png";
	}
	else
	{
		outputTextBox.textContent = "[Binary Data]";
		outputImageCanvas.src="assets/blank.png";
	}
	return xnbData;
}

function pngLoad({target})
{
	let result = target.result;
	arrayToImg(result);
}

function arrayToImg(buffer)
{
	window.URL.revokeObjectURL(previewUrl);

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

function extractFileName(fullname)
{
	let matcher = fullname.match(/(.*)\.([^\s.]+)$/);
	if(matcher === null) return [fullname,null];
	return [ matcher[1], matcher[2] ];
}

function closeButton(error)
{
	console.warn(error);
	zipper.inactiveDownloadButton();
}

/******************************************************************************/
/*                                  Show Code                                 */
/*----------------------------------------------------------------------------*/
const codeBox = document.getElementById("code");


function codeMaker(strings, {yaml=false, contentOnly=false}={})
{
	let configList=[];
	if(yaml) configList.push("yaml:true");
	if(contentOnly) configList.push("contentOnly:true");
	const configString = configList.length > 0 ? `, {${configList.join(", ")}}` : "";
	return strings[0] + configString + strings[1];
}


function showCode()
{
const code=codeMaker`import { unpackToFiles } from "./libs/xnb.module.js";
async function handleFile(file)
{
	return unpackToFiles(file${options});
}`;
	codeBox.textContent = code;
}



export {addEventlistener_unpack};