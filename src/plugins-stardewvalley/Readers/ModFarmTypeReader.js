import {BaseReader,
	NullableReader,
	StringReader,
	DictionaryReader
} from "../../readers/readers.js"; //@xnb/readers

/**
 * ModFarmType Reader
 * @class
 * @extends BaseReader
 */
export default class ModFarmTypeReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModFarmType':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["ModFarmType", 
			"String", // ID
			"String", // tooltipStringPath
			"String", // mapName
			"Nullable<String>:1", "String", //iconTexture
			"Nullable<String>:1", "String", //worldMapTexture
			"Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String" //modData
		];
	}
	static type()
	{
		return "Reflective<ModFarmType>";
	}

	/**
	 * Reads ModFarmType from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableStringDictReader = new NullableReader(
			new DictionaryReader( new StringReader() )
		);

		const ID = resolver.read(buffer);
		const TooltipStringPath = resolver.read(buffer);
		const MapName = resolver.read(buffer);
		const IconTexture = nullableStringReader.read(buffer, resolver);
		const WorldMapTexture = nullableStringReader.read(buffer, resolver);
		const ModData = nullableStringDictReader.read(buffer, resolver);

		return {
			ID,
			TooltipStringPath,
			MapName,
			IconTexture,
			WorldMapTexture,
			ModData
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableStringDictReader = new NullableReader(
			new DictionaryReader( new StringReader() )
		);

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.TooltipStringPath, resolver);
		stringReader.write(buffer, content.MapName, resolver);
		nullableStringReader.write(buffer, content.IconTexture, resolver);
		nullableStringReader.write(buffer, content.WorldMapTexture, resolver);
		nullableStringDictReader.write(buffer, content.ModData, resolver);
	}

	isValueType() {
		return false;
	}
}