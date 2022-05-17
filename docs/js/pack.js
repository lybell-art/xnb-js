import { pack } from "./libs/xnb.module.js";
import zipDownloadMaker from "./zipDownloadMaker.js";

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
}

/******************************************************************************/
/*                                Handle Files                                */
/*----------------------------------------------------------------------------*/

function handleFiles()
{
	if(!this.files || this.files.length === 0) return;

	showCode();

//	pack(this.files, {debug:true}).then((files)=>{console.log(files); return files;});
	pack(this.files).then(xnbPackToZip).catch(closeButton);
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

function showCode()
{
const code=`import { pack } from "./libs/xnb.module.js";
async function handleFile(files)
{
	return pack(files);
}`;
	codeBox.textContent = code;
}


export {addEventlistener_pack};