import BaseReader from "./BaseReader.js";

/**
 * Boolean Reader
 * @class
 * @extends BaseReader
 */
export default class BooleanReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.BooleanReader':
			case 'System.Boolean':
				return true;
			default: return false;
		}
	}

	/**
	 * Reads Boolean from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Boolean}
	 */
	read(buffer) {
		return Boolean(buffer.readInt());
	}

	/**
	 * Writes Boolean into buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data
	 * @param {ReaderResolver}
	 */
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeByte(content);
	}
}
