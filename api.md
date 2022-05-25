xnb.js api
=============
This is the usage and API of **xnb.js**.
## Unpacking
### unpackToXnbData( file : File/Buffer )
- ``file`` (File / Buffer) : xnb file to unpack
- Returns : Promise - Fulfills with the unpacked XnbData with headers.

Asynchronously reads the xnb file, and return the data as a object.
```js
// browser usage
document.getElementById("fileInput").addEventlistener(function(){
	const file = this.files[0];
	XNB.unpackToXnbData( file ).then(e=>console.log(e)); // returns XnbData{ header:..., readers:..., content:...}
})
// node.js usage
fs.readFile("./Crobus.xnb")
	.then( unpackToXnbData )
	.then( e=>console.log(e) ); // returns XnbData{ header:..., readers:..., content:...}
```
### unpackToContent( file : File/Buffer )
- ``file`` (File / Buffer) : xnb file to unpack
- Returns : Promise - Fulfills with the unpacked XnbContent without headers.

Asynchronously reads the xnb file, and return the content data only.
```js
// browser usage
document.getElementById("fileInput").addEventlistener(function(){
	const file = this.files[0];
	XNB.unpackToContent( file ).then(e=>console.log(e)); // returns XnbContent{ type:..., content:...}
})
// node.js usage
fs.readFile("./Crobus.xnb")
	.then( unpackToContent )
	.then( e=>console.log(e) ); // returns XnbContent{ type:..., content:...}
```
### unpackToFiles( file : File/Buffer, config : Object )
- ``file`` (File / Buffer) : xnb file to unpack
- ``config`` (Object) : configs
	- ``yaml`` (Boolean) : If ``true``, it returns header file as yaml format. Compatible with XnbExtract.
	- ``contentOnly`` (Boolean) : If ``true``, it returns only content files except header data.
	- ``fileName`` (String) : The name of the file to return.
- Returns : Promise - Fullfills with Blob array contains unpacked files.

Asynchronously reads the xnb file, and return the unpacked files array. Text data returns as json format.(yaml format if `yaml` is `true`)
If both ``yaml`` and ``contentOnly`` are ``true``, then ``yaml`` is ignored.
Each element of returned array is an object consisting of `{data, extension}`. `data` is the actual data of the unpacked file, either the Blob object (browser) or the Uint8Array (node.js), and `extension` is the extension of the unpacked file.
```js
// browser usage
document.getElementById("fileInput").addEventlistener(function(){
	const file = this.files[0];
	XNB.unpackToFiles( file ).then(e=>{
		for(let {data, extension} of e)
		{
			console.log(data); // returns Blob()
			console.log(extension); // returns "png", "json", etc...
		}
	});
})
// node.js usage
const fileName = "Crobus.xnb";
const baseName = path.basename(fileName, ".xnb");
fs.readFile(`./${fileName}`)
	.then( e=>XBM.unpackToFiles( file, { fileName:baseName }) )
	.then( e=>{
		for(let {data, extension} of e)
		{
			console.log(data); // returns UInt8Array()
			console.log(extension); // returns "png", "json", etc...
		}
	} );
```

### bufferToXnb( buffer : ArrayBuffer )
- ``buffer`` (ArrayBuffer) : the binary buffer of xnb file
- Returns : XnbData

Convert buffer of xnb to object with headers.
```js
// browser usage
document.getElementById("fileInput").addEventlistener(function(){
	const file = this.files[0];
	const fileReader = new FileReader();
	fileReader.readAsArrayBuffer(file);
	fileReader.onload = function(){
		const data = XNB.bufferToXnb(this.result); // returns XnbData{ header:..., readers:..., content:...}
	}
})
// node.js usage
const buffer = fs.readFileSync("./Crobus.xnb");
const xnbData = XNB.bufferToXnb(buffer); // returns XnbData{ header:..., readers:..., content:...}
```

### bufferToContents( buffer : ArrayBuffer )
- ``buffer`` (ArrayBuffer) : the binary buffer of xnb file
- Returns : XnbContent

Convert buffer of xnb to object with only contents.

### xnbDataToContent( loadedXnb : XnbData )
- ``loadedXnb`` (XnbData) : the xnb object with header data
- Returns : XnbContent

Convert XnbData to XnbContent.

### xnbDataToFiles( xnbObject : XnbData, config : Object )
- ``file`` (File / Buffer) : xnb file to unpack
- ``config`` (Object) : configs
	- ``yaml`` (Boolean) : If ``true``, it returns header file as yaml format. Compatible with XnbExtract.
	- ``contentOnly`` (Boolean) : If ``true``, it returns only content files except header data.
	- ``fileName`` (String) : The name of the file to return.
- Returns : Promise - Fullfills with Blob array contains unpacked files.

Convert XnbData to Files array. The format of the array is the same as that of `unpackToFiles`.

## Packing

### pack( files : Flielist/Array, configs : Object )
- ``files`` (Filelist/Array) : A array of files to be packed to xnb. Json or yaml file must be included.
- ``configs`` (Object) : configs
	- ``compression`` (String) : Compression method. default is ``"default"``.
	- ``debug`` (Boolean) : If `true`, it returns the success and failure results of all files.
	
Receive a list of files to pack and convert them into xnb files. The json or yaml file containing the information in the header must be included. Compatible with XnbExtract.
The compression methods currently supported by xnb.js are the following:
- `"default"` : Try to use the compression algorithm specified in the header. Files specified as LZ4 compression perform LZ4 compression. Because the LZX compression algorithm is not implemented, files specified as LZX compression are not compressed.
- `"none"` : Export the file with uncompressed data.
- `"LZ4"` : Use LZ4 compression. Ensure a smaller file size. Exported file is incompatible with XnbExtract because it cannot read xnb files compressed with LZ4.

You can directly put `Filelist` object in a browser environment. But in a node.js environment, there is no `FileList` object, so you must put an array whose elements are `{name, data}` objects as parameters. `name` means the name of the file and `data` means the actual binary buffer of the file.
To use this in a node.js environment, see the following example:
```js
const files = await readdir(input);
const fileList = [];

// make fileList
for (let name of files)
{
	const readPath = path.resolve(input, name);
	const data = await readFile(readPath);
	fileList.push({name, data});
}

// pack to xnb data
const result = await pack(fileList);
console.log(result);
```

## Reader Plugins

### setReaders( readers : Object\<BaseReader\> )
- ``readers`` (ArrayBuffer) : Reader

Specifies the type of reader used by xnb.js. This is useful when you want to use only certain readers.
The key of ``readers`` should be a recognizable data name+Reader for the header of the xnb file, and the value should include the reader class that inherited the BaseReader. See the following example:
```js
import {setReaders} from "@xnb/core";
import {LightweightTexture2DReader, StringReader} from "@xnb/readers";

setReaders({
	Texture2DReader : LightweightTexture2DReader,
	StringReader : StringReader
});
```

### addReaders( readers : Object\<BaseReader\> )
- ``readers`` (ArrayBuffer) : Reader

Add the readers used by xnb.js. This is useful when you want to add plugins. See the following example:
```js
import {addReaders} from "xnb";
import * as StardewReader from "@xnb/stardew-valley";

addReaders(StardewReader);
```

## Data Structure
### XnbData
`XnbData` is the object included headers, readers data, and content data extracted from xnb file. `unpackToXnbData()`, and  `bufferToXnb()` returns this. When unpacking xnb using the library as a worker, you can convert json data into XnbData objects.
#### XnbData( header : Object, readers : Array, content : Object )
- `header` (Object) : Header of xnb
	- `target` (String) : Target of xnb. It must be 'w', 'm', 'x', 'a', or 'i'
	- `formatVersion` (Number) : Format version of xnb. It must be 3,4, or 5.
	- `hidef` (Boolean) : Graphic profile of xnb. If `true`, it means HiDef, and if `false`, it means Reach.
	- `compressed` (Boolean/Number) : Indicates whether xnb is compressed. It can be specified as 128 (LZX compression) or 64 (LZ4 compression).
- `readers` (Array) : Reader data of xnb
- `content` (Object) : Content data of xnb

Create new `XnbData` object.
#### XnbData.prototype.header
Header of xnb.
#### XnbData.prototype.readers
Reader data of xnb.
#### XnbData.prototype.content
Content data of xnb.
#### XnbData.prototype.target *readonly*
Returns xnb of target platform.
#### XnbData.prototype.formatVersion *readonly*
Returns xnb of format version.
#### XnbData.prototype.hidef *readonly*
Returns whether xnb is in hiDef mode.
#### XnbData.prototype.compressed *readonly*
Returns whether xnb was compressed.
#### XnbData.prototype.contentType *readonly*
Returns the content type of xnb. The content type can be one of five:
| contentType | Description |
|--|--|
| Texture2D | Texture data like sprites, portraits. |
| TBin | Map file. |
| Effect | Effect binary data. |
| BMFont | Font data. This is the xml format. |
| JSON | Object data like item data or dialogue. |
#### XnbData.prototype.rawContent *readonly*
Returns the actual content of xnb. If `XnbData.prototype.content` contains `export` (Texture2D, TBin, Effect, BMFont), it returns a binary of that content; otherwise, it returns json data.
Texture2D-type content returns color array that is not compressed in png format.
#### XnbData.prototype.stringify()
Convert this as stringified json.

### XnbContent
`XnbContent` is an object that contains only content extracted from an Xnb file.
#### XnbContent.prototype.type
Returns the content type of xnb. 
#### XnbContent.prototype.content
Returns xnb's actual content data in `Blob`/`Uint8Array` format.
Texture2D-type content returns data compressed in png format. You can use the Blob URL to display an image in a browser environment.