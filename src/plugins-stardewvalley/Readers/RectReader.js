import {RectangleReader} from "../../readers/src/readers.js"; //@xnb/readers

/**
 * Stardew Valley Rect Reader
 * @class
 * @extends BaseReader
 */
export default class RectReader extends RectangleReader {
	static isTypeOf(type) {
		if( super.isTypeOf(type) ) return true;
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.Rect':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["Rect"];
	}
	static type()
	{
		return "Reflective<Rect>";
	}

	isValueType() {
		return false;
	}
}