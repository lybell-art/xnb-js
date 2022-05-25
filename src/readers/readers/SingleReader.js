import BaseReader from "./BaseReader.js";

/**
 * Single Reader
 * @class
 * @extends BaseReader
 */
export default class SingleReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.SingleReader':
			case 'System.Single':
				return true;
			default: return false;
		}
	}

	/**
	 * Reads Single from the buffer.
	 * @param {BufferReader} buffer
	 * @returns {Number}
	 */
	read(buffer) {
		return buffer.readSingle();
	}

	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeSingle(content);
	}
}
