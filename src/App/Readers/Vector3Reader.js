import BaseReader from "./BaseReader.js";
import BufferReader from "../BufferReader.js";
import SingleReader from "./SingleReader.js";

/**
 * Vector3 Reader
 * @class
 * @extends BaseReader
 */
export default class Vector3Reader extends BaseReader {
    /**
     * Reads Vector3 from buffer.
     * @param {BufferReader} buffer
     * @returns {object}
     */
    read(buffer) {
        const singleReader = new SingleReader();

        let x = singleReader.read(buffer);
        let y = singleReader.read(buffer);
        let z = singleReader.read(buffer);

        return { x, y, z };
    }

    write(buffer, content, resolver) {
        this.writeIndex(buffer, resolver);
        const singleReader = new SingleReader();
        singleReader.write(buffer, content.x, null);
        singleReader.write(buffer, content.y, null);
        singleReader.write(buffer, content.z, null);
    }
}
