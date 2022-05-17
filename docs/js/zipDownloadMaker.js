/******************************************************************************/
/*                          Unpack and Make Zip File                          */
/*----------------------------------------------------------------------------*/

class zipDownloadMaker
{
	/**
	 * @param {HTMLElement} linkElement
	 * @param {Function} data make function
	 * @param {Function} file name make function
	 */
	constructor(linkElement, dataMaker=(data)=>data, fileNameMaker=(data, baseName)=>baseName)
	{
		this.linkElement = linkElement;
		this.url = null;
		this.baseName = "result";
		this.dataMaker = dataMaker;
		this.fileNameMaker = (data)=>fileNameMaker(data, this.baseName);

		this.zipper = new JSZip();

		this.virtualLink = document.createElement("a");
		this.linkElement.addEventListener("click", (e)=>{
			if(linkElement.classList.contains("inactive")) return;
			this.virtualLink.click();
		});

		this.filenameDisplayer = linkElement.getElementsByClassName("js-result-filename")[0] ?? null;
	}
	initialize(name = "result")
	{
		window.URL.revokeObjectURL(this.url);
		this.baseName = name;
	}
	export(blobs)
	{
		if(Array.isArray(blobs) && blobs.length > 1) return this.multiFileExport(blobs);
		return this.singleFileExport(blobs);
	}
	singleFileExport(blobs)
	{
		const [blob] = [blobs].flat();
		const data = this.dataMaker(blob);
		const name = this.fileNameMaker(blob);

		return this.makeDownloadButton(data, name);
	}
	multiFileExport(blobs)
	{
		return this.blobToZip(blobs)
			.then(zip=>this.makeDownloadButton(zip, `${this.baseName}.zip`))
			.then(()=>this.flushZip());
	}
	blobToZip(blobs)
	{
		blobs.forEach( ( blob )=>{
			this.zipper.file(this.fileNameMaker(blob), this.dataMaker(blob));
		});
		return this.zipper.generateAsync({type:"blob", compression: "DEFLATE"});
	}
	makeDownloadButton(zipped, fileName="result.zip")
	{
		this.url = window.URL.createObjectURL(zipped);

		this.virtualLink.href = this.url;
		this.virtualLink.download = fileName;
		this.linkElement.classList.remove("inactive");
		this.displayFilename(fileName);
	}
	displayFilename(fileName="result.zip")
	{
		if(this.filenameDisplayer == null) return;
		this.filenameDisplayer.textContent = fileName;
	}
	flushZip()
	{
		this.zipper.forEach((path)=>this.zipper.remove(path));
	}
	inactiveDownloadButton()
	{
		this.linkElement.classList.add("inactive");
		this.displayFilename("");
	}
}

export default zipDownloadMaker;