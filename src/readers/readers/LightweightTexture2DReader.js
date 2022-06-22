import BaseReader from "./BaseReader.js";
import Int32Reader from "./Int32Reader.js";
import UInt32Reader from "./UInt32Reader.js";

/**
 * Lightweight Texture2D Reader. Exclude DXT compressors.
 * @class
 * @extends BaseReader
 */
export default class LightweightTexture2DReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Texture2DReader':
				return true;
			default: return false;
		}
	}
	static type()
	{
		return "Texture2D";
	}

	/**
	 * Reads Texture2D from buffer.
	 * @param {BufferReader} buffer
	 * @returns {object}
	 */
	read(buffer) {
		const int32Reader = new Int32Reader();
		const uint32Reader = new UInt32Reader();

		let format = int32Reader.read(buffer);
		let width = uint32Reader.read(buffer);
		let height = uint32Reader.read(buffer);
		let mipCount = uint32Reader.read(buffer);

		if (mipCount > 1)
			console.warn(`Found mipcount of ${mipCount}, only the first will be used.`);

		let dataSize = uint32Reader.read(buffer);
		let data = buffer.read(dataSize);
		data = new Uint8Array(data);

		if (format != 0)
			throw new Error("Compressed texture format is not supported!");

		// add the alpha channel into the image
		for(let i = 0; i < data.length; i += 4) {
			let inverseAlpha = 255 / data[i + 3];
			data[i    ] = Math.min(Math.ceil(data[i    ] * inverseAlpha), 255);
			data[i + 1] = Math.min(Math.ceil(data[i + 1] * inverseAlpha), 255);
			data[i + 2] = Math.min(Math.ceil(data[i + 2] * inverseAlpha), 255);
		}

		return {
			format,
			export: { 
				type: this.type, 
				data,
				width,
				height
			}
		};
	}

	/**
	 * Writes Texture2D into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		if (content.format != 0) throw new Error("Compressed texture format is not supported!");

		const int32Reader = new Int32Reader();
		const uint32Reader = new UInt32Reader();

		this.writeIndex(buffer, resolver);

		const width = content.export.width;
		const height = content.export.height;

		int32Reader.write(buffer, content.format, null);
		uint32Reader.write(buffer, content.export.width, null);
		uint32Reader.write(buffer, content.export.height, null);
		uint32Reader.write(buffer, 1, null);

		let data = content.export.data;

		for (let i = 0; i < data.length; i += 4) {
			const alpha = data[i + 3] / 255;
			data[i    ] = Math.floor(data[i    ] * alpha);
			data[i + 1] = Math.floor(data[i + 1] * alpha);
			data[i + 2] = Math.floor(data[i + 2] * alpha);
		}
		
		uint32Reader.write(buffer, data.length, null);
		buffer.concat(data);
	}

	isValueType() {
		return false;
	}

	get type()
	{
		return "Texture2D";
	}
}
