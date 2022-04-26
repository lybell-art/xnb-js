import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import ReaderResolver from "../ReaderResolver.js";
import BooleanReader from "./BooleanReader.js";

/**
 * Nullable Reader
 * @class
 * @extends BaseReader
 */
export default class NullableReader extends BaseReader {
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
    read(buffer, resolver) {
        // get an instance of boolean reader
        const booleanReader = new BooleanReader();
        // read in if the nullable has a value or not
        const hasValue = booleanReader.read(buffer);

        // return the value
        return (hasValue ? (this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer)) : null);
    }

    /**
     * Writes Nullable into the buffer
     * @param {BufferWriter} buffer
     * @param {Mixed} data The data
     * @param {ReaderResolver} resolver
     */
    write(buffer, content, resolver) {
        //this.writeIndex(buffer, resolver);
        const booleanReader = new BooleanReader();
        buffer.writeByte(content != null);
        if (content != null)
            this.reader.write(buffer, content, (this.reader.isValueType() ? null : resolver));
    }

    isValueType() {
        return false;
    }

    get type() {
        return `Nullable<${this.reader.type}>`;
    }
}
