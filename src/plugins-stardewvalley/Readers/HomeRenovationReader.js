import {BaseReader,
	BooleanReader,
	Int32Reader,
	StringReader,
	ListReader,
	NullableReader,
	DictionaryReader
} from "../../readers/readers.js"; //@xnb/readers
import RenovationValueReader from "./RenovationValueReader.js";
import RectGroupReader from "./RectGroupReader.js";

/**
 * HomeRenovation Reader
 * @class
 * @extends BaseReader
 */
export default class HomeRenovationReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.HomeRenovation':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["HomeRenovation", 
			"String", //textStrings
			"String", //animationType
			null, // checkForObstructions
			null, // price
			"Nullable<String>", "String", //roomId
			"List<RenovationValue>", ...RenovationValueReader.parseTypeList(), //requirements 
			"List<RenovationValue>", ...RenovationValueReader.parseTypeList(), //renovateActions
			"Nullable<List<RectGroup>>:4", "List<RectGroup>", ...RectGroupReader.parseTypeList(), //rectGroups
			"Nullable<String>", "String", //specialRect
			"Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String" //customfields
		];
	}
	static type()
	{
		return "Reflective<HomeRenovation>";
	}

	/**
	 * Reads HomeRenovation from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const booleanReader = new BooleanReader();
		const intReader = new Int32Reader();
		const nullableRectGroupListReader = new NullableReader(new ListReader(new RectGroupReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));

		const TextStrings = resolver.read(buffer); //string
		const AnimationType = resolver.read(buffer); //string
		
		const CheckForObstructions = booleanReader.read(buffer); //boolean
		const Price = intReader.read(buffer); //int
		const RoomId = nullableStringReader.read(buffer, resolver); //string

		const Requirements = resolver.read(buffer); //List<renov>
		const RenovateActions = resolver.read(buffer); //List<renov>
		const RectGroups = nullableRectGroupListReader.read(buffer, resolver); //List<rectGroup>
		const SpecialRect = nullableStringReader.read(buffer, resolver); //string
		const CustomFields = nullableStringDictReader.read(buffer, resolver); // Dict<string,string>
		
		return {
			TextStrings,
			AnimationType,
			CheckForObstructions,
			Price,
			RoomId,
			Requirements,
			RenovateActions,
			RectGroups,
			SpecialRect,
			CustomFields
		};
	}

	write(buffer, content, resolver) {
		const booleanReader = new BooleanReader();
		const intReader = new Int32Reader();
		const stringReader = new StringReader();
		const renovationValueListReader = new ListReader(new RenovationValueReader());
		const nullableRectGroupListReader = new NullableReader(new ListReader(new RectGroupReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.TextStrings, resolver);
		stringReader.write(buffer, content.AnimationType, resolver);
		booleanReader.write(buffer, content.CheckForObstructions, null);
		intReader.write(buffer, content.Price, null);
		nullableStringReader.write(buffer, content.RoomId, resolver);
		renovationValueListReader.write(buffer, content.Requirements, resolver);
		renovationValueListReader.write(buffer, content.RenovateActions, resolver);
		nullableRectGroupListReader.write(buffer, content.RectGroups, resolver);
		nullableStringReader.write(buffer, content.SpecialRect, resolver);
		nullableStringDictReader.write(buffer, content.CustomFields, resolver);
	}

	isValueType() {
		return false;
	}
}