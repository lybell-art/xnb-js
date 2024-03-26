import { bufferToXnb } from "./workerHelper.js";
import { extractFileName } from "./utils.js";
import { xnbDataToContent, xnbDataToFiles } from "./libs/xnb.js";
import zipDownloadMaker from "./zipDownloadMaker.js";

let fileState = [];
const options = {yaml:false, contentOnly:false};

/******************************************************************************/
/*                             Add Event Listener                             */
/*----------------------------------------------------------------------------*/

function addEventlistener_unpack()
{
	// add file change event handler
	const fileImporter = document.getElementById("toUnpackFile");
	fileImporter.addEventListener("change", ()=>setFiles(fileImporter.files));

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
		handleFiles();
	});
	contentOnlyChecker.addEventListener("change", function(){
		options.contentOnly = this.checked;
		if(this.checked && yamlChecker.checked)
		{
			yamlChecker.checked = false;
			options.yaml = false;
		} 
		showCode();
		handleFiles();
	});
}

/******************************************************************************/
/*                                Handle Files                                */
/*----------------------------------------------------------------------------*/
const outputPreviewer = document.getElementById("preview");

function setFiles(files)
{
	if(!files || files.length === 0) return;
	fileState = [...files];
	showCode();
	handleFiles();
}

function handleFiles()
{
	if(!fileState || fileState.length === 0) return;

	let zipFileName;
	if(fileState.length === 1) [zipFileName] = extractFileName(fileState[0].name);
	else zipFileName = "result";

	zipper.initialize(zipFileName);
	outputPreviewer.reset(fileState.length);

	return Promise.allSettled( fileState.map( handleEachFile ) )
		.then( (result)=>result
			.filter( ({status})=>status === "fulfilled" )
			.map( ({value})=>value )
			.flat()
		)
		.then( (result)=>{
			if(result.length === 0) return zipper.inactiveDownloadButton();
			else return zipper.export(result);
		} )
}

async function handleEachFile(file, index)
{
	const [baseName] = extractFileName(file.name);

	outputPreviewer.showLoading(index);
	try{
		const data = await file.arrayBuffer().then(bufferToXnb);
		const previewData = convertXnbDataToShow(data);
		outputPreviewer.showData(previewData, index);
		const result = await xnbDataToFiles(data, {...options, fileName:baseName});
		result.forEach( file=>file.fileName=baseName );
		return result;
	}
	catch(error) {
		console.log(error);
		outputPreviewer.showError(error, index);
	}
}


/******************************************************************************/
/*                           Convert Preview Data                             */
/*----------------------------------------------------------------------------*/

function convertXnbDataToShow(xnbData)
{
	if(xnbData.contentType === "Texture2D")
	{
		const {content} = xnbDataToContent(xnbData);
		return new Blob([content], {type: "image/png"});
	}
	else if(xnbData.contentType === "JSON") return xnbData.rawContent;
	else return "[Binary Data]";
}


/******************************************************************************/
/*                        Unpack XNB and Make Zip File                        */
/*----------------------------------------------------------------------------*/
const zipper = new zipDownloadMaker(
	document.getElementById("downloadUnpacked"),
	({data})=>data,
	({fileName, extension}, baseName)=>`${fileName ?? baseName}.${extension}`
);



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



export {addEventlistener_unpack, setFiles as setUnpackFiles};