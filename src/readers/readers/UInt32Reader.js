import BaseReader from "./BaseReader.js";

/**
 * UInt32 Reader
 * @class
 * @extends BaseReader
 */
export default class UInt32Reader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.UInt32Reader':
			case 'System.UInt32':
				return true;
			default: return false;
		}
	}

	/**
	 * Reads UInt32 from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Number}
	 */
	read(buffer) {
		return buffer.readUInt32();
	}

	/**
	 * 
	 * @param {BufferWriter} buffer 
	 * @param {Number} content 
	 * @param {ReaderResolver} resolver 
	 */
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeUInt32(content);
	}
}