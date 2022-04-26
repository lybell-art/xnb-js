import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import SingleReader from "./SingleReader.js";

/**
 * Vector2 Reader
 * @class
 * @extends BaseReader
 */
export default class Vector2Reader extends BaseReader {
    /**
     * Reads Vector2 from buffer.
     * @param {BufferReader} buffer
     * @returns {object}
     */
    read(buffer) {
        const singleReader = new SingleReader();

        let x = singleReader.read(buffer);
        let y = singleReader.read(buffer);

        return { x, y };
    }
}
