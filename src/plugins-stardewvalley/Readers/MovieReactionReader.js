import {BaseReader,
	StringReader,
	NullableReader,
	ListReader
} from "../../readers/src/readers.js"; //@xnb/readers
import SpecialResponsesReader from "./SpecialResponseReader.js";

/**
 * MovieCharacterReaction Reader
 * @class
 * @extends BaseReader
 */
export default class MovieReactionReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieReaction':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["MovieReaction", 
			"String", // tag
			"Nullable<String>:1", "String", // response
			"Nullable<List<String>>:2", "List<String>", "String", // whitelist
			"Nullable<SpecialResponses>:25", SpecialResponsesReader.parseTypeList(), // specialResponses
			"String" // ID
		];
	}
	static type()
	{
		return "Reflective<MovieCharacterReaction>";
	}

	/**
	 * Reads MovieCharacterReaction from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableStringListReader = new NullableReader( new ListReader( new StringReader() ) );
		const nullableSpecialResponsesReader = new NullableReader( new SpecialResponsesReader() );

		const Tag = resolver.read(buffer);
		const Response = nullableStringReader.read(buffer, resolver) || "like";
		const WhiteList = nullableStringListReader.read(buffer, resolver) || [];
		const SpecialResponses = nullableSpecialResponsesReader.read(buffer, resolver);
		const ID = resolver.read(buffer);
		
		return {
			Tag,
			Response,
			Whitelist,
			SpecialResponses,
			ID
		};
	}

	write(buffer, content, resolver) {
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableStringListReader = new NullableReader( new ListReader( new StringReader() ) );
		const nullableSpecialResponsesReader = new NullableReader( new SpecialResponsesReader() );

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Tag, resolver);
		nullableStringReader.write(buffer, content.Response, resolver);
		nullableStringListReader.write(buffer, content.WhiteList, resolver);
		nullableSpecialResponsesReader.write(buffer, content.SpecialResponses, resolver);
		stringReader.write(buffer, content.ID, resolver);
	}

	isValueType() {
		return false;
	}
}