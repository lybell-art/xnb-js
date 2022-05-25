import {
	setReaders,
	addReaders,

	unpackToXnbData, 
	unpackToContent, 
	unpackToFiles, 

	bufferToXnb, 
	bufferToContents, 

	xnbDataToContent, 
	xnbDataToFiles,
	pack,
	XnbData,
	XnbContent
} from "./core/xnb-core.module.js"; // @xnb/core
import * as Reader from "./readers/xnb-readers.module.js"; // @xnb/readers
import * as StardewReader from "./plugins/xnb-stardew.module.js"; // @xnb/plugin-stardewValley

setReaders({...Reader, ...StardewReader});

export {
	Reader,
	addReaders,

	unpackToXnbData, 
	unpackToContent, 
	unpackToFiles, 

	bufferToXnb, 
	bufferToContents, 

	xnbDataToContent, 
	xnbDataToFiles,
	pack,
	XnbData,
	XnbContent
};