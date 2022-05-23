import {BaseReader,
	StringReader,
	NullableReader
} from "../../readers/src/readers.js"; //@xnb/readers

/**
 * RandomizedElementItem Reader
 * @class
 * @extends BaseReader
 */
export default class RandomizedElementItemReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.RandomizedElementItem':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["RandomizedElementItem", 
			"Nullable<String>", "String", // name
			"String" // value
		];
	}
	static type()
	{
		return "Reflective<RandomizedElementItem>";
	}

	/**
	 * Reads RandomizedElementItem from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const nullableStringReader = new NullableReader( new StringReader() );

		const RequiredTags = nullableStringReader.read(buffer, resolver) || "";
		const Value = resolver.read(buffer);

		return {RequiredTags, Value};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader( new StringReader() );

		this.writeIndex(buffer, resolver);

		nullableStringReader.write(buffer, content, resolver);
		stringReader.write(buffer, content, resolver);
	}

	isValueType() {
		return false;
	}
}