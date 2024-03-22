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
			case 'StardewValley.GameData.FishPonds.FishPondData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["FishPondData", 
			"String", //id
			"List<String>", "String", // requiredTags
			null, // precedence
			null, // spawnTime
			"List<FishPondReward>:6", ...FishPondRewardReader.parseTypeList(), //producedItems
			"Nullable<Dictionary<Int32,List<String>>>:4", 
			"Dictionary<Int32,List<String>>", "Int32", "List<String>", "String", //populationGates,
			"Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String" //customfields
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
		const stringDictReader = new NullableReader( new DictionaryReader(
			new StringReader(),
			new StringReader()
		) );

		const Id = resolver.read(buffer);
		const RequiredTags = resolver.read(buffer);
		const Precedence = int32Reader.read(buffer);
		const SpawnTime = int32Reader.read(buffer);
		const ProducedItems = resolver.read(buffer);
		const PopulationGates = stringListDictReader.read(buffer, resolver);
		const CustomFields = stringDictReader.read(buffer, resolver);

		return {
			Id,
			RequiredTags,
			Precedence,
			SpawnTime,
			ProducedItems,
			PopulationGates,
			CustomFields
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const stringListReader = new ListReader( new StringReader() );
		const int32Reader = new Int32Reader();
		const fishPondRewardListReader = new ListReader( new FishPondRewardReader() );
		const stringListDictReader = new NullableReader( new DictionaryReader(
			new Int32Reader(),
			new ListReader( new StringReader() )
		) );
		const stringDictReader = new NullableReader( new DictionaryReader(
			new StringReader(),
			new StringReader()
		) );
		
		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Id, resolver);
		stringListReader.write(buffer, content.RequiredTags, resolver);
		int32Reader.write(buffer, content.Precedence, null);
		int32Reader.write(buffer, content.SpawnTime, null);
		fishPondRewardListReader.write(buffer, content.ProducedItems, resolver);
		stringListDictReader.write(buffer, content.PopulationGates, resolver);
		stringDictReader.write(buffer, content.CustomFields, resolver);
	}

	isValueType() {
		return false;
	}
}