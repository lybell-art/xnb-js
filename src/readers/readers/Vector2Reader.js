import BaseReader from "./BaseReader.js";
import SingleReader from "./SingleReader.js";

/**
 * Vector2 Reader
 * @class
 * @extends BaseReader
 */
export default class Vector2Reader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Vector2Reader':
			case 'Microsoft.Xna.Framework.Vector2':
				return true;
			default: return false;
		}
	}

	/**
	 * Reads Vector2 from buffer.
	 * @param {BufferReader} buffer
	 * @returns {object}
	 */
	read(buffer) {
		const singleReader = new SingleReader();

		let x = singleReader.read(buffer);
		let y = singleReader.read(buffer);

		return { x, y };
	}
}
