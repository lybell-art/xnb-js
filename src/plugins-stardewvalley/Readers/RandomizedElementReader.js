import {BaseReader,
	StringReader,
	ListReader
} from "../../readers/src/readers.js"; //@xnb/readers
import RandomizedElementItemReader from "./RandomizedElementItemReader.js";

/**
 * RandomizedElement Reader
 * @class
 * @extends BaseReader
 */
export default class RandomizedElementReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.RandomizedElement':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["RandomizedElement", 
			"String", // name
			"List<RandomizedElementItem>", ...RandomizedElementItemReader.parseTypeList() // values
		];
	}
	static type()
	{
		return "Reflective<RandomizedElement>";
	}

	/**
	 * Reads RandomizedElement from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const itemListReader = new ListReader( new RandomizedElementItemReader() );

		const Name = resolver.read(buffer);
		const Values = itemListReader.read(buffer, resolver);

		return {Name, Values};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const itemListReader = new ListReader( new RandomizedElementItemReader() );

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content, resolver);
		itemListReader.write(buffer, content, resolver);
	}

	isValueType() {
		return false;
	}
}