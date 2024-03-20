import {BaseReader,
	StringReader,
} from "../../readers/readers.js"; //@xnb/readers

/**
 * RenovationValue Reader
 * @class
 * @extends BaseReader
 */
export default class RenovationValueReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.RenovationValue':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["RenovationValue", 
			"String", "String", "String"
		];
	}
	static type()
	{
		return "Reflective<RenovationValue>";
	}

	/**
	 * Reads RenovationValue from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const Type = resolver.read(buffer); //string
		const Key = resolver.read(buffer); //string
		const Value = resolver.read(buffer); //string
		
		return {Type,Key,Value};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Type, resolver);
		stringReader.write(buffer, content.Key, resolver);
		stringReader.write(buffer, content.Value, resolver);
	}

	isValueType() {
		return false;
	}
}