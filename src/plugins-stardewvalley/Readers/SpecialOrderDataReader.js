import {BaseReader,
	StringReader,
	NullableReader,
	ListReader
} from "../../readers/src/readers.js"; //@xnb/readers
import RandomizedElementReader from "./RandomizedElementReader.js";
import SpecialOrderObjectiveDataReader from "./SpecialOrderObjectiveDataReader.js";
import SpecialOrderRewardDataReader from "./SpecialOrderRewardData.js";

/**
 * SpecialOrderData Reader
 * @class
 * @extends BaseReader
 */
export default class SpecialOrderDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrderData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["SpecialOrderData", 
		];
	}
	static type()
	{
		return "Reflective<SpecialOrderData>";
	}

	/**
	 * Reads SpecialOrderData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {

		let AreaName = resolver.read(buffer);
		let BundleSets = nullableBundleSetListReader.read(buffer, resolver);

		return {
			AreaName,
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.AreaName, resolver);
	}

	isValueType() {
		return false;
	}
}