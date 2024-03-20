import {BaseReader,
	StringReader,
	ListReader
} from "../../readers/readers.js"; //@xnb/readers
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
		const Name = resolver.read(buffer);
		const Values = resolver.read(buffer);

		return {Name, Values};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const itemListReader = new ListReader( new RandomizedElementItemReader() );

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Name, resolver);
		itemListReader.write(buffer, content.Values, resolver);
	}

	isValueType() {
		return false;
	}
}