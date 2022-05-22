import BaseReader from "./BaseReader.js";
import BooleanReader from "./BooleanReader.js";

/**
 * Nullable Reader
 * @class
 * @extends BaseReader
 */
export default class NullableReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.NullableReader':
				return true;
			default: return false;
		}
	}
	static hasSubType() {
		return true;
	}

	/**
	 * @constructor
	 * @param {BaseReader} reader
	 */
	constructor(reader) {
		super();
		/**
		 * Nullable type
		 * @type {BaseReader}
		 */
		this.reader = reader;
	}

	/**
	 * Reads Nullable type from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {mixed|null}
	 */
	read(buffer, resolver=null) {
		// get an instance of boolean reader
		const booleanReader = new BooleanReader();
		// read in if the nullable has a value or not
		const hasValue = buffer.peekByte(1);

		if(!hasValue)
		{
			booleanReader.read(buffer);
			return null;
		}
		if(resolver === null)
		{
			booleanReader.read(buffer);
			return this.reader.read(buffer);
		}
		return (this.reader.isValueType()) ? this.reader.read(buffer) : resolver.read(buffer);
	}

	/**
	 * Writes Nullable into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content=null, resolver=null) {
		//this.writeIndex(buffer, resolver);
		const booleanReader = new BooleanReader();

		if(content === null)
		{
			buffer.writeByte(0);
			return;
		}
		if(resolver === null) buffer.writeByte(1);
		this.reader.write(buffer, content, (this.reader.isValueType() ? null : resolver));
	}

	isValueType() {
		return false;
	}

	get type() {
		return `Nullable<${this.reader.type}>`;
	}

	parseTypeList() {
		const inBlock = this.reader.parseTypeList();
		return [`${this.type}:${inBlock.length}`, ...inBlock];
	}
}
