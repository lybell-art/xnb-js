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
	// The properties of the Rect data type in Stardew Valley are capitalized.
	read(buffer) {
		const {x, y, width, height} = super.read(buffer);
		return { X:x, Y:y, Width:width, Height:height };
	}
	write(buffer, content, resolver) {
		const { X:x, Y:y, Width:width, Height:height } = content;
		super.write(buffer, {x,y,width,height}, resolver);
	}

	isValueType() {
		return false;
	}
}