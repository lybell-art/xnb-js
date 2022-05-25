import BaseReader from "./BaseReader.js";

/**
 * Reflective Reader
 * @class
 * @extends BaseReader
 */
export default class ReflectiveReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.ReflectiveReader':
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
         * Reflective type
         * @type {BaseReader}
         */
        this.reader = reader;
    }

	/**
	 * Reads Reflection data from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Mixed}
	 */
	read(buffer, resolver) {
		const reflective = this.reader.read(buffer, resolver);
		return reflective;
	}

	/**
	 * Writes Reflection data and returns buffer
	 * @param {BufferWriter} buffer
	 * @param {Number} content
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		this.reader.write(buffer, content, (this.reader.isValueType() ? null : resolver));
	}

	isValueType() {
        return false;
    }

    get type() {
        return `${this.reader.type}`;
    }

    parseTypeList() {
		return [...this.reader.parseTypeList()];
	}
}
