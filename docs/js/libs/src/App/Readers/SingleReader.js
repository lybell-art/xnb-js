import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";

/**
 * Single Reader
 * @class
 * @extends BaseReader
 */
export default class SingleReader extends BaseReader {
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
