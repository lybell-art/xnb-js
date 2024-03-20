/**
 * Reflective Reader
 * @class
 * @extends BaseReader
 */
export default class ReflectiveSchemeReader {
	static isTypeOf(type) {
		return false;
	}
	static hasSubType() {
		return false;
	}
	static type()
	{
		return "ReflectiveScheme";
	}
	/**
     * @constructor
     * @param {Object} object scheme
     */
    constructor(name, readers) {
        this.name = name;
        this.readers = readers;
    }

	/**
	 * Reads Reflection data from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Mixed}
	 */
	read(buffer, resolver) {
		const result = {};
		for(let [key, reader] of this.readers.entries())
		{
			if(reader.isValueType()) result[key] = reader.read(buffer);
			else if(reader.constructor.type() === "Nullable") result[key] = reader.read(buffer, resolver);
			else result[key] = resolver.read(buffer);
		}

		return result;
	}

	/**
	 * Writes Reflection data and returns buffer
	 * @param {BufferWriter} buffer
	 * @param {Number} content
	 * @param {ReaderResolver} resolver
	 */
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		for(let [key, reader] of this.readers.entries())
		{
			reader.write(buffer, content[key], (reader.isValueType() ? null : resolver));
		}
	}

	writeIndex(buffer, resolver) {
		if (resolver != null)
			buffer.write7BitNumber(Number.parseInt(resolver.getIndex(this)) + 1);
	}

	isValueType() {
        return false;
    }

    get type() {
        return `ReflectiveScheme<${name}>`;
    }

    parseTypeList() {
		return [...this.reader.parseTypeList()];
	}

	toString() {
		return this.type;
	}
}