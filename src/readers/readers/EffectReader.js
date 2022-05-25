import BaseReader from "./BaseReader.js";
import UInt32Reader from "./UInt32Reader.js";

/**
 * Effect Reader
 * @class
 * @extends BaseReader
 */
export default class EffectReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.EffectReader':
			case 'Microsoft.Xna.Framework.Graphics.Effect':
				return true;
			default: return false;
		}
	}

	read(buffer) {
		const uint32Reader = new UInt32Reader();

		const size = uint32Reader.read(buffer);
		const bytecode = buffer.read(size);

		return { export: { type: this.type, data: bytecode } };
	}

	/**
	 * Writes Effects into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);

		const data = content.export.data;
		const uint32Reader = new UInt32Reader();

		uint32Reader.write(buffer, data.byteLength, null);
		buffer.concat(data);
	}

	isValueType() {
		return false;
	}
}