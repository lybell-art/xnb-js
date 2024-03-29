import BufferReader from "./BufferReader.js";
import XnbError from "../Utils/XnbError.js";

/**
 * Class used to read the XNB types using the readers
 * @class
 */
class ReaderResolver {
	/**
	 * Creating a new instance of ReaderResolver
	 * @constructor
	 * @param {BaseReader[]} readers Array of BaseReaders
	 */
	constructor(readers) {
		/**
		 * Array of base readers
		 * @type {BaseReader[]}
		 */
		this.readers = readers;
	}

	/**
	 * Read the XNB file contents
	 * @method read
	 * @public
	 * @param {BufferReader} buffer The buffer to read from.
	 */
	read(buffer) {
		// read the index of which reader to use
		let index = buffer.read7BitNumber() - 1;
		
		if (this.readers[index] == null)
			throw new XnbError(`Invalid reader index ${index} | pos: ${buffer.bytePosition.toString(16)}`);
		// read the buffer using the selected reader
		return this.readers[index].read(buffer, this);
	}

	/**
	 * Writes the XNB file contents
	 * @param {BufferWriter} buffer
	 * @param {Object} content 
	 */
	write(buffer, content) {
		this.readers[0].write(buffer, content, this);
	}

	/**
	 * Returns the index of the reader
	 * @param {BaseReader} reader 
	 * @param {Number}
	 */
	getIndex(reader) {
		for (let i=0, len=this.readers.length; i<len; i++)
		{
			if (reader.toString() === this.readers[i].toString())
				return i;
		}
	}
}

export default ReaderResolver;