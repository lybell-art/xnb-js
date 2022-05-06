import { pack } from "./src/xnbUnpacker.js";
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
	const fileImportButton = document.getElementById("toPackImport");
	fileImportButton.addEventListener("click", ()=>{fileImporter.click();});
}

/******************************************************************************/
/*                                Handle Files                                */
/*----------------------------------------------------------------------------*/

function handleFiles()
{
	if(!this.files || this.files.length === 0) return;

	pack(this.files, {debug:true}).then((files)=>{console.log(files); return files;});
/*	pack(this.files).then((files)=>{console.log(files); return files;}).then(xnbPackToZip);*/
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


export {addEventlistener_pack};