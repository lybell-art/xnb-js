import {BaseReader,
	ListReader, 
	Int32Reader, 
	StringReader, 
	NullableReader
} from "../../readers/readers.js"; //@xnb/readers

/**
 * ConcessionItemData Reader
 * @class
 * @extends BaseReader
 */
export default class ConcessionItemDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.ConcessionItemData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["ConcessionItemData", 
		'String', //ID
		'String', //name
		'String', //displayName
		'String', //description
		null, //price
		'String', // texture
		null, //spriteIndex
		'Nullable<List<String>>:2', "List<String>", 'String' //itemTag
		];
	}
	static type()
	{
		return "Reflective<ConcessionItemData>";
	}

	/**
	 * Reads ConcessionItemData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));

		let ID = resolver.read(buffer);
		let Name = resolver.read(buffer);
		let DisplayName = resolver.read(buffer);
		let Description = resolver.read(buffer);
		let Price = int32Reader.read(buffer);
		let Texture = resolver.read(buffer);
		let SpriteIndex = int32Reader.read(buffer);
		let ItemTags = nullableStringListReader.read(buffer, resolver);

		return {
			ID,
			Name,
			DisplayName,
			Description,
			Price,
			Texture,
			SpriteIndex,
			ItemTags
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		
		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.Name, resolver);
		stringReader.write(buffer, content.DisplayName, resolver);
		stringReader.write(buffer, content.Description, resolver);
		int32Reader.write(buffer, content.Price, null);
		stringReader.write(buffer, content.Texture, resolver);
		int32Reader.write(buffer, content.SpriteIndex, null);
		nullableStringListReader.write(buffer, content.ItemTags, resolver);
	}

	isValueType() {
		return false;
	}
}