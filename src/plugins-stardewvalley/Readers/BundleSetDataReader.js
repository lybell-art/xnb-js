import {BaseReader,
	ListReader
} from "../../readers/readers.js"; //@xnb/readers
import BundleDataReader from "./BundleDataReader.js";

/**
 * BundleSetData Reader
 * @class
 * @extends BaseReader
 */
export default class BundleSetDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.BundleSetData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["BundleSetData", 
			"List<BundleData>", ...BundleDataReader.parseTypeList() //Bundles
		];
	}
	static type()
	{
		return "Reflective<BundleSetData>";
	}

	/**
	 * Reads BundleSetData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		let Bundles = resolver.read(buffer);

		return {Bundles};
	}

	write(buffer, content, resolver) {
		const bundleListReader = new ListReader( new BundleDataReader() );

		this.writeIndex(buffer, resolver);

		bundleListReader.write(buffer, content.Bundles, resolver);
	}

	isValueType() {
		return false;
	}
}