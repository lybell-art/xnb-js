import {BaseReader,
	StringReader,
	BooleanReader,
	Int32Reader
} from "../../readers/readers.js"; //@xnb/readers

/**
 * ModWallpaperOrFlooring Reader
 * @class
 * @extends BaseReader
 */
export default class ModWallpaperOrFlooringReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModWallpaperOrFlooring':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["ModWallpaperOrFlooring", 
			"String", // ID
			"String", // Texture
			null, // IsFlooring
			null // Count
		];
	}
	static type()
	{
		return "Reflective<ModWallpaperOrFlooring>";
	}

	/**
	 * Reads ModWallpaperOrFlooring from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();

		const ID = resolver.read(buffer);
		const Texture = resolver.read(buffer);
		const IsFlooring = booleanReader.read(buffer);
		const Count = int32Reader.read(buffer);

		return {
			ID,
			Texture,
			IsFlooring,
			Count
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const stringReader = new StringReader();

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.Texture, resolver);
		booleanReader.write(buffer, content.IsFlooring, null);
		int32Reader.write(buffer, content.Count, null);
	}

	isValueType() {
		return false;
	}
}