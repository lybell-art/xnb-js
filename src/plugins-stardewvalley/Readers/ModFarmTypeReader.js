import {BaseReader,
	BooleanReader,
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
			null, //spawnMonstersByDefault
			"Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String", //modData
			"Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String" //customFields
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
			new DictionaryReader( new StringReader(), new StringReader() )
		);
		const booleanReader = new BooleanReader();

		const ID = resolver.read(buffer);
		const TooltipStringPath = resolver.read(buffer);
		const MapName = resolver.read(buffer);
		const IconTexture = nullableStringReader.read(buffer, resolver);
		const WorldMapTexture = nullableStringReader.read(buffer, resolver);
		const SpawnMonstersByDefault = booleanReader.read(buffer);
		const ModData = nullableStringDictReader.read(buffer, resolver);
		const CustomFields = nullableStringDictReader.read(buffer, resolver);

		return {
			ID,
			TooltipStringPath,
			MapName,
			IconTexture,
			WorldMapTexture,
			SpawnMonstersByDefault,
			ModData,
			CustomFields
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableStringDictReader = new NullableReader(
			new DictionaryReader( new StringReader(), new StringReader() )
		);
		const booleanReader = new BooleanReader();

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.TooltipStringPath, resolver);
		stringReader.write(buffer, content.MapName, resolver);
		nullableStringReader.write(buffer, content.IconTexture, resolver);
		nullableStringReader.write(buffer, content.WorldMapTexture, resolver);
		booleanReader.write(buffer, content.SpawnMonstersByDefault, null);
		nullableStringDictReader.write(buffer, content.ModData, resolver);
		nullableStringDictReader.write(buffer, content.CustomFields, resolver);
	}

	isValueType() {
		return false;
	}
}