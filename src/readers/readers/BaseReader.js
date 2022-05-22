/**
 * Base class for all readers.
 * @abstract
 * @class
 */
export default class BaseReader {
	static isTypeOf(type) {
		return false;
	}
	static hasSubType() {
		return false;
	}
	static parseTypeList() {
		return [this.type()];
	}
	static type()
	{
		return this.name.slice(0, -6);
	}

	/**
	 * Returns if type normally requires a special reader.
	 * @public
	 * @method
	 * @returns {Boolean} Returns true if type is primitive.
	 */
	isValueType() {
		return true;
	}

	/**
	 * Returns string type of reader
	 * @public
	 * @property
	 * @returns {string}
	 */
	get type() {
		return this.constructor.type();
	}

	/**
	 * Reads the buffer by the specification of the type reader.
	 * @public
	 * @param {BufferReader} buffer The buffer to read from.
	 * @param {ReaderResolver} resolver The content reader to resolve readers from.
	 * @returns {mixed} Returns the type as specified by the type reader.
	 */
	read(buffer, resolver) {
		throw new Error('Cannot invoke methods on abstract class.');
	}

	/**
	 * Writes into the buffer
	 * @param {BufferWriter} buffer The buffer to write to
	 * @param {Mixed} data The data to parse to write to the buffer
	 * @param {ReaderResolver} resolver ReaderResolver to write non-primitive types
	 */
	write(buffer, content, resolver) {
		throw new Error('Cannot invoke methods on abstract class.');
	}

	/**
	 * Writes the index of this reader to the buffer
	 * @param {BufferWriter} buffer
	 * @param {ReaderResolver} resolver 
	 */
	writeIndex(buffer, resolver) {
		if (resolver != null)
			buffer.write7BitNumber(Number.parseInt(resolver.getIndex(this)) + 1);
	}

	/**
	 * When printing out in a string.
	 * @returns {String}
	 */
	toString() {
		return this.type;
	}

	parseTypeList() {
		return this.constructor.parseTypeList();
	}
}