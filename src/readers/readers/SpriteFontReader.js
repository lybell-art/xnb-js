import BaseReader from "./BaseReader.js";
import Int32Reader from "./Int32Reader.js";
import SingleReader from "./SingleReader.js";
import NullableReader from "./NullableReader.js";
import CharReader from "./CharReader.js";
import Texture2DReader from "./Texture2DReader.js";
import ListReader from "./ListReader.js";
import RectangleReader from "./RectangleReader.js";
import Vector3Reader from "./Vector3Reader.js";

/**
 * SpriteFont Reader
 * @class
 * @extends BaseReader
 */
export default class SpriteFontReader extends BaseReader {
    static isTypeOf(type) {
        switch (type) {
            case 'Microsoft.Xna.Framework.Content.SpriteFontReader':
                return true;
            default: return false;
        }
    }
    static parseTypeList() {
        return ["SpriteFont", "Texture2D", 'List<Rectangle>', 'Rectangle', 
        'List<Rectangle>', 'Rectangle', 
        'List<Char>', 'Char',
        null, null,
        'List<Vector3>', 'Vector3',
        'Nullable<Char>', 'Char'];
    }

    /**
     * Reads SpriteFont from buffer.
     * @param {BufferReader} buffer
     * @param {ReaderResolver} resolver
     * @returns {object}
     */
    read(buffer, resolver) {
        const int32Reader = new Int32Reader();
        const singleReader = new SingleReader();
        const nullableCharReader = new NullableReader(new CharReader());

        const texture = resolver.read(buffer);
        const glyphs = resolver.read(buffer);
        const cropping = resolver.read(buffer);
        const characterMap = resolver.read(buffer);
        const verticalLineSpacing = int32Reader.read(buffer);
        const horizontalSpacing = singleReader.read(buffer);
        const kerning = resolver.read(buffer);
        const defaultCharacter = nullableCharReader.read(buffer);

        return {
            texture,
            glyphs,
            cropping,
            characterMap,
            verticalLineSpacing,
            horizontalSpacing,
            kerning,
            defaultCharacter
        };
    }

    write(buffer, content, resolver) {
        const int32Reader = new Int32Reader();
        const charReader = new CharReader();
        const singleReader = new SingleReader();
        const nullableCharReader = new NullableReader(charReader);
        const texture2DReader = new Texture2DReader();
        const rectangleListReader = new ListReader(new RectangleReader());
        const charListReader = new ListReader(charReader);
        const vector3ListReader = new ListReader(new Vector3Reader());

        this.writeIndex(buffer, resolver);

        try {
            texture2DReader.write(buffer, content.texture, resolver);
            // Allocate space in the buffer in advance to minimize reallocation to improve performance.
            buffer.alloc(100000);
            rectangleListReader.write(buffer, content.glyphs, resolver);
            rectangleListReader.write(buffer, content.cropping, resolver);
            charListReader.write(buffer, content.characterMap, resolver);
            int32Reader.write(buffer, content.verticalLineSpacing, null);
            singleReader.write(buffer, content.horizontalSpacing, null);
            vector3ListReader.write(buffer, content.kerning, resolver);
            nullableCharReader.write(buffer, content.defaultCharacter, null);
        }
        catch (ex) {
            throw ex;
        }
    }

    isValueType() {
        return false;
    }
}