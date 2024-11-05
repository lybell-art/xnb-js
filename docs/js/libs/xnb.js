import {
	setReaders,
	addReaders,
	setSchemes,
	setEnum,

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
} from "./core/xnb-core.module.js" // @xnb/core
import * as Reader from "./readers/xnb-readers.module.js"; // @xnb/readers
import {
	readers as StardewReader,
	schemes as StardewScheme, 
	enums as StardewEnum
} from "./plugins/xnb-stardew.module.js"; // @xnb/plugin-stardewValley

const readers_1_6 = {...Reader, ...StardewReader};
let loaded = false;

if(!loaded) {
	setReaders(readers_1_6);
	setSchemes(StardewScheme);
	setEnum(StardewEnum);
	console.log("---loaded readers!---");
}

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