import { extractFileName } from "./utils.js";
import { setPackFiles } from "./pack.js";
import { setUnpackFiles } from "./unpack.js";

/******************************************************************************/
/*                             Add Event Listener                             */
/*----------------------------------------------------------------------------*/

function addEventlistener_drag()
{
	const dropElement = document.getElementById("dropArea");
	const dropIndicator = document.querySelector(".drag-indicator");

	dropElement.addEventListener("dragenter", (e)=> {
		dropIndicator.classList.remove("hidden");
	});
	dropElement.addEventListener("dragleave", (e)=> {
		if(!isInElement(e.relatedTarget, dropElement)) {
			dropIndicator.classList.add("hidden");
		}
	});
	dropElement.addEventListener("dragover", (e)=> {
		e.preventDefault();
	});
	dropElement.addEventListener("drop", (e)=>{
		e.preventDefault();
		dropIndicator.classList.add("hidden");
		distributeFiles(e.dataTransfer.files);
	});
}

const packFileExtern = new Set(["png", "json", "yaml", "tbin", "cso", "xml"]);

function distributeFiles(files)
{
	let toUnpackFiles = [];
	let toPackFiles = [];
	for(let file of files)
	{
		let [, extern] = extractFileName(file.name);
		if(extern === "xnb") toUnpackFiles.push(file);
		else if(packFileExtern.has(extern) ) toPackFiles.push(file);
	}
	setPackFiles(toPackFiles);
	setUnpackFiles(toUnpackFiles);
}

function isInElement(child, parent)
{
	let target = child;
	while(target != null)
	{
		if(target === parent) return true;
		target = target.parentElement;
	}
	return false;
}


export {addEventlistener_drag};