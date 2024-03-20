import {
	setReaders,
	addReaders,
	setSchemes,

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
} from "../../../src/core/Xnb.js"; // @xnb/core
import * as Reader from "../../../src/readers/readers.js"; // @xnb/readers
import {readers as StardewReader, schemes as StardewScheme} from "../../../src/plugins-stardewvalley/index.js"; // @xnb/plugin-stardewValley

setReaders({...Reader, ...StardewReader});
setSchemes(StardewScheme);

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