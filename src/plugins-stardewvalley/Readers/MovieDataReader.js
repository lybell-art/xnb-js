import {BaseReader,
	ListReader, 
	Int32Reader, 
	StringReader, 
	NullableReader
} from "../../readers/readers.js"; //@xnb/readers
import MovieSceneReader from "./MovieSceneReader.js";

/**
 * MovieData Reader
 * @class
 * @extends BaseReader
 */
export default class MovieDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieData':
				return true;
			default: return false;
		}
	}
	static parseTypeList() {
		return ["MovieData", 
		"Nullable<String>", 'String', 
		null, 
		'String', 
		'String', 
		"Nullable<List<String>>", 'List<String>', 'String',
		"List<MovieScene>", ...MovieSceneReader.parseTypeList()];
	}
	static type()
	{
		return "Reflective<MovieData>";
	}

	/**
	 * Reads MovieData from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {object}
	 */
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));

		let ID = nullableStringReader.read(buffer, resolver);
		let SheetIndex = int32Reader.read(buffer);
		let Title = resolver.read(buffer);
		let Description = resolver.read(buffer);
		let Tags = nullableStringListReader.read(buffer, resolver);
		let Scenes = resolver.read(buffer);
		
		return {
			ID,
			SheetIndex,
			Title,
			Description,
			Tags,
			Scenes
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const movieSceneListReader = new ListReader(new MovieSceneReader());
		
		this.writeIndex(buffer, resolver);
		nullableStringReader.write(buffer, content.ID, resolver);
		int32Reader.write(buffer, content.SheetIndex, null);
		stringReader.write(buffer, content.Title, resolver);
		stringReader.write(buffer, content.Description, resolver);
		nullableStringListReader.write(buffer, content.Tags, resolver);
		movieSceneListReader.write(buffer, content.Scenes, resolver);
	}

	isValueType() {
		return false;
	}
}