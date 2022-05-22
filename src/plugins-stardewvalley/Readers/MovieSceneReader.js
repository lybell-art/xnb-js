import {BaseReader,
	ListReader, 
	BooleanReader,
	Int32Reader, 
	StringReader, 
	NullableReader
} from "../../readers/src/readers.js"; //@xnb/readers

/**
 * MovieScene Reader
 * @class
 * @extends BaseReader
 */
export default class MovieSceneReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieScene':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["MovieScene", 
		null, // image
		"Nullable<String>", 'String', // music
		"Nullable<String>", 'String', // sound
		null, // messageDelay
		"Nullable<String>", 'String', // script
		"Nullable<String>", 'String', // text
		null, // shake
		"Nullable<String>", 'String', // responsePoint
		'String' // ID
		];
	}
	static type()
	{
		return "Reflective<MovieScene>";
	}

	/**
	 * Reads MovieScene from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();
		const nullableStringReader = new NullableReader(new StringReader());

		let Image = int32Reader.read(buffer, null);
		let Music = nullableStringReader.read(buffer, resolver);
		let Sound = nullableStringReader.read(buffer, resolver);
		let MessageDelay = int32Reader.read(buffer, null);
		let Script = nullableStringReader.read(buffer, resolver);
		let Text = nullableStringReader.read(buffer, resolver);
		let Shake = booleanReader.read(buffer);
		let ResponsePoint = nullableStringReader.read(buffer, resolver);
		let ID = resolver.read(buffer);
		
		return {
			Image,
			Music,
			Sound,
			MessageDelay,
			Script,
			Text,
			Shake,
			ResponsePoint,
			ID
		};
	}

	write(buffer, content, resolver) {
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();
		const nullableStringReader = new NullableReader(new StringReader());
		const stringReader = new StringReader();

		this.writeIndex(buffer, resolver);

		int32Reader.write(buffer, content.Image, null);
		nullableStringReader.write(buffer, content.Music, resolver);
		nullableStringReader.write(buffer, content.Sound, resolver);
		int32Reader.write(buffer, content.MessageDelay, null);
		nullableStringReader.write(buffer, content.Script, resolver);
		nullableStringReader.write(buffer, content.Text, resolver);
		booleanReader.write(buffer, content.Shake, null);
		nullableStringReader.write(buffer, content.ResponsePoint, resolver);
		stringReader.write(buffer, content.ID, resolver);
	}

	isValueType() {
		return false;
	}
}