import {BaseReader,
	StringReader,
	DictionaryReader
} from "../../readers/src/readers.js"; //@xnb/readers

/**
 * SpecialOrderObjectiveData Reader
 * @class
 * @extends BaseReader
 */
export default class SpecialOrderObjectiveDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrderObjectiveData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["SpecialOrderObjectiveData", 
			"String", // type
			"String", // text
			"String", // requiredCount
			"Dictionary<String,String>", "String", "String" // data
		];
	}
	static type()
	{
		return "Reflective<SpecialOrderObjectiveData>";
	}

	/**
	 * Reads SpecialOrderObjectiveData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const Type = resolver.read(buffer);
		const Text = resolver.read(buffer);
		const RequiredCount = resolver.read(buffer);
		const Data = resolver.read(buffer);

		return {
			Type,
			Text,
			RequiredCount,
			Data
		};
	}

	write(buffer, content, resolver) {
		console.log(content);

		const stringReader = new StringReader();
		const stringDictReader = new DictionaryReader(new StringReader(), new StringReader());

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Type, resolver);
		stringReader.write(buffer, content.Text, resolver);
		stringReader.write(buffer, content.RequiredCount, resolver);
		stringDictReader.write(buffer, content.Data, resolver);
	}

	isValueType() {
		return false;
	}
}