import {BaseReader,
	SingleReader,
	Int32Reader,
} from "../../readers/readers.js"; //@xnb/readers

/**
 * FishPondReward Reader
 * @class
 * @extends BaseReader
 */
export default class FishPondRewardReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.FishPond.FishPondReward':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["FishPondReward", 
			null,null,null,null,null
		];
	}
	static type()
	{
		return "Reflective<FishPondReward>";
	}

	/**
	 * Reads FishPondReward from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();

		const RequiredPopulation = int32Reader.read(buffer);
		const Chance = Math.round(floatReader.read(buffer) * 100000) / 100000;
		const ItemId = int32Reader.read(buffer);
		const MinQuantity = int32Reader.read(buffer);
		const MaxQuantity = int32Reader.read(buffer);

		return {
			RequiredPopulation,
			Chance,
			ItemId,
			MinQuantity,
			MaxQuantity
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		
		this.writeIndex(buffer, resolver);

		int32Reader.write(buffer, content.RequiredPopulation, null);
		floatReader.write(buffer, content.Chance, null);
		int32Reader.write(buffer, content.ItemId, null);
		int32Reader.write(buffer, content.MinQuantity, null);
		int32Reader.write(buffer, content.MaxQuantity, null);
	}

	isValueType() {
		return false;
	}
}