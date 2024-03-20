import {BaseReader,
	StringReader,
	NullableReader,
	ListReader
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
			case 'StardewValley.GameData.SpecialOrderData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["SpecialOrderData", 
			"String", // name
			"String", // requester
			"String", // duration
			"Nullable<String>", "String", // repeatable
			"Nullable<String>", "String", // requiredTags
			"Nullable<String>", "String", // orderType
			"Nullable<String>", "String", // specialRule
			"String", // text
			"Nullable<String>", "String", // orderType
			"Nullable<String>", "String", // specialRule
			"Nullable<List<RandomizedElement>>:8", "List<RandomizedElement>", ...RandomizedElementReader.parseTypeList(), // randomizedElement
			"List<SpecialOrderObjectiveData>", ...SpecialOrderObjectiveDataReader.parseTypeList(), // objectives
			"List<SpecialOrderRewardData>", ...SpecialOrderRewardDataReader.parseTypeList() // rewards
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
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableRandomizedElemListReader = new NullableReader( 
			new ListReader( new RandomizedElementReader() ) 
		);

		const Name = resolver.read(buffer);
		const Requester = resolver.read(buffer);
		const Duration = resolver.read(buffer);
		const Repeatable = nullableStringReader.read(buffer, resolver) || "False";
		const RequiredTags = nullableStringReader.read(buffer, resolver) || "";
		const OrderType = nullableStringReader.read(buffer, resolver) || "";
		const SpecialRule = nullableStringReader.read(buffer, resolver) || "";
		const Text = resolver.read(buffer);
		const ItemToRemoveOnEnd = nullableStringReader.read(buffer, resolver);
		const MailToRemoveOnEnd = nullableStringReader.read(buffer, resolver);
		const RandomizedElements = nullableRandomizedElemListReader.read(buffer, resolver);
		const Objectives = resolver.read(buffer);
		const Rewards = resolver.read(buffer);

		return {
			Name,
			Requester,
			Duration,
			Repeatable,
			RequiredTags,
			OrderType,
			SpecialRule,
			Text,
			ItemToRemoveOnEnd,
			MailToRemoveOnEnd,
			RandomizedElements,
			Objectives,
			Rewards
		};
	}

	write(buffer, content, resolver) {
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

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.Name, resolver);
		stringReader.write(buffer, content.Requester, resolver);
		stringReader.write(buffer, content.Duration, resolver);
		nullableStringReader.write(buffer, content.Repeatable, resolver);
		nullableStringReader.write(buffer, content.RequiredTags, resolver);
		nullableStringReader.write(buffer, content.OrderType, resolver);
		nullableStringReader.write(buffer, content.SpecialRule, resolver);
		stringReader.write(buffer, content.Text, resolver);
		nullableStringReader.write(buffer, content.ItemToRemoveOnEnd, resolver);
		nullableStringReader.write(buffer, content.MailToRemoveOnEnd, resolver);
		nullableRandomizedElemListReader.write(buffer, content.RandomizedElements, resolver);
		objectiveListReader.write(buffer, content.Objectives, resolver);
		rewardListReader.write(buffer, content.Rewards, resolver)
	}

	isValueType() {
		return false;
	}
}