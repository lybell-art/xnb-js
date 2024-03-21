import {BaseReader,
	NullableReader,
	ListReader,
	StringReader,
	BooleanReader
} from "../../readers/readers.js"; //@xnb/readers

/**
 * TailorItemRecipe Reader
 * @class
 * @extends BaseReader
 */
export default class TailorItemRecipeReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Crafting.TailorItemRecipe':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["TailorItemRecipe", 
			"Nullable<String>:1", "String", // id
			"Nullable<List<String>>:2", "List<String>", "String", // firstItemTags
			"Nullable<List<String>>:2", "List<String>", "String", // secondItemTags
			null, //spendingRightItem
			"Nullable<String>:1", "String", //craftedItemID
			"Nullable<List<String>>:2", "List<String>", "String", // craftedItemIDs
			"Nullable<String>:1", "String" // craftedItemIdFeminie
		];
	}
	static type()
	{
		return "Reflective<TailorItemRecipe>";
	}

	/**
	 * Reads TailorItemRecipe from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const nullableStringListReader = new NullableReader( new ListReader( new StringReader() ) );
		const nullableStringReader = new NullableReader( new StringReader() );
		const booleanReader = new BooleanReader();

		const Id = nullableStringReader.read(buffer);
		const FirstItemTags = nullableStringListReader.read(buffer, resolver);
		const SecondItemTags = nullableStringListReader.read(buffer, resolver);
		const SpendingRightItem = booleanReader.read(buffer);
		const CraftedItemID = nullableStringReader.read(buffer, resolver);
		const CraftedItemIDs = nullableStringListReader.read(buffer, resolver);
		const CraftedItemIdFeminine = nullableStringReader.read(buffer, resolver);

		return {
			Id,
			FirstItemTags,
			SecondItemTags,
			SpendingRightItem,
			CraftedItemID,
			CraftedItemIDs,
			CraftedItemIdFeminine
		};
	}

	write(buffer, content, resolver) {
		const nullableStringListReader = new NullableReader( new ListReader( new StringReader() ) );
		const nullableStringReader = new NullableReader( new StringReader() );
		const booleanReader = new BooleanReader();

		this.writeIndex(buffer, resolver);

		nullableStringReader.write(buffer, content.Id, resolver);
		nullableStringListReader.write(buffer, content.FirstItemTags, resolver);
		nullableStringListReader.write(buffer, content.SecondItemTags, resolver);
		booleanReader.write(buffer, content.SpendingRightItem, null);
		nullableStringReader.write(buffer, content.CraftedItemID, resolver);
		nullableStringListReader.write(buffer, content.CraftedItemIDs, resolver);
		nullableStringReader.write(buffer, content.CraftedItemIdFeminine, resolver);
	}

	isValueType() {
		return false;
	}
}