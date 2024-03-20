import {BaseReader,
	ListReader,
} from "../../readers/readers.js"; //@xnb/readers
import RectReader from "./RectReader.js"

/**
 * RectGroup Reader
 * @class
 * @extends BaseReader
 */
export default class RectGroupReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.RectGroup':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["RectGroup", 
			"List<Rect>", "Rect"
		];
	}
	static type()
	{
		return "Reflective<RectGroup>";
	}

	/**
	 * Reads RectGroup from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const Rects = resolver.read(buffer); //List<Rect>
		
		return {Rects};
	}

	write(buffer, content, resolver) {
		const rectListReader = new ListReader(new RectReader());

		this.writeIndex(buffer, resolver);

		rectListReader.write(buffer, content.Rects, resolver);
	}

	isValueType() {
		return false;
	}
}