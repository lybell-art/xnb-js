import {BaseReader,
	ListReader, 
	StringReader, 
	NullableReader
} from "../../readers/src/readers.js"; //@xnb/readers

/**
 * ConcessionTaste Reader
 * @class
 * @extends BaseReader
 */
export default class ConcessionTasteReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.ConcessionTaste':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["ConcessionTaste", 
		'String', //name
		'Nullable<List<String>>:2', "List<String>", 'String', //lovedTags
		'Nullable<List<String>>:2', "List<String>", 'String', //likedTags
		'Nullable<List<String>>:2', "List<String>", 'String', //dislikedTags
		];
	}
	static type()
	{
		return "Reflective<ConcessionTaste>";
	}

	/**
	 * Reads ConcessionTaste from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));

		let Name = resolver.read(buffer);
		let LovedTags = nullableStringListReader.read(buffer, resolver);
		let LikedTags = nullableStringListReader.read(buffer, resolver);
		let DislikedTags = nullableStringListReader.read(buffer, resolver);

		return {
			Name,
			LovedTags,
			LikedTags,
			DislikedTags
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		
		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Name, resolver);
		nullableStringListReader.write(buffer, content.LovedTags, resolver);
		nullableStringListReader.write(buffer, content.LikedTags, resolver);
		nullableStringListReader.write(buffer, content.DislikedTags, resolver);
	}

	isValueType() {
		return false;
	}
}