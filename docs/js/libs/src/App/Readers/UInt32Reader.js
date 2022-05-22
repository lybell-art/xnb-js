import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import BufferWriter from "../BufferWriter.js";

/**
 * UInt32 Reader
 * @class
 * @extends BaseReader
 */
export default class UInt32Reader extends BaseReader {
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