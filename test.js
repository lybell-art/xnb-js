import {convertXnbData} from "./xnbunpacker-clone/xnbUnpacker.js"

const fileImportButton = document.getElementById("fileImport");
const fileImporter = document.getElementById("file");
fileImportButton.addEventListener("click", ()=>{fileImporter.click();});

fileImporter.addEventListener("change", handleFiles);

function handleFiles()
{
	if(!this.files) return;

	const file=this.files[0];
	if(file.type.search("image/") > -1) console.log("this is image!");
	else console.log("this is xnb file!");

	const fileReader = new FileReader();
	fileReader.readAsArrayBuffer(file);
	fileReader.onload = function() {
		convertXnbData(fileReader.result);
	};
}