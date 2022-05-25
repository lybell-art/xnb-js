import BaseReader from "./BaseReader.js";
import StringReader from "./StringReader.js";

/**
 * BmFont Reader
 * @class
 * @extends BaseReader
 */
export default class BmFontReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'BmFont.XmlSourceReader':
				return true;
			default: return false;
		}
	}
	
	/**
	 * Reads BmFont from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Object}
	 */
	read(buffer) {
		const stringReader = new StringReader();
		const xml = stringReader.read(buffer);
		return { export: { type: this.type, data: xml } };
	}

	/**
	 * Writes BmFont into buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data
	 * @param {ReaderResolver}
	 */
	write(buffer, content, resolver) {
		// write index of reader
		this.writeIndex(buffer, resolver);
		const stringReader = new StringReader();
		stringReader.write(buffer, content.export.data, null);
	}

	isValueType() {
		return false;
	}
}