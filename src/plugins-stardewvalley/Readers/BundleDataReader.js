import {BaseReader,
	Int32Reader,
	StringReader
} from "../../readers/readers.js"; //@xnb/readers

/**
 * BundleData Reader
 * @class
 * @extends BaseReader
 */
export default class BundleDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.BundleData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["BundleData", 
			"String", // name
			null, // index
			"String", // sprite
			"String", // color
			"String", // items
			null, // pick
			null, // requireItems
			"String", // reward
		];
	}
	static type()
	{
		return "Reflective<BundleData>";
	}

	/**
	 * Reads BundleData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();

		let Name = resolver.read(buffer);
		let Index = int32Reader.read(buffer);
		let Sprite = resolver.read(buffer);
		let Color = resolver.read(buffer);
		let Items = resolver.read(buffer);
		let Pick = int32Reader.read(buffer);
		let RequiredItems = int32Reader.read(buffer);
		let Reward = resolver.read(buffer);

		return {
			Name,
			Index,
			Sprite,
			Color,
			Items,
			Pick,
			RequiredItems,
			Reward
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Name, resolver);
		int32Reader.write(buffer, content.Index, null);
		stringReader.write(buffer, content.Sprite, resolver);
		stringReader.write(buffer, content.Color, resolver);
		stringReader.write(buffer, content.Items, resolver);
		int32Reader.write(buffer, content.Pick, null);
		int32Reader.write(buffer, content.RequiredItems, null);
		stringReader.write(buffer, content.Reward, resolver);
	}

	isValueType() {
		return false;
	}
}