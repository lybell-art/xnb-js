import {BaseReader,
	Int32Reader,
	BooleanReader,
	StringReader,
	NullableReader,
	ListReader,
	DictionaryReader
} from "../../readers/readers.js"; //@xnb/readers

/**
 * BigCraftableData Reader
 * @class
 * @extends BaseReader
 */
export default class BigCraftableDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.BigCraftables.BigCraftableData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["BigCraftableData", 
			"String", // name
			"String", // DisplayName
			"String", // Description
			null, // Price
			null, // Fragility
			null, // CanBePlacedOutdoors
			null, // CanBePlacedIndoors
			null, // IsLamp
			"Nullable<String>:1", "String", // Texture
			null, // SpriteIndex
			"Nullable<List<String>>:2", "List<String>", "String", // contextTags
			"Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String" //CustomFields
		];
	}
	static type()
	{
		return "Reflective<BigCraftableData>";
	}

	/**
	 * Reads BigCraftableData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableListStringReader = new NullableReader(
			new ListReader(new StringReader())
		);
		const nullableDictStringReader = new NullableReader(
			new DictionaryReader(new StringReader(), new StringReader())
		);

		let Name = resolver.read(buffer);
		let DisplayName = resolver.read(buffer);
		let Description = resolver.read(buffer);

		let Price = int32Reader.read(buffer);
		let Fragility = int32Reader.read(buffer);
		let CanBePlacedOutdoors = booleanReader.read(buffer);
		let CanBePlacedIndoors = booleanReader.read(buffer);
		let IsLamp = booleanReader.read(buffer);

		let Texture = nullableStringReader.read(buffer, resolver);
		let SpriteIndex = int32Reader.read(buffer);
		let ContextTag = nullableListStringReader.read(buffer, resolver);
		let CustomFields = nullableDictStringReader.read(buffer, resolver);

		return {
			Name,
			DisplayName,
			Description,
			Price,
			Fragility,
			CanBePlacedOutdoors,
			CanBePlacedIndoors,
			IsLamp,
			Texture,
			SpriteIndex,
			ContextTag,
			CustomFields
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableListStringReader = new NullableReader(
			new ListReader(new StringReader())
		);
		const nullableDictStringReader = new NullableReader(
			new DictionaryReader(new StringReader(), new StringReader())
		);

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Name, resolver);
		stringReader.write(buffer, content.DisplayName, resolver);
		stringReader.write(buffer, content.Description, resolver);

		int32Reader.write(buffer, content.Price, null);
		int32Reader.write(buffer, content.Fragility, null);
		booleanReader.write(buffer, content.CanBePlacedOutdoors, null);
		booleanReader.write(buffer, content.CanBePlacedIndoors, null);
		booleanReader.write(buffer, content.IsLamp, null);

		nullableStringReader.write(buffer, content.Texture, resolver);
		int32Reader.write(buffer, content.SpriteIndex, null);
		nullableListStringReader.write(buffer, content.ContextTag, resolver);
		nullableDictStringReader.write(buffer, content.CustomFields, resolver);
	}

	isValueType() {
		return false;
	}
}