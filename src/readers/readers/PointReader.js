import BaseReader from "./BaseReader.js";
import Int32Reader from "./Int32Reader.js";

/**
 * Point Reader
 * @class
 * @extends BaseReader
 */
export default class PointReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.PointReader':
			case 'Microsoft.Xna.Framework.Point':
				return true;
			default: return false;
		}
	}

	/**
	 * Reads Rectangle from buffer.
	 * @param {BufferReader} buffer
	 * @returns {object}
	 */
	read(buffer) {
		const int32Reader = new Int32Reader();

		const x = int32Reader.read(buffer);
		const y = int32Reader.read(buffer);

		return { x, y };
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
	}
}
