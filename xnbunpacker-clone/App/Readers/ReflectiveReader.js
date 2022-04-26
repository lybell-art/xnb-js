import BaseReader from "./BaseReader.js";
import BufferWriter from "../BufferWriter.js";

/**
 * Reflective Reader
 * @class
 * @extends BaseReader
 */
export default class ReflectiveReader extends BaseReader {
	/**
	 * Reads Reflection data from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Mixed}
	 */
	read(buffer) {
		
	}

	/**
	 * Writes Reflection data and returns buffer
	 * @param {BufferWriter} buffer
	 * @param {Number} content
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeInt32(content);
	}
}
