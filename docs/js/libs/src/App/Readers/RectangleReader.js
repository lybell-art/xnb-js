import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import BufferWriter from "../BufferWriter.js";
import Int32Reader from "./Int32Reader.js";

/**
 * Rectangle Reader
 * @class
 * @extends BaseReader
 */
export default class RectangleReader extends BaseReader {
	/**
	 * Reads Rectangle from buffer.
	 * @param {BufferReader} buffer
	 * @returns {object}
	 */
	read(buffer) {
		const int32Reader = new Int32Reader();

		const x = int32Reader.read(buffer);
		const y = int32Reader.read(buffer);
		const width = int32Reader.read(buffer);
		const height = int32Reader.read(buffer);

		return { x, y, width, height };
	}

	/**
	 * Writes Effects into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const int32Reader = new Int32Reader();
		int32Reader.write(buffer, content.x, null);
		int32Reader.write(buffer, content.y, null);
		int32Reader.write(buffer, content.width, null);
		int32Reader.write(buffer, content.height, null);
	}
}
