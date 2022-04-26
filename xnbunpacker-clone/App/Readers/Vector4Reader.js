import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import SingleReader from "./SingleReader.js";
/**
 * Vector4 Reader
 * @class
 * @extends BaseReader
 */
export default class Vector4Reader extends BaseReader {
    /**
     * Reads Vector4 from buffer.
     * @param {BufferReader} buffer
     * @returns {object}
     */
    read(buffer) {
        const singleReader = new SingleReader();

        let x = singleReader.read(buffer);
        let y = singleReader.read(buffer);
        let z = singleReader.read(buffer);
        let w = singleReader.read(buffer);

        return { x, y, z, w };
    }
}