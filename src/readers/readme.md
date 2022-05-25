@xnb/readers
----------------
The basic readers of xnb.js.
### Installation
```bash
npm install @xnb/readers
```
### Usage
```js
import {setReaders, unpackToXnbData} from "@xnb/core";
import {Texture2DReader} from "@xnb/readers";

setReaders({Texture2DReader});

unpackToXnbData(file);
```
### Documentation

#### Abstract Class
- BaseReader : Base class for all readers.
#### Primitive Reader
All primitive type readers except StringReader do not use resolver.
```js
read(buffer, resolver)
{
	const int32Reader = new Int32Reader();
	const value = int32Reader.read(buffer);
}
write(buffer, content, resolver)
{
	const int32Reader = new Int32Reader();
	int32Reader.write(buffer, content, null);
}
```
- Int32Reader : A reader that can read and write **int** type.
- UInt32Reader : A reader that can read and write **unsigned int** type.
- SingleReader : A reader that can read and write 4byte **float** type.
- DoubleReader : A reader that can read and write 8byte **double** type.
- BooleanReader : A reader that can read and write **boolean** type.
- CharReader : A reader that can read and write **char** type.
- StringReader : A reader that can read and write **String** type.
- Vector2Reader : A reader that can read and write **Vector2** type.
- Vector3Reader : A reader that can read and write **Vector3** type.
- Vector4Reader : A reader that can read and write **Vector4** type.
- Vector4Reader : A reader that can read and write **Vector4** type.
- RectangleReader: A reader that can read and write **Rectangle** type.
#### Sub-type Reader
- ArrayReader : A reader that can read and write **Array** type.
- ListReader : A reader that can read and write **List** type.
- DictionaryReader : A reader that can read and write **Dictionary** type.
- NullableReader : A reader that can read and write **Nullable** type.
- ReflectiveReader : A reader that can read and write **Reflective** type.
#### Complex-type Reader
- Texture2DReader : A reader that can read and write **Texture2D** type. Included DXT compression.
- LightweightTexture2DReader : A reader that can read and write **Texture2D** type. Excluded DXT compression. This is useful when you want to extract only sprite data that contains png data.
- BmFontReader : A reader that can read and write **BmFont** type.
- SpriteFontReader : A reader that can read and write **SpriteFont** type.
- EffectReader : A reader that can read and write **Effect** type.
- TBinReader : A reader that can read and write **tilemap** file.

If you want use LightweightTexture2DReader, you should *rename* this reader to Texture2DReader when importing it.
```js
import {LightweightTexture2DReader as Texture2DReader} from "@xnb/readers";

setReaders({Texture2DReader});
```