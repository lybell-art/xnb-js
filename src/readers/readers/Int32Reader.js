import BaseReader from "./BaseReader.js";

/**
 * Int32 Reader
 * @class
 * @extends BaseReader
 */
export default class Int32Reader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Int32Reader':
			case 'Microsoft.Xna.Framework.Content.EnumReader':
			case 'System.Int32':
				return true;
			default: return false;
		}
	}

	/**
	 * Reads Int32 from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Number}
	 */
	read(buffer) {
		return buffer.readInt32();
	}

	/**
	 * Writes Int32 and returns buffer
	 * @param {BufferWriter} buffer
	 * @param {Number} content
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeInt32(content);
	}
}