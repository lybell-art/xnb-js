xnb.js 
=============
**xnb.js** is the javascript library that allows you to handle xnb files on the web or in a node.js environment.

## Description
The xnb format is a compressed data format used by Microsoft XNA Game Studio and is known for its use in games such as the Stardew Valley. xnb.js allows xnb files to be handled on the web without installing any other programs, making it easy to create utility web app or programs, for games using xnb files.
Currently, xnb decompression has been fully implemented, and due to the absence of an open-source JavaScript library that implements the LZX compression algorithm, packing returns uncompressed or compressed xnb files with the lz4 compression algorithm.

Based on LeonBlade's [XnbCli](https://github.com/LeonBlade/xnbcli), xnb.js is rewritten some code dedicated to node.js into universal code regardless of environment. All credits to [LeonBlade](https://github.com/LeonBlade/).

## Try this!
Web XNB Previewer : https://lybell-art.github.io/xnb-js

## Install
You can install xnb.js with npm, or download the library directly and upload it to your own web server or use the existing CDN without a build system.
I recommend that you load xnb.js using the es6 module.

### cdn
You can load and use a library hosted online. Here's how to use it:

#### Load as ES6 Module(Recommended)
```js
import * as XNB from "https://cdn.jsdelivr.net/npm/xnb@1.0.2/dist/xnb.module.js";
```
#### Load as UMD
```html
<script src="https://cdn.jsdelivr.net/npm/xnb@1.0.2/dist/xnb.min.js"></script>
```
If you need to support ES5, such as IE11, I recommend using xnb.es5.min.js.

### npm
```sh
npm install xnb
```
There's no default export. You can use it like this:
```js
import * as XNB from 'xnb';
```

## Examples

### Browsers example
Load and unpack the xnb file, and show the result as image.
```js
import { unpackToContent } from "xnb";
let previewUrl="";
const outputImageCanvas = document.getElementById("output");

document.getElementById("input").addEventListener("change", 
function handleFiles()
{
	if(!this.files || this.files.length === 0) return;
	// read file
	const file=this.files[0];

	// unpack xnb file as contents
	unpackToContent(file).then(function(content){
		// check content's type, and make blob url
		if(content.type === "png")
		{
			window.URL.revokeObjectURL(previewUrl);
			previewUrl = window.URL.createObjectURL(content.content);
			outputImageCanvas.src = previewUrl;
		}
	});
});
```
### Node.js example
Load and unpack the xnb file, and save the results as files.
```js
import { unpackToFiles } from "xnb";
import { readFile } from 'node:fs/promises';

readFile("./Abigail.xnb") // read xnb file as Buffer
.then(xnb=>unpackToFiles(xnb, {fileName:"Abigail.xnb"})) // unpack xnb file
.then(outputs=>{
	// save data to outputs folder
	const writers = [];
	for(let {data, extension} of outputs)
	{
		const writePath = path.resolve("./outputs", `Abigail.${extension}`);
		writers.push(writeFile(writePath, data));
	}
	return Promise.all(writers);
});
```
## API
See this [link](https://github.com/lybell-art/xnb-js/api.md).

## External resource
xnb.js contains dxt.js, lz4.js, and png.js as bundle. libsquish(=dxt.js) and lz4.js were rewritten for es6 module system.
The licenses for the original libraries are as follows.
| Library | Source Code | License |
|--|--|--|
| **dxt.js(Libsquish)** | https://sourceforge.net/projects/libsquish/ | MIT License |
| **LZ4-js** | https://github.com/pierrec/node-lz4 | MIT License |
| **png.js** | https://github.com/lukeapage/pngjs | MIT License |

## License
GNU LGPL 3.0

## Other language
- [한국어](https://github.com/lybell-art/xnb-js/blob/main/readme-ko.md)
