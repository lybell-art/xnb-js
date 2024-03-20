import BaseReader from "./BaseReader.js";
import SingleReader from "./SingleReader.js";
/**
 * Vector4 Reader
 * @class
 * @extends BaseReader
 */
export default class Vector4Reader extends BaseReader {
    static isTypeOf(type) {
        switch (type) {
            case 'Microsoft.Xna.Framework.Content.Vector4Reader':
            case 'Microsoft.Xna.Framework.Vector4':
                return true;
            default: return false;
        }
    }

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

    write(buffer, content, resolver) {
        this.writeIndex(buffer, resolver);
        const singleReader = new SingleReader();
        singleReader.write(buffer, content.x, null);
        singleReader.write(buffer, content.y, null);
        singleReader.write(buffer, content.z, null);
        singleReader.write(buffer, content.w, null);
    }
}