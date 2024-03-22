import {BaseReader,
	NullableReader,
	StringReader
} from "../../readers/readers.js"; //@xnb/readers

/**
 * CharacterResponse Reader
 * @class
 * @extends BaseReader
 */
export default class CharacterResponseReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.CharacterResponse':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["CharacterResponse", 
			"Nullable<String>:1", "String", // responsePoint
			"Nullable<String>:1", "String", // script
			"Nullable<String>:1", "String" // text
		];
	}
	static type()
	{
		return "Reflective<CharacterResponse>";
	}

	/**
	 * Reads CharacterResponse from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const nullableStringReader = new NullableReader( new StringReader() );

		const ResponsePoint = nullableStringReader.read(buffer, resolver);
		const Script = nullableStringReader.read(buffer, resolver);
		const Text = nullableStringReader.read(buffer, resolver);
		
		return {
			ResponsePoint,
			Script,
			Text
		};
	}

	write(buffer, content, resolver) {
		const nullableStringReader = new NullableReader( new StringReader() );

		this.writeIndex(buffer, resolver);

		nullableStringReader.write(buffer, content.ResponsePoint, resolver);
		nullableStringReader.write(buffer, content.Script, resolver);
		nullableStringReader.write(buffer, content.Text, resolver);
	}

	isValueType() {
		return false;
	}
}