import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import BufferWriter from "../BufferWriter.js";
import StringReader from "./StringReader.js";

/**
 * BmFont Reader
 * @class
 * @extends BaseReader
 */
export default class BmFontReader extends BaseReader {
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
		stringReader.write(buffer, content.data, null);
	}

	isValueType() {
		return false;
	}
}