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
} from "./core/xnb-core.module.js"; // @xnb/core
import * as Reader from "./readers/xnb-readers.module.js"; // @xnb/readers
import {readers as StardewReader, schemes as StardewScheme, enums as StardewEnum} from "./plugins/xnb-stardew.module.js"; // @xnb/plugin-stardewValley
import * as StardewLegacyReader from "./plugins/xnb-stardew-legacy.module.js"; // @xnb/plugin-stardewValley 1.5

const readers_1_6 = {...Reader, ...StardewReader};
const readers_1_5 = {...Reader, ...StardewLegacyReader};

setReaders(readers_1_6);
setSchemes(StardewScheme);
setEnum(StardewEnum);

// for stardew valley 1.5 mobile / console
function toggleLegacy(isLegacy)
{
	if(isLegacy) setReaders(readers_1_5);
	else setReaders(readers_1_6);
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
	XnbContent,

	toggleLegacy
};