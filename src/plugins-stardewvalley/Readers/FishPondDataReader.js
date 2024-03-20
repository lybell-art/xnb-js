import {BaseReader,
	ListReader,
	Int32Reader,
	StringReader,
	DictionaryReader,
	NullableReader
} from "../../readers/readers.js"; //@xnb/readers
import FishPondRewardReader from "./FishPondRewardReader.js";

/**
 * FishPondData Reader
 * @class
 * @extends BaseReader
 */
export default class FishPondDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.FishPond.FishPondData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["FishPondData", 
			"List<String>", "String", // requiredTags
			null, // spawnTime
			"List<FishPondReward>", ...FishPondRewardReader.parseTypeList(), //producedItems
			"Nullable<Dictionary<Int32,List<String>>>:4", 
			"Dictionary<Int32,List<String>>", "Int32", "List<String>", "String" //populationGates
		];
	}
	static type()
	{
		return "Reflective<FishPondData>";
	}

	/**
	 * Reads FishPondData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const stringListDictReader = new NullableReader( new DictionaryReader(
			new Int32Reader(),
			new ListReader( new StringReader() )
		) );

		const RequiredTags = resolver.read(buffer);
		const SpawnTime = int32Reader.read(buffer);
		const ProducedItems = resolver.read(buffer);
		const PopulationGates = stringListDictReader.read(buffer, resolver);

		return {
			RequiredTags,
			SpawnTime,
			ProducedItems,
			PopulationGates
		};
	}

	write(buffer, content, resolver) {
		const stringListReader = new ListReader( new StringReader() );
		const int32Reader = new Int32Reader();
		const fishPondRewardListReader = new ListReader( new FishPondRewardReader() );
		const stringListDictReader = new NullableReader( new DictionaryReader(
			new Int32Reader(),
			new ListReader( new StringReader() )
		) );
		
		this.writeIndex(buffer, resolver);

		stringListReader.write(buffer, content.RequiredTags, resolver);
		int32Reader.write(buffer, content.SpawnTime, null);
		fishPondRewardListReader.write(buffer, content.ProducedItems, resolver);
		stringListDictReader.write(buffer, content.PopulationGates, resolver);
	}

	isValueType() {
		return false;
	}
}