/** 
 * xnb.js 1.2.0
 * made by Lybell( https://github.com/lybell-art/ )
 * This library is based on the XnbCli made by Leonblade.
 * 
 * xnb.js is licensed under the LGPL 3.0 License.
 * 
*/

const __promise_allSettled = Promise.allSettled !== undefined ? Promise.allSettled.bind(Promise) : function (promises) {
	let mappedPromises = promises.map(p => {
		return p.then(value => {
			return {
				status: 'fulfilled',
				value
			};
		}).catch(reason => {
			return {
				status: 'rejected',
				reason
			};
		});
	});
	return Promise.all(mappedPromises);
};

function ownKeys(object, enumerableOnly) {
	var keys = Object.keys(object);

	if (Object.getOwnPropertySymbols) {
		var symbols = Object.getOwnPropertySymbols(object);
		enumerableOnly && (symbols = symbols.filter(function (sym) {
			return Object.getOwnPropertyDescriptor(object, sym).enumerable;
		})), keys.push.apply(keys, symbols);
	}

	return keys;
}

function _objectSpread2(target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = null != arguments[i] ? arguments[i] : {};
		i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
			_defineProperty(target, key, source[key]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
			Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
		});
	}

	return target;
}

function _defineProperty(obj, key, value) {
	if (key in obj) {
		Object.defineProperty(obj, key, {
			value: value,
			enumerable: true,
			configurable: true,
			writable: true
		});
	} else {
		obj[key] = value;
	}

	return obj;
}

class XnbError extends Error {
	constructor() {
		let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
		super(message);
		this.name = "XnbError";
		this.message = message;
		Error.captureStackTrace(this, XnbError);
	}

}

function removeExternBracket(str) {
	let bracketStack = [];
	let result = [];

	for (let i = 0; i < str.length; i++) {
		let c = str[i];
		if (c === "[") bracketStack.push(i);else if (c === "]") {
			let startPoint = bracketStack.pop();
			if (startPoint === undefined) throw new Error("Invalid Bracket Form!");
			if (bracketStack.length === 0) result.push(str.slice(startPoint + 1, i));
		}
	}

	return result;
}

class TypeReader {
	static setReaders(readers) {
		TypeReader.readers = _objectSpread2({}, readers);
	}

	static addReaders(readers) {
		TypeReader.readers = _objectSpread2(_objectSpread2({}, TypeReader.readers), readers);
	}

	static makeSimplied(type, reader) {
		let simple = type.split(/`|,/)[0];

		if (reader.isTypeOf(simple)) {
			if (reader.hasSubType()) {
				let subtypes = TypeReader.parseSubtypes(type).map(TypeReader.simplifyType.bind(TypeReader));
				return "".concat(reader.type(), "<").concat(subtypes.join(","), ">");
			} else return reader.type();
		}

		return null;
	}

	static simplifyType(type) {
		let simple = type.split(/`|,/)[0];
		let isArray = simple.endsWith('[]');
		if (isArray) return "Array<".concat(simplifyType(simple.slice(0, -2)), ">");

		if (simple === 'Microsoft.Xna.Framework.Content.ReflectiveReader') {
				let reflectiveType = TypeReader.parseSubtypes(type).map(TypeReader.simplifyType.bind(TypeReader));
				return "".concat(reflectiveType);
			}

		for (let reader of Object.values(TypeReader.readers)) {
			let result = TypeReader.makeSimplied(type, reader);
			if (result !== null) return result;
		}

		throw new XnbError("Non-implemented type found, cannot resolve type \"".concat(simple, "\", \"").concat(type, "\"."));
	}

	static parseSubtypes(type) {
		let subtype = type.slice(type.search("`") + 1);
		subtype[0];
		subtype = removeExternBracket(subtype)[0];
		let matches = removeExternBracket(subtype);
		return matches;
	}

	static getTypeInfo(type) {
		let mainType = type.match(/[^<]+/)[0];
		let subtypes = type.match(/<(.+)>/);
		subtypes = subtypes ? subtypes[1].split(',').map(type => type.trim()) : [];
		return {
			type: mainType,
			subtypes
		};
	}

	static getReaderTypeList(typeString) {
		let reader = TypeReader.getReader(typeString);
		return reader.parseTypeList();
	}

	static getReader(typeString) {
		let {
			type,
			subtypes
		} = TypeReader.getTypeInfo(typeString);
		subtypes = subtypes.map(TypeReader.getReader.bind(TypeReader));
		if (TypeReader.readers.hasOwnProperty("".concat(type, "Reader"))) return new TypeReader.readers["".concat(type, "Reader")](...subtypes);
		throw new XnbError("Invalid reader type \"".concat(typeString, "\" passed, unable to resolve!"));
	}

	static getReaderFromRaw(typeString) {
		const simplified = TypeReader.simplifyType(typeString);
		return TypeReader.getReader(simplified);
	}

}

_defineProperty(TypeReader, "readers", {});

const UTF8_FIRST_BITES = [0xC0, 0xE0, 0xF0];
const UTF8_SECOND_BITES = 0x80;
const UTF8_MASK = 0b111111;
const UTF16_BITES = [0xD800, 0xDC00];
const UTF16_MASK = 0b1111111111;

function UTF8Encode(code) {
	if (code < 0x80) return [code];
	if (code < 0x800) return [UTF8_FIRST_BITES[0] | code >> 6, UTF8_SECOND_BITES | code & UTF8_MASK];
	if (code < 0x10000) return [UTF8_FIRST_BITES[1] | code >> 12, UTF8_SECOND_BITES | code >> 6 & UTF8_MASK, UTF8_SECOND_BITES | code & UTF8_MASK];
	return [UTF8_FIRST_BITES[2] | code >> 18, UTF8_SECOND_BITES | code >> 12 & UTF8_MASK, UTF8_SECOND_BITES | code >> 6 & UTF8_MASK, UTF8_SECOND_BITES | code & UTF8_MASK];
}

function UTF16Encode(code) {
	if (code < 0xFFFF) return [code];
	code -= 0x10000;
	return [UTF16_BITES[0] | code >> 10 & UTF16_MASK, UTF16_BITES[1] | code & UTF16_MASK];
}

function UTF8Decode(codeSet) {
	var _codeSet;

	if (typeof codeSet === "number") codeSet = [codeSet];
	if (!((_codeSet = codeSet) !== null && _codeSet !== void 0 && _codeSet.length)) throw new Error("Invalid codeset!");
	const codeSetRange = codeSet.length;
	if (codeSetRange === 1) return codeSet[0];
	if (codeSetRange === 2) return ((codeSet[0] ^ UTF8_FIRST_BITES[0]) << 6) + (codeSet[1] ^ UTF8_SECOND_BITES);

	if (codeSetRange === 3) {
		return ((codeSet[0] ^ UTF8_FIRST_BITES[1]) << 12) + ((codeSet[1] ^ UTF8_SECOND_BITES) << 6) + (codeSet[2] ^ UTF8_SECOND_BITES);
	}

	return ((codeSet[0] ^ UTF8_FIRST_BITES[2]) << 18) + ((codeSet[1] ^ UTF8_SECOND_BITES) << 12) + ((codeSet[2] ^ UTF8_SECOND_BITES) << 6) + (codeSet[3] ^ UTF8_SECOND_BITES);
}

function UTF16Decode(codeSet) {
	var _codeSet2;

	if (typeof codeSet === "number") codeSet = [codeSet];
	if (!((_codeSet2 = codeSet) !== null && _codeSet2 !== void 0 && _codeSet2.length)) throw new Error("Invalid codeset!");
	const codeSetRange = codeSet.length;
	if (codeSetRange === 1) return codeSet[0];
	return ((codeSet[0] & UTF16_MASK) << 10) + (codeSet[1] & UTF16_MASK) + 0x10000;
}

function stringToUnicode(str) {
	const utf16Map = Array.from({
		length: str.length
	}, (_, i) => str.charCodeAt(i));
	const result = [];
	let index = 0;

	while (index < str.length) {
		let code = utf16Map[index];

		if ((UTF16_BITES[0] & code) !== UTF16_BITES[0]) {
			result.push(code);
			index++;
		} else {
			result.push(UTF16Decode(utf16Map.slice(index, index + 2)));
			index += 2;
		}
	}

	return result;
}

function UTF8ToUnicode(codes) {
	const dataArray = codes instanceof ArrayBuffer ? new Uint8Array(codes) : codes;
	const result = [];
	let index = 0;

	while (index < dataArray.length) {
		let headerCode = dataArray[index];

		if ((headerCode & 0x80) === 0) {
			result.push(headerCode);
			index++;
		} else if (headerCode < UTF8_FIRST_BITES[1]) {
			result.push(UTF8Decode(dataArray.slice(index, index + 2)));
			index += 2;
		} else if (headerCode < UTF8_FIRST_BITES[2]) {
			result.push(UTF8Decode(dataArray.slice(index, index + 3)));
			index += 3;
		} else {
			result.push(UTF8Decode(dataArray.slice(index, index + 4)));
			index += 4;
		}
	}

	return result;
}

function UnicodeToUTF8(unicodeArr) {
	const result = [];

	for (let code of unicodeArr) {
		result.push(...UTF8Encode(code));
	}

	return result;
}

function UnicodeToString(unicodeArr) {
	const result = [];

	for (let code of unicodeArr) {
		result.push(...UTF16Encode(code));
	}

	const blockSize = 32768;
	let resultStr = "";

	for (let i = 0; i < result.length / blockSize; i++) {
		resultStr += String.fromCharCode(...result.slice(i * blockSize, (i + 1) * blockSize));
	}

	return resultStr;
}

function stringToUTF8(str) {
	return UnicodeToUTF8(stringToUnicode(str));
}

function UTF8ToString(utf8Array) {
	return UnicodeToString(UTF8ToUnicode(utf8Array));
}

const LITTLE_ENDIAN = true;

class BufferReader {
	constructor(buffer) {
		let endianus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : LITTLE_ENDIAN;
		this._endianus = endianus;
		this._buffer = buffer.slice();
		this._dataView = new DataView(this._buffer);
		this._offset = 0;
		this._bitOffset = 0;
	}

	seek(index) {
		let origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._offset;
		const offset = this._offset;
		this._offset = Math.max(origin + Number.parseInt(index), 0);
		if (this._offset < 0 || this._offset > this.buffer.length) throw new RangeError("Buffer seek out of bounds! ".concat(this._offset, " ").concat(this.buffer.length));
		return this._offset - offset;
	}

	get bytePosition() {
		return Number.parseInt(this._offset);
	}

	set bytePosition(value) {
		this._offset = value;
	}

	get bitPosition() {
		return Number.parseInt(this._bitOffset);
	}

	set bitPosition(offset) {
		if (offset < 0) offset = 16 - offset;
		this._bitOffset = offset % 16;
		const byteSeek = (offset - Math.abs(offset) % 16) / 16 * 2;
		this.seek(byteSeek);
	}

	get size() {
		return this.buffer.byteLength;
	}

	get buffer() {
		return this._buffer;
	}

	copyFrom(buffer) {
		let targetIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		let sourceIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		let length = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : buffer.byteLength;
		const sourceView = new Uint8Array(buffer);
		const isOverflow = this.buffer.byteLength < length + targetIndex;
		let targetBuffer = this.buffer;
		let targetView = this._dataView;

		if (isOverflow) {
			targetBuffer = new ArrayBuffer(this.buffer.byteLength + (length + targetIndex - this.buffer.byteLength));
			targetView = new DataView(targetBuffer);

			for (let i = 0; i < this.buffer.byteLength; i++) {
				targetView.setUint8(i, this._dataView.getUint8(i));
			}
		}

		for (let i = sourceIndex, j = targetIndex; i < length; i++, j++) {
			targetView.setUint8(j, sourceView[i]);
		}

		if (isOverflow) {
			this._buffer = targetBuffer;
			this._dataView = targetView;
		}
	}

	read(count) {
		const buffer = this.buffer.slice(this._offset, this._offset + count);
		this.seek(count);
		return buffer;
	}

	readByte() {
		return this.readUInt();
	}

	readInt() {
		const value = this._dataView.getInt8(this._offset);

		this.seek(1);
		return value;
	}

	readUInt() {
		const value = this._dataView.getUint8(this._offset);

		this.seek(1);
		return value;
	}

	readUInt16() {
		const value = this._dataView.getUint16(this._offset, this._endianus);

		this.seek(2);
		return value;
	}

	readUInt32() {
		const value = this._dataView.getUint32(this._offset, this._endianus);

		this.seek(4);
		return value;
	}

	readInt16() {
		const value = this._dataView.getInt16(this._offset, this._endianus);

		this.seek(2);
		return value;
	}

	readInt32() {
		const value = this._dataView.getInt32(this._offset, this._endianus);

		this.seek(4);
		return value;
	}

	readSingle() {
		const value = this._dataView.getFloat32(this._offset, this._endianus);

		this.seek(4);
		return value;
	}

	readDouble() {
		const value = this._dataView.getFloat32(this._offset, this._endianus);

		this.seek(8);
		return value;
	}

	readString() {
		let count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
		const chars = [];
		this._offset;

		if (count === -1) {
			while (this.peekByte(1) != 0x0) chars.push(this.readByte());
		} else {
			for (let i = 0; i < count; i++) {
				chars.push(this.readByte());
			}
		}

		return UTF8ToString(chars);
	}

	peek(count) {
		const buffer = this.read(count);
		this.seek(-count);
		return buffer;
	}

	peekByte() {
		return this.peekUInt();
	}

	peekInt() {
		const value = this._dataView.getInt8(this._offset);

		return value;
	}

	peekUInt() {
		const value = this._dataView.getUint8(this._offset);

		return value;
	}

	peekUInt16() {
		const value = this._dataView.getUint16(this._offset, this._endianus);

		return value;
	}

	peekUInt32() {
		const value = this._dataView.getUint32(this._offset, this._endianus);

		return value;
	}

	peekInt16() {
		const value = this._dataView.getInt16(this._offset, this._endianus);

		return value;
	}

	peekInt32() {
		const value = this._dataView.getInt32(this._offset, this._endianus);

		return value;
	}

	peekSingle() {
		const value = this._dataView.getFloat32(this._offset, this._endianus);

		return value;
	}

	peekDouble() {
		const value = this._dataView.getFloat64(this._offset, this._endianus);

		return value;
	}

	peekString() {
		let count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		const chars = [];
		const startOffset = this._offset;

		if (count === 0) {
			while (this.peekByte(1) != 0x0) chars.push(this.readByte());
		} else {
			for (let i = 0; i < count; i++) {
				chars.push(this.readByte());
			}
		}

		this.bytePosition = startOffset;
		return UTF8ToString(chars);
	}

	read7BitNumber() {
		let result = 0;
		let bitsRead = 0;
		let value;

		do {
			value = this.readByte();
			result |= (value & 0x7F) << bitsRead;
			bitsRead += 7;
		} while (value & 0x80);

		return result;
	}

	readLZXBits(bits) {
		let bitsLeft = bits;
		let read = 0;

		while (bitsLeft > 0) {
			const peek = this._dataView.getUint16(this._offset, true);

			const bitsInFrame = Math.min(Math.max(bitsLeft, 0), 16 - this.bitPosition);
			const offset = 16 - this.bitPosition - bitsInFrame;
			const value = (peek & 2 ** bitsInFrame - 1 << offset) >> offset;
			bitsLeft -= bitsInFrame;
			this.bitPosition += bitsInFrame;
			read |= value << bitsLeft;
		}

		return read;
	}

	peekLZXBits(bits) {
		let bitPosition = this.bitPosition;
		let bytePosition = this.bytePosition;
		const read = this.readLZXBits(bits);
		this.bitPosition = bitPosition;
		this.bytePosition = bytePosition;
		return read;
	}

	readLZXInt16() {
		let seek = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
		const lsB = this.readByte();
		const msB = this.readByte();
		if (!seek) this.seek(-2);
		return lsB << 8 | msB;
	}

	align() {
		if (this.bitPosition > 0) this.bitPosition += 16 - this.bitPosition;
	}

}

class BufferWriter {
	constructor() {
		let size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2048;
		this._buffer = new ArrayBuffer(size);
		this._dataView = new DataView(this._buffer);
		this.bytePosition = 0;
	}

	get buffer() {
		return this._buffer;
	}

	reconnectDataView() {
		this._dataView = new DataView(this._buffer);
	}

	trim() {
		let pending = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
		this._buffer = this.buffer.slice(0, this.bytePosition);
		if (!pending) this.reconnectDataView();
	}

	alloc(bytes) {
		if (this._buffer.byteLength <= this.bytePosition + bytes) {
			const tBuffer = new ArrayBuffer(this._buffer.byteLength + bytes);
			const tDataView = new DataView(tBuffer);

			for (let i = 0; i < this.buffer.byteLength; i++) {
				tDataView.setUint8(i, this._dataView.getUint8(i));
			}

			this._buffer = tBuffer;
			this._dataView = tDataView;
		}

		return this;
	}

	concat(buffer) {
		const targetBufferView = new Uint8Array(buffer);
		const newPosition = this.bytePosition + targetBufferView.length;
		this.alloc(targetBufferView.length);

		for (let i = this.bytePosition; i < newPosition; i++) {
			this._dataView.setUint8(i, targetBufferView[i - this.bytePosition]);
		}

		this.bytePosition = newPosition;
		this.trim();
	}

	write(bytes) {
		const targetBufferView = new Uint8Array(bytes);
		const newPosition = this.bytePosition + targetBufferView.length;
		this.alloc(targetBufferView.length);

		for (let i = this.bytePosition; i < newPosition; i++) {
			this._dataView.setUint8(i, targetBufferView[i - this.bytePosition]);
		}

		this.bytePosition = newPosition;
	}

	writeString(str) {
		let utf8Data = stringToUTF8(str);
		this.write(utf8Data);
	}

	writeByte(byte) {
		this.alloc(1)._dataView.setUint8(this.bytePosition, byte);

		this.bytePosition++;
	}

	writeInt(number) {
		this.alloc(1)._dataView.setInt8(this.bytePosition, number);

		this.bytePosition++;
	}

	writeUInt(number) {
		this.alloc(1)._dataView.setUint8(this.bytePosition, number);

		this.bytePosition++;
	}

	writeInt16(number) {
		this.alloc(2)._dataView.setInt16(this.bytePosition, number, true);

		this.bytePosition += 2;
	}

	writeUInt16(number) {
		this.alloc(2)._dataView.setUint16(this.bytePosition, number, true);

		this.bytePosition += 2;
	}

	writeInt32(number) {
		this.alloc(4)._dataView.setInt32(this.bytePosition, number, true);

		this.bytePosition += 4;
	}

	writeUInt32(number) {
		this.alloc(4)._dataView.setUint32(this.bytePosition, number, true);

		this.bytePosition += 4;
	}

	writeSingle(number) {
		this.alloc(4)._dataView.setFloat32(this.bytePosition, number, true);

		this.bytePosition += 4;
	}

	writeDouble(number) {
		this.alloc(8)._dataView.setFloat64(this.bytePosition, number, true);

		this.bytePosition += 8;
	}

	write7BitNumber(number) {
		this.alloc(2);

		do {
			let byte = number & 0x7F;
			number = number >> 7;
			if (number) byte |= 0x80;

			this._dataView.setUint8(this.bytePosition, byte);

			this.bytePosition++;
		} while (number);
	}

}

/** @license
 *
 * This file is heavily based on MonoGame's implementation of their LzxDecoder attributed to Ali Scissons
 * which is derived from libmspack by Stuart Cole.
 *
 * (C) 2003-2004 Stuart Caie.
 * (C) 2011 Ali Scissons.
 * (C) 2017 James Stine.
 *
 * The LZX method was created by Johnathan Forbes and Tomi Poutanen, adapted by Microsoft Corporation.
 *
 * 
 * GNU LESSER GENERAL PUBLIC LICENSE version 2.1
 * LzxDecoder is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License (LGPL) version 2.1 
 *
 * MICROSOFT PUBLIC LICENSE
 * This source code a derivative on LzxDecoder and is subject to the terms of the Microsoft Public License (Ms-PL). 
 *	
 * Redistribution and use in source and binary forms, with or without modification, 
 * is permitted provided that redistributions of the source code retain the above 
 * copyright notices and this file header. 
 *	
 * Additional copyright notices should be appended to the list above. 
 * 
 * For details, see <http://www.opensource.org/licenses/ms-pl.html>.
 *
 *
 * I made the mistake of not including this license years ago. Big thanks to everyone involved and license has now been
 * acknowleded properly as it should have been back in 2017.
 *
 * Resources:
 *
 * cabextract/libmspack - http://http://www.cabextract.org.uk/
 * MonoGame LzxDecoder.cs - https://github.com/MonoGame/MonoGame/blob/master/MonoGame.Framework/Content/LzxDecoder.cs
 *
 */
const MIN_MATCH = 2;
const NUM_CHARS = 256;
const BLOCKTYPE = {
	INVALID: 0,
	VERBATIM: 1,
	ALIGNED: 2,
	UNCOMPRESSED: 3
};
const PRETREE_NUM_ELEMENTS = 20;
const ALIGNED_NUM_ELEMENTS = 8;
const NUM_PRIMARY_LENGTHS = 7;
const NUM_SECONDARY_LENGTHS = 249;
const PRETREE_MAXSYMBOLS = PRETREE_NUM_ELEMENTS;
const PRETREE_TABLEBITS = 6;
const MAINTREE_MAXSYMBOLS = NUM_CHARS + 50 * 8;
const MAINTREE_TABLEBITS = 12;
const LENGTH_MAXSYMBOLS = NUM_SECONDARY_LENGTHS + 1;
const LENGTH_TABLEBITS = 12;
const ALIGNED_MAXSYMBOLS = ALIGNED_NUM_ELEMENTS;
const ALIGNED_TABLEBITS = 7;

class Lzx {
	constructor(window_bits) {
		this.window_size = 1 << window_bits;
		if (window_bits < 15 || window_bits > 21) throw new XnbError('Window size out of range!');

		if (!Lzx.extra_bits.length) {
			for (let i = 0, j = 0; i <= 50; i += 2) {
				Lzx.extra_bits[i] = Lzx.extra_bits[i + 1] = j;
				if (i != 0 && j < 17) j++;
			}
		}

		if (!Lzx.position_base.length) {
			for (let i = 0, j = 0; i <= 50; i++) {
				Lzx.position_base[i] = j;
				j += 1 << Lzx.extra_bits[i];
			}
		}

		const posn_slots = window_bits == 21 ? 50 : window_bits == 20 ? 42 : window_bits << 1;
		this.R0 = this.R1 = this.R2 = 1;
		this.main_elements = NUM_CHARS + (posn_slots << 3);
		this.header_read = false;
		this.block_remaining = 0;
		this.block_type = BLOCKTYPE.INVALID;
		this.window_posn = 0;
		this.pretree_table = [];
		this.pretree_len = [];
		this.aligned_table = [];
		this.aligned_len = [];
		this.length_table = [];
		this.length_len = [];
		this.maintree_table = [];
		this.maintree_len = [];

		for (let i = 0; i < MAINTREE_MAXSYMBOLS; i++) this.maintree_len[i] = 0;

		for (let i = 0; i < NUM_SECONDARY_LENGTHS; i++) this.length_len[i] = 0;

		this.win = [];
	}

	decompress(buffer, frame_size, block_size) {
		if (!this.header_read) {
			const intel = buffer.readLZXBits(1);
			if (intel != 0) throw new XnbError("Intel E8 Call found, invalid for XNB files.");
			this.header_read = true;
		}

		let togo = frame_size;

		while (togo > 0) {
			if (this.block_remaining == 0) {
				this.block_type = buffer.readLZXBits(3);
				const hi = buffer.readLZXBits(16);
				const lo = buffer.readLZXBits(8);
				this.block_remaining = hi << 8 | lo;

				switch (this.block_type) {
					case BLOCKTYPE.ALIGNED:
						for (let i = 0; i < 8; i++) this.aligned_len[i] = buffer.readLZXBits(3);

						this.aligned_table = this.decodeTable(ALIGNED_MAXSYMBOLS, ALIGNED_TABLEBITS, this.aligned_len);

					case BLOCKTYPE.VERBATIM:
						this.readLengths(buffer, this.maintree_len, 0, 256);
						this.readLengths(buffer, this.maintree_len, 256, this.main_elements);
						this.maintree_table = this.decodeTable(MAINTREE_MAXSYMBOLS, MAINTREE_TABLEBITS, this.maintree_len);
						this.readLengths(buffer, this.length_len, 0, NUM_SECONDARY_LENGTHS);
						this.length_table = this.decodeTable(LENGTH_MAXSYMBOLS, LENGTH_TABLEBITS, this.length_len);
						break;

					case BLOCKTYPE.UNCOMPRESSED:
						buffer.align();
						this.R0 = buffer.readInt32();
						this.R1 = buffer.readInt32();
						this.R2 = buffer.readInt32();
						break;

					default:
						throw new XnbError("Invalid Blocktype Found: ".concat(this.block_type));
				}
			}

			let this_run = this.block_remaining;

			while ((this_run = this.block_remaining) > 0 && togo > 0) {
				if (this_run > togo) this_run = togo;
				togo -= this_run;
				this.block_remaining -= this_run;
				this.window_posn &= this.window_size - 1;
				if (this.window_posn + this_run > this.window_size) throw new XnbError('Cannot run outside of window frame.');

				switch (this.block_type) {
					case BLOCKTYPE.ALIGNED:
						while (this_run > 0) {
							let main_element = this.readHuffSymbol(buffer, this.maintree_table, this.maintree_len, MAINTREE_MAXSYMBOLS, MAINTREE_TABLEBITS);

							if (main_element < NUM_CHARS) {
								this.win[this.window_posn++] = main_element;
								this_run--;
								continue;
							}

							main_element -= NUM_CHARS;
							let length_footer;
							let match_length = main_element & NUM_PRIMARY_LENGTHS;

							if (match_length == NUM_PRIMARY_LENGTHS) {
								length_footer = this.readHuffSymbol(buffer, this.length_table, this.length_len, LENGTH_MAXSYMBOLS, LENGTH_TABLEBITS);
								match_length += length_footer;
							}

							match_length += MIN_MATCH;
							let match_offset = main_element >> 3;

							if (match_offset > 2) {
								let extra = Lzx.extra_bits[match_offset];
								match_offset = Lzx.position_base[match_offset] - 2;

								if (extra > 3) {
									extra -= 3;
									let verbatim_bits = buffer.readLZXBits(extra);
									match_offset += verbatim_bits << 3;
									let aligned_bits = this.readHuffSymbol(buffer, this.aligned_table, this.aligned_len, ALIGNED_MAXSYMBOLS, ALIGNED_TABLEBITS);
									match_offset += aligned_bits;
								} else if (extra == 3) {
									match_offset += this.readHuffSymbol(buffer, this.aligned_table, this.aligned_len, ALIGNED_MAXSYMBOLS, ALIGNED_TABLEBITS);
								} else if (extra > 0) match_offset += buffer.readLZXBits(extra);else match_offset = 1;

								this.R2 = this.R1;
								this.R1 = this.R0;
								this.R0 = match_offset;
							} else if (match_offset === 0) {
								match_offset = this.R0;
							} else if (match_offset == 1) {
								match_offset = this.R1;
								this.R1 = this.R0;
								this.R0 = match_offset;
							} else {
								match_offset = this.R2;
								this.R2 = this.R0;
								this.R0 = match_offset;
							}

							let rundest = this.window_posn;
							let runsrc;
							this_run -= match_length;
							if (this.window_posn >= match_offset) runsrc = rundest - match_offset;else {
								runsrc = rundest + (this.window_size - match_offset);
								let copy_length = match_offset - this.window_posn;

								if (copy_length < match_length) {
									match_length -= copy_length;
									this.window_posn += copy_length;

									while (copy_length-- > 0) this.win[rundest++] = this.win[runsrc++];

									runsrc = 0;
								}
							}
							this.window_posn += match_length;

							while (match_length-- > 0) this.win[rundest++] = this.win[runsrc++];
						}

						break;

					case BLOCKTYPE.VERBATIM:
						while (this_run > 0) {
							let main_element = this.readHuffSymbol(buffer, this.maintree_table, this.maintree_len, MAINTREE_MAXSYMBOLS, MAINTREE_TABLEBITS);

							if (main_element < NUM_CHARS) {
								this.win[this.window_posn++] = main_element;
								this_run--;
								continue;
							}

							main_element -= NUM_CHARS;
							let length_footer;
							let match_length = main_element & NUM_PRIMARY_LENGTHS;

							if (match_length == NUM_PRIMARY_LENGTHS) {
								length_footer = this.readHuffSymbol(buffer, this.length_table, this.length_len, LENGTH_MAXSYMBOLS, LENGTH_TABLEBITS);
								match_length += length_footer;
							}

							match_length += MIN_MATCH;
							let match_offset = main_element >> 3;

							if (match_offset > 2) {
								if (match_offset != 3) {
									let extra = Lzx.extra_bits[match_offset];
									let verbatim_bits = buffer.readLZXBits(extra);
									match_offset = Lzx.position_base[match_offset] - 2 + verbatim_bits;
								} else match_offset = 1;

								this.R2 = this.R1;
								this.R1 = this.R0;
								this.R0 = match_offset;
							} else if (match_offset === 0) {
								match_offset = this.R0;
							} else if (match_offset == 1) {
								match_offset = this.R1;
								this.R1 = this.R0;
								this.R0 = match_offset;
							} else {
								match_offset = this.R2;
								this.R2 = this.R0;
								this.R0 = match_offset;
							}

							let rundest = this.window_posn;
							let runsrc;
							this_run -= match_length;
							if (this.window_posn >= match_offset) runsrc = rundest - match_offset;else {
								runsrc = rundest + (this.window_size - match_offset);
								let copy_length = match_offset - this.window_posn;

								if (copy_length < match_length) {
									match_length -= copy_length;
									this.window_posn += copy_length;

									while (copy_length-- > 0) this.win[rundest++] = this.win[runsrc++];

									runsrc = 0;
								}
							}
							this.window_posn += match_length;

							while (match_length-- > 0) this.win[rundest++] = this.win[runsrc++];
						}

						break;

					case BLOCKTYPE.UNCOMPRESSED:
						if (buffer.bytePosition + this_run > block_size) throw new XnbError('Overrun!' + block_size + ' ' + buffer.bytePosition + ' ' + this_run);

						for (let i = 0; i < this_run; i++) this.win[window_posn + i] = buffer.buffer[buffer.bytePosition + i];

						buffer.bytePosition += this_run;
						this.window_posn += this_run;
						break;

					default:
						throw new XnbError('Invalid blocktype specified!');
				}
			}
		}

		if (togo != 0) throw new XnbError('EOF reached with data left to go.');
		buffer.align();
		const start_window_pos = (this.window_posn == 0 ? this.window_size : this.window_posn) - frame_size;
		return this.win.slice(start_window_pos, start_window_pos + frame_size);
	}

	readLengths(buffer, table, first, last) {
		for (let i = 0; i < 20; i++) this.pretree_len[i] = buffer.readLZXBits(4);

		this.pretree_table = this.decodeTable(PRETREE_MAXSYMBOLS, PRETREE_TABLEBITS, this.pretree_len);

		for (let i = first; i < last;) {
			let symbol = this.readHuffSymbol(buffer, this.pretree_table, this.pretree_len, PRETREE_MAXSYMBOLS, PRETREE_TABLEBITS);

			if (symbol == 17) {
				let zeros = buffer.readLZXBits(4) + 4;

				while (zeros-- != 0) table[i++] = 0;
			} else if (symbol == 18) {
				let zeros = buffer.readLZXBits(5) + 20;

				while (zeros-- != 0) table[i++] = 0;
			} else if (symbol == 19) {
				let same = buffer.readLZXBits(1) + 4;
				symbol = this.readHuffSymbol(buffer, this.pretree_table, this.pretree_len, PRETREE_MAXSYMBOLS, PRETREE_TABLEBITS);
				symbol = table[i] - symbol;
				if (symbol < 0) symbol += 17;

				while (same-- != 0) table[i++] = symbol;
			} else {
				symbol = table[i] - symbol;
				if (symbol < 0) symbol += 17;
				table[i++] = symbol;
			}
		}

		return table;
	}

	decodeTable(symbols, bits, length) {
		let table = [];
		let pos = 0;
		let table_mask = 1 << bits;
		let bit_mask = table_mask >> 1;

		for (let bit_num = 1; bit_num <= bits; bit_num++) {
			for (let symbol = 0; symbol < symbols; symbol++) {
				if (length[symbol] == bit_num) {
					let leaf = pos;

					if ((pos += bit_mask) > table_mask) {
						throw new XnbError('Overrun table!');
					}

					let fill = bit_mask;

					while (fill-- > 0) table[leaf++] = symbol;
				}
			}

			bit_mask >>= 1;
		}

		if (pos == table_mask) return table;

		for (let symbol = pos; symbol < table_mask; symbol++) table[symbol] = 0xFFFF;

		let next_symbol = table_mask >> 1 < symbols ? symbols : table_mask >> 1;
		pos <<= 16;
		table_mask <<= 16;
		bit_mask = 1 << 15;

		for (let bit_num = bits + 1; bit_num <= 16; bit_num++) {
			for (let symbol = 0; symbol < symbols; symbol++) {
				if (length[symbol] != bit_num) continue;
				let leaf = pos >> 16;

				for (let fill = 0; fill < bit_num - bits; fill++) {
					if (table[leaf] == 0xFFFF) {
						table[next_symbol << 1] = 0xFFFF;
						table[(next_symbol << 1) + 1] = 0xFFFF;
						table[leaf] = next_symbol++;
					}

					leaf = table[leaf] << 1;
					if (pos >> 15 - fill & 1) leaf++;
				}

				table[leaf] = symbol;
				if ((pos += bit_mask) > table_mask) throw new XnbError('Overrun table during decoding.');
			}

			bit_mask >>= 1;
		}

		if (pos == table_mask) return table;
		throw new XnbError('Decode table did not reach table mask.');
	}

	readHuffSymbol(buffer, table, length, symbols, bits) {
		let bit = buffer.peekLZXBits(32) >>> 0;
		let i = table[buffer.peekLZXBits(bits)];

		if (i >= symbols) {
			let j = 1 << 32 - bits;

			do {
				j >>= 1;
				i <<= 1;
				i |= (bit & j) != 0 ? 1 : 0;
				if (j == 0) return 0;
			} while ((i = table[i]) >= symbols);
		}

		buffer.bitPosition += length[i];
		return i;
	}

	set RRR(X) {
		if (this.R0 != X && this.R1 != X && this.R2 != X) {
			this.R2 = this.R1;
			this.R1 = this.R0;
			this.R0 = X;
		} else if (this.R1 == X) {
			let R1 = this.R1;
			this.R1 = this.R0;
			this.R0 = R1;
		} else if (this.R2 == X) {
			let R2 = this.R2;
			this.R2 = this.R0;
			this.R0 = R2;
		}
	}

}

Lzx.position_base = [];
Lzx.extra_bits = [];

class Presser {
	static decompress(buffer, compressedTodo, decompressedTodo) {
		let pos = 0;
		let block_size;
		let frame_size;
		const lzx = new Lzx(16);
		let decompressed = new BufferWriter(decompressedTodo);

		while (pos < compressedTodo) {
			const flag = buffer.readByte();

			if (flag == 0xFF) {
				frame_size = buffer.readLZXInt16();
				block_size = buffer.readLZXInt16();
				pos += 5;
			} else {
				buffer.seek(-1);
				block_size = buffer.readLZXInt16(this.buffer);
				frame_size = 0x8000;
				pos += 2;
			}

			if (block_size == 0 || frame_size == 0) break;
			if (block_size > 0x10000 || frame_size > 0x10000) throw new XnbError('Invalid size read in compression content.');
			decompressed.write(lzx.decompress(buffer, frame_size, block_size));
			pos += block_size;
		}

		console.log('File has been successfully decompressed!');
		decompressed.trim();
		return decompressed.buffer;
	}

}

class LZ4Utils {
	static hashU32(a) {
		a = a | 0;
		a = a + 2127912214 + (a << 12) | 0;
		a = a ^ -949894596 ^ a >>> 19;
		a = a + 374761393 + (a << 5) | 0;
		a = a + -744332180 ^ a << 9;
		a = a + -42973499 + (a << 3) | 0;
		return a ^ -1252372727 ^ a >>> 16 | 0;
	}

	static readU64(b, n) {
		var x = 0;
		x |= b[n++] << 0;
		x |= b[n++] << 8;
		x |= b[n++] << 16;
		x |= b[n++] << 24;
		x |= b[n++] << 32;
		x |= b[n++] << 40;
		x |= b[n++] << 48;
		x |= b[n++] << 56;
		return x;
	}

	static readU32(b, n) {
		var x = 0;
		x |= b[n++] << 0;
		x |= b[n++] << 8;
		x |= b[n++] << 16;
		x |= b[n++] << 24;
		return x;
	}

	static writeU32(b, n, x) {
		b[n++] = x >> 0 & 0xff;
		b[n++] = x >> 8 & 0xff;
		b[n++] = x >> 16 & 0xff;
		b[n++] = x >> 24 & 0xff;
	}

	static imul(a, b) {
		var ah = a >>> 16;
		var al = a & 65535;
		var bh = b >>> 16;
		var bl = b & 65535;
		return al * bl + (ah * bl + al * bh << 16) | 0;
	}

}

/** @license
 * Original Code by: https://github.com/Benzinga/lz4js/
 */
const minMatch = 4;
const minLength = 13;
const searchLimit = 5;
const skipTrigger = 6;
const hashSize = 1 << 16;
const mlBits = 4;
const mlMask = (1 << mlBits) - 1;
const runBits = 4;
const runMask = (1 << runBits) - 1;
makeBuffer(5 << 20);
const hashTable = makeHashTable();

function makeHashTable() {
	try {
		return new Uint32Array(hashSize);
	} catch (error) {
		const hashTable = new Array(hashSize);

		for (var i = 0; i < hashSize; i++) {
			hashTable[i] = 0;
		}

		return hashTable;
	}
}

function clearHashTable(table) {
	for (var i = 0; i < hashSize; i++) {
		hashTable[i] = 0;
	}
}

function makeBuffer(size) {
	try {
		return new Uint8Array(size);
	} catch (error) {
		var buf = new Array(size);

		for (var i = 0; i < size; i++) {
			buf[i] = 0;
		}

		return buf;
	}
}

function compressBound(n) {
	return n + n / 255 + 16 | 0;
}

function decompressBlock(src, dst) {
	let sIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	let sLength = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : src.length - 2 * sIndex;
	let dIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
	var mLength, mOffset, sEnd, n, i;
	var hasCopyWithin = dst.copyWithin !== undefined && dst.fill !== undefined;
	sEnd = sIndex + sLength;

	while (sIndex < sEnd) {
		var token = src[sIndex++];
		var literalCount = token >> 4;

		if (literalCount > 0) {
			if (literalCount === 0xf) {
				while (true) {
					literalCount += src[sIndex];

					if (src[sIndex++] !== 0xff) {
						break;
					}
				}
			}

			for (n = sIndex + literalCount; sIndex < n;) {
				dst[dIndex++] = src[sIndex++];
			}
		}

		if (sIndex >= sEnd) {
			break;
		}

		mLength = token & 0xf;
		mOffset = src[sIndex++] | src[sIndex++] << 8;

		if (mLength === 0xf) {
			while (true) {
				mLength += src[sIndex];

				if (src[sIndex++] !== 0xff) {
					break;
				}
			}
		}

		mLength += minMatch;

		if (hasCopyWithin && mOffset === 1) {
			dst.fill(dst[dIndex - 1] | 0, dIndex, dIndex + mLength);
			dIndex += mLength;
		} else if (hasCopyWithin && mOffset > mLength && mLength > 31) {
			dst.copyWithin(dIndex, dIndex - mOffset, dIndex - mOffset + mLength);
			dIndex += mLength;
		} else {
			for (i = dIndex - mOffset, n = i + mLength; i < n;) {
				dst[dIndex++] = dst[i++] | 0;
			}
		}
	}

	return dIndex;
}

function compressBlock(src, dst, sIndex, sLength, hashTable) {
	var mIndex, mAnchor, mLength, mOffset, mStep;
	var literalCount, dIndex, sEnd, n;
	dIndex = 0;
	sEnd = sLength + sIndex;
	mAnchor = sIndex;

	if (sLength >= minLength) {
		var searchMatchCount = (1 << skipTrigger) + 3;

		while (sIndex + minMatch < sEnd - searchLimit) {
			var seq = LZ4Utils.readU32(src, sIndex);
			var hash = LZ4Utils.hashU32(seq) >>> 0;
			hash = (hash >> 16 ^ hash) >>> 0 & 0xffff;
			mIndex = hashTable[hash] - 1;
			hashTable[hash] = sIndex + 1;

			if (mIndex < 0 || sIndex - mIndex >>> 16 > 0 || LZ4Utils.readU32(src, mIndex) !== seq) {
				mStep = searchMatchCount++ >> skipTrigger;
				sIndex += mStep;
				continue;
			}

			searchMatchCount = (1 << skipTrigger) + 3;
			literalCount = sIndex - mAnchor;
			mOffset = sIndex - mIndex;
			sIndex += minMatch;
			mIndex += minMatch;
			mLength = sIndex;

			while (sIndex < sEnd - searchLimit && src[sIndex] === src[mIndex]) {
				sIndex++;
				mIndex++;
			}

			mLength = sIndex - mLength;
			var token = mLength < mlMask ? mLength : mlMask;

			if (literalCount >= runMask) {
				dst[dIndex++] = (runMask << mlBits) + token;

				for (n = literalCount - runMask; n >= 0xff; n -= 0xff) {
					dst[dIndex++] = 0xff;
				}

				dst[dIndex++] = n;
			} else {
				dst[dIndex++] = (literalCount << mlBits) + token;
			}

			for (var i = 0; i < literalCount; i++) {
				dst[dIndex++] = src[mAnchor + i];
			}

			dst[dIndex++] = mOffset;
			dst[dIndex++] = mOffset >> 8;

			if (mLength >= mlMask) {
				for (n = mLength - mlMask; n >= 0xff; n -= 0xff) {
					dst[dIndex++] = 0xff;
				}

				dst[dIndex++] = n;
			}

			mAnchor = sIndex;
		}
	}

	if (mAnchor === 0) {
		return 0;
	}

	literalCount = sEnd - mAnchor;

	if (literalCount >= runMask) {
		dst[dIndex++] = runMask << mlBits;

		for (n = literalCount - runMask; n >= 0xff; n -= 0xff) {
			dst[dIndex++] = 0xff;
		}

		dst[dIndex++] = n;
	} else {
		dst[dIndex++] = literalCount << mlBits;
	}

	sIndex = mAnchor;

	while (sIndex < sEnd) {
		dst[dIndex++] = src[sIndex++];
	}

	return dIndex;
}

function compressSingleBlock(src, dst) {
	clearHashTable();
	return compressBlock(src, dst, 0, src.length, hashTable);
}

function UTF8Length(str) {
	const codes = stringToUnicode(str);
	return codes.reduce((sum, unicode) => {
		if (unicode < 0x80) return sum + 1;
		if (unicode < 0x800) return sum + 2;
		if (unicode < 0x10000) return sum + 3;
		return sum + 4;
	}, 0);
}

class StringReaderCore {
	read(buffer) {
		let length = buffer.read7BitNumber();
		return buffer.readString(length);
	}

	write(buffer, string) {
		const size = UTF8Length(string);
		buffer.write7BitNumber(size);
		buffer.writeString(string);
	}

}

class ReaderResolver {
	constructor(readers) {
		this.readers = readers;
	}

	read(buffer) {
		let index = buffer.read7BitNumber() - 1;
		if (this.readers[index] == null) throw new XnbError("Invalid reader index ".concat(index));
		return this.readers[index].read(buffer, this);
	}

	write(buffer, content) {
		this.readers[0].write(buffer, content, this);
	}

	getIndex(reader) {
		for (let i = 0, len = this.readers.length; i < len; i++) {
			if (reader.toString() === this.readers[i].toString()) return i;
		}
	}

}

class XnbData {
	constructor(header, readers, content) {
		let {
			target,
			formatVersion,
			hidef,
			compressed
		} = header;
		this.header = {
			target,
			formatVersion,
			hidef,
			compressed
		};
		this.readers = readers;
		this.content = content;
	}

	get target() {
		var _this$header;

		switch ((_this$header = this.header) === null || _this$header === void 0 ? void 0 : _this$header.target) {
			case 'w':
				return "Microsoft Windows";

			case 'm':
				return "Windows Phone 7";

			case 'x':
				return "Xbox 360";

			case 'a':
				return "Android";

			case 'i':
				return "iOS";

			default:
				return "Unknown";
		}
	}

	get formatVersion() {
		var _this$header2;

		switch ((_this$header2 = this.header) === null || _this$header2 === void 0 ? void 0 : _this$header2.formatVersion) {
			case 0x3:
				return "XNA Game Studio 3.0";

			case 0x4:
				return "XNA Game Studio 3.1";

			case 0x5:
				return "XNA Game Studio 4.0";

			default:
				return "Unknown";
		}
	}

	get hidef() {
		var _this$header3;

		return !!((_this$header3 = this.header) !== null && _this$header3 !== void 0 && _this$header3.hidef);
	}

	get compressed() {
		var _this$header4;

		return !!((_this$header4 = this.header) !== null && _this$header4 !== void 0 && _this$header4.compressed);
	}

	get contentType() {
		let {
			export: raw
		} = this.content;
		if (raw !== undefined) return raw.type;
		return "JSON";
	}

	get rawContent() {
		let {
			export: raw
		} = this.content;
		if (raw !== undefined) return raw.data;
		return JSON.stringify(this.content, (key, value) => {
			if (key === "export") return value.type;
			return value;
		}, 4);
	}

	stringify() {
		return JSON.stringify({
			header: this.header,
			readers: this.readers,
			content: this.content
		}, null, 4);
	}

	toString() {
		return this.stringify();
	}

}

function extensionToDatatype(extension) {
	switch (extension) {
		case "json":
			return "JSON";

		case "yaml":
			return "yaml";

		case "png":
			return "Texture2D";

		case "cso":
			return "Effect";

		case 'tbin':
			return "TBin";

		case 'xml':
			return "BmFont";
	}

	return "Others";
}

class XnbContent {
	constructor(data, ext) {
		this.type = extensionToDatatype(ext);
		this.content = data;
	}

}

const HIDEF_MASK = 0x1;
const COMPRESSED_LZ4_MASK = 0x40;
const COMPRESSED_LZX_MASK = 0x80;
const XNB_COMPRESSED_PROLOGUE_SIZE = 14;

class XnbConverter {
	constructor() {
		this.target = '';
		this.formatVersion = 0;
		this.hidef = false;
		this.compressed = false;
		this.compressionType = 0;
		this.buffer = null;
		this.fileSize = 0;
		this.readers = [];
		this.sharedResources = [];
	}

	load(arrayBuffer) {
		this.buffer = new BufferReader(arrayBuffer);

		this._validateHeader();

		console.info('XNB file validated successfully!');
		this.fileSize = this.buffer.readUInt32();
		if (this.buffer.size != this.fileSize) throw new XnbError('XNB file has been truncated!');

		if (this.compressed) {
			const decompressedSize = this.buffer.readUInt32();

			if (this.compressionType == COMPRESSED_LZX_MASK) {
				const compressedTodo = this.fileSize - XNB_COMPRESSED_PROLOGUE_SIZE;
				const decompressed = Presser.decompress(this.buffer, compressedTodo, decompressedSize);
				this.buffer.copyFrom(decompressed, XNB_COMPRESSED_PROLOGUE_SIZE, 0, decompressedSize);
				this.buffer.bytePosition = XNB_COMPRESSED_PROLOGUE_SIZE;
			} else if (this.compressionType == COMPRESSED_LZ4_MASK) {
				const trimmed = this.buffer.buffer.slice(XNB_COMPRESSED_PROLOGUE_SIZE);
				const trimmedArray = new Uint8Array(trimmed);
				const decompressed = new Uint8Array(decompressedSize);
				decompressBlock(trimmedArray, decompressed);
				this.buffer.copyFrom(decompressed, XNB_COMPRESSED_PROLOGUE_SIZE, 0, decompressedSize);
				this.buffer.bytePosition = XNB_COMPRESSED_PROLOGUE_SIZE;
			}
		}

		let count = this.buffer.read7BitNumber();
		const stringReader = new StringReaderCore();
		const readers = [];

		for (let i = 0; i < count; i++) {
			const type = stringReader.read(this.buffer);
			const version = this.buffer.readInt32();
			const reader = TypeReader.getReaderFromRaw(type);
			this.readers.push(reader);
			readers.push({
				type,
				version
			});
		}

		const shared = this.buffer.read7BitNumber();
		if (shared != 0) throw new XnbError("Unexpected (".concat(shared, ") shared resources."));
		const content = new ReaderResolver(this.readers);
		const result = content.read(this.buffer);
		console.log('Successfuly read XNB file!');
		return new XnbData({
			target: this.target,
			formatVersion: this.formatVersion,
			hidef: this.hidef,
			compressed: this.compressed
		}, readers, result);
	}

	convert(json) {
		const buffer = new BufferWriter();
		const stringReader = new StringReaderCore();
		let {
			target,
			formatVersion,
			hidef,
			compressed
		} = json.header;
		this.target = target;
		this.formatVersion = formatVersion;
		this.hidef = hidef;
		const lz4Compression = this.target == 'a' || this.target == 'i' || (compressed & COMPRESSED_LZ4_MASK) != 0;
		this.compressed = lz4Compression ? true : false;
		buffer.writeString("XNB");
		buffer.writeString(this.target);
		buffer.writeByte(this.formatVersion);
		buffer.writeByte(this.hidef | (this.compressed && lz4Compression ? COMPRESSED_LZ4_MASK : 0));
		buffer.writeUInt32(0);
		if (lz4Compression) buffer.writeUInt32(0);
		buffer.write7BitNumber(json.readers.length);

		for (let reader of json.readers) {
			this.readers.push(TypeReader.getReaderFromRaw(reader.type));
			stringReader.write(buffer, reader.type);
			buffer.writeUInt32(reader.version);
		}

		buffer.write7BitNumber(0);
		const content = new ReaderResolver(this.readers);
		content.write(buffer, json.content);
		buffer.trim();

		if (lz4Compression) {
			const trimmed = buffer.buffer.slice(XNB_COMPRESSED_PROLOGUE_SIZE);
			const trimmedArray = new Uint8Array(trimmed);
			let compressedSize = compressBound(trimmedArray.length);
			let compressed = new Uint8Array(compressedSize);
			compressedSize = compressSingleBlock(trimmedArray, compressed);
			compressed = compressed.slice(0, compressedSize);
			buffer.bytePosition = 6;
			buffer.writeUInt32(XNB_COMPRESSED_PROLOGUE_SIZE + compressedSize);
			buffer.writeUInt32(trimmedArray.length);
			buffer.concat(compressed);
			let returnBuffer = buffer.buffer.slice(0, XNB_COMPRESSED_PROLOGUE_SIZE + compressedSize);
			return returnBuffer;
		}

		let fileSize = buffer.bytePosition;
		buffer.bytePosition = 6;
		buffer.writeUInt32(fileSize, 6);
		return buffer.buffer;
	}

	_validateHeader() {
		if (this.buffer == null) throw new XnbError('Buffer is null');
		const magic = this.buffer.readString(3);
		if (magic != 'XNB') throw new XnbError("Invalid file magic found, expecting \"XNB\", found \"".concat(magic, "\""));
		this.target = this.buffer.readString(1).toLowerCase();
		this.formatVersion = this.buffer.readByte();
		const flags = this.buffer.readByte(1);
		this.hidef = (flags & HIDEF_MASK) != 0;
		this.compressed = flags & COMPRESSED_LZX_MASK || (flags & COMPRESSED_LZ4_MASK) != 0;
		this.compressionType = (flags & COMPRESSED_LZX_MASK) != 0 ? COMPRESSED_LZX_MASK : flags & COMPRESSED_LZ4_MASK ? COMPRESSED_LZ4_MASK : 0;
	}

}

function injectRGBA(data, i) {
	let {
		r,
		g = r,
		b = r,
		a = 255
	} = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	data[4 * i + 0] = r;
	data[4 * i + 1] = g;
	data[4 * i + 2] = b;
	data[4 * i + 3] = a;
	return [r, g, b, a];
}

function png16to8(data) {
	const megascale = new Uint16Array(data);
	const downscale = new Uint8Array(megascale.length);

	for (let i = 0; i < megascale.length; i++) {
		downscale[i] = megascale[i] >> 8;
	}

	return downscale;
}

function addChannels(data, originChannel) {
	const size = data.length / originChannel;
	const rgbaData = new Uint8Array(size * 4);
	if (originChannel === 4) return data;

	if (originChannel === 1) {
			for (let i = 0; i < size; i++) {
				injectRGBA(rgbaData, i, {
					r: data[i]
				});
			}
		} else if (originChannel === 2) {
			for (let i = 0; i < size; i++) {
				injectRGBA(rgbaData, i, {
					r: data[i * 2],
					a: data[i * 2 + 1]
				});
			}
		} else if (originChannel === 3) {
			for (let i = 0; i < size; i++) {
				injectRGBA(rgbaData, i, {
					r: data[i * 3],
					g: data[i * 3 + 1],
					b: data[i * 3 + 2]
				});
			}
		}

	return rgbaData;
}

function applyPalette(data, depth, palette) {
	const oldData = new Uint8Array(data);
	const length = oldData.length * 8 / depth;
	const newData = new Uint8Array(length * 4);
	let bitPosition = 0;

	for (let i = 0; i < length; i++) {
		const bytePosition = Math.floor(bitPosition / 8);
		const bitOffset = 8 - bitPosition % 8 - depth;
		let paletteIndex;
		if (depth === 16) paletteIndex = oldData[bytePosition] << 8 | oldData[bytePosition + 1];else paletteIndex = oldData[bytePosition] >> bitOffset & 2 ** depth - 1;
		[newData[i * 4], newData[i * 4 + 1], newData[i * 4 + 2], newData[i * 4 + 3]] = palette[paletteIndex];
		bitPosition += depth;
	}

	return newData;
}

function fixPNG(pngdata) {
	const {
		width,
		height,
		channels,
		depth
	} = pngdata;
	let {
		data
	} = pngdata;
	if (pngdata.palette) return applyPalette(data, depth, pngdata.palette);
	if (depth === 16) data = png16to8(data);
	if (channels < 4) data = addChannels(data, channels);
	return data;
}

var t = {
	396: function _() {
		!function (t) {
			if (t.TextEncoder && t.TextDecoder) return !1;

			function e() {
				let t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "utf-8";
				if ("utf-8" !== t) throw new RangeError("Failed to construct 'TextEncoder': The encoding label provided ('".concat(t, "') is invalid."));
			}

			function i() {
				let t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "utf-8";
				let e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
					fatal: !1
				};
				if ("utf-8" !== t) throw new RangeError("Failed to construct 'TextDecoder': The encoding label provided ('".concat(t, "') is invalid."));
				if (e.fatal) throw new Error("Failed to construct 'TextDecoder': the 'fatal' option is unsupported.");
			}

			Object.defineProperty(e.prototype, "encoding", {
				value: "utf-8"
			}), e.prototype.encode = function (t) {
				let e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
					stream: !1
				};
				if (e.stream) throw new Error("Failed to encode: the 'stream' option is unsupported.");
				let i = 0;
				const n = t.length;
				let r = 0,
						s = Math.max(32, n + (n >> 1) + 7),
						a = new Uint8Array(s >> 3 << 3);

				for (; i < n;) {
					let e = t.charCodeAt(i++);

					if (e >= 55296 && e <= 56319) {
						if (i < n) {
							const n = t.charCodeAt(i);
							56320 == (64512 & n) && (++i, e = ((1023 & e) << 10) + (1023 & n) + 65536);
						}

						if (e >= 55296 && e <= 56319) continue;
					}

					if (r + 4 > a.length) {
						s += 8, s *= 1 + i / t.length * 2, s = s >> 3 << 3;
						const e = new Uint8Array(s);
						e.set(a), a = e;
					}

					if (0 != (4294967168 & e)) {
						if (0 == (4294965248 & e)) a[r++] = e >> 6 & 31 | 192;else if (0 == (4294901760 & e)) a[r++] = e >> 12 & 15 | 224, a[r++] = e >> 6 & 63 | 128;else {
							if (0 != (4292870144 & e)) continue;
							a[r++] = e >> 18 & 7 | 240, a[r++] = e >> 12 & 63 | 128, a[r++] = e >> 6 & 63 | 128;
						}
						a[r++] = 63 & e | 128;
					} else a[r++] = e;
				}

				return a.slice(0, r);
			}, Object.defineProperty(i.prototype, "encoding", {
				value: "utf-8"
			}), Object.defineProperty(i.prototype, "fatal", {
				value: !1
			}), Object.defineProperty(i.prototype, "ignoreBOM", {
				value: !1
			}), i.prototype.decode = function (t) {
				let e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
					stream: !1
				};
				if (e.stream) throw new Error("Failed to decode: the 'stream' option is unsupported.");
				const i = new Uint8Array(t);
				let n = 0;
				const r = i.length,
							s = [];

				for (; n < r;) {
					const t = i[n++];
					if (0 === t) break;
					if (0 == (128 & t)) s.push(t);else if (192 == (224 & t)) {
						const e = 63 & i[n++];
						s.push((31 & t) << 6 | e);
					} else if (224 == (240 & t)) {
						const e = 63 & i[n++],
									r = 63 & i[n++];
						s.push((31 & t) << 12 | e << 6 | r);
					} else if (240 == (248 & t)) {
						let e = (7 & t) << 18 | (63 & i[n++]) << 12 | (63 & i[n++]) << 6 | 63 & i[n++];
						e > 65535 && (e -= 65536, s.push(e >>> 10 & 1023 | 55296), e = 56320 | 1023 & e), s.push(e);
					}
				}

				return String.fromCharCode.apply(null, s);
			}, t.TextEncoder = e, t.TextDecoder = i;
		}("undefined" != typeof window ? window : "undefined" != typeof self ? self : this);
	}
},
		e = {};

function i(n) {
	var r = e[n];
	if (void 0 !== r) return r.exports;
	var s = e[n] = {
		exports: {}
	};
	return t[n].call(s.exports, s, s.exports, i), s.exports;
}

i.d = (t, e) => {
	for (var n in e) i.o(e, n) && !i.o(t, n) && Object.defineProperty(t, n, {
		enumerable: !0,
		get: e[n]
	});
}, i.o = (t, e) => Object.prototype.hasOwnProperty.call(t, e);
var n = {};

(() => {
	i.d(n, {
		P: () => Mi,
		m: () => Fi
	}), i(396);
	const t = new TextDecoder("utf-8"),
				e = new TextEncoder();

	class r {
		constructor() {
			let t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8192;
			let e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			let i = !1;
			"number" == typeof t ? t = new ArrayBuffer(t) : (i = !0, this.lastWrittenByte = t.byteLength);
			const n = e.offset ? e.offset >>> 0 : 0,
						s = t.byteLength - n;
			let a = n;
			(ArrayBuffer.isView(t) || t instanceof r) && (t.byteLength !== t.buffer.byteLength && (a = t.byteOffset + n), t = t.buffer), this.lastWrittenByte = i ? s : 0, this.buffer = t, this.length = s, this.byteLength = s, this.byteOffset = a, this.offset = 0, this.littleEndian = !0, this._data = new DataView(this.buffer, a, s), this._mark = 0, this._marks = [];
		}

		available() {
			let t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
			return this.offset + t <= this.length;
		}

		isLittleEndian() {
			return this.littleEndian;
		}

		setLittleEndian() {
			return this.littleEndian = !0, this;
		}

		isBigEndian() {
			return !this.littleEndian;
		}

		setBigEndian() {
			return this.littleEndian = !1, this;
		}

		skip() {
			let t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
			return this.offset += t, this;
		}

		seek(t) {
			return this.offset = t, this;
		}

		mark() {
			return this._mark = this.offset, this;
		}

		reset() {
			return this.offset = this._mark, this;
		}

		pushMark() {
			return this._marks.push(this.offset), this;
		}

		popMark() {
			const t = this._marks.pop();

			if (void 0 === t) throw new Error("Mark stack empty");
			return this.seek(t), this;
		}

		rewind() {
			return this.offset = 0, this;
		}

		ensureAvailable() {
			let t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

			if (!this.available(t)) {
				const e = 2 * (this.offset + t),
							i = new Uint8Array(e);
				i.set(new Uint8Array(this.buffer)), this.buffer = i.buffer, this.length = this.byteLength = e, this._data = new DataView(this.buffer);
			}

			return this;
		}

		readBoolean() {
			return 0 !== this.readUint8();
		}

		readInt8() {
			return this._data.getInt8(this.offset++);
		}

		readUint8() {
			return this._data.getUint8(this.offset++);
		}

		readByte() {
			return this.readUint8();
		}

		readBytes() {
			let t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
			const e = new Uint8Array(t);

			for (let i = 0; i < t; i++) e[i] = this.readByte();

			return e;
		}

		readInt16() {
			const t = this._data.getInt16(this.offset, this.littleEndian);

			return this.offset += 2, t;
		}

		readUint16() {
			const t = this._data.getUint16(this.offset, this.littleEndian);

			return this.offset += 2, t;
		}

		readInt32() {
			const t = this._data.getInt32(this.offset, this.littleEndian);

			return this.offset += 4, t;
		}

		readUint32() {
			const t = this._data.getUint32(this.offset, this.littleEndian);

			return this.offset += 4, t;
		}

		readFloat32() {
			const t = this._data.getFloat32(this.offset, this.littleEndian);

			return this.offset += 4, t;
		}

		readFloat64() {
			const t = this._data.getFloat64(this.offset, this.littleEndian);

			return this.offset += 8, t;
		}

		readBigInt64() {
			const t = this._data.getBigInt64(this.offset, this.littleEndian);

			return this.offset += 8, t;
		}

		readBigUint64() {
			const t = this._data.getBigUint64(this.offset, this.littleEndian);

			return this.offset += 8, t;
		}

		readChar() {
			return String.fromCharCode(this.readInt8());
		}

		readChars() {
			let t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
			let e = "";

			for (let i = 0; i < t; i++) e += this.readChar();

			return e;
		}

		readUtf8() {
			let e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
			return i = this.readBytes(e), t.decode(i);
			var i;
		}

		writeBoolean(t) {
			return this.writeUint8(t ? 255 : 0), this;
		}

		writeInt8(t) {
			return this.ensureAvailable(1), this._data.setInt8(this.offset++, t), this._updateLastWrittenByte(), this;
		}

		writeUint8(t) {
			return this.ensureAvailable(1), this._data.setUint8(this.offset++, t), this._updateLastWrittenByte(), this;
		}

		writeByte(t) {
			return this.writeUint8(t);
		}

		writeBytes(t) {
			this.ensureAvailable(t.length);

			for (let e = 0; e < t.length; e++) this._data.setUint8(this.offset++, t[e]);

			return this._updateLastWrittenByte(), this;
		}

		writeInt16(t) {
			return this.ensureAvailable(2), this._data.setInt16(this.offset, t, this.littleEndian), this.offset += 2, this._updateLastWrittenByte(), this;
		}

		writeUint16(t) {
			return this.ensureAvailable(2), this._data.setUint16(this.offset, t, this.littleEndian), this.offset += 2, this._updateLastWrittenByte(), this;
		}

		writeInt32(t) {
			return this.ensureAvailable(4), this._data.setInt32(this.offset, t, this.littleEndian), this.offset += 4, this._updateLastWrittenByte(), this;
		}

		writeUint32(t) {
			return this.ensureAvailable(4), this._data.setUint32(this.offset, t, this.littleEndian), this.offset += 4, this._updateLastWrittenByte(), this;
		}

		writeFloat32(t) {
			return this.ensureAvailable(4), this._data.setFloat32(this.offset, t, this.littleEndian), this.offset += 4, this._updateLastWrittenByte(), this;
		}

		writeFloat64(t) {
			return this.ensureAvailable(8), this._data.setFloat64(this.offset, t, this.littleEndian), this.offset += 8, this._updateLastWrittenByte(), this;
		}

		writeBigInt64(t) {
			return this.ensureAvailable(8), this._data.setBigInt64(this.offset, t, this.littleEndian), this.offset += 8, this._updateLastWrittenByte(), this;
		}

		writeBigUint64(t) {
			return this.ensureAvailable(8), this._data.setBigUint64(this.offset, t, this.littleEndian), this.offset += 8, this._updateLastWrittenByte(), this;
		}

		writeChar(t) {
			return this.writeUint8(t.charCodeAt(0));
		}

		writeChars(t) {
			for (let e = 0; e < t.length; e++) this.writeUint8(t.charCodeAt(e));

			return this;
		}

		writeUtf8(t) {
			return this.writeBytes(function (t) {
				return e.encode(t);
			}(t));
		}

		toArray() {
			return new Uint8Array(this.buffer, this.byteOffset, this.lastWrittenByte);
		}

		_updateLastWrittenByte() {
			this.offset > this.lastWrittenByte && (this.lastWrittenByte = this.offset);
		}

	}

	function s(t) {
		let e = t.length;

		for (; --e >= 0;) t[e] = 0;
	}

	const a = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]),
				o = new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]),
				h = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]),
				l = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
				d = new Array(576);
	s(d);

	const _ = new Array(60);

	s(_);
	const f = new Array(512);
	s(f);
	const c = new Array(256);
	s(c);
	const u = new Array(29);
	s(u);
	const w = new Array(30);

	function p(t, e, i, n, r) {
		this.static_tree = t, this.extra_bits = e, this.extra_base = i, this.elems = n, this.max_length = r, this.has_stree = t && t.length;
	}

	let g, b, m;

	function k(t, e) {
		this.dyn_tree = t, this.max_code = 0, this.stat_desc = e;
	}

	s(w);

	const y = t => t < 256 ? f[t] : f[256 + (t >>> 7)],
				v = (t, e) => {
		t.pending_buf[t.pending++] = 255 & e, t.pending_buf[t.pending++] = e >>> 8 & 255;
	},
				E = (t, e, i) => {
		t.bi_valid > 16 - i ? (t.bi_buf |= e << t.bi_valid & 65535, v(t, t.bi_buf), t.bi_buf = e >> 16 - t.bi_valid, t.bi_valid += i - 16) : (t.bi_buf |= e << t.bi_valid & 65535, t.bi_valid += i);
	},
				A = (t, e, i) => {
		E(t, i[2 * e], i[2 * e + 1]);
	},
				x = (t, e) => {
		let i = 0;

		do {
			i |= 1 & t, t >>>= 1, i <<= 1;
		} while (--e > 0);

		return i >>> 1;
	},
				U = (t, e, i) => {
		const n = new Array(16);
		let r,
				s,
				a = 0;

		for (r = 1; r <= 15; r++) n[r] = a = a + i[r - 1] << 1;

		for (s = 0; s <= e; s++) {
			let e = t[2 * s + 1];
			0 !== e && (t[2 * s] = x(n[e]++, e));
		}
	},
				z = t => {
		let e;

		for (e = 0; e < 286; e++) t.dyn_ltree[2 * e] = 0;

		for (e = 0; e < 30; e++) t.dyn_dtree[2 * e] = 0;

		for (e = 0; e < 19; e++) t.bl_tree[2 * e] = 0;

		t.dyn_ltree[512] = 1, t.opt_len = t.static_len = 0, t.last_lit = t.matches = 0;
	},
				R = t => {
		t.bi_valid > 8 ? v(t, t.bi_buf) : t.bi_valid > 0 && (t.pending_buf[t.pending++] = t.bi_buf), t.bi_buf = 0, t.bi_valid = 0;
	},
				N = (t, e, i, n) => {
		const r = 2 * e,
					s = 2 * i;
		return t[r] < t[s] || t[r] === t[s] && n[e] <= n[i];
	},
				T = (t, e, i) => {
		const n = t.heap[i];
		let r = i << 1;

		for (; r <= t.heap_len && (r < t.heap_len && N(e, t.heap[r + 1], t.heap[r], t.depth) && r++, !N(e, n, t.heap[r], t.depth));) t.heap[i] = t.heap[r], i = r, r <<= 1;

		t.heap[i] = n;
	},
				O = (t, e, i) => {
		let n,
				r,
				s,
				h,
				l = 0;
		if (0 !== t.last_lit) do {
			n = t.pending_buf[t.d_buf + 2 * l] << 8 | t.pending_buf[t.d_buf + 2 * l + 1], r = t.pending_buf[t.l_buf + l], l++, 0 === n ? A(t, r, e) : (s = c[r], A(t, s + 256 + 1, e), h = a[s], 0 !== h && (r -= u[s], E(t, r, h)), n--, s = y(n), A(t, s, i), h = o[s], 0 !== h && (n -= w[s], E(t, n, h)));
		} while (l < t.last_lit);
		A(t, 256, e);
	},
				L = (t, e) => {
		const i = e.dyn_tree,
					n = e.stat_desc.static_tree,
					r = e.stat_desc.has_stree,
					s = e.stat_desc.elems;
		let a,
				o,
				h,
				l = -1;

		for (t.heap_len = 0, t.heap_max = 573, a = 0; a < s; a++) 0 !== i[2 * a] ? (t.heap[++t.heap_len] = l = a, t.depth[a] = 0) : i[2 * a + 1] = 0;

		for (; t.heap_len < 2;) h = t.heap[++t.heap_len] = l < 2 ? ++l : 0, i[2 * h] = 1, t.depth[h] = 0, t.opt_len--, r && (t.static_len -= n[2 * h + 1]);

		for (e.max_code = l, a = t.heap_len >> 1; a >= 1; a--) T(t, i, a);

		h = s;

		do {
			a = t.heap[1], t.heap[1] = t.heap[t.heap_len--], T(t, i, 1), o = t.heap[1], t.heap[--t.heap_max] = a, t.heap[--t.heap_max] = o, i[2 * h] = i[2 * a] + i[2 * o], t.depth[h] = (t.depth[a] >= t.depth[o] ? t.depth[a] : t.depth[o]) + 1, i[2 * a + 1] = i[2 * o + 1] = h, t.heap[1] = h++, T(t, i, 1);
		} while (t.heap_len >= 2);

		t.heap[--t.heap_max] = t.heap[1], ((t, e) => {
			const i = e.dyn_tree,
						n = e.max_code,
						r = e.stat_desc.static_tree,
						s = e.stat_desc.has_stree,
						a = e.stat_desc.extra_bits,
						o = e.stat_desc.extra_base,
						h = e.stat_desc.max_length;

			let l,
					d,
					_,
					f,
					c,
					u,
					w = 0;

			for (f = 0; f <= 15; f++) t.bl_count[f] = 0;

			for (i[2 * t.heap[t.heap_max] + 1] = 0, l = t.heap_max + 1; l < 573; l++) d = t.heap[l], f = i[2 * i[2 * d + 1] + 1] + 1, f > h && (f = h, w++), i[2 * d + 1] = f, d > n || (t.bl_count[f]++, c = 0, d >= o && (c = a[d - o]), u = i[2 * d], t.opt_len += u * (f + c), s && (t.static_len += u * (r[2 * d + 1] + c)));

			if (0 !== w) {
				do {
					for (f = h - 1; 0 === t.bl_count[f];) f--;

					t.bl_count[f]--, t.bl_count[f + 1] += 2, t.bl_count[h]--, w -= 2;
				} while (w > 0);

				for (f = h; 0 !== f; f--) for (d = t.bl_count[f]; 0 !== d;) _ = t.heap[--l], _ > n || (i[2 * _ + 1] !== f && (t.opt_len += (f - i[2 * _ + 1]) * i[2 * _], i[2 * _ + 1] = f), d--);
			}
		})(t, e), U(i, l, t.bl_count);
	},
				B = (t, e, i) => {
		let n,
				r,
				s = -1,
				a = e[1],
				o = 0,
				h = 7,
				l = 4;

		for (0 === a && (h = 138, l = 3), e[2 * (i + 1) + 1] = 65535, n = 0; n <= i; n++) r = a, a = e[2 * (n + 1) + 1], ++o < h && r === a || (o < l ? t.bl_tree[2 * r] += o : 0 !== r ? (r !== s && t.bl_tree[2 * r]++, t.bl_tree[32]++) : o <= 10 ? t.bl_tree[34]++ : t.bl_tree[36]++, o = 0, s = r, 0 === a ? (h = 138, l = 3) : r === a ? (h = 6, l = 3) : (h = 7, l = 4));
	},
				C = (t, e, i) => {
		let n,
				r,
				s = -1,
				a = e[1],
				o = 0,
				h = 7,
				l = 4;

		for (0 === a && (h = 138, l = 3), n = 0; n <= i; n++) if (r = a, a = e[2 * (n + 1) + 1], !(++o < h && r === a)) {
			if (o < l) do {
				A(t, r, t.bl_tree);
			} while (0 != --o);else 0 !== r ? (r !== s && (A(t, r, t.bl_tree), o--), A(t, 16, t.bl_tree), E(t, o - 3, 2)) : o <= 10 ? (A(t, 17, t.bl_tree), E(t, o - 3, 3)) : (A(t, 18, t.bl_tree), E(t, o - 11, 7));
			o = 0, s = r, 0 === a ? (h = 138, l = 3) : r === a ? (h = 6, l = 3) : (h = 7, l = 4);
		}
	};

	let D = !1;

	const I = (t, e, i, n) => {
		E(t, 0 + (n ? 1 : 0), 3), ((t, e, i, n) => {
			R(t), v(t, i), v(t, ~i), t.pending_buf.set(t.window.subarray(e, e + i), t.pending), t.pending += i;
		})(t, e, i);
	};

	var S = {
		_tr_init: t => {
			D || ((() => {
				let t, e, i, n, r;
				const s = new Array(16);

				for (i = 0, n = 0; n < 28; n++) for (u[n] = i, t = 0; t < 1 << a[n]; t++) c[i++] = n;

				for (c[i - 1] = n, r = 0, n = 0; n < 16; n++) for (w[n] = r, t = 0; t < 1 << o[n]; t++) f[r++] = n;

				for (r >>= 7; n < 30; n++) for (w[n] = r << 7, t = 0; t < 1 << o[n] - 7; t++) f[256 + r++] = n;

				for (e = 0; e <= 15; e++) s[e] = 0;

				for (t = 0; t <= 143;) d[2 * t + 1] = 8, t++, s[8]++;

				for (; t <= 255;) d[2 * t + 1] = 9, t++, s[9]++;

				for (; t <= 279;) d[2 * t + 1] = 7, t++, s[7]++;

				for (; t <= 287;) d[2 * t + 1] = 8, t++, s[8]++;

				for (U(d, 287, s), t = 0; t < 30; t++) _[2 * t + 1] = 5, _[2 * t] = x(t, 5);

				g = new p(d, a, 257, 286, 15), b = new p(_, o, 0, 30, 15), m = new p(new Array(0), h, 0, 19, 7);
			})(), D = !0), t.l_desc = new k(t.dyn_ltree, g), t.d_desc = new k(t.dyn_dtree, b), t.bl_desc = new k(t.bl_tree, m), t.bi_buf = 0, t.bi_valid = 0, z(t);
		},
		_tr_stored_block: I,
		_tr_flush_block: (t, e, i, n) => {
			let r,
					s,
					a = 0;
			t.level > 0 ? (2 === t.strm.data_type && (t.strm.data_type = (t => {
				let e,
						i = 4093624447;

				for (e = 0; e <= 31; e++, i >>>= 1) if (1 & i && 0 !== t.dyn_ltree[2 * e]) return 0;

				if (0 !== t.dyn_ltree[18] || 0 !== t.dyn_ltree[20] || 0 !== t.dyn_ltree[26]) return 1;

				for (e = 32; e < 256; e++) if (0 !== t.dyn_ltree[2 * e]) return 1;

				return 0;
			})(t)), L(t, t.l_desc), L(t, t.d_desc), a = (t => {
				let e;

				for (B(t, t.dyn_ltree, t.l_desc.max_code), B(t, t.dyn_dtree, t.d_desc.max_code), L(t, t.bl_desc), e = 18; e >= 3 && 0 === t.bl_tree[2 * l[e] + 1]; e--);

				return t.opt_len += 3 * (e + 1) + 5 + 5 + 4, e;
			})(t), r = t.opt_len + 3 + 7 >>> 3, s = t.static_len + 3 + 7 >>> 3, s <= r && (r = s)) : r = s = i + 5, i + 4 <= r && -1 !== e ? I(t, e, i, n) : 4 === t.strategy || s === r ? (E(t, 2 + (n ? 1 : 0), 3), O(t, d, _)) : (E(t, 4 + (n ? 1 : 0), 3), ((t, e, i, n) => {
				let r;

				for (E(t, e - 257, 5), E(t, i - 1, 5), E(t, n - 4, 4), r = 0; r < n; r++) E(t, t.bl_tree[2 * l[r] + 1], 3);

				C(t, t.dyn_ltree, e - 1), C(t, t.dyn_dtree, i - 1);
			})(t, t.l_desc.max_code + 1, t.d_desc.max_code + 1, a + 1), O(t, t.dyn_ltree, t.dyn_dtree)), z(t), n && R(t);
		},
		_tr_tally: (t, e, i) => (t.pending_buf[t.d_buf + 2 * t.last_lit] = e >>> 8 & 255, t.pending_buf[t.d_buf + 2 * t.last_lit + 1] = 255 & e, t.pending_buf[t.l_buf + t.last_lit] = 255 & i, t.last_lit++, 0 === e ? t.dyn_ltree[2 * i]++ : (t.matches++, e--, t.dyn_ltree[2 * (c[i] + 256 + 1)]++, t.dyn_dtree[2 * y(e)]++), t.last_lit === t.lit_bufsize - 1),
		_tr_align: t => {
			E(t, 2, 3), A(t, 256, d), (t => {
				16 === t.bi_valid ? (v(t, t.bi_buf), t.bi_buf = 0, t.bi_valid = 0) : t.bi_valid >= 8 && (t.pending_buf[t.pending++] = 255 & t.bi_buf, t.bi_buf >>= 8, t.bi_valid -= 8);
			})(t);
		}
	},
			Z = (t, e, i, n) => {
		let r = 65535 & t | 0,
				s = t >>> 16 & 65535 | 0,
				a = 0;

		for (; 0 !== i;) {
			a = i > 2e3 ? 2e3 : i, i -= a;

			do {
				r = r + e[n++] | 0, s = s + r | 0;
			} while (--a);

			r %= 65521, s %= 65521;
		}

		return r | s << 16 | 0;
	};

	const F = new Uint32Array((() => {
		let t,
				e = [];

		for (var i = 0; i < 256; i++) {
			t = i;

			for (var n = 0; n < 8; n++) t = 1 & t ? 3988292384 ^ t >>> 1 : t >>> 1;

			e[i] = t;
		}

		return e;
	})());

	var M = (t, e, i, n) => {
		const r = F,
					s = n + i;
		t ^= -1;

		for (let i = n; i < s; i++) t = t >>> 8 ^ r[255 & (t ^ e[i])];

		return -1 ^ t;
	},
			P = {
		2: "need dictionary",
		1: "stream end",
		0: "",
		"-1": "file error",
		"-2": "stream error",
		"-3": "data error",
		"-4": "insufficient memory",
		"-5": "buffer error",
		"-6": "incompatible version"
	},
			H = {
		Z_NO_FLUSH: 0,
		Z_PARTIAL_FLUSH: 1,
		Z_SYNC_FLUSH: 2,
		Z_FULL_FLUSH: 3,
		Z_FINISH: 4,
		Z_BLOCK: 5,
		Z_TREES: 6,
		Z_OK: 0,
		Z_STREAM_END: 1,
		Z_NEED_DICT: 2,
		Z_ERRNO: -1,
		Z_STREAM_ERROR: -2,
		Z_DATA_ERROR: -3,
		Z_MEM_ERROR: -4,
		Z_BUF_ERROR: -5,
		Z_NO_COMPRESSION: 0,
		Z_BEST_SPEED: 1,
		Z_BEST_COMPRESSION: 9,
		Z_DEFAULT_COMPRESSION: -1,
		Z_FILTERED: 1,
		Z_HUFFMAN_ONLY: 2,
		Z_RLE: 3,
		Z_FIXED: 4,
		Z_DEFAULT_STRATEGY: 0,
		Z_BINARY: 0,
		Z_TEXT: 1,
		Z_UNKNOWN: 2,
		Z_DEFLATED: 8
	};

	const {
		_tr_init: W,
		_tr_stored_block: K,
		_tr_flush_block: $,
		_tr_tally: Y,
		_tr_align: j
	} = S,
				{
		Z_NO_FLUSH: G,
		Z_PARTIAL_FLUSH: X,
		Z_FULL_FLUSH: V,
		Z_FINISH: q,
		Z_BLOCK: J,
		Z_OK: Q,
		Z_STREAM_END: tt,
		Z_STREAM_ERROR: et,
		Z_DATA_ERROR: it,
		Z_BUF_ERROR: nt,
		Z_DEFAULT_COMPRESSION: rt,
		Z_FILTERED: st,
		Z_HUFFMAN_ONLY: at,
		Z_RLE: ot,
		Z_FIXED: ht,
		Z_DEFAULT_STRATEGY: lt,
		Z_UNKNOWN: dt,
		Z_DEFLATED: _t
	} = H,
				ft = 258,
				ct = 262,
				ut = 103,
				wt = 113,
				pt = 666,
				gt = (t, e) => (t.msg = P[e], e),
				bt = t => (t << 1) - (t > 4 ? 9 : 0),
				mt = t => {
		let e = t.length;

		for (; --e >= 0;) t[e] = 0;
	};

	let kt = (t, e, i) => (e << t.hash_shift ^ i) & t.hash_mask;

	const yt = t => {
		const e = t.state;
		let i = e.pending;
		i > t.avail_out && (i = t.avail_out), 0 !== i && (t.output.set(e.pending_buf.subarray(e.pending_out, e.pending_out + i), t.next_out), t.next_out += i, e.pending_out += i, t.total_out += i, t.avail_out -= i, e.pending -= i, 0 === e.pending && (e.pending_out = 0));
	},
				vt = (t, e) => {
		$(t, t.block_start >= 0 ? t.block_start : -1, t.strstart - t.block_start, e), t.block_start = t.strstart, yt(t.strm);
	},
				Et = (t, e) => {
		t.pending_buf[t.pending++] = e;
	},
				At = (t, e) => {
		t.pending_buf[t.pending++] = e >>> 8 & 255, t.pending_buf[t.pending++] = 255 & e;
	},
				xt = (t, e, i, n) => {
		let r = t.avail_in;
		return r > n && (r = n), 0 === r ? 0 : (t.avail_in -= r, e.set(t.input.subarray(t.next_in, t.next_in + r), i), 1 === t.state.wrap ? t.adler = Z(t.adler, e, r, i) : 2 === t.state.wrap && (t.adler = M(t.adler, e, r, i)), t.next_in += r, t.total_in += r, r);
	},
				Ut = (t, e) => {
		let i,
				n,
				r = t.max_chain_length,
				s = t.strstart,
				a = t.prev_length,
				o = t.nice_match;
		const h = t.strstart > t.w_size - ct ? t.strstart - (t.w_size - ct) : 0,
					l = t.window,
					d = t.w_mask,
					_ = t.prev,
					f = t.strstart + ft;
		let c = l[s + a - 1],
				u = l[s + a];
		t.prev_length >= t.good_match && (r >>= 2), o > t.lookahead && (o = t.lookahead);

		do {
			if (i = e, l[i + a] === u && l[i + a - 1] === c && l[i] === l[s] && l[++i] === l[s + 1]) {
				s += 2, i++;

				do {} while (l[++s] === l[++i] && l[++s] === l[++i] && l[++s] === l[++i] && l[++s] === l[++i] && l[++s] === l[++i] && l[++s] === l[++i] && l[++s] === l[++i] && l[++s] === l[++i] && s < f);

				if (n = ft - (f - s), s = f - ft, n > a) {
					if (t.match_start = e, a = n, n >= o) break;
					c = l[s + a - 1], u = l[s + a];
				}
			}
		} while ((e = _[e & d]) > h && 0 != --r);

		return a <= t.lookahead ? a : t.lookahead;
	},
				zt = t => {
		const e = t.w_size;
		let i, n, r, s, a;

		do {
			if (s = t.window_size - t.lookahead - t.strstart, t.strstart >= e + (e - ct)) {
				t.window.set(t.window.subarray(e, e + e), 0), t.match_start -= e, t.strstart -= e, t.block_start -= e, n = t.hash_size, i = n;

				do {
					r = t.head[--i], t.head[i] = r >= e ? r - e : 0;
				} while (--n);

				n = e, i = n;

				do {
					r = t.prev[--i], t.prev[i] = r >= e ? r - e : 0;
				} while (--n);

				s += e;
			}

			if (0 === t.strm.avail_in) break;
			if (n = xt(t.strm, t.window, t.strstart + t.lookahead, s), t.lookahead += n, t.lookahead + t.insert >= 3) for (a = t.strstart - t.insert, t.ins_h = t.window[a], t.ins_h = kt(t, t.ins_h, t.window[a + 1]); t.insert && (t.ins_h = kt(t, t.ins_h, t.window[a + 3 - 1]), t.prev[a & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = a, a++, t.insert--, !(t.lookahead + t.insert < 3)););
		} while (t.lookahead < ct && 0 !== t.strm.avail_in);
	},
				Rt = (t, e) => {
		let i, n;

		for (;;) {
			if (t.lookahead < ct) {
				if (zt(t), t.lookahead < ct && e === G) return 1;
				if (0 === t.lookahead) break;
			}

			if (i = 0, t.lookahead >= 3 && (t.ins_h = kt(t, t.ins_h, t.window[t.strstart + 3 - 1]), i = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart), 0 !== i && t.strstart - i <= t.w_size - ct && (t.match_length = Ut(t, i)), t.match_length >= 3) {
				if (n = Y(t, t.strstart - t.match_start, t.match_length - 3), t.lookahead -= t.match_length, t.match_length <= t.max_lazy_match && t.lookahead >= 3) {
					t.match_length--;

					do {
						t.strstart++, t.ins_h = kt(t, t.ins_h, t.window[t.strstart + 3 - 1]), i = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart;
					} while (0 != --t.match_length);

					t.strstart++;
				} else t.strstart += t.match_length, t.match_length = 0, t.ins_h = t.window[t.strstart], t.ins_h = kt(t, t.ins_h, t.window[t.strstart + 1]);
			} else n = Y(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++;
			if (n && (vt(t, !1), 0 === t.strm.avail_out)) return 1;
		}

		return t.insert = t.strstart < 2 ? t.strstart : 2, e === q ? (vt(t, !0), 0 === t.strm.avail_out ? 3 : 4) : t.last_lit && (vt(t, !1), 0 === t.strm.avail_out) ? 1 : 2;
	},
				Nt = (t, e) => {
		let i, n, r;

		for (;;) {
			if (t.lookahead < ct) {
				if (zt(t), t.lookahead < ct && e === G) return 1;
				if (0 === t.lookahead) break;
			}

			if (i = 0, t.lookahead >= 3 && (t.ins_h = kt(t, t.ins_h, t.window[t.strstart + 3 - 1]), i = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart), t.prev_length = t.match_length, t.prev_match = t.match_start, t.match_length = 2, 0 !== i && t.prev_length < t.max_lazy_match && t.strstart - i <= t.w_size - ct && (t.match_length = Ut(t, i), t.match_length <= 5 && (t.strategy === st || 3 === t.match_length && t.strstart - t.match_start > 4096) && (t.match_length = 2)), t.prev_length >= 3 && t.match_length <= t.prev_length) {
				r = t.strstart + t.lookahead - 3, n = Y(t, t.strstart - 1 - t.prev_match, t.prev_length - 3), t.lookahead -= t.prev_length - 1, t.prev_length -= 2;

				do {
					++t.strstart <= r && (t.ins_h = kt(t, t.ins_h, t.window[t.strstart + 3 - 1]), i = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h], t.head[t.ins_h] = t.strstart);
				} while (0 != --t.prev_length);

				if (t.match_available = 0, t.match_length = 2, t.strstart++, n && (vt(t, !1), 0 === t.strm.avail_out)) return 1;
			} else if (t.match_available) {
				if (n = Y(t, 0, t.window[t.strstart - 1]), n && vt(t, !1), t.strstart++, t.lookahead--, 0 === t.strm.avail_out) return 1;
			} else t.match_available = 1, t.strstart++, t.lookahead--;
		}

		return t.match_available && (n = Y(t, 0, t.window[t.strstart - 1]), t.match_available = 0), t.insert = t.strstart < 2 ? t.strstart : 2, e === q ? (vt(t, !0), 0 === t.strm.avail_out ? 3 : 4) : t.last_lit && (vt(t, !1), 0 === t.strm.avail_out) ? 1 : 2;
	};

	function Tt(t, e, i, n, r) {
		this.good_length = t, this.max_lazy = e, this.nice_length = i, this.max_chain = n, this.func = r;
	}

	const Ot = [new Tt(0, 0, 0, 0, (t, e) => {
		let i = 65535;

		for (i > t.pending_buf_size - 5 && (i = t.pending_buf_size - 5);;) {
			if (t.lookahead <= 1) {
				if (zt(t), 0 === t.lookahead && e === G) return 1;
				if (0 === t.lookahead) break;
			}

			t.strstart += t.lookahead, t.lookahead = 0;
			const n = t.block_start + i;
			if ((0 === t.strstart || t.strstart >= n) && (t.lookahead = t.strstart - n, t.strstart = n, vt(t, !1), 0 === t.strm.avail_out)) return 1;
			if (t.strstart - t.block_start >= t.w_size - ct && (vt(t, !1), 0 === t.strm.avail_out)) return 1;
		}

		return t.insert = 0, e === q ? (vt(t, !0), 0 === t.strm.avail_out ? 3 : 4) : (t.strstart > t.block_start && (vt(t, !1), t.strm.avail_out), 1);
	}), new Tt(4, 4, 8, 4, Rt), new Tt(4, 5, 16, 8, Rt), new Tt(4, 6, 32, 32, Rt), new Tt(4, 4, 16, 16, Nt), new Tt(8, 16, 32, 32, Nt), new Tt(8, 16, 128, 128, Nt), new Tt(8, 32, 128, 256, Nt), new Tt(32, 128, 258, 1024, Nt), new Tt(32, 258, 258, 4096, Nt)];

	function Lt() {
		this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = _t, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new Uint16Array(1146), this.dyn_dtree = new Uint16Array(122), this.bl_tree = new Uint16Array(78), mt(this.dyn_ltree), mt(this.dyn_dtree), mt(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new Uint16Array(16), this.heap = new Uint16Array(573), mt(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new Uint16Array(573), mt(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
	}

	const Bt = t => {
		if (!t || !t.state) return gt(t, et);
		t.total_in = t.total_out = 0, t.data_type = dt;
		const e = t.state;
		return e.pending = 0, e.pending_out = 0, e.wrap < 0 && (e.wrap = -e.wrap), e.status = e.wrap ? 42 : wt, t.adler = 2 === e.wrap ? 0 : 1, e.last_flush = G, W(e), Q;
	},
				Ct = t => {
		const e = Bt(t);
		var i;
		return e === Q && ((i = t.state).window_size = 2 * i.w_size, mt(i.head), i.max_lazy_match = Ot[i.level].max_lazy, i.good_match = Ot[i.level].good_length, i.nice_match = Ot[i.level].nice_length, i.max_chain_length = Ot[i.level].max_chain, i.strstart = 0, i.block_start = 0, i.lookahead = 0, i.insert = 0, i.match_length = i.prev_length = 2, i.match_available = 0, i.ins_h = 0), e;
	},
				Dt = (t, e, i, n, r, s) => {
		if (!t) return et;
		let a = 1;
		if (e === rt && (e = 6), n < 0 ? (a = 0, n = -n) : n > 15 && (a = 2, n -= 16), r < 1 || r > 9 || i !== _t || n < 8 || n > 15 || e < 0 || e > 9 || s < 0 || s > ht) return gt(t, et);
		8 === n && (n = 9);
		const o = new Lt();
		return t.state = o, o.strm = t, o.wrap = a, o.gzhead = null, o.w_bits = n, o.w_size = 1 << o.w_bits, o.w_mask = o.w_size - 1, o.hash_bits = r + 7, o.hash_size = 1 << o.hash_bits, o.hash_mask = o.hash_size - 1, o.hash_shift = ~~((o.hash_bits + 3 - 1) / 3), o.window = new Uint8Array(2 * o.w_size), o.head = new Uint16Array(o.hash_size), o.prev = new Uint16Array(o.w_size), o.lit_bufsize = 1 << r + 6, o.pending_buf_size = 4 * o.lit_bufsize, o.pending_buf = new Uint8Array(o.pending_buf_size), o.d_buf = 1 * o.lit_bufsize, o.l_buf = 3 * o.lit_bufsize, o.level = e, o.strategy = s, o.method = i, Ct(t);
	};

	var It = Dt,
			St = (t, e) => t && t.state ? 2 !== t.state.wrap ? et : (t.state.gzhead = e, Q) : et,
			Zt = (t, e) => {
		let i, n;
		if (!t || !t.state || e > J || e < 0) return t ? gt(t, et) : et;
		const r = t.state;
		if (!t.output || !t.input && 0 !== t.avail_in || r.status === pt && e !== q) return gt(t, 0 === t.avail_out ? nt : et);
		r.strm = t;
		const s = r.last_flush;
		if (r.last_flush = e, 42 === r.status) if (2 === r.wrap) t.adler = 0, Et(r, 31), Et(r, 139), Et(r, 8), r.gzhead ? (Et(r, (r.gzhead.text ? 1 : 0) + (r.gzhead.hcrc ? 2 : 0) + (r.gzhead.extra ? 4 : 0) + (r.gzhead.name ? 8 : 0) + (r.gzhead.comment ? 16 : 0)), Et(r, 255 & r.gzhead.time), Et(r, r.gzhead.time >> 8 & 255), Et(r, r.gzhead.time >> 16 & 255), Et(r, r.gzhead.time >> 24 & 255), Et(r, 9 === r.level ? 2 : r.strategy >= at || r.level < 2 ? 4 : 0), Et(r, 255 & r.gzhead.os), r.gzhead.extra && r.gzhead.extra.length && (Et(r, 255 & r.gzhead.extra.length), Et(r, r.gzhead.extra.length >> 8 & 255)), r.gzhead.hcrc && (t.adler = M(t.adler, r.pending_buf, r.pending, 0)), r.gzindex = 0, r.status = 69) : (Et(r, 0), Et(r, 0), Et(r, 0), Et(r, 0), Et(r, 0), Et(r, 9 === r.level ? 2 : r.strategy >= at || r.level < 2 ? 4 : 0), Et(r, 3), r.status = wt);else {
			let e = _t + (r.w_bits - 8 << 4) << 8,
					i = -1;
			i = r.strategy >= at || r.level < 2 ? 0 : r.level < 6 ? 1 : 6 === r.level ? 2 : 3, e |= i << 6, 0 !== r.strstart && (e |= 32), e += 31 - e % 31, r.status = wt, At(r, e), 0 !== r.strstart && (At(r, t.adler >>> 16), At(r, 65535 & t.adler)), t.adler = 1;
		}
		if (69 === r.status) if (r.gzhead.extra) {
			for (i = r.pending; r.gzindex < (65535 & r.gzhead.extra.length) && (r.pending !== r.pending_buf_size || (r.gzhead.hcrc && r.pending > i && (t.adler = M(t.adler, r.pending_buf, r.pending - i, i)), yt(t), i = r.pending, r.pending !== r.pending_buf_size));) Et(r, 255 & r.gzhead.extra[r.gzindex]), r.gzindex++;

			r.gzhead.hcrc && r.pending > i && (t.adler = M(t.adler, r.pending_buf, r.pending - i, i)), r.gzindex === r.gzhead.extra.length && (r.gzindex = 0, r.status = 73);
		} else r.status = 73;
		if (73 === r.status) if (r.gzhead.name) {
			i = r.pending;

			do {
				if (r.pending === r.pending_buf_size && (r.gzhead.hcrc && r.pending > i && (t.adler = M(t.adler, r.pending_buf, r.pending - i, i)), yt(t), i = r.pending, r.pending === r.pending_buf_size)) {
					n = 1;
					break;
				}

				n = r.gzindex < r.gzhead.name.length ? 255 & r.gzhead.name.charCodeAt(r.gzindex++) : 0, Et(r, n);
			} while (0 !== n);

			r.gzhead.hcrc && r.pending > i && (t.adler = M(t.adler, r.pending_buf, r.pending - i, i)), 0 === n && (r.gzindex = 0, r.status = 91);
		} else r.status = 91;
		if (91 === r.status) if (r.gzhead.comment) {
			i = r.pending;

			do {
				if (r.pending === r.pending_buf_size && (r.gzhead.hcrc && r.pending > i && (t.adler = M(t.adler, r.pending_buf, r.pending - i, i)), yt(t), i = r.pending, r.pending === r.pending_buf_size)) {
					n = 1;
					break;
				}

				n = r.gzindex < r.gzhead.comment.length ? 255 & r.gzhead.comment.charCodeAt(r.gzindex++) : 0, Et(r, n);
			} while (0 !== n);

			r.gzhead.hcrc && r.pending > i && (t.adler = M(t.adler, r.pending_buf, r.pending - i, i)), 0 === n && (r.status = ut);
		} else r.status = ut;

		if (r.status === ut && (r.gzhead.hcrc ? (r.pending + 2 > r.pending_buf_size && yt(t), r.pending + 2 <= r.pending_buf_size && (Et(r, 255 & t.adler), Et(r, t.adler >> 8 & 255), t.adler = 0, r.status = wt)) : r.status = wt), 0 !== r.pending) {
			if (yt(t), 0 === t.avail_out) return r.last_flush = -1, Q;
		} else if (0 === t.avail_in && bt(e) <= bt(s) && e !== q) return gt(t, nt);

		if (r.status === pt && 0 !== t.avail_in) return gt(t, nt);

		if (0 !== t.avail_in || 0 !== r.lookahead || e !== G && r.status !== pt) {
			let i = r.strategy === at ? ((t, e) => {
				let i;

				for (;;) {
					if (0 === t.lookahead && (zt(t), 0 === t.lookahead)) {
						if (e === G) return 1;
						break;
					}

					if (t.match_length = 0, i = Y(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++, i && (vt(t, !1), 0 === t.strm.avail_out)) return 1;
				}

				return t.insert = 0, e === q ? (vt(t, !0), 0 === t.strm.avail_out ? 3 : 4) : t.last_lit && (vt(t, !1), 0 === t.strm.avail_out) ? 1 : 2;
			})(r, e) : r.strategy === ot ? ((t, e) => {
				let i, n, r, s;
				const a = t.window;

				for (;;) {
					if (t.lookahead <= ft) {
						if (zt(t), t.lookahead <= ft && e === G) return 1;
						if (0 === t.lookahead) break;
					}

					if (t.match_length = 0, t.lookahead >= 3 && t.strstart > 0 && (r = t.strstart - 1, n = a[r], n === a[++r] && n === a[++r] && n === a[++r])) {
						s = t.strstart + ft;

						do {} while (n === a[++r] && n === a[++r] && n === a[++r] && n === a[++r] && n === a[++r] && n === a[++r] && n === a[++r] && n === a[++r] && r < s);

						t.match_length = ft - (s - r), t.match_length > t.lookahead && (t.match_length = t.lookahead);
					}

					if (t.match_length >= 3 ? (i = Y(t, 1, t.match_length - 3), t.lookahead -= t.match_length, t.strstart += t.match_length, t.match_length = 0) : (i = Y(t, 0, t.window[t.strstart]), t.lookahead--, t.strstart++), i && (vt(t, !1), 0 === t.strm.avail_out)) return 1;
				}

				return t.insert = 0, e === q ? (vt(t, !0), 0 === t.strm.avail_out ? 3 : 4) : t.last_lit && (vt(t, !1), 0 === t.strm.avail_out) ? 1 : 2;
			})(r, e) : Ot[r.level].func(r, e);
			if (3 !== i && 4 !== i || (r.status = pt), 1 === i || 3 === i) return 0 === t.avail_out && (r.last_flush = -1), Q;
			if (2 === i && (e === X ? j(r) : e !== J && (K(r, 0, 0, !1), e === V && (mt(r.head), 0 === r.lookahead && (r.strstart = 0, r.block_start = 0, r.insert = 0))), yt(t), 0 === t.avail_out)) return r.last_flush = -1, Q;
		}

		return e !== q ? Q : r.wrap <= 0 ? tt : (2 === r.wrap ? (Et(r, 255 & t.adler), Et(r, t.adler >> 8 & 255), Et(r, t.adler >> 16 & 255), Et(r, t.adler >> 24 & 255), Et(r, 255 & t.total_in), Et(r, t.total_in >> 8 & 255), Et(r, t.total_in >> 16 & 255), Et(r, t.total_in >> 24 & 255)) : (At(r, t.adler >>> 16), At(r, 65535 & t.adler)), yt(t), r.wrap > 0 && (r.wrap = -r.wrap), 0 !== r.pending ? Q : tt);
	},
			Ft = t => {
		if (!t || !t.state) return et;
		const e = t.state.status;
		return 42 !== e && 69 !== e && 73 !== e && 91 !== e && e !== ut && e !== wt && e !== pt ? gt(t, et) : (t.state = null, e === wt ? gt(t, it) : Q);
	},
			Mt = (t, e) => {
		let i = e.length;
		if (!t || !t.state) return et;
		const n = t.state,
					r = n.wrap;
		if (2 === r || 1 === r && 42 !== n.status || n.lookahead) return et;

		if (1 === r && (t.adler = Z(t.adler, e, i, 0)), n.wrap = 0, i >= n.w_size) {
			0 === r && (mt(n.head), n.strstart = 0, n.block_start = 0, n.insert = 0);
			let t = new Uint8Array(n.w_size);
			t.set(e.subarray(i - n.w_size, i), 0), e = t, i = n.w_size;
		}

		const s = t.avail_in,
					a = t.next_in,
					o = t.input;

		for (t.avail_in = i, t.next_in = 0, t.input = e, zt(n); n.lookahead >= 3;) {
			let t = n.strstart,
					e = n.lookahead - 2;

			do {
				n.ins_h = kt(n, n.ins_h, n.window[t + 3 - 1]), n.prev[t & n.w_mask] = n.head[n.ins_h], n.head[n.ins_h] = t, t++;
			} while (--e);

			n.strstart = t, n.lookahead = 2, zt(n);
		}

		return n.strstart += n.lookahead, n.block_start = n.strstart, n.insert = n.lookahead, n.lookahead = 0, n.match_length = n.prev_length = 2, n.match_available = 0, t.next_in = a, t.input = o, t.avail_in = s, n.wrap = r, Q;
	};

	const Pt = (t, e) => Object.prototype.hasOwnProperty.call(t, e);

	var Ht = function Ht(t) {
		const e = Array.prototype.slice.call(arguments, 1);

		for (; e.length;) {
			const i = e.shift();

			if (i) {
				if ("object" != typeof i) throw new TypeError(i + "must be non-object");

				for (const e in i) Pt(i, e) && (t[e] = i[e]);
			}
		}

		return t;
	},
			Wt = t => {
		let e = 0;

		for (let i = 0, n = t.length; i < n; i++) e += t[i].length;

		const i = new Uint8Array(e);

		for (let e = 0, n = 0, r = t.length; e < r; e++) {
			let r = t[e];
			i.set(r, n), n += r.length;
		}

		return i;
	};

	let Kt = !0;

	try {
		String.fromCharCode.apply(null, new Uint8Array(1));
	} catch (t) {
		Kt = !1;
	}

	const $t = new Uint8Array(256);

	for (let t = 0; t < 256; t++) $t[t] = t >= 252 ? 6 : t >= 248 ? 5 : t >= 240 ? 4 : t >= 224 ? 3 : t >= 192 ? 2 : 1;

	$t[254] = $t[254] = 1;

	var Yt = t => {
		if ("function" == typeof TextEncoder && TextEncoder.prototype.encode) return new TextEncoder().encode(t);
		let e,
				i,
				n,
				r,
				s,
				a = t.length,
				o = 0;

		for (r = 0; r < a; r++) i = t.charCodeAt(r), 55296 == (64512 & i) && r + 1 < a && (n = t.charCodeAt(r + 1), 56320 == (64512 & n) && (i = 65536 + (i - 55296 << 10) + (n - 56320), r++)), o += i < 128 ? 1 : i < 2048 ? 2 : i < 65536 ? 3 : 4;

		for (e = new Uint8Array(o), s = 0, r = 0; s < o; r++) i = t.charCodeAt(r), 55296 == (64512 & i) && r + 1 < a && (n = t.charCodeAt(r + 1), 56320 == (64512 & n) && (i = 65536 + (i - 55296 << 10) + (n - 56320), r++)), i < 128 ? e[s++] = i : i < 2048 ? (e[s++] = 192 | i >>> 6, e[s++] = 128 | 63 & i) : i < 65536 ? (e[s++] = 224 | i >>> 12, e[s++] = 128 | i >>> 6 & 63, e[s++] = 128 | 63 & i) : (e[s++] = 240 | i >>> 18, e[s++] = 128 | i >>> 12 & 63, e[s++] = 128 | i >>> 6 & 63, e[s++] = 128 | 63 & i);

		return e;
	},
			jt = (t, e) => {
		const i = e || t.length;
		if ("function" == typeof TextDecoder && TextDecoder.prototype.decode) return new TextDecoder().decode(t.subarray(0, e));
		let n, r;
		const s = new Array(2 * i);

		for (r = 0, n = 0; n < i;) {
			let e = t[n++];

			if (e < 128) {
				s[r++] = e;
				continue;
			}

			let a = $t[e];
			if (a > 4) s[r++] = 65533, n += a - 1;else {
				for (e &= 2 === a ? 31 : 3 === a ? 15 : 7; a > 1 && n < i;) e = e << 6 | 63 & t[n++], a--;

				a > 1 ? s[r++] = 65533 : e < 65536 ? s[r++] = e : (e -= 65536, s[r++] = 55296 | e >> 10 & 1023, s[r++] = 56320 | 1023 & e);
			}
		}

		return ((t, e) => {
			if (e < 65534 && t.subarray && Kt) return String.fromCharCode.apply(null, t.length === e ? t : t.subarray(0, e));
			let i = "";

			for (let n = 0; n < e; n++) i += String.fromCharCode(t[n]);

			return i;
		})(s, r);
	},
			Gt = (t, e) => {
		(e = e || t.length) > t.length && (e = t.length);
		let i = e - 1;

		for (; i >= 0 && 128 == (192 & t[i]);) i--;

		return i < 0 || 0 === i ? e : i + $t[t[i]] > e ? i : e;
	},
			Xt = function Xt() {
		this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
	};

	const Vt = Object.prototype.toString,
				{
		Z_NO_FLUSH: qt,
		Z_SYNC_FLUSH: Jt,
		Z_FULL_FLUSH: Qt,
		Z_FINISH: te,
		Z_OK: ee,
		Z_STREAM_END: ie,
		Z_DEFAULT_COMPRESSION: ne,
		Z_DEFAULT_STRATEGY: re,
		Z_DEFLATED: se
	} = H;

	function ae(t) {
		this.options = Ht({
			level: ne,
			method: se,
			chunkSize: 16384,
			windowBits: 15,
			memLevel: 8,
			strategy: re
		}, t || {});
		let e = this.options;
		e.raw && e.windowBits > 0 ? e.windowBits = -e.windowBits : e.gzip && e.windowBits > 0 && e.windowBits < 16 && (e.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new Xt(), this.strm.avail_out = 0;
		let i = It(this.strm, e.level, e.method, e.windowBits, e.memLevel, e.strategy);
		if (i !== ee) throw new Error(P[i]);

		if (e.header && St(this.strm, e.header), e.dictionary) {
			let t;
			if (t = "string" == typeof e.dictionary ? Yt(e.dictionary) : "[object ArrayBuffer]" === Vt.call(e.dictionary) ? new Uint8Array(e.dictionary) : e.dictionary, i = Mt(this.strm, t), i !== ee) throw new Error(P[i]);
			this._dict_set = !0;
		}
	}

	function oe(t, e) {
		const i = new ae(e);
		if (i.push(t, !0), i.err) throw i.msg || P[i.err];
		return i.result;
	}

	ae.prototype.push = function (t, e) {
		const i = this.strm,
					n = this.options.chunkSize;
		let r, s;
		if (this.ended) return !1;

		for (s = e === ~~e ? e : !0 === e ? te : qt, "string" == typeof t ? i.input = Yt(t) : "[object ArrayBuffer]" === Vt.call(t) ? i.input = new Uint8Array(t) : i.input = t, i.next_in = 0, i.avail_in = i.input.length;;) if (0 === i.avail_out && (i.output = new Uint8Array(n), i.next_out = 0, i.avail_out = n), (s === Jt || s === Qt) && i.avail_out <= 6) this.onData(i.output.subarray(0, i.next_out)), i.avail_out = 0;else {
			if (r = Zt(i, s), r === ie) return i.next_out > 0 && this.onData(i.output.subarray(0, i.next_out)), r = Ft(this.strm), this.onEnd(r), this.ended = !0, r === ee;

			if (0 !== i.avail_out) {
				if (s > 0 && i.next_out > 0) this.onData(i.output.subarray(0, i.next_out)), i.avail_out = 0;else if (0 === i.avail_in) break;
			} else this.onData(i.output);
		}

		return !0;
	}, ae.prototype.onData = function (t) {
		this.chunks.push(t);
	}, ae.prototype.onEnd = function (t) {
		t === ee && (this.result = Wt(this.chunks)), this.chunks = [], this.err = t, this.msg = this.strm.msg;
	};

	var he = {
		Deflate: ae,
		deflate: oe,
		deflateRaw: function deflateRaw(t, e) {
			return (e = e || {}).raw = !0, oe(t, e);
		},
		gzip: function gzip(t, e) {
			return (e = e || {}).gzip = !0, oe(t, e);
		},
		constants: H
	},
			le = function le(t, e) {
		let i, n, r, s, a, o, h, l, d, _, f, c, u, w, p, g, b, m, k, y, v, E, A, x;

		const U = t.state;
		i = t.next_in, A = t.input, n = i + (t.avail_in - 5), r = t.next_out, x = t.output, s = r - (e - t.avail_out), a = r + (t.avail_out - 257), o = U.dmax, h = U.wsize, l = U.whave, d = U.wnext, _ = U.window, f = U.hold, c = U.bits, u = U.lencode, w = U.distcode, p = (1 << U.lenbits) - 1, g = (1 << U.distbits) - 1;

		t: do {
			c < 15 && (f += A[i++] << c, c += 8, f += A[i++] << c, c += 8), b = u[f & p];

			e: for (;;) {
				if (m = b >>> 24, f >>>= m, c -= m, m = b >>> 16 & 255, 0 === m) x[r++] = 65535 & b;else {
					if (!(16 & m)) {
						if (0 == (64 & m)) {
							b = u[(65535 & b) + (f & (1 << m) - 1)];
							continue e;
						}

						if (32 & m) {
							U.mode = 12;
							break t;
						}

						t.msg = "invalid literal/length code", U.mode = 30;
						break t;
					}

					k = 65535 & b, m &= 15, m && (c < m && (f += A[i++] << c, c += 8), k += f & (1 << m) - 1, f >>>= m, c -= m), c < 15 && (f += A[i++] << c, c += 8, f += A[i++] << c, c += 8), b = w[f & g];

					i: for (;;) {
						if (m = b >>> 24, f >>>= m, c -= m, m = b >>> 16 & 255, !(16 & m)) {
							if (0 == (64 & m)) {
								b = w[(65535 & b) + (f & (1 << m) - 1)];
								continue i;
							}

							t.msg = "invalid distance code", U.mode = 30;
							break t;
						}

						if (y = 65535 & b, m &= 15, c < m && (f += A[i++] << c, c += 8, c < m && (f += A[i++] << c, c += 8)), y += f & (1 << m) - 1, y > o) {
							t.msg = "invalid distance too far back", U.mode = 30;
							break t;
						}

						if (f >>>= m, c -= m, m = r - s, y > m) {
							if (m = y - m, m > l && U.sane) {
								t.msg = "invalid distance too far back", U.mode = 30;
								break t;
							}

							if (v = 0, E = _, 0 === d) {
								if (v += h - m, m < k) {
									k -= m;

									do {
										x[r++] = _[v++];
									} while (--m);

									v = r - y, E = x;
								}
							} else if (d < m) {
								if (v += h + d - m, m -= d, m < k) {
									k -= m;

									do {
										x[r++] = _[v++];
									} while (--m);

									if (v = 0, d < k) {
										m = d, k -= m;

										do {
											x[r++] = _[v++];
										} while (--m);

										v = r - y, E = x;
									}
								}
							} else if (v += d - m, m < k) {
								k -= m;

								do {
									x[r++] = _[v++];
								} while (--m);

								v = r - y, E = x;
							}

							for (; k > 2;) x[r++] = E[v++], x[r++] = E[v++], x[r++] = E[v++], k -= 3;

							k && (x[r++] = E[v++], k > 1 && (x[r++] = E[v++]));
						} else {
							v = r - y;

							do {
								x[r++] = x[v++], x[r++] = x[v++], x[r++] = x[v++], k -= 3;
							} while (k > 2);

							k && (x[r++] = x[v++], k > 1 && (x[r++] = x[v++]));
						}

						break;
					}
				}
				break;
			}
		} while (i < n && r < a);

		k = c >> 3, i -= k, c -= k << 3, f &= (1 << c) - 1, t.next_in = i, t.next_out = r, t.avail_in = i < n ? n - i + 5 : 5 - (i - n), t.avail_out = r < a ? a - r + 257 : 257 - (r - a), U.hold = f, U.bits = c;
	};

	const de = new Uint16Array([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0]),
				_e = new Uint8Array([16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78]),
				fe = new Uint16Array([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0]),
				ce = new Uint8Array([16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64]);

	var ue = (t, e, i, n, r, s, a, o) => {
		const h = o.bits;

		let l,
				d,
				_,
				f,
				c,
				u,
				w = 0,
				p = 0,
				g = 0,
				b = 0,
				m = 0,
				k = 0,
				y = 0,
				v = 0,
				E = 0,
				A = 0,
				x = null,
				U = 0;

		const z = new Uint16Array(16),
					R = new Uint16Array(16);
		let N,
				T,
				O,
				L = null,
				B = 0;

		for (w = 0; w <= 15; w++) z[w] = 0;

		for (p = 0; p < n; p++) z[e[i + p]]++;

		for (m = h, b = 15; b >= 1 && 0 === z[b]; b--);

		if (m > b && (m = b), 0 === b) return r[s++] = 20971520, r[s++] = 20971520, o.bits = 1, 0;

		for (g = 1; g < b && 0 === z[g]; g++);

		for (m < g && (m = g), v = 1, w = 1; w <= 15; w++) if (v <<= 1, v -= z[w], v < 0) return -1;

		if (v > 0 && (0 === t || 1 !== b)) return -1;

		for (R[1] = 0, w = 1; w < 15; w++) R[w + 1] = R[w] + z[w];

		for (p = 0; p < n; p++) 0 !== e[i + p] && (a[R[e[i + p]]++] = p);

		if (0 === t ? (x = L = a, u = 19) : 1 === t ? (x = de, U -= 257, L = _e, B -= 257, u = 256) : (x = fe, L = ce, u = -1), A = 0, p = 0, w = g, c = s, k = m, y = 0, _ = -1, E = 1 << m, f = E - 1, 1 === t && E > 852 || 2 === t && E > 592) return 1;

		for (;;) {
			N = w - y, a[p] < u ? (T = 0, O = a[p]) : a[p] > u ? (T = L[B + a[p]], O = x[U + a[p]]) : (T = 96, O = 0), l = 1 << w - y, d = 1 << k, g = d;

			do {
				d -= l, r[c + (A >> y) + d] = N << 24 | T << 16 | O | 0;
			} while (0 !== d);

			for (l = 1 << w - 1; A & l;) l >>= 1;

			if (0 !== l ? (A &= l - 1, A += l) : A = 0, p++, 0 == --z[w]) {
				if (w === b) break;
				w = e[i + a[p]];
			}

			if (w > m && (A & f) !== _) {
				for (0 === y && (y = m), c += g, k = w - y, v = 1 << k; k + y < b && (v -= z[k + y], !(v <= 0));) k++, v <<= 1;

				if (E += 1 << k, 1 === t && E > 852 || 2 === t && E > 592) return 1;
				_ = A & f, r[_] = m << 24 | k << 16 | c - s | 0;
			}
		}

		return 0 !== A && (r[c + A] = w - y << 24 | 64 << 16 | 0), o.bits = m, 0;
	};

	const {
		Z_FINISH: we,
		Z_BLOCK: pe,
		Z_TREES: ge,
		Z_OK: be,
		Z_STREAM_END: me,
		Z_NEED_DICT: ke,
		Z_STREAM_ERROR: ye,
		Z_DATA_ERROR: ve,
		Z_MEM_ERROR: Ee,
		Z_BUF_ERROR: Ae,
		Z_DEFLATED: xe
	} = H,
				Ue = 12,
				ze = 30,
				Re = t => (t >>> 24 & 255) + (t >>> 8 & 65280) + ((65280 & t) << 8) + ((255 & t) << 24);

	function Ne() {
		this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new Uint16Array(320), this.work = new Uint16Array(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
	}

	const Te = t => {
		if (!t || !t.state) return ye;
		const e = t.state;
		return t.total_in = t.total_out = e.total = 0, t.msg = "", e.wrap && (t.adler = 1 & e.wrap), e.mode = 1, e.last = 0, e.havedict = 0, e.dmax = 32768, e.head = null, e.hold = 0, e.bits = 0, e.lencode = e.lendyn = new Int32Array(852), e.distcode = e.distdyn = new Int32Array(592), e.sane = 1, e.back = -1, be;
	},
				Oe = t => {
		if (!t || !t.state) return ye;
		const e = t.state;
		return e.wsize = 0, e.whave = 0, e.wnext = 0, Te(t);
	},
				Le = (t, e) => {
		let i;
		if (!t || !t.state) return ye;
		const n = t.state;
		return e < 0 ? (i = 0, e = -e) : (i = 1 + (e >> 4), e < 48 && (e &= 15)), e && (e < 8 || e > 15) ? ye : (null !== n.window && n.wbits !== e && (n.window = null), n.wrap = i, n.wbits = e, Oe(t));
	},
				Be = (t, e) => {
		if (!t) return ye;
		const i = new Ne();
		t.state = i, i.window = null;
		const n = Le(t, e);
		return n !== be && (t.state = null), n;
	};

	let Ce,
			De,
			Ie = !0;

	const Se = t => {
		if (Ie) {
			Ce = new Int32Array(512), De = new Int32Array(32);
			let e = 0;

			for (; e < 144;) t.lens[e++] = 8;

			for (; e < 256;) t.lens[e++] = 9;

			for (; e < 280;) t.lens[e++] = 7;

			for (; e < 288;) t.lens[e++] = 8;

			for (ue(1, t.lens, 0, 288, Ce, 0, t.work, {
				bits: 9
			}), e = 0; e < 32;) t.lens[e++] = 5;

			ue(2, t.lens, 0, 32, De, 0, t.work, {
				bits: 5
			}), Ie = !1;
		}

		t.lencode = Ce, t.lenbits = 9, t.distcode = De, t.distbits = 5;
	},
				Ze = (t, e, i, n) => {
		let r;
		const s = t.state;
		return null === s.window && (s.wsize = 1 << s.wbits, s.wnext = 0, s.whave = 0, s.window = new Uint8Array(s.wsize)), n >= s.wsize ? (s.window.set(e.subarray(i - s.wsize, i), 0), s.wnext = 0, s.whave = s.wsize) : (r = s.wsize - s.wnext, r > n && (r = n), s.window.set(e.subarray(i - n, i - n + r), s.wnext), (n -= r) ? (s.window.set(e.subarray(i - n, i), 0), s.wnext = n, s.whave = s.wsize) : (s.wnext += r, s.wnext === s.wsize && (s.wnext = 0), s.whave < s.wsize && (s.whave += r))), 0;
	};

	var Fe = Oe,
			Me = Be,
			Pe = (t, e) => {
		let i,
				n,
				r,
				s,
				a,
				o,
				h,
				l,
				d,
				_,
				f,
				c,
				u,
				w,
				p,
				g,
				b,
				m,
				k,
				y,
				v,
				E,
				A = 0;

		const x = new Uint8Array(4);
		let U, z;
		const R = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
		if (!t || !t.state || !t.output || !t.input && 0 !== t.avail_in) return ye;
		i = t.state, i.mode === Ue && (i.mode = 13), a = t.next_out, r = t.output, h = t.avail_out, s = t.next_in, n = t.input, o = t.avail_in, l = i.hold, d = i.bits, _ = o, f = h, E = be;

		t: for (;;) switch (i.mode) {
			case 1:
				if (0 === i.wrap) {
					i.mode = 13;
					break;
				}

				for (; d < 16;) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				if (2 & i.wrap && 35615 === l) {
					i.check = 0, x[0] = 255 & l, x[1] = l >>> 8 & 255, i.check = M(i.check, x, 2, 0), l = 0, d = 0, i.mode = 2;
					break;
				}

				if (i.flags = 0, i.head && (i.head.done = !1), !(1 & i.wrap) || (((255 & l) << 8) + (l >> 8)) % 31) {
					t.msg = "incorrect header check", i.mode = ze;
					break;
				}

				if ((15 & l) !== xe) {
					t.msg = "unknown compression method", i.mode = ze;
					break;
				}

				if (l >>>= 4, d -= 4, v = 8 + (15 & l), 0 === i.wbits) i.wbits = v;else if (v > i.wbits) {
					t.msg = "invalid window size", i.mode = ze;
					break;
				}
				i.dmax = 1 << i.wbits, t.adler = i.check = 1, i.mode = 512 & l ? 10 : Ue, l = 0, d = 0;
				break;

			case 2:
				for (; d < 16;) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				if (i.flags = l, (255 & i.flags) !== xe) {
					t.msg = "unknown compression method", i.mode = ze;
					break;
				}

				if (57344 & i.flags) {
					t.msg = "unknown header flags set", i.mode = ze;
					break;
				}

				i.head && (i.head.text = l >> 8 & 1), 512 & i.flags && (x[0] = 255 & l, x[1] = l >>> 8 & 255, i.check = M(i.check, x, 2, 0)), l = 0, d = 0, i.mode = 3;

			case 3:
				for (; d < 32;) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				i.head && (i.head.time = l), 512 & i.flags && (x[0] = 255 & l, x[1] = l >>> 8 & 255, x[2] = l >>> 16 & 255, x[3] = l >>> 24 & 255, i.check = M(i.check, x, 4, 0)), l = 0, d = 0, i.mode = 4;

			case 4:
				for (; d < 16;) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				i.head && (i.head.xflags = 255 & l, i.head.os = l >> 8), 512 & i.flags && (x[0] = 255 & l, x[1] = l >>> 8 & 255, i.check = M(i.check, x, 2, 0)), l = 0, d = 0, i.mode = 5;

			case 5:
				if (1024 & i.flags) {
					for (; d < 16;) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					i.length = l, i.head && (i.head.extra_len = l), 512 & i.flags && (x[0] = 255 & l, x[1] = l >>> 8 & 255, i.check = M(i.check, x, 2, 0)), l = 0, d = 0;
				} else i.head && (i.head.extra = null);

				i.mode = 6;

			case 6:
				if (1024 & i.flags && (c = i.length, c > o && (c = o), c && (i.head && (v = i.head.extra_len - i.length, i.head.extra || (i.head.extra = new Uint8Array(i.head.extra_len)), i.head.extra.set(n.subarray(s, s + c), v)), 512 & i.flags && (i.check = M(i.check, n, c, s)), o -= c, s += c, i.length -= c), i.length)) break t;
				i.length = 0, i.mode = 7;

			case 7:
				if (2048 & i.flags) {
					if (0 === o) break t;
					c = 0;

					do {
						v = n[s + c++], i.head && v && i.length < 65536 && (i.head.name += String.fromCharCode(v));
					} while (v && c < o);

					if (512 & i.flags && (i.check = M(i.check, n, c, s)), o -= c, s += c, v) break t;
				} else i.head && (i.head.name = null);

				i.length = 0, i.mode = 8;

			case 8:
				if (4096 & i.flags) {
					if (0 === o) break t;
					c = 0;

					do {
						v = n[s + c++], i.head && v && i.length < 65536 && (i.head.comment += String.fromCharCode(v));
					} while (v && c < o);

					if (512 & i.flags && (i.check = M(i.check, n, c, s)), o -= c, s += c, v) break t;
				} else i.head && (i.head.comment = null);

				i.mode = 9;

			case 9:
				if (512 & i.flags) {
					for (; d < 16;) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					if (l !== (65535 & i.check)) {
						t.msg = "header crc mismatch", i.mode = ze;
						break;
					}

					l = 0, d = 0;
				}

				i.head && (i.head.hcrc = i.flags >> 9 & 1, i.head.done = !0), t.adler = i.check = 0, i.mode = Ue;
				break;

			case 10:
				for (; d < 32;) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				t.adler = i.check = Re(l), l = 0, d = 0, i.mode = 11;

			case 11:
				if (0 === i.havedict) return t.next_out = a, t.avail_out = h, t.next_in = s, t.avail_in = o, i.hold = l, i.bits = d, ke;
				t.adler = i.check = 1, i.mode = Ue;

			case Ue:
				if (e === pe || e === ge) break t;

			case 13:
				if (i.last) {
					l >>>= 7 & d, d -= 7 & d, i.mode = 27;
					break;
				}

				for (; d < 3;) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				switch (i.last = 1 & l, l >>>= 1, d -= 1, 3 & l) {
					case 0:
						i.mode = 14;
						break;

					case 1:
						if (Se(i), i.mode = 20, e === ge) {
							l >>>= 2, d -= 2;
							break t;
						}

						break;

					case 2:
						i.mode = 17;
						break;

					case 3:
						t.msg = "invalid block type", i.mode = ze;
				}

				l >>>= 2, d -= 2;
				break;

			case 14:
				for (l >>>= 7 & d, d -= 7 & d; d < 32;) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				if ((65535 & l) != (l >>> 16 ^ 65535)) {
					t.msg = "invalid stored block lengths", i.mode = ze;
					break;
				}

				if (i.length = 65535 & l, l = 0, d = 0, i.mode = 15, e === ge) break t;

			case 15:
				i.mode = 16;

			case 16:
				if (c = i.length, c) {
					if (c > o && (c = o), c > h && (c = h), 0 === c) break t;
					r.set(n.subarray(s, s + c), a), o -= c, s += c, h -= c, a += c, i.length -= c;
					break;
				}

				i.mode = Ue;
				break;

			case 17:
				for (; d < 14;) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				if (i.nlen = 257 + (31 & l), l >>>= 5, d -= 5, i.ndist = 1 + (31 & l), l >>>= 5, d -= 5, i.ncode = 4 + (15 & l), l >>>= 4, d -= 4, i.nlen > 286 || i.ndist > 30) {
					t.msg = "too many length or distance symbols", i.mode = ze;
					break;
				}

				i.have = 0, i.mode = 18;

			case 18:
				for (; i.have < i.ncode;) {
					for (; d < 3;) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					i.lens[R[i.have++]] = 7 & l, l >>>= 3, d -= 3;
				}

				for (; i.have < 19;) i.lens[R[i.have++]] = 0;

				if (i.lencode = i.lendyn, i.lenbits = 7, U = {
					bits: i.lenbits
				}, E = ue(0, i.lens, 0, 19, i.lencode, 0, i.work, U), i.lenbits = U.bits, E) {
					t.msg = "invalid code lengths set", i.mode = ze;
					break;
				}

				i.have = 0, i.mode = 19;

			case 19:
				for (; i.have < i.nlen + i.ndist;) {
					for (; A = i.lencode[l & (1 << i.lenbits) - 1], p = A >>> 24, g = A >>> 16 & 255, b = 65535 & A, !(p <= d);) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					if (b < 16) l >>>= p, d -= p, i.lens[i.have++] = b;else {
						if (16 === b) {
							for (z = p + 2; d < z;) {
								if (0 === o) break t;
								o--, l += n[s++] << d, d += 8;
							}

							if (l >>>= p, d -= p, 0 === i.have) {
								t.msg = "invalid bit length repeat", i.mode = ze;
								break;
							}

							v = i.lens[i.have - 1], c = 3 + (3 & l), l >>>= 2, d -= 2;
						} else if (17 === b) {
							for (z = p + 3; d < z;) {
								if (0 === o) break t;
								o--, l += n[s++] << d, d += 8;
							}

							l >>>= p, d -= p, v = 0, c = 3 + (7 & l), l >>>= 3, d -= 3;
						} else {
							for (z = p + 7; d < z;) {
								if (0 === o) break t;
								o--, l += n[s++] << d, d += 8;
							}

							l >>>= p, d -= p, v = 0, c = 11 + (127 & l), l >>>= 7, d -= 7;
						}

						if (i.have + c > i.nlen + i.ndist) {
							t.msg = "invalid bit length repeat", i.mode = ze;
							break;
						}

						for (; c--;) i.lens[i.have++] = v;
					}
				}

				if (i.mode === ze) break;

				if (0 === i.lens[256]) {
					t.msg = "invalid code -- missing end-of-block", i.mode = ze;
					break;
				}

				if (i.lenbits = 9, U = {
					bits: i.lenbits
				}, E = ue(1, i.lens, 0, i.nlen, i.lencode, 0, i.work, U), i.lenbits = U.bits, E) {
					t.msg = "invalid literal/lengths set", i.mode = ze;
					break;
				}

				if (i.distbits = 6, i.distcode = i.distdyn, U = {
					bits: i.distbits
				}, E = ue(2, i.lens, i.nlen, i.ndist, i.distcode, 0, i.work, U), i.distbits = U.bits, E) {
					t.msg = "invalid distances set", i.mode = ze;
					break;
				}

				if (i.mode = 20, e === ge) break t;

			case 20:
				i.mode = 21;

			case 21:
				if (o >= 6 && h >= 258) {
					t.next_out = a, t.avail_out = h, t.next_in = s, t.avail_in = o, i.hold = l, i.bits = d, le(t, f), a = t.next_out, r = t.output, h = t.avail_out, s = t.next_in, n = t.input, o = t.avail_in, l = i.hold, d = i.bits, i.mode === Ue && (i.back = -1);
					break;
				}

				for (i.back = 0; A = i.lencode[l & (1 << i.lenbits) - 1], p = A >>> 24, g = A >>> 16 & 255, b = 65535 & A, !(p <= d);) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				if (g && 0 == (240 & g)) {
					for (m = p, k = g, y = b; A = i.lencode[y + ((l & (1 << m + k) - 1) >> m)], p = A >>> 24, g = A >>> 16 & 255, b = 65535 & A, !(m + p <= d);) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					l >>>= m, d -= m, i.back += m;
				}

				if (l >>>= p, d -= p, i.back += p, i.length = b, 0 === g) {
					i.mode = 26;
					break;
				}

				if (32 & g) {
					i.back = -1, i.mode = Ue;
					break;
				}

				if (64 & g) {
					t.msg = "invalid literal/length code", i.mode = ze;
					break;
				}

				i.extra = 15 & g, i.mode = 22;

			case 22:
				if (i.extra) {
					for (z = i.extra; d < z;) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					i.length += l & (1 << i.extra) - 1, l >>>= i.extra, d -= i.extra, i.back += i.extra;
				}

				i.was = i.length, i.mode = 23;

			case 23:
				for (; A = i.distcode[l & (1 << i.distbits) - 1], p = A >>> 24, g = A >>> 16 & 255, b = 65535 & A, !(p <= d);) {
					if (0 === o) break t;
					o--, l += n[s++] << d, d += 8;
				}

				if (0 == (240 & g)) {
					for (m = p, k = g, y = b; A = i.distcode[y + ((l & (1 << m + k) - 1) >> m)], p = A >>> 24, g = A >>> 16 & 255, b = 65535 & A, !(m + p <= d);) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					l >>>= m, d -= m, i.back += m;
				}

				if (l >>>= p, d -= p, i.back += p, 64 & g) {
					t.msg = "invalid distance code", i.mode = ze;
					break;
				}

				i.offset = b, i.extra = 15 & g, i.mode = 24;

			case 24:
				if (i.extra) {
					for (z = i.extra; d < z;) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					i.offset += l & (1 << i.extra) - 1, l >>>= i.extra, d -= i.extra, i.back += i.extra;
				}

				if (i.offset > i.dmax) {
					t.msg = "invalid distance too far back", i.mode = ze;
					break;
				}

				i.mode = 25;

			case 25:
				if (0 === h) break t;

				if (c = f - h, i.offset > c) {
					if (c = i.offset - c, c > i.whave && i.sane) {
						t.msg = "invalid distance too far back", i.mode = ze;
						break;
					}

					c > i.wnext ? (c -= i.wnext, u = i.wsize - c) : u = i.wnext - c, c > i.length && (c = i.length), w = i.window;
				} else w = r, u = a - i.offset, c = i.length;

				c > h && (c = h), h -= c, i.length -= c;

				do {
					r[a++] = w[u++];
				} while (--c);

				0 === i.length && (i.mode = 21);
				break;

			case 26:
				if (0 === h) break t;
				r[a++] = i.length, h--, i.mode = 21;
				break;

			case 27:
				if (i.wrap) {
					for (; d < 32;) {
						if (0 === o) break t;
						o--, l |= n[s++] << d, d += 8;
					}

					if (f -= h, t.total_out += f, i.total += f, f && (t.adler = i.check = i.flags ? M(i.check, r, f, a - f) : Z(i.check, r, f, a - f)), f = h, (i.flags ? l : Re(l)) !== i.check) {
						t.msg = "incorrect data check", i.mode = ze;
						break;
					}

					l = 0, d = 0;
				}

				i.mode = 28;

			case 28:
				if (i.wrap && i.flags) {
					for (; d < 32;) {
						if (0 === o) break t;
						o--, l += n[s++] << d, d += 8;
					}

					if (l !== (4294967295 & i.total)) {
						t.msg = "incorrect length check", i.mode = ze;
						break;
					}

					l = 0, d = 0;
				}

				i.mode = 29;

			case 29:
				E = me;
				break t;

			case ze:
				E = ve;
				break t;

			case 31:
				return Ee;

			default:
				return ye;
		}

		return t.next_out = a, t.avail_out = h, t.next_in = s, t.avail_in = o, i.hold = l, i.bits = d, (i.wsize || f !== t.avail_out && i.mode < ze && (i.mode < 27 || e !== we)) && Ze(t, t.output, t.next_out, f - t.avail_out), _ -= t.avail_in, f -= t.avail_out, t.total_in += _, t.total_out += f, i.total += f, i.wrap && f && (t.adler = i.check = i.flags ? M(i.check, r, f, t.next_out - f) : Z(i.check, r, f, t.next_out - f)), t.data_type = i.bits + (i.last ? 64 : 0) + (i.mode === Ue ? 128 : 0) + (20 === i.mode || 15 === i.mode ? 256 : 0), (0 === _ && 0 === f || e === we) && E === be && (E = Ae), E;
	},
			He = t => {
		if (!t || !t.state) return ye;
		let e = t.state;
		return e.window && (e.window = null), t.state = null, be;
	},
			We = (t, e) => {
		if (!t || !t.state) return ye;
		const i = t.state;
		return 0 == (2 & i.wrap) ? ye : (i.head = e, e.done = !1, be);
	},
			Ke = (t, e) => {
		const i = e.length;
		let n, r, s;
		return t && t.state ? (n = t.state, 0 !== n.wrap && 11 !== n.mode ? ye : 11 === n.mode && (r = 1, r = Z(r, e, i, 0), r !== n.check) ? ve : (s = Ze(t, e, i, i), s ? (n.mode = 31, Ee) : (n.havedict = 1, be))) : ye;
	},
			$e = function $e() {
		this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1;
	};

	const Ye = Object.prototype.toString,
				{
		Z_NO_FLUSH: je,
		Z_FINISH: Ge,
		Z_OK: Xe,
		Z_STREAM_END: Ve,
		Z_NEED_DICT: qe,
		Z_STREAM_ERROR: Je,
		Z_DATA_ERROR: Qe,
		Z_MEM_ERROR: ti
	} = H;

	function ei(t) {
		this.options = Ht({
			chunkSize: 65536,
			windowBits: 15,
			to: ""
		}, t || {});
		const e = this.options;
		e.raw && e.windowBits >= 0 && e.windowBits < 16 && (e.windowBits = -e.windowBits, 0 === e.windowBits && (e.windowBits = -15)), !(e.windowBits >= 0 && e.windowBits < 16) || t && t.windowBits || (e.windowBits += 32), e.windowBits > 15 && e.windowBits < 48 && 0 == (15 & e.windowBits) && (e.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new Xt(), this.strm.avail_out = 0;
		let i = Me(this.strm, e.windowBits);
		if (i !== Xe) throw new Error(P[i]);
		if (this.header = new $e(), We(this.strm, this.header), e.dictionary && ("string" == typeof e.dictionary ? e.dictionary = Yt(e.dictionary) : "[object ArrayBuffer]" === Ye.call(e.dictionary) && (e.dictionary = new Uint8Array(e.dictionary)), e.raw && (i = Ke(this.strm, e.dictionary), i !== Xe))) throw new Error(P[i]);
	}

	function ii(t, e) {
		const i = new ei(e);
		if (i.push(t), i.err) throw i.msg || P[i.err];
		return i.result;
	}

	ei.prototype.push = function (t, e) {
		const i = this.strm,
					n = this.options.chunkSize,
					r = this.options.dictionary;
		let s, a, o;
		if (this.ended) return !1;

		for (a = e === ~~e ? e : !0 === e ? Ge : je, "[object ArrayBuffer]" === Ye.call(t) ? i.input = new Uint8Array(t) : i.input = t, i.next_in = 0, i.avail_in = i.input.length;;) {
			for (0 === i.avail_out && (i.output = new Uint8Array(n), i.next_out = 0, i.avail_out = n), s = Pe(i, a), s === qe && r && (s = Ke(i, r), s === Xe ? s = Pe(i, a) : s === Qe && (s = qe)); i.avail_in > 0 && s === Ve && i.state.wrap > 0 && 0 !== t[i.next_in];) Fe(i), s = Pe(i, a);

			switch (s) {
				case Je:
				case Qe:
				case qe:
				case ti:
					return this.onEnd(s), this.ended = !0, !1;
			}

			if (o = i.avail_out, i.next_out && (0 === i.avail_out || s === Ve)) if ("string" === this.options.to) {
				let t = Gt(i.output, i.next_out),
						e = i.next_out - t,
						r = jt(i.output, t);
				i.next_out = e, i.avail_out = n - e, e && i.output.set(i.output.subarray(t, t + e), 0), this.onData(r);
			} else this.onData(i.output.length === i.next_out ? i.output : i.output.subarray(0, i.next_out));

			if (s !== Xe || 0 !== o) {
				if (s === Ve) return s = He(this.strm), this.onEnd(s), this.ended = !0, !0;
				if (0 === i.avail_in) break;
			}
		}

		return !0;
	}, ei.prototype.onData = function (t) {
		this.chunks.push(t);
	}, ei.prototype.onEnd = function (t) {
		t === Xe && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = Wt(this.chunks)), this.chunks = [], this.err = t, this.msg = this.strm.msg;
	};
	var ni = {
		Inflate: ei,
		inflate: ii,
		inflateRaw: function inflateRaw(t, e) {
			return (e = e || {}).raw = !0, ii(t, e);
		},
		ungzip: ii,
		constants: H
	};
	const {
		Deflate: ri,
		deflate: si,
		deflateRaw: ai,
		gzip: oi
	} = he,
				{
		Inflate: hi,
		inflate: li,
		inflateRaw: di,
		ungzip: _i
	} = ni;
	var fi = si,
			ci = hi,
			ui = li;
	const wi = [137, 80, 78, 71, 13, 10, 26, 10],
				pi = [];

	for (let t = 0; t < 256; t++) {
		let e = t;

		for (let t = 0; t < 8; t++) 1 & e ? e = 3988292384 ^ e >>> 1 : e >>>= 1;

		pi[t] = e;
	}

	const gi = 4294967295;

	function bi(t, e) {
		return (function (t, e, i) {
			let n = 4294967295;

			for (let t = 0; t < i; t++) n = pi[255 & (n ^ e[t])] ^ n >>> 8;

			return n;
		}(0, t, e) ^ gi) >>> 0;
	}

	var mi, ki, yi, vi;
	!function (t) {
		t[t.UNKNOWN = -1] = "UNKNOWN", t[t.GREYSCALE = 0] = "GREYSCALE", t[t.TRUECOLOUR = 2] = "TRUECOLOUR", t[t.INDEXED_COLOUR = 3] = "INDEXED_COLOUR", t[t.GREYSCALE_ALPHA = 4] = "GREYSCALE_ALPHA", t[t.TRUECOLOUR_ALPHA = 6] = "TRUECOLOUR_ALPHA";
	}(mi || (mi = {})), function (t) {
		t[t.UNKNOWN = -1] = "UNKNOWN", t[t.DEFLATE = 0] = "DEFLATE";
	}(ki || (ki = {})), function (t) {
		t[t.UNKNOWN = -1] = "UNKNOWN", t[t.ADAPTIVE = 0] = "ADAPTIVE";
	}(yi || (yi = {})), function (t) {
		t[t.UNKNOWN = -1] = "UNKNOWN", t[t.NO_INTERLACE = 0] = "NO_INTERLACE", t[t.ADAM7 = 1] = "ADAM7";
	}(vi || (vi = {}));
	const Ei = new Uint8Array(0),
				Ai = new Uint16Array([255]),
				xi = 255 === new Uint8Array(Ai.buffer)[0];

	class Ui extends r {
		constructor(t) {
			let e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			super(t);
			const {
				checkCrc: i = !1
			} = e;
			this._checkCrc = i, this._inflator = new ci(), this._png = {
				width: -1,
				height: -1,
				channels: -1,
				data: new Uint8Array(0),
				depth: 1,
				text: {}
			}, this._end = !1, this._hasPalette = !1, this._palette = [], this._compressionMethod = ki.UNKNOWN, this._filterMethod = yi.UNKNOWN, this._interlaceMethod = vi.UNKNOWN, this._colorType = -1, this.setBigEndian();
		}

		decode() {
			for (this.decodeSignature(); !this._end;) this.decodeChunk();

			return this.decodeImage(), this._png;
		}

		decodeSignature() {
			for (let t = 0; t < wi.length; t++) if (this.readUint8() !== wi[t]) throw new Error("wrong PNG signature. Byte at ".concat(t, " should be ").concat(wi[t], "."));
		}

		decodeChunk() {
			const t = this.readUint32(),
						e = this.readChars(4),
						i = this.offset;

			switch (e) {
				case "IHDR":
					this.decodeIHDR();
					break;

				case "PLTE":
					this.decodePLTE(t);
					break;

				case "IDAT":
					this.decodeIDAT(t);
					break;

				case "IEND":
					this._end = !0;
					break;

				case "tRNS":
					this.decodetRNS(t);
					break;

				case "iCCP":
					this.decodeiCCP(t);
					break;

				case "tEXt":
					this.decodetEXt(t);
					break;

				case "pHYs":
					this.decodepHYs();
					break;

				default:
					this.skip(t);
			}

			if (this.offset - i !== t) throw new Error("Length mismatch while decoding chunk ".concat(e));

			if (this._checkCrc) {
				const i = this.readUint32(),
							n = t + 4,
							r = bi(new Uint8Array(this.buffer, this.byteOffset + this.offset - n - 4, n), n);
				if (r !== i) throw new Error("CRC mismatch for chunk ".concat(e, ". Expected ").concat(i, ", found ").concat(r));
			} else this.skip(4);
		}

		decodeIHDR() {
			const t = this._png;
			t.width = this.readUint32(), t.height = this.readUint32(), t.depth = function (t) {
				if (1 !== t && 2 !== t && 4 !== t && 8 !== t && 16 !== t) throw new Error("invalid bit depth: ".concat(t));
				return t;
			}(this.readUint8());
			const e = this.readUint8();
			let i;

			switch (this._colorType = e, e) {
				case mi.GREYSCALE:
					i = 1;
					break;

				case mi.TRUECOLOUR:
					i = 3;
					break;

				case mi.INDEXED_COLOUR:
					i = 1;
					break;

				case mi.GREYSCALE_ALPHA:
					i = 2;
					break;

				case mi.TRUECOLOUR_ALPHA:
					i = 4;
					break;

				default:
					throw new Error("Unknown color type: ".concat(e));
			}

			if (this._png.channels = i, this._compressionMethod = this.readUint8(), this._compressionMethod !== ki.DEFLATE) throw new Error("Unsupported compression method: ".concat(this._compressionMethod));
			this._filterMethod = this.readUint8(), this._interlaceMethod = this.readUint8();
		}

		decodePLTE(t) {
			if (t % 3 != 0) throw new RangeError("PLTE field length must be a multiple of 3. Got ".concat(t));
			const e = t / 3;
			this._hasPalette = !0;
			const i = [];
			this._palette = i;

			for (let t = 0; t < e; t++) i.push([this.readUint8(), this.readUint8(), this.readUint8()]);
		}

		decodeIDAT(t) {
			this._inflator.push(new Uint8Array(this.buffer, this.offset + this.byteOffset, t)), this.skip(t);
		}

		decodetRNS(t) {
			if (3 === this._colorType) {
				if (t > this._palette.length) throw new Error("tRNS chunk contains more alpha values than there are palette colors (".concat(t, " vs ").concat(this._palette.length, ")"));
				let e = 0;

				for (; e < t; e++) {
					const t = this.readByte();

					this._palette[e].push(t);
				}

				for (; e < this._palette.length; e++) this._palette[e].push(255);
			}
		}

		decodeiCCP(t) {
			let e,
					i = "";

			for (; "\0" !== (e = this.readChar());) i += e;

			const n = this.readUint8();
			if (n !== ki.DEFLATE) throw new Error("Unsupported iCCP compression method: ".concat(n));
			const r = this.readBytes(t - i.length - 2);
			this._png.iccEmbeddedProfile = {
				name: i,
				profile: ui(r)
			};
		}

		decodetEXt(t) {
			let e,
					i = "";

			for (; "\0" !== (e = this.readChar());) i += e;

			this._png.text[i] = this.readChars(t - i.length - 1);
		}

		decodepHYs() {
			const t = this.readUint32(),
						e = this.readUint32(),
						i = this.readByte();
			this._png.resolution = {
				x: t,
				y: e,
				unit: i
			};
		}

		decodeImage() {
			if (this._inflator.err) throw new Error("Error while decompressing the data: ".concat(this._inflator.err));
			const t = this._inflator.result;
			if (this._filterMethod !== yi.ADAPTIVE) throw new Error("Filter method ".concat(this._filterMethod, " not supported"));
			if (this._interlaceMethod !== vi.NO_INTERLACE) throw new Error("Interlace method ".concat(this._interlaceMethod, " not supported"));
			this.decodeInterlaceNull(t);
		}

		decodeInterlaceNull(t) {
			const e = this._png.height,
						i = this._png.channels * this._png.depth / 8,
						n = this._png.width * i,
						r = new Uint8Array(this._png.height * n);
			let s,
					a,
					o = Ei,
					h = 0;

			for (let l = 0; l < e; l++) {
				switch (s = t.subarray(h + 1, h + 1 + n), a = r.subarray(l * n, (l + 1) * n), t[h]) {
					case 0:
						zi(s, a, n);
						break;

					case 1:
						Ri(s, a, n, i);
						break;

					case 2:
						Ni(s, a, o, n);
						break;

					case 3:
						Ti(s, a, o, n, i);
						break;

					case 4:
						Oi(s, a, o, n, i);
						break;

					default:
						throw new Error("Unsupported filter: ".concat(t[h]));
				}

				o = a, h += n + 1;
			}

			if (this._hasPalette && (this._png.palette = this._palette), 16 === this._png.depth) {
				const t = new Uint16Array(r.buffer);
				if (xi) for (let e = 0; e < t.length; e++) t[e] = (255 & (l = t[e])) << 8 | l >> 8 & 255;
				this._png.data = t;
			} else this._png.data = r;

			var l;
		}

	}

	function zi(t, e, i) {
		for (let n = 0; n < i; n++) e[n] = t[n];
	}

	function Ri(t, e, i, n) {
		let r = 0;

		for (; r < n; r++) e[r] = t[r];

		for (; r < i; r++) e[r] = t[r] + e[r - n] & 255;
	}

	function Ni(t, e, i, n) {
		let r = 0;
		if (0 === i.length) for (; r < n; r++) e[r] = t[r];else for (; r < n; r++) e[r] = t[r] + i[r] & 255;
	}

	function Ti(t, e, i, n, r) {
		let s = 0;

		if (0 === i.length) {
			for (; s < r; s++) e[s] = t[s];

			for (; s < n; s++) e[s] = t[s] + (e[s - r] >> 1) & 255;
		} else {
			for (; s < r; s++) e[s] = t[s] + (i[s] >> 1) & 255;

			for (; s < n; s++) e[s] = t[s] + (e[s - r] + i[s] >> 1) & 255;
		}
	}

	function Oi(t, e, i, n, r) {
		let s = 0;

		if (0 === i.length) {
			for (; s < r; s++) e[s] = t[s];

			for (; s < n; s++) e[s] = t[s] + e[s - r] & 255;
		} else {
			for (; s < r; s++) e[s] = t[s] + i[s] & 255;

			for (; s < n; s++) e[s] = t[s] + Li(e[s - r], i[s], i[s - r]) & 255;
		}
	}

	function Li(t, e, i) {
		const n = t + e - i,
					r = Math.abs(n - t),
					s = Math.abs(n - e),
					a = Math.abs(n - i);
		return r <= s && r <= a ? t : s <= a ? e : i;
	}

	const Bi = {
		level: 3
	};

	class Ci extends r {
		constructor(t) {
			let e = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			super(), this._colorType = mi.UNKNOWN, this._zlibOptions = _objectSpread2(_objectSpread2({}, Bi), e.zlib), this._png = this._checkData(t), this.setBigEndian();
		}

		encode() {
			return this.encodeSignature(), this.encodeIHDR(), this.encodeData(), this.encodeIEND(), this.toArray();
		}

		encodeSignature() {
			this.writeBytes(wi);
		}

		encodeIHDR() {
			this.writeUint32(13), this.writeChars("IHDR"), this.writeUint32(this._png.width), this.writeUint32(this._png.height), this.writeByte(this._png.depth), this.writeByte(this._colorType), this.writeByte(ki.DEFLATE), this.writeByte(yi.ADAPTIVE), this.writeByte(vi.NO_INTERLACE), this.writeCrc(17);
		}

		encodeIEND() {
			this.writeUint32(0), this.writeChars("IEND"), this.writeCrc(4);
		}

		encodeIDAT(t) {
			this.writeUint32(t.length), this.writeChars("IDAT"), this.writeBytes(t), this.writeCrc(t.length + 4);
		}

		encodeData() {
			const {
				width: t,
				height: e,
				channels: i,
				depth: n,
				data: s
			} = this._png,
						a = i * t,
						o = new r().setBigEndian();
			let h = 0;

			for (let t = 0; t < e; t++) if (o.writeByte(0), 8 === n) h = Ii(s, o, a, h);else {
				if (16 !== n) throw new Error("unreachable");
				h = Si(s, o, a, h);
			}

			const l = o.toArray(),
						d = fi(l, this._zlibOptions);
			this.encodeIDAT(d);
		}

		_checkData(t) {
			const {
				colorType: e,
				channels: i,
				depth: n
			} = function (t) {
				const {
					channels: e = 4,
					depth: i = 8
				} = t;
				if (4 !== e && 3 !== e && 2 !== e && 1 !== e) throw new RangeError("unsupported number of channels: ".concat(e));
				if (8 !== i && 16 !== i) throw new RangeError("unsupported bit depth: ".concat(i));
				const n = {
					channels: e,
					depth: i,
					colorType: mi.UNKNOWN
				};

				switch (e) {
					case 4:
						n.colorType = mi.TRUECOLOUR_ALPHA;
						break;

					case 3:
						n.colorType = mi.TRUECOLOUR;
						break;

					case 1:
						n.colorType = mi.GREYSCALE;
						break;

					case 2:
						n.colorType = mi.GREYSCALE_ALPHA;
						break;

					default:
						throw new Error("unsupported number of channels");
				}

				return n;
			}(t),
						r = {
				width: Di(t.width, "width"),
				height: Di(t.height, "height"),
				channels: i,
				data: t.data,
				depth: n,
				text: {}
			};

			this._colorType = e;
			const s = r.width * r.height * i;
			if (r.data.length !== s) throw new RangeError("wrong data size. Found ".concat(r.data.length, ", expected ").concat(s));
			return r;
		}

		writeCrc(t) {
			this.writeUint32(bi(new Uint8Array(this.buffer, this.byteOffset + this.offset - t, t), t));
		}

	}

	function Di(t, e) {
		if (Number.isInteger(t) && t > 0) return t;
		throw new TypeError("".concat(e, " must be a positive integer"));
	}

	function Ii(t, e, i, n) {
		for (let r = 0; r < i; r++) e.writeByte(t[n++]);

		return n;
	}

	function Si(t, e, i, n) {
		for (let r = 0; r < i; r++) e.writeUint16(t[n++]);

		return n;
	}

	var Zi;
	!function (t) {
		t[t.UNKNOWN = 0] = "UNKNOWN", t[t.METRE = 1] = "METRE";
	}(Zi || (Zi = {}));

	const Fi = (t, e, i) => new Ci({
		width: t,
		height: e,
		data: i
	}, undefined).encode(),
				Mi = t => function (t, e) {
		return new Ui(t, void 0).decode();
	}(t);
})();

var r = n.P,
		s = n.m;

function isTypeObject(object) {
	return object && object.hasOwnProperty('type') && object.hasOwnProperty('data');
}

function stringify(o, gap, indentation) {
	if (isTypeObject(o)) {
		let s = stringify(o.data, gap, indentation);

		if (s.includes('\n')) {
			return ' #!' + o.type + s;
		} else {
			return s + ' #!' + o.type;
		}
	} else if (o && 'object' === typeof o) {
		let isArray = Array.isArray(o);

		if (Object.keys(o).length == 0) {
			if (isArray) return '[]';else return '{}';
		}

		let s = '\n';

		for (let k in o) {
			if (Object.hasOwnProperty.call(o, k)) {
				s += gap.repeat(indentation + 1);

				if (isArray) {
					s += '- ' + stringify(o[k], gap, indentation + 1);
				} else {
					if (k.includes(': ')) {
						s += stringify(k, gap, indentation + 1);
						s += ': ' + stringify(o[k], gap, indentation + 1);
					} else {
						s += k + ': ' + stringify(o[k], gap, indentation + 1);
					}
				}

				s += '\n';
			}
		}

		return s;
	} else if ('string' === typeof o) {
		return JSON.stringify(o);
	} else if ('undefined' === typeof o || o === null) {
		return 'null';
	} else if (!!o == o || +o == o) {
		return JSON.stringify(o);
	} else {
		throw new Error('Non-implemented parsing for ' + o);
	}
}

function preStringify(object) {
	let space = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
	var gap = '';

	if (typeof space == 'number') {
		gap = ' '.repeat(Math.min(10, space));
	} else if (typeof space == 'string') {
		gap = space.slice(0, 10);
	}

	return stringify(object, gap, -1);
}

class LineGenerator {
	constructor(lines, indentString, startingLine) {
		this.startingLine = startingLine || 0;
		this.lineIndex = -1;
		let filteredLines = [];

		for (let i = 0; i < lines.length; i++) {
			let trimmedLine = lines[i].trim();

			if (trimmedLine !== '') {
				filteredLines.push([lines[i], i]);
			}
		}

		this.lines = filteredLines;
		this.indentString = indentString || this.findIndentString();
	}

	getLineNumber() {
		return this.startingLine + this.lineIndex;
	}

	nextGroup() {
		let lines = [];
		let baseIndent = this.indentLevel(this.lineIndex + 1);

		while (!this.finished() && this.indentLevel(this.lineIndex + 1) >= baseIndent) {
			lines.push(this.next());
		}

		return new LineGenerator(lines, this.indentString, this.getLineNumber() - lines.length);
	}

	next() {
		if (this.finished()) throw new Error('Trying to next finished generator');
		this.lineIndex++;
		return this.getLine();
	}

	peek() {
		return this.getLine(this.lineIndex + 1);
	}

	finished() {
		return this.lineIndex == this.lines.length - 1;
	}

	getLine(index) {
		index = index !== undefined ? index : this.lineIndex;
		if (index >= this.lines.length) return null;
		return this.lines[index][0];
	}

	findIndentString() {
		for (let [line] of this.lines) {
			if (!line.trim() || line.replace(/^\s+/, "") == line) continue;
			return line.match(/^(\s+)/)[1];
		}

		return '';
	}

	indentLevel(index) {
		index = index !== undefined ? index : this.lineIndex;
		if (index < 0) index = 0;
		let indentLevel = 0;
		let line = this.getLine(index);

		while (line.startsWith(this.indentString)) {
			line = line.slice(this.indentString.length);
			indentLevel++;
		}

		return indentLevel;
	}

}

function getObject(lineGroup, type) {
	let object;
	lineGroup.indentLevel();

	while (!lineGroup.finished()) {
		let line = lineGroup.next();
		let trimmedLine = line.trim();
		let keyMatch = trimmedLine.match(/^(.*?):(?: |$)/);
		let typeMatch = trimmedLine.match(/#!([\w<,>]+)/);
		let key, value, type;

		if (trimmedLine.startsWith('"')) {
			keyMatch = trimmedLine.match(/^"(.*?)":(?: |$)/);
		}

		if (typeMatch) {
			type = typeMatch[1];
			trimmedLine = trimmedLine.replace(typeMatch[0], '');
		}

		if (keyMatch) {
			if (!object) object = {};
			key = keyMatch[1];
			value = trimmedLine.replace(keyMatch[0], '').trim();
		} else if (trimmedLine.startsWith('-')) {
			if (!object) object = [];
			value = trimmedLine.slice(1).trim();
		}

		if (value) {
			value = getValue(value, type);
		} else {
			value = getObject(lineGroup.nextGroup(), type);
		}

		if (Array.isArray(object)) {
			object.push(value);
		} else {
			object[key] = value;
		}
	}

	if (type) {
		object = {
			type: type,
			data: object
		};
	}

	return object;
}

function getValue(value, type) {
	value = JSON.parse(value);

	if (type) {
		value = {
			type: type,
			data: value
		};
	}

	return value;
}

function parse(str) {
	let lines = str.replace(/\t/g, '	').split('\n');
	let lineGenerator = new LineGenerator(lines);
	return getObject(lineGenerator);
}

function deepCopy(obj) {
	let newObj;

	if (Array.isArray(obj)) {
		newObj = [];

		for (let item of obj) {
			newObj.push(deepCopy(item));
		}

		return newObj;
	}

	if (!!obj && typeof obj === "object") {
		newObj = {};

		for (let [key, value] of Object.entries(obj)) {
			newObj[key] = deepCopy(value);
		}

		return newObj;
	}

	return obj;
}

function isPrimitiveReaderType(reader) {
	switch (reader) {
		case 'Boolean':
		case 'Int32':
		case 'UInt32':
		case 'Single':
		case 'Double':
		case 'Char':
		case 'String':
		case '':
		case 'Vector2':
		case 'Vector3':
		case 'Vector4':
		case 'Rectangle':
		case 'Rect':
			return true;

		default:
			return false;
	}
}

function isExportReaderType(reader) {
	switch (reader) {
		case 'Texture2D':
		case 'TBin':
		case 'Effect':
		case 'BmFont':
			return true;

		default:
			return false;
	}
}

function convertJsonContentsToXnbNode(raw, readers) {
	let extractedImages = [];
	let extractedMaps = [];

	const {
		converted
	} = function recursiveConvert(obj, path) {
		let index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		const reader = readers[index];

		if (isPrimitiveReaderType(reader)) {
			return {
				converted: {
					type: reader,
					data: obj
				},
				traversed: index
			};
		}

		if (reader === null) {
			return {
				converted: obj,
				traversed: index
			};
		}

		if (reader.startsWith('Nullable')) {
			let nullableData, trav;
			let [readerType, blockTraversed = 1] = reader.split(":");
			blockTraversed = +blockTraversed;

			if (obj === null) {
				nullableData = null;
				trav = index + blockTraversed;
			} else if (typeof obj === "object" && (!obj || Object.keys(obj).length === 0)) {
				nullableData = {
					type: readers[index + 1],
					data: deepCopy(obj)
				};
				trav = index + blockTraversed;
			} else {
				let {
					converted,
					traversed
				} = recursiveConvert(obj, [...path], index + 1);
				nullableData = converted;
				trav = traversed;
			}

			return {
				converted: {
					type: readerType,
					data: {
						data: nullableData
					}
				},
				traversed: trav
			};
		}

		if (isExportReaderType(reader)) {
			if (reader === 'Texture2D') {
				extractedImages.push({
					path: path.join('.')
				});
				return {
					converted: {
						type: reader,
						data: {
							format: obj.format
						}
					},
					traversed: index
				};
			}

			if (reader === 'TBin') {
				extractedMaps.push({
					path: path.join('.')
				});
			}

			return {
				converted: {
					type: reader,
					data: {}
				},
				traversed: index
			};
		}

		let data;
		if (Array.isArray(obj)) data = [];else data = {};
		let traversed = index;
		let first = true;
		let isComplex = !reader.startsWith("Dictionary") && !reader.startsWith("Array") && !reader.startsWith("List");

		for (let [key, value] of Object.entries(obj)) {
			let newIndex;
			if (reader.startsWith("Dictionary")) newIndex = index + 2;else if (reader.startsWith("Array") || reader.startsWith("List")) newIndex = index + 1;else newIndex = traversed + 1;
			const {
				converted,
				traversed: nexter
			} = recursiveConvert(obj[key], [...path, key], newIndex);
			data[key] = converted;
			if (isComplex) traversed = nexter;else if (first) {
				traversed = nexter;
				first = false;
			}
		}

		return {
			converted: {
				type: reader,
				data
			},
			traversed
		};
	}(raw, []);

	return {
		converted,
		extractedImages,
		extractedMaps
	};
}

function convertJsonContentsFromXnbNode(obj) {
	if (!obj || typeof obj !== "object") return obj;

	if (typeof obj === "object" && obj.hasOwnProperty("data")) {
		let {
			type,
			data
		} = obj;
		if (isPrimitiveReaderType(type)) return deepCopy(data);

		if (isExportReaderType(type)) {
			data = deepCopy(data);
			if (type === "Texture2D") data.export = "Texture2D.png";else if (type === "Effect") data.export = "Effect.cso";else if (type === "TBin") data.export = "TBin.tbin";else if (type === "BmFont") data.export = "BmFont.xml";
			return data;
		}

		if (type.startsWith("Nullable")) {
			if (data === null || data.data === null) return null;
			return convertJsonContentsFromXnbNode(data.data);
		}

		obj = deepCopy(data);
	}

	let newObj;

	if (Array.isArray(obj)) {
		newObj = [];

		for (let item of obj) {
			newObj.push(convertJsonContentsFromXnbNode(item));
		}

		return newObj;
	}

	if (!!obj && typeof obj === "object") {
		newObj = {};

		for (let [key, value] of Object.entries(obj)) {
			newObj[key] = convertJsonContentsFromXnbNode(value);
		}

		return newObj;
	}

	return null;
}

function toXnbNodeData(json) {
	const toYamlJson = {};
	const {
		compressed,
		formatVersion,
		hidef: hiDef,
		target
	} = json.header;
	let readerData = deepCopy(json.readers);
	toYamlJson.xnbData = {
		target,
		compressed: !!compressed,
		hiDef,
		readerData,
		numSharedResources: 0
	};
	const rawContent = deepCopy(json.content);
	const mainReader = TypeReader.simplifyType(readerData[0].type);
	let readersTypeList = TypeReader.getReaderTypeList(mainReader);

	if (readersTypeList[0] === 'SpriteFont') {
		readersTypeList = ['SpriteFont', 'Texture2D', 'List<Rectangle>', 'Rectangle', 'List<Rectangle>', 'Rectangle', 'List<Char>', 'Char', null, 'List<Vector3>', 'Vector3', 'Nullable<Char>', 'Char', null];
		rawContent.verticalSpacing = rawContent.verticalLineSpacing;
		delete rawContent.verticalLineSpacing;
	}

	const {
		converted,
		extractedImages,
		extractedMaps
	} = convertJsonContentsToXnbNode(rawContent, readersTypeList);
	toYamlJson.content = converted;
	if (extractedImages.length > 0) toYamlJson.extractedImages = extractedImages;
	if (extractedMaps.length > 0) toYamlJson.extractedMaps = extractedMaps;
	return toYamlJson;
}

function fromXnbNodeData(json) {
	const result = {};
	const {
		compressed,
		readerData,
		hiDef: hidef,
		target
	} = json.xnbData;
	result.header = {
		target,
		formatVersion: 5,
		compressed: compressed ? target === 'a' || target === 'i' ? 0x40 : 0x80 : 0,
		hidef
	};
	result.readers = deepCopy(readerData);
	result.content = convertJsonContentsFromXnbNode(json.content);

	if (TypeReader.simplifyType(result.readers[0].type) === 'SpriteFont') {
		result.content.verticalLineSpacing = result.content.verticalSpacing;
		delete result.content.verticalSpacing;
	}

	return result;
}

function searchElement(parent, element) {
	if (!parent || typeof parent != 'object') return;

	if (parent.hasOwnProperty(element)) {
		return {
			parent,
			value: parent[element]
		};
	}

	for (let child of Object.values(parent)) {
		if (!!child || typeof child == 'object') {
			let found = searchElement(child, element);
			if (found) return found;
		}
	}

	return null;
}

function extractFileName(fullname) {
	let matcher = fullname.match(/(.*)\.([^\s.]+)$/);
	if (matcher === null) return [fullname, null];
	return [matcher[1], matcher[2]];
}

function getExtension(dataType) {
	switch (dataType) {
		case "JSON":
			return "json";

		case "yaml":
			return "yaml";

		case "Texture2D":
			return "png";

		case "Effect":
			return "cso";

		case 'TBin':
			return "tbin";

		case 'BmFont':
			return "xml";
	}

	return "bin";
}

function getMimeType(dataType) {
	switch (dataType) {
		case "JSON":
			return "application/json";

		case "yaml":
			return "text/plain";

		case "Texture2D":
			return "image/png";

		case "Effect":
			return "application/x-cso";

		case 'BmFont':
			return "application/xml";
	}

	return "application/octet-stream";
}

function makeBlob(data, dataType) {
	if (typeof Blob === "function") return {
		data: new Blob([data], {
			type: getMimeType(dataType)
		}),
		extension: getExtension(dataType)
	};
	return {
		data: data,
		extension: getExtension(dataType)
	};
}

function exportContent(content) {
	let jsonContent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	let found = searchElement(content, "export");

	if (found) {
		const {
			value
		} = found;
		let {
			type: dataType,
			data
		} = value;

		if (dataType === "Texture2D") {
			data = s(value.width, value.height, new Uint8Array(data));
		}

		return makeBlob(data, dataType);
	}

	if (jsonContent) {
		let contentJson = JSON.stringify(content, null, 4);
		return makeBlob(contentJson, "JSON");
	}

	return null;
}
/** @api
 * decompressed xnb object to real file blobs.
 * @param {XnbData} decompressed xnb objects (returned by bufferToXnb() / Xnb.load())
 * @param {Object} config (yaml:export file as yaml, 
 * 					contentOnly:export content file only, 
 * 					fileName:exported files's name) (optional)
 */


function exportFiles(xnbObject) {
	let {
		yaml: isYaml = false,
		contentOnly = false,
		fileName = null
	} = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	if (isYaml && contentOnly) isYaml = false;
	if (!xnbObject.hasOwnProperty('content')) throw new XnbError('Invalid object!');
	const blobs = [];
	const {
		content
	} = xnbObject;
	const contentBlob = exportContent(content, contentOnly);
	if (contentBlob !== null) blobs.push(contentBlob);
	if (contentOnly) return blobs;
	const resultJSON = JSON.stringify(xnbObject, (key, value) => {
		if (key === "export") {
			if (typeof fileName == "string" && fileName !== "") {
				return "".concat(fileName, ".").concat(getExtension(value.type));
			}

			return "".concat(value.type, ".").concat(getExtension(value.type));
		}

		return value;
	}, 4);
	let result = resultJSON;
	if (isYaml) result = preStringify(toXnbNodeData(xnbObject));
	blobs.unshift(makeBlob(result, isYaml ? "yaml" : "JSON"));
	return blobs;
}

function resolveCompression(compressionString) {
	let str = compressionString.toLowerCase();
	if (str === "none") return 0;
	if (str === "lz4") return 0x40;
	return null;
}

async function readBlobasText(blob) {
	if (typeof Blob === "function" && blob instanceof Blob) return blob.text();else if (typeof Buffer === "function" && blob instanceof Buffer) return blob.toString();else return blob;
}

async function readBlobasArrayBuffer(blob) {
	if (typeof Blob === "function" && blob instanceof Blob) return blob.arrayBuffer();else if (typeof Buffer === "function" && blob instanceof Buffer) return blob.buffer;
}

async function readExternFiles(extension, files) {
	if (extension === "png") {
		const rawPng = await readBlobasArrayBuffer(files.png);
		let png = r(new Uint8Array(rawPng));
		if (png.channel !== 4 || png.depth !== 8 || png.palette !== undefined) png.data = fixPNG(png);
		return {
			type: "Texture2D",
			data: png.data,
			width: png.width,
			height: png.height
		};
	}

	if (extension === "cso") {
		const data = await readBlobasArrayBuffer(files.cso);
		return {
			type: "Effect",
			data
		};
	}

	if (extension === "tbin") {
		const data = await readBlobasArrayBuffer(files.tbin);
		return {
			type: "TBin",
			data
		};
	}

	if (extension === "xml") {
		const data = await readBlobasText(files.xml);
		return {
			type: "BmFont",
			data
		};
	}
}

async function resolveImports(files) {
	let configs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	const {
		compression = "default"
	} = configs;
	const jsonFile = files.json || files.yaml;
	if (!jsonFile) throw new XnbError("There is no JSON or YAML file to pack!");
	const rawText = await readBlobasText(jsonFile);
	let jsonData = null;
	if (files.json) jsonData = JSON.parse(rawText);else jsonData = fromXnbNodeData(parse(rawText));
	let compressBits = resolveCompression(compression);
	if (compressBits !== null) jsonData.header.compressed = compressBits;

	if (!jsonData.hasOwnProperty('content')) {
		throw new XnbError("".concat(jsonFile.name, " does not have \"content\"."));
	}

	const found = searchElement(jsonData.content, "export");

	if (found) {
		const {
			parent,
			value
		} = found;
		const [, extension] = extractFileName(value);
		parent.export = await readExternFiles(extension, files);
	}

	return jsonData;
}

function getReaderAssembly(extension) {
	if (extension === "png") return "Microsoft.Xna.Framework.Content.Texture2DReader, Microsoft.Xna.Framework.Graphics, Version=4.0.0.0, Culture=neutral, PublicKeyToken=842cf8be1de50553";
	if (extension === "tbin") return "xTile.Pipeline.TideReader, xTile";
	if (extension === "xml") return "BmFont.XmlSourceReader, BmFont, Version=2012.1.7.0, Culture=neutral, PublicKeyToken=null";
}

function makeHeader(fileName) {
	const [, extension] = extractFileName(fileName);
	const readerType = getReaderAssembly(extension);
	let content = {
		export: fileName
	};
	if (extension === "png") content.format = 0;
	const result = {
		header: {
			target: "w",
			formatVersion: 5,
			hidef: true,
			compressed: true
		},
		readers: [{
			type: readerType,
			version: 0
		}],
		content
	};
	return JSON.stringify(result);
}

/** @api
 * Asynchronously reads the file into binary and then unpacks the json data.
 * XNB -> arrayBuffer -> XnbData
 * @param {File / Buffer} file
 * @return {XnbData} JSON data with headers
 */

async function unpackToXnbData(file) {
	if (typeof window !== "undefined") {
		const [, extension] = extractFileName(file.name);

		if (extension !== "xnb") {
			return new Error("Invalid XNB File!");
		}

		const buffer = await file.arrayBuffer();
		return bufferToXnb(buffer);
	}

	return bufferToXnb(file.buffer);
}
/** @api
 * Asynchronously reads the file into binary and then return content file.
 * XNB -> arrayBuffer -> XnbData -> Content
 * @param {File / Buffer} file
 * @return {XnbContent} exported Content Object
 */


function unpackToContent(file) {
	return unpackToXnbData(file).then(xnbDataToContent);
}
/** @api
 * Asynchronously reads the file into binary and then unpacks the contents and remake to Blobs array.
 * XNB -> arrayBuffer -> XnbData -> Files
 * @param {File / Buffer} file
 * @param {Object} config (yaml:export file as yaml, contentOnly:export content file only, fileName:file name(for node.js))
 * @return {Array<Blobs>} exported Files Blobs
 */


function unpackToFiles(file) {
	let configs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	let {
		yaml = false,
		contentOnly = false,
		fileName: name = null
	} = configs;
	if (typeof window !== "undefined" && name === null) name = file.name;
	let [fileName] = extractFileName(name);

	const exporter = xnbObject => exportFiles(xnbObject, {
		yaml,
		contentOnly,
		fileName
	});

	return unpackToXnbData(file).then(exporter);
}
/** @api
 * reads the buffer and then unpacks.
 * arrayBuffer -> XnbData
 * @param {ArrayBuffer} buffer
 * @return {XnbData} the loaded XNB json
 */


function bufferToXnb(buffer) {
	const xnb = new XnbConverter();
	return xnb.load(buffer);
}
/** @api
 * reads the buffer and then unpacks the contents.
 * arrayBuffer -> XnbData -> Content
 * @param {ArrayBuffer} buffer
 * @return {XnbContent} exported Content Object
 */


function bufferToContents(buffer) {
	const xnb = new XnbConverter();
	const xnbData = xnb.load(buffer);
	return xnbDataToContent(xnbData);
}
/** @api
 * remove header from the loaded XNB Object
 * XnbData -> Content
 * @param {XnbData} the loaded XNB object include headers
 * @return {XnbContent} exported Content Object
 */


function xnbDataToContent(loadedXnb) {
	const {
		content
	} = loadedXnb;
	const {
		data,
		extension
	} = exportContent(content, true);
	return new XnbContent(data, extension);
}
/** @api
 * reads the json and then unpacks the contents.
 * @param {FileList/Array<Object{name, data}>} to pack json data
 * @return {Object<file>/Object<buffer>} packed XNB Array Buffer
 */


function fileMapper(files) {
	let returnMap = {};
	let noHeaderMap = {};

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		let [fileName, extension] = extractFileName(file.name);
		if (extension === null) continue;

		if (returnMap[fileName] === undefined) {
			returnMap[fileName] = {};
			if (extension !== "json" && extension !== "yaml") noHeaderMap[fileName] = file.name;
		}

		const namedFileObj = returnMap[fileName];
		if (typeof Blob === "function" && file instanceof Blob) namedFileObj[extension] = file;else namedFileObj[extension] = file.data;
		if (extension === "json" || extension === "yaml") delete noHeaderMap[fileName];
	}

	for (let fileName of Object.keys(noHeaderMap)) {
		returnMap[fileName].json = makeHeader(noHeaderMap[fileName]);
	}

	return returnMap;
}
/** @api
 * reads the json and then unpacks the contents.
 * @param {json} to pack json data
 * @return {ArrayBuffer} packed XNB Array Buffer
 */


function packJsonToBinary(json) {
	const xnb = new XnbConverter();
	const buffer = xnb.convert(json);
	return buffer;
}
/** @api
 * Asynchronously reads the file into binary and then pack xnb files.
 * @param {FlieList} files
 * @param {Object} configs(compression:default, none, LZ4, LZX / debug)
 * @return {Array(Blobs)} 
 */


function pack(files) {
	let configs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	const groupedFiles = fileMapper(files);
	let promises = [];

	for (let [fileName, filePack] of Object.entries(groupedFiles)) {
		promises.push(resolveImports(filePack, configs).then(packJsonToBinary).then(buffer => {
			if (typeof Blob === "function") return {
				name: fileName,
				data: new Blob([buffer], {
					type: "application/octet-stream"
				})
			};
			return {
				name: fileName,
				data: new Uint8Array(buffer)
			};
		}));
	}

	return __promise_allSettled(promises).then(blobArray => {
		if (configs.debug === true) return blobArray;
		return blobArray.filter(_ref => {
			let {
				status,
				value
			} = _ref;
			return status === "fulfilled";
		}).map(_ref2 => {
			let {
				value
			} = _ref2;
			return value;
		});
	});
}

function setReaders(readers) {
	return TypeReader.setReaders(readers);
}

function addReaders(readers) {
	return TypeReader.addReaders(readers);
}

export { XnbContent, XnbData, addReaders, bufferToContents, bufferToXnb, pack, setReaders, unpackToContent, unpackToFiles, unpackToXnbData, xnbDataToContent, exportFiles as xnbDataToFiles };
