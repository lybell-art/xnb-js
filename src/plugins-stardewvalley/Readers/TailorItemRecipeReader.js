import {BaseReader,
	NullableReader,
	ListReader,
	StringReader,
	BooleanReader,
	Int32Reader
} from "../../readers/src/readers.js"; //@xnb/readers

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
			"Nullable<List<String>>:2", "List<String>", "String", // firstItemTags
			"Nullable<List<String>>:2", "List<String>", "String", // secondItemTags
			null, //spendingRightItem
			null, //craftedItemID
			"Nullable<List<String>>:2", "List<String>", "String", // craftedItemIDs
			"Nullable<String>", "String" // craftedItemColor
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
		const int32Reader = new Int32Reader();

		const FirstItemTags = nullableStringListReader.read(buffer, resolver);
		const SecondItemTags = nullableStringListReader.read(buffer, resolver);
		const SpendingRightItem = booleanReader.read(buffer);
		const CraftedItemID = int32Reader.read(buffer);
		const CraftedItemIDs = nullableStringListReader.read(buffer, resolver);
		const CraftedItemColor = nullableStringReader.read(buffer, resolver);

		return {
			FirstItemTags,
			SecondItemTags,
			SpendingRightItem,
			CraftedItemID,
			CraftedItemIDs,
			CraftedItemColor
		};
	}

	write(buffer, content, resolver) {
		const nullableStringListReader = new NullableReader( new ListReader( new StringReader() ) );
		const nullableStringReader = new NullableReader( new StringReader() );
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();

		this.writeIndex(buffer, resolver);

		nullableStringListReader.write(buffer, content.FirstItemTags, resolver);
		nullableStringListReader.write(buffer, content.SecondItemTags, resolver);
		booleanReader.write(buffer, content.SpendingRightItem, null);
		int32Reader.write(buffer, content.CraftedItemID, null);
		nullableStringListReader.write(buffer, content.CraftedItemIDs, resolver);
		nullableStringReader.write(buffer, content.CraftedItemColor, resolver);
	}

	isValueType() {
		return false;
	}
}