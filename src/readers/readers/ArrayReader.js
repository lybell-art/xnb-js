import BaseReader from "./BaseReader.js";
import UInt32Reader from "./UInt32Reader.js";

/**
 * Array Reader
 * @class
 * @extends BaseReader
 */
export default class ArrayReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.ArrayReader':
				return true;
			default: return false;
		}
	}
	static hasSubType() {
		return true;
	}

	/**
	 * Constructor for the ArrayReader
	 * @param {BaseReader} reader The reader used for the array elements
	 */
	constructor(reader) {
		super();
		/** @type {BaseReader} */
		this.reader = reader;
	}

	/**
	 * Reads Array from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {Array}
	 */
	read(buffer, resolver) {
		// create a uint32 reader
		const uint32Reader = new UInt32Reader();
		// read the number of elements in the array
		let size = uint32Reader.read(buffer);
		// create local array
		let array = [];

		// loop size number of times for the array elements
		for (let i = 0; i < size; i++) {
			// get value from buffer
			let value = this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer);
			// push into local array
			array.push(value);
		}

		// return the array
		return array;
	}

	/**
	 * Writes Array into buffer
	 * @param {BufferWriter} buffer
	 * @param {Array} data
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		// write the index
		this.writeIndex(buffer, resolver);
		// create a uint32 reader
		const uint32Reader = new UInt32Reader();
		// write the number of elements in the array
		uint32Reader.write(buffer, content.length, null);
		
		// loop over array to write array contents

		for (let i = 0; i < content.length; i++)
			this.reader.write(buffer, content[i], (this.reader.isValueType() ? null : resolver));
	}

	isValueType() {
		return false;
	}

	get type() {
		return `Array<${this.reader.type}>`;
	}

	parseTypeList() {
		const inBlock = this.reader.parseTypeList();
		return [`${this.type}:${inBlock.length}`, ...inBlock];
	}
}
