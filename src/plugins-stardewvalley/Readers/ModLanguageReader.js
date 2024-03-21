import {BaseReader,
	NullableReader,
	StringReader,
	BooleanReader,
	Int32Reader,
	SingleReader,
	DictionaryReader
} from "../../readers/readers.js"; //@xnb/readers

/**
 * ModLanguage Reader
 * @class
 * @extends BaseReader
 */
export default class ModLanguageReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModLanguage':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["ModLanguage", 
			"String", // ID
			"String", // languageCode
			"String", // buttonTexture
			null, // useLatinFont
			"Nullable<String>:1", "String", // fontFile
			null, // fontPixelZoom
			null, // fontApplyYOffset
			null, // smallFontLineSpacing
			null, // useGenderedCharacterTranslations
			"Nullable<String>:1", "String", //numberComma
			"String", // timeFormat
			"String", // clockTimeFormat
			"String", // clockDataFormat
			"Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String", //customFields
		];
	}
	static type()
	{
		return "Reflective<ModLanguage>";
	}

	/**
	 * Reads ModLanguage from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableStringDictReader = new NullableReader(
			new DictionaryReader( new StringReader(), new StringReader() )
		);

		const ID = resolver.read(buffer);
		const LanguageCode = resolver.read(buffer);
		const ButtonTexture = resolver.read(buffer);
		const UseLatinFont = booleanReader.read(buffer);
		const FontFile = nullableStringReader.read(buffer, resolver);
		const FontPixelZoom = floatReader.read(buffer);
		const FontApplyYOffset = booleanReader.read(buffer);
		const SmallFontLineSpacing = int32Reader.read(buffer);
		const UseGenderedCharacterTranslations = booleanReader.read(buffer);
		const NumberComma = nullableStringReader.read(buffer, resolver);
		const TimeFormat = resolver.read(buffer);
		const ClockTimeFormat = resolver.read(buffer);
		const ClockDateFormat = resolver.read(buffer);
		const CustomFields = nullableStringDictReader.read(buffer, resolver);

		return {
			ID,
			LanguageCode,
			ButtonTexture,
			UseLatinFont,
			FontFile,
			FontPixelZoom,
			FontApplyYOffset,
			SmallFontLineSpacing,
			UseGenderedCharacterTranslations,
			NumberComma,
			TimeFormat,
			ClockTimeFormat,
			ClockDateFormat,
			CustomFields
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader( new StringReader() );
		const nullableStringDictReader = new NullableReader(
			new DictionaryReader( new StringReader(), new StringReader() )
		);

		this.writeIndex(buffer, resolver);

		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.LanguageCode, resolver);
		stringReader.write(buffer, content.ButtonTexture, resolver);
		booleanReader.write(buffer, content.UseLatinFont, null);
		nullableStringReader.write(buffer, content.FontFile, resolver);
		floatReader.write(buffer, content.FontPixelZoom, null);
		booleanReader.write(buffer, content.FontApplyYOffset, null);
		int32Reader.write(buffer, content.SmallFontLineSpacing, null);
		booleanReader.write(buffer, content.UseGenderedCharacterTranslations, null);
		nullableStringReader.write(buffer, content.NumberComma, resolver);
		stringReader.write(buffer, content.TimeFormat, resolver);
		stringReader.write(buffer, content.ClockTimeFormat, resolver);
		stringReader.write(buffer, content.ClockDateFormat, resolver);
		nullableStringDictReader.write(buffer, content.CustomFields, resolver);
	}

	isValueType() {
		return false;
	}
}