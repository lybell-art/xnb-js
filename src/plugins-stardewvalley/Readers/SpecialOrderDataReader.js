import {BaseReader,
	StringReader,
	Int32Reader,
	BooleanReader,
	NullableReader,
	ListReader,
	DictionaryReader
} from "../../readers/readers.js"; //@xnb/readers
import RandomizedElementReader from "./RandomizedElementReader.js";
import SpecialOrderObjectiveDataReader from "./SpecialOrderObjectiveDataReader.js";
import SpecialOrderRewardDataReader from "./SpecialOrderRewardDataReader.js";

/**
 * SpecialOrderData Reader
 * @class
 * @extends BaseReader
 */
export default class SpecialOrderDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrders.SpecialOrderData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["SpecialOrderData", 
			"String", // name
			"String", // requester
			null, // duration
			null, // repeatable
			"Nullable<String>", "String", // requiredTags
			"Nullable<String>", "String", // condition
			"Nullable<String>", "String", // orderType
			"Nullable<String>", "String", // specialRule
			"String", // text
			"Nullable<String>", "String", // itemToRemoveOnEnd
			"Nullable<String>", "String", // mailToRemoveOnEnd
			"Nullable<List<RandomizedElement>>:8", "List<RandomizedElement>", ...RandomizedElementReader.parseTypeList(), // randomizedElement
			"List<SpecialOrderObjectiveData>", ...SpecialOrderObjectiveDataReader.parseTypeList(), // objectives
			"List<SpecialOrderRewardData>", ...SpecialOrderRewardDataReader.parseTypeList(), // rewards
			"Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String" // customfields
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
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableRandomizedElemListReader = new NullableReader( 
			new ListReader( new RandomizedElementReader() ) 
		);
		const nullableStringDictReader = new NullableReader(
			new DictionaryReader(new StringReader(), new StringReader())
		);

		const Name = resolver.read(buffer);
		const Requester = resolver.read(buffer);
		const Duration = int32Reader.read(buffer);
		const Repeatable = booleanReader.read(buffer);
		const RequiredTags = nullableStringReader.read(buffer, resolver);
		const Condition = nullableStringReader.read(buffer, resolver);
		const OrderType = nullableStringReader.read(buffer, resolver);
		const SpecialRule = nullableStringReader.read(buffer, resolver)
		const Text = resolver.read(buffer);
		const ItemToRemoveOnEnd = nullableStringReader.read(buffer, resolver);
		const MailToRemoveOnEnd = nullableStringReader.read(buffer, resolver);
		const RandomizedElements = nullableRandomizedElemListReader.read(buffer, resolver);
		const Objectives = resolver.read(buffer);
		const Rewards = resolver.read(buffer);
		const CustomFields = nullableStringDictReader.read(buffer, resolver);

		return {
			Name,
			Requester,
			Duration,
			Repeatable,
			RequiredTags,
			Condition,
			OrderType,
			SpecialRule,
			Text,
			ItemToRemoveOnEnd,
			MailToRemoveOnEnd,
			RandomizedElements,
			Objectives,
			Rewards,
			CustomFields
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableRandomizedElemListReader = new NullableReader( 
			new ListReader( new RandomizedElementReader() ) 
		);
		const objectiveListReader = new ListReader(
			new SpecialOrderObjectiveDataReader()
		);
		const rewardListReader = new ListReader(
			new SpecialOrderRewardDataReader()
		);
		const nullableStringDictReader = new NullableReader(
			new DictionaryReader(new StringReader(), new StringReader())
		);

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Name, resolver);
		stringReader.write(buffer, content.Requester, resolver);
		int32Reader.write(buffer, content.Duration, null);
		booleanReader.write(buffer, content.Repeatable, null);
		nullableStringReader.write(buffer, content.RequiredTags, resolver);
		nullableStringReader.write(buffer, content.Condition, resolver);
		nullableStringReader.write(buffer, content.OrderType, resolver);
		nullableStringReader.write(buffer, content.SpecialRule, resolver);
		stringReader.write(buffer, content.Text, resolver);
		nullableStringReader.write(buffer, content.ItemToRemoveOnEnd, resolver);
		nullableStringReader.write(buffer, content.MailToRemoveOnEnd, resolver);
		nullableRandomizedElemListReader.write(buffer, content.RandomizedElements, resolver);
		objectiveListReader.write(buffer, content.Objectives, resolver);
		rewardListReader.write(buffer, content.Rewards, resolver);
		nullableStringDictReader.write(buffer, content.CustomFields, resolver);
	}

	isValueType() {
		return false;
	}
}