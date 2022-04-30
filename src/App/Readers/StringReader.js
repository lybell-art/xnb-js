import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import BufferWriter from "../BufferWriter.js";
import ReaderResolver from "../ReaderResolver.js";
import {UTF8Length} from "../../Utils/UTF8ToString.js";

/**
 * String Reader
 * @class
 * @extends BaseReader
 */
export default class StringReader extends BaseReader {
    /**
     * Reads String from buffer.
     * @param {BufferReader} buffer
     * @returns {String}
     */
    read(buffer) {
        // read in the length of the string
        let length = buffer.read7BitNumber();
        // read in the UTF-8 encoded string
        return buffer.readString(length);
    }

    /**
     * Writes the string to the buffer.
     * @param {BufferWriter} buffer 
     * @param {String} string 
     * @param {ReaderResolver} resolver
     */
    write(buffer, string, resolver) {
        // write the index
        this.writeIndex(buffer, resolver);
        // get the size of UTF-8 encoded string
        const size = UTF8Length(string);
        // write the length of the string
        buffer.write7BitNumber(size); 
        // write the string
        buffer.writeString(string);
    }

    isValueType() {
        return false;
    }
}
