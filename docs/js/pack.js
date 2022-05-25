import { pack } from "./libs/xnb.js";
import zipDownloadMaker from "./zipDownloadMaker.js";

const options = {compression:"default"};

/******************************************************************************/
/*                             Add Event Listener                             */
/*----------------------------------------------------------------------------*/

function addEventlistener_pack()
{
	// add file change event handler
	const fileImporter = document.getElementById("toPackFile");
	fileImporter.addEventListener("change", handleFiles);

	// add file import button
	const fileImportButton = document.getElementById("packButton");
	fileImportButton.addEventListener("click", ()=>{fileImporter.click();});

	// add checkbox event handler
	const lz4Checker = document.getElementById("check_lz4");

	lz4Checker.addEventListener("change", function(){
		options.compression = this.checked ? "LZ4" : "default";
		showCode();
		handleFiles.call(fileImporter);
	});
}

/******************************************************************************/
/*                                Handle Files                                */
/*----------------------------------------------------------------------------*/

function handleFiles()
{
	if(!this.files || this.files.length === 0) return;

	showCode();

//	pack(this.files, {...options, debug:true}).then((files)=>{console.log(files); return files;});
	pack(this.files, options).then(xnbPackToZip).catch(closeButton);
}


/******************************************************************************/
/*                        Pack to XNB and Make Zip File                       */
/*----------------------------------------------------------------------------*/

const zipper = new zipDownloadMaker(
	document.getElementById("downloadPacked"),
	({data})=>data,
	({name}, baseName)=>`${name}.xnb`
);

function xnbPackToZip(xnbs)
{
	zipper.initialize("result");
	zipper.export(xnbs);
}

function closeButton()
{
	zipper.inactiveDownloadButton();
}

/******************************************************************************/
/*                                  Show Code                                 */
/*----------------------------------------------------------------------------*/
const codeBox = document.getElementById("code");

function codeMaker(strings, {compression="default"}={})
{
	let configList=[];
	if(compression !== "default") configList.push(`compression:${compression}`);
	const configString = configList.length > 0 ? `, {${configList.join(", ")}}` : "";
	return strings[0] + configString + strings[1];
}

function showCode()
{
const code=codeMaker`import { pack } from "./libs/xnb.module.js";
async function handleFile(files)
{
	return pack(files${options});
}`;
	codeBox.textContent = code;
}


export {addEventlistener_pack};