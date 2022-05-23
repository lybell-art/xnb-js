import {BaseReader,
	NullableReader
} from "../../readers/src/readers.js"; //@xnb/readers
import CharacterResponseReader from "./CharacterResponseReader.js";

/**
 * SpecialResponses Reader
 * @class
 * @extends BaseReader
 */
export default class SpecialResponsesReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.SpecialResponses':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["SpecialResponses", 
			"Nullable<CharacterResponse>:7", CharacterResponseReader.parseTypeList(), // beforeMovie
			"Nullable<CharacterResponse>:7", CharacterResponseReader.parseTypeList(), // duringMovie
			"Nullable<CharacterResponse>:7", CharacterResponseReader.parseTypeList() // afterMovie
		];
	}
	static type()
	{
		return "Reflective<SpecialResponses>";
	}

	/**
	 * Reads SpecialResponses from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const nullableCharacterResponseReader = new NullableReader( new CharacterResponseReader() );

		const BeforeMovie = nullableCharacterResponseReader.read(buffer, resolver);
		const DuringMovie = nullableCharacterResponseReader.read(buffer, resolver);
		const AfterMovie = nullableCharacterResponseReader.read(buffer, resolver);
		
		return {
			BeforeMovie,
			DuringMovie,
			AfterMovie
		};
	}

	write(buffer, content, resolver) {
		const nullableCharacterResponseReader = new NullableReader( new CharacterResponseReader() );

		this.writeIndex(buffer, resolver);

		nullableCharacterResponseReader.write(buffer, content.BeforeMovie, resolver);
		nullableCharacterResponseReader.write(buffer, content.DuringMovie, resolver);
		nullableCharacterResponseReader.write(buffer, content.AfterMovie, resolver);
	}

	isValueType() {
		return false;
	}
}