import {BaseReader,
	StringReader,
	DictionaryReader
} from "../../readers/src/readers.js"; //@xnb/readers

/**
 * SpecialOrderRewardData Reader
 * @class
 * @extends BaseReader
 */
export default class SpecialOrderRewardDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrderRewardData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["SpecialOrderRewardData", 
			"String", // type
			"Dictionary<String,String>", "String", "String" // data
		];
	}
	static type()
	{
		return "Reflective<SpecialOrderRewardData>";
	}

	/**
	 * Reads SpecialOrderRewardData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const Type = resolver.read(buffer);
		const Data = resolver.read(buffer);

		return {
			Type,
			Text,
			RequiredCount,
			Data
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const stringDictReader = new DictionaryReader(new StringReader(), new StringReader());

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Type, resolver);
		stringReader.write(buffer, content.Data, resolver);
	}

	isValueType() {
		return false;
	}
}