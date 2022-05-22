import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import ReaderResolver from "../ReaderResolver.js";
import UInt32Reader from "./UInt32Reader.js";

/**
 * List Reader
 * @class
 * @extends BaseReader
 */
export default class ListReader extends BaseReader {
	constructor(reader) {
		super();
		/** @type {BaseReader} */
		this.reader = reader;
	}

	/**
	 * Reads List from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {Array}
	 */
	read(buffer, resolver) {
		const uint32Reader = new UInt32Reader();
		const size = uint32Reader.read(buffer);

		const list = [];
		for (let i = 0; i < size; i++) {
			const value = this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer);
			list.push(value);
		}
		return list;
	}

	/**
	 * Writes List into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const uint32Reader = new UInt32Reader();
		uint32Reader.write(buffer, content.length, null);
		for (let data of Object.values(content) )
		{
			this.reader.write(buffer, data, (this.reader.isValueType() ? null : resolver));
		}
	}

	get type() {
		return `List<${this.reader.type}>`;
	}
}
