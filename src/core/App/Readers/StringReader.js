import BufferReader from "../BufferReader.js";
import BufferWriter from "../BufferWriter.js";
import {UTF8Length} from "../../Utils/UTF8ToString.js";

/**
 * Lightweight String Reader in @xnb/core
 * @class
 * @extends BaseReader
 */
export default class StringReaderCore {
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
     */
    write(buffer, string) {
        // get the size of UTF-8 encoded string
        const size = UTF8Length(string);
        // write the length of the string
        buffer.write7BitNumber(size); 
        // write the string
        buffer.writeString(string);
    }
}
