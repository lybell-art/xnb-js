import {BaseReader,
	StringReader,
	NullableReader,
	ListReader
} from "../../readers/src/readers.js"; //@xnb/readers
import MovieReactionReader from "./MovieReactionReader.js";

/**
 * MovieCharacterReaction Reader
 * @class
 * @extends BaseReader
 */
export default class MovieCharacterReactionReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieCharacterReaction':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["MovieCharacterReaction", 
			"String", // NPCName
			"Nullable<List<MovieReaction>>:34", "List<MovieReaction>", MovieReactionReader.parseTypeList() //reactions
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
		const nullableReactionListReader = new NullableReader(
			new ListReader( new MovieReactionReader() )
		);

		const NPCName = resolver.read(buffer);
		const Reactions = nullableReactionListReader.read(buffer, resolver);
		
		return {
			NPCName,
			Reactions
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableReactionListReader = new NullableReader(
			new ListReader( new MovieReactionReader() )
		);

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.NPCName, resolver);
		nullableReactionListReader.write(buffer, content.Reactions, resolver);
	}

	isValueType() {
		return false;
	}
}