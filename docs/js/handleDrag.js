/******************************************************************************/
/*                             Add Event Listener                             */
/*----------------------------------------------------------------------------*/

function addEventlistener_drag()
{
	const dropElement = document.getElementById("dropArea");
	const dropIndicator = document.querySelector(".drag-indicator");
	const unpackFileImpirter = document.getElementById("toUnpackFile");
	const packFileImporter = document.getElementById("toPackFile");

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
		console.log(e.dataTransfer.files);
	});
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