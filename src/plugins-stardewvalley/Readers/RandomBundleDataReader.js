import {BaseReader,
	StringReader,
	NullableReader,
	ListReader
} from "../../readers/readers.js"; //@xnb/readers
import BundleSetDataReader from "./BundleSetDataReader.js";
import BundleDataReader from "./BundleDataReader.js";

/**
 * RandomBundleData Reader
 * @class
 * @extends BaseReader
 */
export default class RandomBundleDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Bundles.RandomBundleData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["RandomBundleData", 
			"String", // AreaName
			"String", // Keys
			"Nullable<List<BundleSetData>>:14", "List<BundleSetData>", ...BundleSetDataReader.parseTypeList(),// BundleSets
			"Nullable<List<BundleData>>:11", "List<BundleData>", ...BundleDataReader.parseTypeList()//Bundles
		];
	}
	static type()
	{
		return "Reflective<RandomBundleData>";
	}

	/**
	 * Reads RandomBundleData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const nullableBundleSetListReader = new NullableReader( new ListReader( new BundleSetDataReader() ) );
		const nullableBundleListReader = new NullableReader( new ListReader( new BundleDataReader() ) );

		let AreaName = resolver.read(buffer);
		let Keys = resolver.read(buffer);
		let BundleSets = nullableBundleSetListReader.read(buffer, resolver);
		let Bundles = nullableBundleListReader.read(buffer, resolver);

		return {
			AreaName,
			Keys,
			BundleSets,
			Bundles
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableBundleSetListReader = new NullableReader( new ListReader( new BundleSetDataReader() ) );
		const nullableBundleListReader = new NullableReader( new ListReader( new BundleDataReader() ) );

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.AreaName, resolver);
		stringReader.write(buffer, content.Keys, resolver);
		nullableBundleSetListReader.write(buffer, content.BundleSets, resolver);
		nullableBundleListReader.write(buffer, content.Bundles, resolver);
	}

	isValueType() {
		return false;
	}
}