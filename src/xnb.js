import {
	setReaders,
	addReaders,

	unpackToXnbData, 
	unpackToContent, 
	unpackToFiles, 

	bufferToXnb, 
	bufferToContents, 

	xnbDataToContent, 
	xnbDataToFiles,
	pack,
	XnbData,
	XnbContent
} from "./core/Xnb.js"; // @xnb/core
import * as Reader from "./readers/readers.js"; // @xnb/readers

const Readers = {
	ArrayReader:Reader.ArrayReader,
	BaseReader:Reader.BaseReader,
	BmFontReader:Reader.BmFontReader,
	BooleanReader:Reader.BooleanReader,
	CharReader:Reader.CharReader,
	DictionaryReader:Reader.DictionaryReader,
	DoubleReader:Reader.DoubleReader,
	EffectReader:Reader.EffectReader,
	Int32Reader:Reader.Int32Reader,
	ListReader:Reader.ListReader,
	NullableReader:Reader.NullableReader,
	RectangleReader:Reader.RectangleReader,
	ReflectiveReader:Reader.ReflectiveReader,
	SingleReader:Reader.SingleReader,
	SpriteFontReader:Reader.SpriteFontReader,
	StringReader:Reader.StringReader,
	TBinReader:Reader.TBinReader,
	Texture2DReader:Reader.Texture2DReader,
	UInt32Reader:Reader.UInt32Reader,
	Vector2Reader:Reader.Vector2Reader,
	Vector3Reader:Reader.Vector3Reader,
	Vector4Reader:Reader.Vector4Reader
};

setReaders(Readers);

export {
	Readers,
	addReaders,

	unpackToXnbData, 
	unpackToContent, 
	unpackToFiles, 

	bufferToXnb, 
	bufferToContents, 

	xnbDataToContent, 
	xnbDataToFiles,
	pack,
	XnbData,
	XnbContent
};