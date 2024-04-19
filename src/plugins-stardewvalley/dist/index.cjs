/** 
 * @xnb/stardewvalley 1.3.3
 * made by Lybell( https://github.com/lybell-art/ )
 * special thanks to Concernedape(Stardew Valley Producer), 진의(Unoffical XnbCli updater)
 * 
 * xnb.js is licensed under the LGPL 3.0 License.
 * 
*/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class BaseReader {
	static isTypeOf(type) {
		return false;
	}
	static hasSubType() {
		return false;
	}
	static parseTypeList() {
		return [this.type()];
	}
	static type() {
		return this.name.slice(0, -6);
	}
	isValueType() {
		return true;
	}
	get type() {
		return this.constructor.type();
	}
	read(buffer, resolver) {
		throw new Error('Cannot invoke methods on abstract class.');
	}
	write(buffer, content, resolver) {
		throw new Error('Cannot invoke methods on abstract class.');
	}
	writeIndex(buffer, resolver) {
		if (resolver != null) buffer.write7BitNumber(Number.parseInt(resolver.getIndex(this)) + 1);
	}
	toString() {
		return this.type;
	}
	parseTypeList() {
		return this.constructor.parseTypeList();
	}
}

class UInt32Reader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.UInt32Reader':
			case 'System.UInt32':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		return buffer.readUInt32();
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeUInt32(content);
	}
}

class ArrayReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.ArrayReader':
				return true;
			default:
				return false;
		}
	}
	static hasSubType() {
		return true;
	}
	constructor(reader) {
		super();
		this.reader = reader;
	}
	read(buffer, resolver) {
		const uint32Reader = new UInt32Reader();
		let size = uint32Reader.read(buffer);
		let array = [];
		for (let i = 0; i < size; i++) {
			let value = this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer);
			array.push(value);
		}
		return array;
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const uint32Reader = new UInt32Reader();
		uint32Reader.write(buffer, content.length, null);
		for (let i = 0; i < content.length; i++) this.reader.write(buffer, content[i], this.reader.isValueType() ? null : resolver);
	}
	isValueType() {
		return false;
	}
	get type() {
		return "Array<".concat(this.reader.type, ">");
	}
	parseTypeList() {
		const inBlock = this.reader.parseTypeList();
		return ["".concat(this.type, ":").concat(inBlock.length), ...inBlock];
	}
}

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
function UTF8Length(str) {
	const codes = stringToUnicode(str);
	return codes.reduce((sum, unicode) => {
		if (unicode < 0x80) return sum + 1;
		if (unicode < 0x800) return sum + 2;
		if (unicode < 0x10000) return sum + 3;
		return sum + 4;
	}, 0);
}

class StringReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.StringReader':
			case 'System.String':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		let length = buffer.read7BitNumber();
		return buffer.readString(length);
	}
	write(buffer, string, resolver) {
		this.writeIndex(buffer, resolver);
		const size = UTF8Length(string);
		buffer.write7BitNumber(size);
		buffer.writeString(string);
	}
	isValueType() {
		return false;
	}
}

class BmFontReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'BmFont.XmlSourceReader':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const stringReader = new StringReader();
		const xml = stringReader.read(buffer);
		return {
			export: {
				type: this.type,
				data: xml
			}
		};
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const stringReader = new StringReader();
		stringReader.write(buffer, content.export.data, null);
	}
	isValueType() {
		return false;
	}
}

class BooleanReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.BooleanReader':
			case 'System.Boolean':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		return Boolean(buffer.readInt());
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeByte(content);
	}
}

class CharReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.CharReader':
			case 'System.Char':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		let charSize = this._getCharSize(buffer.peekInt());
		return buffer.readString(charSize);
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeString(content);
	}
	_getCharSize(byte) {
		return (0xE5000000 >> (byte >> 3 & 0x1e) & 3) + 1;
	}
}

class DictionaryReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.DictionaryReader':
				return true;
			default:
				return false;
		}
	}
	static hasSubType() {
		return true;
	}
	constructor(key, value) {
		if (key == undefined || value == undefined) throw new Error('Cannot create instance of DictionaryReader without Key and Value.');
		super();
		this.key = key;
		this.value = value;
	}
	read(buffer, resolver) {
		let dictionary = {};
		const uint32Reader = new UInt32Reader();
		const size = uint32Reader.read(buffer);
		for (let i = 0; i < size; i++) {
			let key = this.key.isValueType() ? this.key.read(buffer) : resolver.read(buffer);
			let value = this.value.isValueType() ? this.value.read(buffer) : resolver.read(buffer);
			dictionary[key] = value;
		}
		return dictionary;
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeUInt32(Object.keys(content).length);
		for (let key of Object.keys(content)) {
			this.key.write(buffer, key, this.key.isValueType() ? null : resolver);
			this.value.write(buffer, content[key], this.value.isValueType() ? null : resolver);
		}
	}
	isValueType() {
		return false;
	}
	get type() {
		return "Dictionary<".concat(this.key.type, ",").concat(this.value.type, ">");
	}
	parseTypeList() {
		return [this.type, ...this.key.parseTypeList(), ...this.value.parseTypeList()];
	}
}

class DoubleReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.DoubleReader':
			case 'System.Double':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		return buffer.readDouble();
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeDouble(content);
	}
}

class EffectReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.EffectReader':
			case 'Microsoft.Xna.Framework.Graphics.Effect':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const uint32Reader = new UInt32Reader();
		const size = uint32Reader.read(buffer);
		const bytecode = buffer.read(size);
		return {
			export: {
				type: this.type,
				data: bytecode
			}
		};
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const data = content.export.data;
		const uint32Reader = new UInt32Reader();
		uint32Reader.write(buffer, data.byteLength, null);
		buffer.concat(data);
	}
	isValueType() {
		return false;
	}
}

class Int32Reader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Int32Reader':
			case 'Microsoft.Xna.Framework.Content.EnumReader':
			case 'System.Int32':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		return buffer.readInt32();
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeInt32(content);
	}
}

class ListReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.ListReader':
			case 'System.Collections.Generic.List':
				return true;
			default:
				return false;
		}
	}
	static hasSubType() {
		return true;
	}
	constructor(reader) {
		super();
		this.reader = reader;
	}
	read(buffer, resolver) {
		const uint32Reader = new UInt32Reader();
		const size = uint32Reader.read(buffer);
		const list = [];
		for (let i = 0; i < size; i++) {
			const value = this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer);
			list.push(value);
		}
		return list;
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const uint32Reader = new UInt32Reader();
		uint32Reader.write(buffer, content.length, null);
		for (let data of content) {
			this.reader.write(buffer, data, this.reader.isValueType() ? null : resolver);
		}
	}
	isValueType() {
		return false;
	}
	get type() {
		return "List<".concat(this.reader.type, ">");
	}
	parseTypeList() {
		const inBlock = this.reader.parseTypeList();
		return ["".concat(this.type, ":").concat(inBlock.length), ...inBlock];
	}
}

class NullableReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.NullableReader':
				return true;
			default:
				return false;
		}
	}
	static hasSubType() {
		return true;
	}
	constructor(reader) {
		super();
		this.reader = reader;
	}
	read(buffer) {
		let resolver = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
		const booleanReader = new BooleanReader();
		const hasValue = buffer.peekByte(1);
		if (!hasValue) {
			booleanReader.read(buffer);
			return null;
		}
		if (resolver === null || this.reader.isValueType()) {
			booleanReader.read(buffer);
			return this.reader.read(buffer);
		}
		return resolver.read(buffer);
	}
	write(buffer) {
		let content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
		let resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
		const booleanReader = new BooleanReader();
		if (content === null) {
			buffer.writeByte(0);
			return;
		}
		if (resolver === null || this.reader.isValueType()) buffer.writeByte(1);
		this.reader.write(buffer, content, this.reader.isValueType() ? null : resolver);
	}
	isValueType() {
		return false;
	}
	get type() {
		return "Nullable<".concat(this.reader.type, ">");
	}
	parseTypeList() {
		const inBlock = this.reader.parseTypeList();
		return ["".concat(this.type, ":").concat(inBlock.length), ...inBlock];
	}
}

class PointReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.PointReader':
			case 'Microsoft.Xna.Framework.Point':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const int32Reader = new Int32Reader();
		const x = int32Reader.read(buffer);
		const y = int32Reader.read(buffer);
		return {
			x,
			y
		};
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const int32Reader = new Int32Reader();
		int32Reader.write(buffer, content.x, null);
		int32Reader.write(buffer, content.y, null);
	}
}

class ReflectiveReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.ReflectiveReader':
				return true;
			default:
				return false;
		}
	}
	static hasSubType() {
		return true;
	}
	constructor(reader) {
		super();
		this.reader = reader;
	}
	read(buffer, resolver) {
		const reflective = this.reader.read(buffer, resolver);
		return reflective;
	}
	write(buffer, content, resolver) {
		this.reader.write(buffer, content, this.reader.isValueType() ? null : resolver);
	}
	isValueType() {
		return false;
	}
	get type() {
		return "".concat(this.reader.type);
	}
	parseTypeList() {
		return [...this.reader.parseTypeList()];
	}
}

class RectangleReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.RectangleReader':
			case 'Microsoft.Xna.Framework.Rectangle':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const int32Reader = new Int32Reader();
		const x = int32Reader.read(buffer);
		const y = int32Reader.read(buffer);
		const width = int32Reader.read(buffer);
		const height = int32Reader.read(buffer);
		return {
			x,
			y,
			width,
			height
		};
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const int32Reader = new Int32Reader();
		int32Reader.write(buffer, content.x, null);
		int32Reader.write(buffer, content.y, null);
		int32Reader.write(buffer, content.width, null);
		int32Reader.write(buffer, content.height, null);
	}
}

class SingleReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.SingleReader':
			case 'System.Single':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		return buffer.readSingle();
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeSingle(content);
	}
}

const kDxt1 = 1 << 0;
const kDxt3 = 1 << 1;
const kDxt5 = 1 << 2;
const kColourIterativeClusterFit = 1 << 8;
const kColourClusterFit = 1 << 3;
const kColourRangeFit = 1 << 4;
const kColourMetricPerceptual = 1 << 5;
const kColourMetricUniform = 1 << 6;
const kWeightColourByAlpha = 1 << 7;

function createMetadataMethodsForProperty(metadataMap, kind, property, decoratorFinishedRef) {
	return {
		getMetadata: function (key) {
			assertNotFinished(decoratorFinishedRef, "getMetadata"), assertMetadataKey(key);
			var metadataForKey = metadataMap[key];
			if (void 0 !== metadataForKey) if (1 === kind) {
				var pub = metadataForKey.public;
				if (void 0 !== pub) return pub[property];
			} else if (2 === kind) {
				var priv = metadataForKey.private;
				if (void 0 !== priv) return priv.get(property);
			} else if (Object.hasOwnProperty.call(metadataForKey, "constructor")) return metadataForKey.constructor;
		},
		setMetadata: function (key, value) {
			assertNotFinished(decoratorFinishedRef, "setMetadata"), assertMetadataKey(key);
			var metadataForKey = metadataMap[key];
			if (void 0 === metadataForKey && (metadataForKey = metadataMap[key] = {}), 1 === kind) {
				var pub = metadataForKey.public;
				void 0 === pub && (pub = metadataForKey.public = {}), pub[property] = value;
			} else if (2 === kind) {
				var priv = metadataForKey.priv;
				void 0 === priv && (priv = metadataForKey.private = new Map()), priv.set(property, value);
			} else metadataForKey.constructor = value;
		}
	};
}
function convertMetadataMapToFinal(obj, metadataMap) {
	var parentMetadataMap = obj[Symbol.metadata || Symbol.for("Symbol.metadata")],
		metadataKeys = Object.getOwnPropertySymbols(metadataMap);
	if (0 !== metadataKeys.length) {
		for (var i = 0; i < metadataKeys.length; i++) {
			var key = metadataKeys[i],
				metaForKey = metadataMap[key],
				parentMetaForKey = parentMetadataMap ? parentMetadataMap[key] : null,
				pub = metaForKey.public,
				parentPub = parentMetaForKey ? parentMetaForKey.public : null;
			pub && parentPub && Object.setPrototypeOf(pub, parentPub);
			var priv = metaForKey.private;
			if (priv) {
				var privArr = Array.from(priv.values()),
					parentPriv = parentMetaForKey ? parentMetaForKey.private : null;
				parentPriv && (privArr = privArr.concat(parentPriv)), metaForKey.private = privArr;
			}
			parentMetaForKey && Object.setPrototypeOf(metaForKey, parentMetaForKey);
		}
		parentMetadataMap && Object.setPrototypeOf(metadataMap, parentMetadataMap), obj[Symbol.metadata || Symbol.for("Symbol.metadata")] = metadataMap;
	}
}
function createAddInitializerMethod(initializers, decoratorFinishedRef) {
	return function (initializer) {
		assertNotFinished(decoratorFinishedRef, "addInitializer"), assertCallable(initializer, "An initializer"), initializers.push(initializer);
	};
}
function memberDec(dec, name, desc, metadataMap, initializers, kind, isStatic, isPrivate, value) {
	var kindStr;
	switch (kind) {
		case 1:
			kindStr = "accessor";
			break;
		case 2:
			kindStr = "method";
			break;
		case 3:
			kindStr = "getter";
			break;
		case 4:
			kindStr = "setter";
			break;
		default:
			kindStr = "field";
	}
	var metadataKind,
		metadataName,
		ctx = {
			kind: kindStr,
			name: isPrivate ? "#" + name : name,
			isStatic: isStatic,
			isPrivate: isPrivate
		},
		decoratorFinishedRef = {
			v: !1
		};
	if (0 !== kind && (ctx.addInitializer = createAddInitializerMethod(initializers, decoratorFinishedRef)), isPrivate) {
		metadataKind = 2, metadataName = Symbol(name);
		var access = {};
		0 === kind ? (access.get = desc.get, access.set = desc.set) : 2 === kind ? access.get = function () {
			return desc.value;
		} : (1 !== kind && 3 !== kind || (access.get = function () {
			return desc.get.call(this);
		}), 1 !== kind && 4 !== kind || (access.set = function (v) {
			desc.set.call(this, v);
		})), ctx.access = access;
	} else metadataKind = 1, metadataName = name;
	try {
		return dec(value, Object.assign(ctx, createMetadataMethodsForProperty(metadataMap, metadataKind, metadataName, decoratorFinishedRef)));
	} finally {
		decoratorFinishedRef.v = !0;
	}
}
function assertNotFinished(decoratorFinishedRef, fnName) {
	if (decoratorFinishedRef.v) throw new Error("attempted to call " + fnName + " after decoration was finished");
}
function assertMetadataKey(key) {
	if ("symbol" != typeof key) throw new TypeError("Metadata keys must be symbols, received: " + key);
}
function assertCallable(fn, hint) {
	if ("function" != typeof fn) throw new TypeError(hint + " must be a function");
}
function assertValidReturnValue(kind, value) {
	var type = typeof value;
	if (1 === kind) {
		if ("object" !== type || null === value) throw new TypeError("accessor decorators must return an object with get, set, or init properties or void 0");
		void 0 !== value.get && assertCallable(value.get, "accessor.get"), void 0 !== value.set && assertCallable(value.set, "accessor.set"), void 0 !== value.init && assertCallable(value.init, "accessor.init"), void 0 !== value.initializer && assertCallable(value.initializer, "accessor.initializer");
	} else if ("function" !== type) {
		var hint;
		throw hint = 0 === kind ? "field" : 10 === kind ? "class" : "method", new TypeError(hint + " decorators must return a function or void 0");
	}
}
function getInit(desc) {
	var initializer;
	return null == (initializer = desc.init) && (initializer = desc.initializer) && "undefined" != typeof console && console.warn(".initializer has been renamed to .init as of March 2022"), initializer;
}
function applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, metadataMap, initializers) {
	var desc,
		initializer,
		value,
		newValue,
		get,
		set,
		decs = decInfo[0];
	if (isPrivate ? desc = 0 === kind || 1 === kind ? {
		get: decInfo[3],
		set: decInfo[4]
	} : 3 === kind ? {
		get: decInfo[3]
	} : 4 === kind ? {
		set: decInfo[3]
	} : {
		value: decInfo[3]
	} : 0 !== kind && (desc = Object.getOwnPropertyDescriptor(base, name)), 1 === kind ? value = {
		get: desc.get,
		set: desc.set
	} : 2 === kind ? value = desc.value : 3 === kind ? value = desc.get : 4 === kind && (value = desc.set), "function" == typeof decs) void 0 !== (newValue = memberDec(decs, name, desc, metadataMap, initializers, kind, isStatic, isPrivate, value)) && (assertValidReturnValue(kind, newValue), 0 === kind ? initializer = newValue : 1 === kind ? (initializer = getInit(newValue), get = newValue.get || value.get, set = newValue.set || value.set, value = {
		get: get,
		set: set
	}) : value = newValue);else for (var i = decs.length - 1; i >= 0; i--) {
		var newInit;
		if (void 0 !== (newValue = memberDec(decs[i], name, desc, metadataMap, initializers, kind, isStatic, isPrivate, value))) assertValidReturnValue(kind, newValue), 0 === kind ? newInit = newValue : 1 === kind ? (newInit = getInit(newValue), get = newValue.get || value.get, set = newValue.set || value.set, value = {
			get: get,
			set: set
		}) : value = newValue, void 0 !== newInit && (void 0 === initializer ? initializer = newInit : "function" == typeof initializer ? initializer = [initializer, newInit] : initializer.push(newInit));
	}
	if (0 === kind || 1 === kind) {
		if (void 0 === initializer) initializer = function (instance, init) {
			return init;
		};else if ("function" != typeof initializer) {
			var ownInitializers = initializer;
			initializer = function (instance, init) {
				for (var value = init, i = 0; i < ownInitializers.length; i++) value = ownInitializers[i].call(instance, value);
				return value;
			};
		} else {
			var originalInitializer = initializer;
			initializer = function (instance, init) {
				return originalInitializer.call(instance, init);
			};
		}
		ret.push(initializer);
	}
	0 !== kind && (1 === kind ? (desc.get = value.get, desc.set = value.set) : 2 === kind ? desc.value = value : 3 === kind ? desc.get = value : 4 === kind && (desc.set = value), isPrivate ? 1 === kind ? (ret.push(function (instance, args) {
		return value.get.call(instance, args);
	}), ret.push(function (instance, args) {
		return value.set.call(instance, args);
	})) : 2 === kind ? ret.push(value) : ret.push(function (instance, args) {
		return value.call(instance, args);
	}) : Object.defineProperty(base, name, desc));
}
function applyMemberDecs(ret, Class, protoMetadataMap, staticMetadataMap, decInfos) {
	for (var protoInitializers, staticInitializers, existingProtoNonFields = new Map(), existingStaticNonFields = new Map(), i = 0; i < decInfos.length; i++) {
		var decInfo = decInfos[i];
		if (Array.isArray(decInfo)) {
			var base,
				metadataMap,
				initializers,
				kind = decInfo[1],
				name = decInfo[2],
				isPrivate = decInfo.length > 3,
				isStatic = kind >= 5;
			if (isStatic ? (base = Class, metadataMap = staticMetadataMap, 0 !== (kind -= 5) && (initializers = staticInitializers = staticInitializers || [])) : (base = Class.prototype, metadataMap = protoMetadataMap, 0 !== kind && (initializers = protoInitializers = protoInitializers || [])), 0 !== kind && !isPrivate) {
				var existingNonFields = isStatic ? existingStaticNonFields : existingProtoNonFields,
					existingKind = existingNonFields.get(name) || 0;
				if (!0 === existingKind || 3 === existingKind && 4 !== kind || 4 === existingKind && 3 !== kind) throw new Error("Attempted to decorate a public method/accessor that has the same name as a previously decorated public method/accessor. This is not currently supported by the decorators plugin. Property name was: " + name);
				!existingKind && kind > 2 ? existingNonFields.set(name, kind) : existingNonFields.set(name, !0);
			}
			applyMemberDec(ret, base, decInfo, name, kind, isStatic, isPrivate, metadataMap, initializers);
		}
	}
	pushInitializers(ret, protoInitializers), pushInitializers(ret, staticInitializers);
}
function pushInitializers(ret, initializers) {
	initializers && ret.push(function (instance) {
		for (var i = 0; i < initializers.length; i++) initializers[i].call(instance);
		return instance;
	});
}
function applyClassDecs(ret, targetClass, metadataMap, classDecs) {
	if (classDecs.length > 0) {
		for (var initializers = [], newClass = targetClass, name = targetClass.name, i = classDecs.length - 1; i >= 0; i--) {
			var decoratorFinishedRef = {
				v: !1
			};
			try {
				var ctx = Object.assign({
						kind: "class",
						name: name,
						addInitializer: createAddInitializerMethod(initializers, decoratorFinishedRef)
					}, createMetadataMethodsForProperty(metadataMap, 0, name, decoratorFinishedRef)),
					nextNewClass = classDecs[i](newClass, ctx);
			} finally {
				decoratorFinishedRef.v = !0;
			}
			void 0 !== nextNewClass && (assertValidReturnValue(10, nextNewClass), newClass = nextNewClass);
		}
		ret.push(newClass, function () {
			for (var i = 0; i < initializers.length; i++) initializers[i].call(newClass);
		});
	}
}
function _applyDecs(targetClass, memberDecs, classDecs) {
	var ret = [],
		staticMetadataMap = {},
		protoMetadataMap = {};
	return applyMemberDecs(ret, targetClass, protoMetadataMap, staticMetadataMap, memberDecs), convertMetadataMapToFinal(targetClass.prototype, protoMetadataMap), applyClassDecs(ret, targetClass, staticMetadataMap, classDecs), convertMetadataMapToFinal(targetClass, staticMetadataMap), ret;
}
function _asyncIterator(iterable) {
	var method,
		async,
		sync,
		retry = 2;
	for ("undefined" != typeof Symbol && (async = Symbol.asyncIterator, sync = Symbol.iterator); retry--;) {
		if (async && null != (method = iterable[async])) return method.call(iterable);
		if (sync && null != (method = iterable[sync])) return new AsyncFromSyncIterator(method.call(iterable));
		async = "@@asyncIterator", sync = "@@iterator";
	}
	throw new TypeError("Object is not async iterable");
}
function AsyncFromSyncIterator(s) {
	function AsyncFromSyncIteratorContinuation(r) {
		if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object."));
		var done = r.done;
		return Promise.resolve(r.value).then(function (value) {
			return {
				value: value,
				done: done
			};
		});
	}
	return AsyncFromSyncIterator = function (s) {
		this.s = s, this.n = s.next;
	}, AsyncFromSyncIterator.prototype = {
		s: null,
		n: null,
		next: function () {
			return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments));
		},
		return: function (value) {
			var ret = this.s.return;
			return void 0 === ret ? Promise.resolve({
				value: value,
				done: !0
			}) : AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments));
		},
		throw: function (value) {
			var thr = this.s.return;
			return void 0 === thr ? Promise.reject(value) : AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments));
		}
	}, new AsyncFromSyncIterator(s);
}
var REACT_ELEMENT_TYPE;
function _jsx(type, props, key, children) {
	REACT_ELEMENT_TYPE || (REACT_ELEMENT_TYPE = "function" == typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103);
	var defaultProps = type && type.defaultProps,
		childrenLength = arguments.length - 3;
	if (props || 0 === childrenLength || (props = {
		children: void 0
	}), 1 === childrenLength) props.children = children;else if (childrenLength > 1) {
		for (var childArray = new Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 3];
		props.children = childArray;
	}
	if (props && defaultProps) for (var propName in defaultProps) void 0 === props[propName] && (props[propName] = defaultProps[propName]);else props || (props = defaultProps || {});
	return {
		$$typeof: REACT_ELEMENT_TYPE,
		type: type,
		key: void 0 === key ? null : "" + key,
		ref: null,
		props: props,
		_owner: null
	};
}
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
function _typeof(obj) {
	"@babel/helpers - typeof";

	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	}, _typeof(obj);
}
function _wrapRegExp() {
	_wrapRegExp = function (re, groups) {
		return new BabelRegExp(re, void 0, groups);
	};
	var _super = RegExp.prototype,
		_groups = new WeakMap();
	function BabelRegExp(re, flags, groups) {
		var _this = new RegExp(re, flags);
		return _groups.set(_this, groups || _groups.get(re)), _setPrototypeOf(_this, BabelRegExp.prototype);
	}
	function buildGroups(result, re) {
		var g = _groups.get(re);
		return Object.keys(g).reduce(function (groups, name) {
			return groups[name] = result[g[name]], groups;
		}, Object.create(null));
	}
	return _inherits(BabelRegExp, RegExp), BabelRegExp.prototype.exec = function (str) {
		var result = _super.exec.call(this, str);
		return result && (result.groups = buildGroups(result, this)), result;
	}, BabelRegExp.prototype[Symbol.replace] = function (str, substitution) {
		if ("string" == typeof substitution) {
			var groups = _groups.get(this);
			return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) {
				return "$" + groups[name];
			}));
		}
		if ("function" == typeof substitution) {
			var _this = this;
			return _super[Symbol.replace].call(this, str, function () {
				var args = arguments;
				return "object" != typeof args[args.length - 1] && (args = [].slice.call(args)).push(buildGroups(args, _this)), substitution.apply(this, args);
			});
		}
		return _super[Symbol.replace].call(this, str, substitution);
	}, _wrapRegExp.apply(this, arguments);
}
function _AwaitValue(value) {
	this.wrapped = value;
}
function _AsyncGenerator(gen) {
	var front, back;
	function send(key, arg) {
		return new Promise(function (resolve, reject) {
			var request = {
				key: key,
				arg: arg,
				resolve: resolve,
				reject: reject,
				next: null
			};
			if (back) {
				back = back.next = request;
			} else {
				front = back = request;
				resume(key, arg);
			}
		});
	}
	function resume(key, arg) {
		try {
			var result = gen[key](arg);
			var value = result.value;
			var wrappedAwait = value instanceof _AwaitValue;
			Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
				if (wrappedAwait) {
					resume(key === "return" ? "return" : "next", arg);
					return;
				}
				settle(result.done ? "return" : "normal", arg);
			}, function (err) {
				resume("throw", err);
			});
		} catch (err) {
			settle("throw", err);
		}
	}
	function settle(type, value) {
		switch (type) {
			case "return":
				front.resolve({
					value: value,
					done: true
				});
				break;
			case "throw":
				front.reject(value);
				break;
			default:
				front.resolve({
					value: value,
					done: false
				});
				break;
		}
		front = front.next;
		if (front) {
			resume(front.key, front.arg);
		} else {
			back = null;
		}
	}
	this._invoke = send;
	if (typeof gen.return !== "function") {
		this.return = undefined;
	}
}
_AsyncGenerator.prototype[typeof Symbol === "function" && Symbol.asyncIterator || "@@asyncIterator"] = function () {
	return this;
};
_AsyncGenerator.prototype.next = function (arg) {
	return this._invoke("next", arg);
};
_AsyncGenerator.prototype.throw = function (arg) {
	return this._invoke("throw", arg);
};
_AsyncGenerator.prototype.return = function (arg) {
	return this._invoke("return", arg);
};
function _wrapAsyncGenerator(fn) {
	return function () {
		return new _AsyncGenerator(fn.apply(this, arguments));
	};
}
function _awaitAsyncGenerator(value) {
	return new _AwaitValue(value);
}
function _asyncGeneratorDelegate(inner, awaitWrap) {
	var iter = {},
		waiting = false;
	function pump(key, value) {
		waiting = true;
		value = new Promise(function (resolve) {
			resolve(inner[key](value));
		});
		return {
			done: false,
			value: awaitWrap(value)
		};
	}
	;
	iter[typeof Symbol !== "undefined" && Symbol.iterator || "@@iterator"] = function () {
		return this;
	};
	iter.next = function (value) {
		if (waiting) {
			waiting = false;
			return value;
		}
		return pump("next", value);
	};
	if (typeof inner.throw === "function") {
		iter.throw = function (value) {
			if (waiting) {
				waiting = false;
				throw value;
			}
			return pump("throw", value);
		};
	}
	if (typeof inner.return === "function") {
		iter.return = function (value) {
			if (waiting) {
				waiting = false;
				return value;
			}
			return pump("return", value);
		};
	}
	return iter;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
	try {
		var info = gen[key](arg);
		var value = info.value;
	} catch (error) {
		reject(error);
		return;
	}
	if (info.done) {
		resolve(value);
	} else {
		Promise.resolve(value).then(_next, _throw);
	}
}
function _asyncToGenerator(fn) {
	return function () {
		var self = this,
			args = arguments;
		return new Promise(function (resolve, reject) {
			var gen = fn.apply(self, args);
			function _next(value) {
				asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
			}
			function _throw(err) {
				asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
			}
			_next(undefined);
		});
	};
}
function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}
function _defineProperties(target, props) {
	for (var i = 0; i < props.length; i++) {
		var descriptor = props[i];
		descriptor.enumerable = descriptor.enumerable || false;
		descriptor.configurable = true;
		if ("value" in descriptor) descriptor.writable = true;
		Object.defineProperty(target, descriptor.key, descriptor);
	}
}
function _createClass(Constructor, protoProps, staticProps) {
	if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	if (staticProps) _defineProperties(Constructor, staticProps);
	Object.defineProperty(Constructor, "prototype", {
		writable: false
	});
	return Constructor;
}
function _defineEnumerableProperties(obj, descs) {
	for (var key in descs) {
		var desc = descs[key];
		desc.configurable = desc.enumerable = true;
		if ("value" in desc) desc.writable = true;
		Object.defineProperty(obj, key, desc);
	}
	if (Object.getOwnPropertySymbols) {
		var objectSymbols = Object.getOwnPropertySymbols(descs);
		for (var i = 0; i < objectSymbols.length; i++) {
			var sym = objectSymbols[i];
			var desc = descs[sym];
			desc.configurable = desc.enumerable = true;
			if ("value" in desc) desc.writable = true;
			Object.defineProperty(obj, sym, desc);
		}
	}
	return obj;
}
function _defaults(obj, defaults) {
	var keys = Object.getOwnPropertyNames(defaults);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = Object.getOwnPropertyDescriptor(defaults, key);
		if (value && value.configurable && obj[key] === undefined) {
			Object.defineProperty(obj, key, value);
		}
	}
	return obj;
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
function _extends() {
	_extends = Object.assign || function (target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	};
	return _extends.apply(this, arguments);
}
function _objectSpread(target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i] != null ? Object(arguments[i]) : {};
		var ownKeys = Object.keys(source);
		if (typeof Object.getOwnPropertySymbols === 'function') {
			ownKeys.push.apply(ownKeys, Object.getOwnPropertySymbols(source).filter(function (sym) {
				return Object.getOwnPropertyDescriptor(source, sym).enumerable;
			}));
		}
		ownKeys.forEach(function (key) {
			_defineProperty(target, key, source[key]);
		});
	}
	return target;
}
function _inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function");
	}
	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: {
			value: subClass,
			writable: true,
			configurable: true
		}
	});
	Object.defineProperty(subClass, "prototype", {
		writable: false
	});
	if (superClass) _setPrototypeOf(subClass, superClass);
}
function _inheritsLoose(subClass, superClass) {
	subClass.prototype = Object.create(superClass.prototype);
	subClass.prototype.constructor = subClass;
	_setPrototypeOf(subClass, superClass);
}
function _getPrototypeOf(o) {
	_getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
		return o.__proto__ || Object.getPrototypeOf(o);
	};
	return _getPrototypeOf(o);
}
function _setPrototypeOf(o, p) {
	_setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
		o.__proto__ = p;
		return o;
	};
	return _setPrototypeOf(o, p);
}
function _isNativeReflectConstruct() {
	if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	if (Reflect.construct.sham) return false;
	if (typeof Proxy === "function") return true;
	try {
		Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
		return true;
	} catch (e) {
		return false;
	}
}
function _construct(Parent, args, Class) {
	if (_isNativeReflectConstruct()) {
		_construct = Reflect.construct;
	} else {
		_construct = function _construct(Parent, args, Class) {
			var a = [null];
			a.push.apply(a, args);
			var Constructor = Function.bind.apply(Parent, a);
			var instance = new Constructor();
			if (Class) _setPrototypeOf(instance, Class.prototype);
			return instance;
		};
	}
	return _construct.apply(null, arguments);
}
function _isNativeFunction(fn) {
	return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _wrapNativeSuper(Class) {
	var _cache = typeof Map === "function" ? new Map() : undefined;
	_wrapNativeSuper = function _wrapNativeSuper(Class) {
		if (Class === null || !_isNativeFunction(Class)) return Class;
		if (typeof Class !== "function") {
			throw new TypeError("Super expression must either be null or a function");
		}
		if (typeof _cache !== "undefined") {
			if (_cache.has(Class)) return _cache.get(Class);
			_cache.set(Class, Wrapper);
		}
		function Wrapper() {
			return _construct(Class, arguments, _getPrototypeOf(this).constructor);
		}
		Wrapper.prototype = Object.create(Class.prototype, {
			constructor: {
				value: Wrapper,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		return _setPrototypeOf(Wrapper, Class);
	};
	return _wrapNativeSuper(Class);
}
function _instanceof(left, right) {
	if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
		return !!right[Symbol.hasInstance](left);
	} else {
		return left instanceof right;
	}
}
function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : {
		default: obj
	};
}
function _getRequireWildcardCache(nodeInterop) {
	if (typeof WeakMap !== "function") return null;
	var cacheBabelInterop = new WeakMap();
	var cacheNodeInterop = new WeakMap();
	return (_getRequireWildcardCache = function (nodeInterop) {
		return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
	})(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
	if (!nodeInterop && obj && obj.__esModule) {
		return obj;
	}
	if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
		return {
			default: obj
		};
	}
	var cache = _getRequireWildcardCache(nodeInterop);
	if (cache && cache.has(obj)) {
		return cache.get(obj);
	}
	var newObj = {};
	var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
	for (var key in obj) {
		if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
			var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
			if (desc && (desc.get || desc.set)) {
				Object.defineProperty(newObj, key, desc);
			} else {
				newObj[key] = obj[key];
			}
		}
	}
	newObj.default = obj;
	if (cache) {
		cache.set(obj, newObj);
	}
	return newObj;
}
function _newArrowCheck(innerThis, boundThis) {
	if (innerThis !== boundThis) {
		throw new TypeError("Cannot instantiate an arrow function");
	}
}
function _objectDestructuringEmpty(obj) {
	if (obj == null) throw new TypeError("Cannot destructure undefined");
}
function _objectWithoutPropertiesLoose(source, excluded) {
	if (source == null) return {};
	var target = {};
	var sourceKeys = Object.keys(source);
	var key, i;
	for (i = 0; i < sourceKeys.length; i++) {
		key = sourceKeys[i];
		if (excluded.indexOf(key) >= 0) continue;
		target[key] = source[key];
	}
	return target;
}
function _objectWithoutProperties(source, excluded) {
	if (source == null) return {};
	var target = _objectWithoutPropertiesLoose(source, excluded);
	var key, i;
	if (Object.getOwnPropertySymbols) {
		var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
		for (i = 0; i < sourceSymbolKeys.length; i++) {
			key = sourceSymbolKeys[i];
			if (excluded.indexOf(key) >= 0) continue;
			if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
			target[key] = source[key];
		}
	}
	return target;
}
function _assertThisInitialized(self) {
	if (self === void 0) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}
	return self;
}
function _possibleConstructorReturn(self, call) {
	if (call && (typeof call === "object" || typeof call === "function")) {
		return call;
	} else if (call !== void 0) {
		throw new TypeError("Derived constructors may only return object or undefined");
	}
	return _assertThisInitialized(self);
}
function _createSuper(Derived) {
	var hasNativeReflectConstruct = _isNativeReflectConstruct();
	return function _createSuperInternal() {
		var Super = _getPrototypeOf(Derived),
			result;
		if (hasNativeReflectConstruct) {
			var NewTarget = _getPrototypeOf(this).constructor;
			result = Reflect.construct(Super, arguments, NewTarget);
		} else {
			result = Super.apply(this, arguments);
		}
		return _possibleConstructorReturn(this, result);
	};
}
function _superPropBase(object, property) {
	while (!Object.prototype.hasOwnProperty.call(object, property)) {
		object = _getPrototypeOf(object);
		if (object === null) break;
	}
	return object;
}
function _get() {
	if (typeof Reflect !== "undefined" && Reflect.get) {
		_get = Reflect.get;
	} else {
		_get = function _get(target, property, receiver) {
			var base = _superPropBase(target, property);
			if (!base) return;
			var desc = Object.getOwnPropertyDescriptor(base, property);
			if (desc.get) {
				return desc.get.call(arguments.length < 3 ? target : receiver);
			}
			return desc.value;
		};
	}
	return _get.apply(this, arguments);
}
function set(target, property, value, receiver) {
	if (typeof Reflect !== "undefined" && Reflect.set) {
		set = Reflect.set;
	} else {
		set = function set(target, property, value, receiver) {
			var base = _superPropBase(target, property);
			var desc;
			if (base) {
				desc = Object.getOwnPropertyDescriptor(base, property);
				if (desc.set) {
					desc.set.call(receiver, value);
					return true;
				} else if (!desc.writable) {
					return false;
				}
			}
			desc = Object.getOwnPropertyDescriptor(receiver, property);
			if (desc) {
				if (!desc.writable) {
					return false;
				}
				desc.value = value;
				Object.defineProperty(receiver, property, desc);
			} else {
				_defineProperty(receiver, property, value);
			}
			return true;
		};
	}
	return set(target, property, value, receiver);
}
function _set(target, property, value, receiver, isStrict) {
	var s = set(target, property, value, receiver || target);
	if (!s && isStrict) {
		throw new Error('failed to set property');
	}
	return value;
}
function _taggedTemplateLiteral(strings, raw) {
	if (!raw) {
		raw = strings.slice(0);
	}
	return Object.freeze(Object.defineProperties(strings, {
		raw: {
			value: Object.freeze(raw)
		}
	}));
}
function _taggedTemplateLiteralLoose(strings, raw) {
	if (!raw) {
		raw = strings.slice(0);
	}
	strings.raw = raw;
	return strings;
}
function _readOnlyError(name) {
	throw new TypeError("\"" + name + "\" is read-only");
}
function _writeOnlyError(name) {
	throw new TypeError("\"" + name + "\" is write-only");
}
function _classNameTDZError(name) {
	throw new Error("Class \"" + name + "\" cannot be referenced in computed property keys.");
}
function _temporalUndefined() {}
function _tdz(name) {
	throw new ReferenceError(name + " is not defined - temporal dead zone");
}
function _temporalRef(val, name) {
	return val === _temporalUndefined ? _tdz(name) : val;
}
function _slicedToArray(arr, i) {
	return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _slicedToArrayLoose(arr, i) {
	return _arrayWithHoles(arr) || _iterableToArrayLimitLoose(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _toArray(arr) {
	return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}
function _toConsumableArray(arr) {
	return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
	if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _arrayWithHoles(arr) {
	if (Array.isArray(arr)) return arr;
}
function _maybeArrayLike(next, arr, i) {
	if (arr && !Array.isArray(arr) && typeof arr.length === "number") {
		var len = arr.length;
		return _arrayLikeToArray(arr, i !== void 0 && i < len ? i : len);
	}
	return next(arr, i);
}
function _iterableToArray(iter) {
	if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterableToArrayLimit(arr, i) {
	var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
	if (_i == null) return;
	var _arr = [];
	var _n = true;
	var _d = false;
	var _s, _e;
	try {
		for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
			_arr.push(_s.value);
			if (i && _arr.length === i) break;
		}
	} catch (err) {
		_d = true;
		_e = err;
	} finally {
		try {
			if (!_n && _i["return"] != null) _i["return"]();
		} finally {
			if (_d) throw _e;
		}
	}
	return _arr;
}
function _iterableToArrayLimitLoose(arr, i) {
	var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);
	if (_i == null) return;
	var _arr = [];
	for (_i = _i.call(arr), _step; !(_step = _i.next()).done;) {
		_arr.push(_step.value);
		if (i && _arr.length === i) break;
	}
	return _arr;
}
function _unsupportedIterableToArray(o, minLen) {
	if (!o) return;
	if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	var n = Object.prototype.toString.call(o).slice(8, -1);
	if (n === "Object" && o.constructor) n = o.constructor.name;
	if (n === "Map" || n === "Set") return Array.from(o);
	if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
	if (len == null || len > arr.length) len = arr.length;
	for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
	return arr2;
}
function _nonIterableSpread() {
	throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableRest() {
	throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _createForOfIteratorHelper(o, allowArrayLike) {
	var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
	if (!it) {
		if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
			if (it) o = it;
			var i = 0;
			var F = function () {};
			return {
				s: F,
				n: function () {
					if (i >= o.length) return {
						done: true
					};
					return {
						done: false,
						value: o[i++]
					};
				},
				e: function (e) {
					throw e;
				},
				f: F
			};
		}
		throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	var normalCompletion = true,
		didErr = false,
		err;
	return {
		s: function () {
			it = it.call(o);
		},
		n: function () {
			var step = it.next();
			normalCompletion = step.done;
			return step;
		},
		e: function (e) {
			didErr = true;
			err = e;
		},
		f: function () {
			try {
				if (!normalCompletion && it.return != null) it.return();
			} finally {
				if (didErr) throw err;
			}
		}
	};
}
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
	var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
	if (it) return (it = it.call(o)).next.bind(it);
	if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
		if (it) o = it;
		var i = 0;
		return function () {
			if (i >= o.length) return {
				done: true
			};
			return {
				done: false,
				value: o[i++]
			};
		};
	}
	throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _skipFirstGeneratorNext(fn) {
	return function () {
		var it = fn.apply(this, arguments);
		it.next();
		return it;
	};
}
function _toPrimitive(input, hint) {
	if (typeof input !== "object" || input === null) return input;
	var prim = input[Symbol.toPrimitive];
	if (prim !== undefined) {
		var res = prim.call(input, hint || "default");
		if (typeof res !== "object") return res;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
	var key = _toPrimitive(arg, "string");
	return typeof key === "symbol" ? key : String(key);
}
function _initializerWarningHelper(descriptor, context) {
	throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.');
}
function _initializerDefineProperty(target, property, descriptor, context) {
	if (!descriptor) return;
	Object.defineProperty(target, property, {
		enumerable: descriptor.enumerable,
		configurable: descriptor.configurable,
		writable: descriptor.writable,
		value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
	});
}
function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object.keys(descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;
	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}
	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);
	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}
	if (desc.initializer === void 0) {
		Object.defineProperty(target, property, desc);
		desc = null;
	}
	return desc;
}
var id = 0;
function _classPrivateFieldLooseKey(name) {
	return "__private_" + id++ + "_" + name;
}
function _classPrivateFieldLooseBase(receiver, privateKey) {
	if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
		throw new TypeError("attempted to use private field on non-instance");
	}
	return receiver;
}
function _classPrivateFieldGet(receiver, privateMap) {
	var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get");
	return _classApplyDescriptorGet(receiver, descriptor);
}
function _classPrivateFieldSet(receiver, privateMap, value) {
	var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");
	_classApplyDescriptorSet(receiver, descriptor, value);
	return value;
}
function _classPrivateFieldDestructureSet(receiver, privateMap) {
	var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set");
	return _classApplyDescriptorDestructureSet(receiver, descriptor);
}
function _classExtractFieldDescriptor(receiver, privateMap, action) {
	if (!privateMap.has(receiver)) {
		throw new TypeError("attempted to " + action + " private field on non-instance");
	}
	return privateMap.get(receiver);
}
function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
	_classCheckPrivateStaticAccess(receiver, classConstructor);
	_classCheckPrivateStaticFieldDescriptor(descriptor, "get");
	return _classApplyDescriptorGet(receiver, descriptor);
}
function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) {
	_classCheckPrivateStaticAccess(receiver, classConstructor);
	_classCheckPrivateStaticFieldDescriptor(descriptor, "set");
	_classApplyDescriptorSet(receiver, descriptor, value);
	return value;
}
function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
	_classCheckPrivateStaticAccess(receiver, classConstructor);
	return method;
}
function _classStaticPrivateMethodSet() {
	throw new TypeError("attempted to set read only static private field");
}
function _classApplyDescriptorGet(receiver, descriptor) {
	if (descriptor.get) {
		return descriptor.get.call(receiver);
	}
	return descriptor.value;
}
function _classApplyDescriptorSet(receiver, descriptor, value) {
	if (descriptor.set) {
		descriptor.set.call(receiver, value);
	} else {
		if (!descriptor.writable) {
			throw new TypeError("attempted to set read only private field");
		}
		descriptor.value = value;
	}
}
function _classApplyDescriptorDestructureSet(receiver, descriptor) {
	if (descriptor.set) {
		if (!("__destrObj" in descriptor)) {
			descriptor.__destrObj = {
				set value(v) {
					descriptor.set.call(receiver, v);
				}
			};
		}
		return descriptor.__destrObj;
	} else {
		if (!descriptor.writable) {
			throw new TypeError("attempted to set read only private field");
		}
		return descriptor;
	}
}
function _classStaticPrivateFieldDestructureSet(receiver, classConstructor, descriptor) {
	_classCheckPrivateStaticAccess(receiver, classConstructor);
	_classCheckPrivateStaticFieldDescriptor(descriptor, "set");
	return _classApplyDescriptorDestructureSet(receiver, descriptor);
}
function _classCheckPrivateStaticAccess(receiver, classConstructor) {
	if (receiver !== classConstructor) {
		throw new TypeError("Private static access of wrong provenance");
	}
}
function _classCheckPrivateStaticFieldDescriptor(descriptor, action) {
	if (descriptor === undefined) {
		throw new TypeError("attempted to " + action + " private static field before its declaration");
	}
}
function _decorate(decorators, factory, superClass, mixins) {
	var api = _getDecoratorsApi();
	if (mixins) {
		for (var i = 0; i < mixins.length; i++) {
			api = mixins[i](api);
		}
	}
	var r = factory(function initialize(O) {
		api.initializeInstanceElements(O, decorated.elements);
	}, superClass);
	var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators);
	api.initializeClassElements(r.F, decorated.elements);
	return api.runClassFinishers(r.F, decorated.finishers);
}
function _getDecoratorsApi() {
	_getDecoratorsApi = function () {
		return api;
	};
	var api = {
		elementsDefinitionOrder: [["method"], ["field"]],
		initializeInstanceElements: function (O, elements) {
			["method", "field"].forEach(function (kind) {
				elements.forEach(function (element) {
					if (element.kind === kind && element.placement === "own") {
						this.defineClassElement(O, element);
					}
				}, this);
			}, this);
		},
		initializeClassElements: function (F, elements) {
			var proto = F.prototype;
			["method", "field"].forEach(function (kind) {
				elements.forEach(function (element) {
					var placement = element.placement;
					if (element.kind === kind && (placement === "static" || placement === "prototype")) {
						var receiver = placement === "static" ? F : proto;
						this.defineClassElement(receiver, element);
					}
				}, this);
			}, this);
		},
		defineClassElement: function (receiver, element) {
			var descriptor = element.descriptor;
			if (element.kind === "field") {
				var initializer = element.initializer;
				descriptor = {
					enumerable: descriptor.enumerable,
					writable: descriptor.writable,
					configurable: descriptor.configurable,
					value: initializer === void 0 ? void 0 : initializer.call(receiver)
				};
			}
			Object.defineProperty(receiver, element.key, descriptor);
		},
		decorateClass: function (elements, decorators) {
			var newElements = [];
			var finishers = [];
			var placements = {
				static: [],
				prototype: [],
				own: []
			};
			elements.forEach(function (element) {
				this.addElementPlacement(element, placements);
			}, this);
			elements.forEach(function (element) {
				if (!_hasDecorators(element)) return newElements.push(element);
				var elementFinishersExtras = this.decorateElement(element, placements);
				newElements.push(elementFinishersExtras.element);
				newElements.push.apply(newElements, elementFinishersExtras.extras);
				finishers.push.apply(finishers, elementFinishersExtras.finishers);
			}, this);
			if (!decorators) {
				return {
					elements: newElements,
					finishers: finishers
				};
			}
			var result = this.decorateConstructor(newElements, decorators);
			finishers.push.apply(finishers, result.finishers);
			result.finishers = finishers;
			return result;
		},
		addElementPlacement: function (element, placements, silent) {
			var keys = placements[element.placement];
			if (!silent && keys.indexOf(element.key) !== -1) {
				throw new TypeError("Duplicated element (" + element.key + ")");
			}
			keys.push(element.key);
		},
		decorateElement: function (element, placements) {
			var extras = [];
			var finishers = [];
			for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
				var keys = placements[element.placement];
				keys.splice(keys.indexOf(element.key), 1);
				var elementObject = this.fromElementDescriptor(element);
				var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject);
				element = elementFinisherExtras.element;
				this.addElementPlacement(element, placements);
				if (elementFinisherExtras.finisher) {
					finishers.push(elementFinisherExtras.finisher);
				}
				var newExtras = elementFinisherExtras.extras;
				if (newExtras) {
					for (var j = 0; j < newExtras.length; j++) {
						this.addElementPlacement(newExtras[j], placements);
					}
					extras.push.apply(extras, newExtras);
				}
			}
			return {
				element: element,
				finishers: finishers,
				extras: extras
			};
		},
		decorateConstructor: function (elements, decorators) {
			var finishers = [];
			for (var i = decorators.length - 1; i >= 0; i--) {
				var obj = this.fromClassDescriptor(elements);
				var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj);
				if (elementsAndFinisher.finisher !== undefined) {
					finishers.push(elementsAndFinisher.finisher);
				}
				if (elementsAndFinisher.elements !== undefined) {
					elements = elementsAndFinisher.elements;
					for (var j = 0; j < elements.length - 1; j++) {
						for (var k = j + 1; k < elements.length; k++) {
							if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
								throw new TypeError("Duplicated element (" + elements[j].key + ")");
							}
						}
					}
				}
			}
			return {
				elements: elements,
				finishers: finishers
			};
		},
		fromElementDescriptor: function (element) {
			var obj = {
				kind: element.kind,
				key: element.key,
				placement: element.placement,
				descriptor: element.descriptor
			};
			var desc = {
				value: "Descriptor",
				configurable: true
			};
			Object.defineProperty(obj, Symbol.toStringTag, desc);
			if (element.kind === "field") obj.initializer = element.initializer;
			return obj;
		},
		toElementDescriptors: function (elementObjects) {
			if (elementObjects === undefined) return;
			return _toArray(elementObjects).map(function (elementObject) {
				var element = this.toElementDescriptor(elementObject);
				this.disallowProperty(elementObject, "finisher", "An element descriptor");
				this.disallowProperty(elementObject, "extras", "An element descriptor");
				return element;
			}, this);
		},
		toElementDescriptor: function (elementObject) {
			var kind = String(elementObject.kind);
			if (kind !== "method" && kind !== "field") {
				throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"');
			}
			var key = _toPropertyKey(elementObject.key);
			var placement = String(elementObject.placement);
			if (placement !== "static" && placement !== "prototype" && placement !== "own") {
				throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"');
			}
			var descriptor = elementObject.descriptor;
			this.disallowProperty(elementObject, "elements", "An element descriptor");
			var element = {
				kind: kind,
				key: key,
				placement: placement,
				descriptor: Object.assign({}, descriptor)
			};
			if (kind !== "field") {
				this.disallowProperty(elementObject, "initializer", "A method descriptor");
			} else {
				this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
				this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
				this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
				element.initializer = elementObject.initializer;
			}
			return element;
		},
		toElementFinisherExtras: function (elementObject) {
			var element = this.toElementDescriptor(elementObject);
			var finisher = _optionalCallableProperty(elementObject, "finisher");
			var extras = this.toElementDescriptors(elementObject.extras);
			return {
				element: element,
				finisher: finisher,
				extras: extras
			};
		},
		fromClassDescriptor: function (elements) {
			var obj = {
				kind: "class",
				elements: elements.map(this.fromElementDescriptor, this)
			};
			var desc = {
				value: "Descriptor",
				configurable: true
			};
			Object.defineProperty(obj, Symbol.toStringTag, desc);
			return obj;
		},
		toClassDescriptor: function (obj) {
			var kind = String(obj.kind);
			if (kind !== "class") {
				throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"');
			}
			this.disallowProperty(obj, "key", "A class descriptor");
			this.disallowProperty(obj, "placement", "A class descriptor");
			this.disallowProperty(obj, "descriptor", "A class descriptor");
			this.disallowProperty(obj, "initializer", "A class descriptor");
			this.disallowProperty(obj, "extras", "A class descriptor");
			var finisher = _optionalCallableProperty(obj, "finisher");
			var elements = this.toElementDescriptors(obj.elements);
			return {
				elements: elements,
				finisher: finisher
			};
		},
		runClassFinishers: function (constructor, finishers) {
			for (var i = 0; i < finishers.length; i++) {
				var newConstructor = (0, finishers[i])(constructor);
				if (newConstructor !== undefined) {
					if (typeof newConstructor !== "function") {
						throw new TypeError("Finishers must return a constructor.");
					}
					constructor = newConstructor;
				}
			}
			return constructor;
		},
		disallowProperty: function (obj, name, objectType) {
			if (obj[name] !== undefined) {
				throw new TypeError(objectType + " can't have a ." + name + " property.");
			}
		}
	};
	return api;
}
function _createElementDescriptor(def) {
	var key = _toPropertyKey(def.key);
	var descriptor;
	if (def.kind === "method") {
		descriptor = {
			value: def.value,
			writable: true,
			configurable: true,
			enumerable: false
		};
	} else if (def.kind === "get") {
		descriptor = {
			get: def.value,
			configurable: true,
			enumerable: false
		};
	} else if (def.kind === "set") {
		descriptor = {
			set: def.value,
			configurable: true,
			enumerable: false
		};
	} else if (def.kind === "field") {
		descriptor = {
			configurable: true,
			writable: true,
			enumerable: true
		};
	}
	var element = {
		kind: def.kind === "field" ? "field" : "method",
		key: key,
		placement: def.static ? "static" : def.kind === "field" ? "own" : "prototype",
		descriptor: descriptor
	};
	if (def.decorators) element.decorators = def.decorators;
	if (def.kind === "field") element.initializer = def.value;
	return element;
}
function _coalesceGetterSetter(element, other) {
	if (element.descriptor.get !== undefined) {
		other.descriptor.get = element.descriptor.get;
	} else {
		other.descriptor.set = element.descriptor.set;
	}
}
function _coalesceClassElements(elements) {
	var newElements = [];
	var isSameElement = function (other) {
		return other.kind === "method" && other.key === element.key && other.placement === element.placement;
	};
	for (var i = 0; i < elements.length; i++) {
		var element = elements[i];
		var other;
		if (element.kind === "method" && (other = newElements.find(isSameElement))) {
			if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
				if (_hasDecorators(element) || _hasDecorators(other)) {
					throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated.");
				}
				other.descriptor = element.descriptor;
			} else {
				if (_hasDecorators(element)) {
					if (_hasDecorators(other)) {
						throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ").");
					}
					other.decorators = element.decorators;
				}
				_coalesceGetterSetter(element, other);
			}
		} else {
			newElements.push(element);
		}
	}
	return newElements;
}
function _hasDecorators(element) {
	return element.decorators && element.decorators.length;
}
function _isDataDescriptor(desc) {
	return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
}
function _optionalCallableProperty(obj, name) {
	var value = obj[name];
	if (value !== undefined && typeof value !== "function") {
		throw new TypeError("Expected '" + name + "' to be a function");
	}
	return value;
}
function _classPrivateMethodGet(receiver, privateSet, fn) {
	if (!privateSet.has(receiver)) {
		throw new TypeError("attempted to get private field on non-instance");
	}
	return fn;
}
function _checkPrivateRedeclaration(obj, privateCollection) {
	if (privateCollection.has(obj)) {
		throw new TypeError("Cannot initialize the same private elements twice on an object");
	}
}
function _classPrivateFieldInitSpec(obj, privateMap, value) {
	_checkPrivateRedeclaration(obj, privateMap);
	privateMap.set(obj, value);
}
function _classPrivateMethodInitSpec(obj, privateSet) {
	_checkPrivateRedeclaration(obj, privateSet);
	privateSet.add(obj);
}
function _classPrivateMethodSet() {
	throw new TypeError("attempted to reassign private method");
}
function _identity(x) {
	return x;
}

function Rot(theta) {
	let Mat = [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]];
	return Mat;
}
function Rij(k, l, theta, N) {
	let Mat = Array(N);
	for (let i = 0; i < N; i++) {
		Mat[i] = Array(N);
	}
	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			Mat[i][j] = (i === j) * 1.0;
		}
	}
	let Rotij = Rot(theta);
	Mat[k][k] = Rotij[0][0];
	Mat[l][l] = Rotij[1][1];
	Mat[k][l] = Rotij[0][1];
	Mat[l][k] = Rotij[1][0];
	return Mat;
}
function getTheta(aii, ajj, aij) {
	let th = 0.0;
	let denom = ajj - aii;
	if (Math.abs(denom) <= 1E-12) {
		th = Math.PI / 4.0;
	} else {
		th = 0.5 * Math.atan(2.0 * aij / (ajj - aii));
	}
	return th;
}
function getAij(Mij) {
	let N = Mij.length;
	let maxMij = 0.0;
	let maxIJ = [0, 1];
	for (let i = 0; i < N; i++) {
		for (let j = i + 1; j < N; j++) {
			if (Math.abs(maxMij) <= Math.abs(Mij[i][j])) {
				maxMij = Math.abs(Mij[i][j]);
				maxIJ = [i, j];
			}
		}
	}
	return [maxIJ, maxMij];
}
function unitary(U, H) {
	let N = U.length;
	let Mat = Array(N);
	for (let i = 0; i < N; i++) {
		Mat[i] = Array(N);
	}
	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			Mat[i][j] = 0;
			for (let k = 0; k < N; k++) {
				for (let l = 0; l < N; l++) {
					Mat[i][j] = Mat[i][j] + U[k][i] * H[k][l] * U[l][j];
				}
			}
		}
	}
	return Mat;
}
function AxB(A, B) {
	let N = A.length;
	let Mat = Array(N);
	for (let i = 0; i < N; i++) {
		Mat[i] = Array(N);
	}
	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			Mat[i][j] = 0;
			for (let k = 0; k < N; k++) {
				Mat[i][j] = Mat[i][j] + A[i][k] * B[k][j];
			}
		}
	}
	return Mat;
}
function eigens(Hij) {
	let convergence = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1E-7;
	let N = Hij.length;
	let Ei = Array(N);
	let e0 = Math.abs(convergence / N);
	let Sij = Array(N);
	for (let i = 0; i < N; i++) {
		Sij[i] = Array(N);
	}
	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			Sij[i][j] = (i === j) * 1.0;
		}
	}
	let Vab = getAij(Hij);
	while (Math.abs(Vab[1]) >= Math.abs(e0)) {
		let i = Vab[0][0];
		let j = Vab[0][1];
		let psi = getTheta(Hij[i][i], Hij[j][j], Hij[i][j]);
		let Gij = Rij(i, j, psi, N);
		Hij = unitary(Gij, Hij);
		Sij = AxB(Sij, Gij);
		Vab = getAij(Hij);
	}
	for (let i = 0; i < N; i++) {
		Ei[i] = Hij[i][i];
	}
	return sorting(Ei, Sij);
}
function sorting(values, vectors) {
	let eigsCount = values.length;
	let eigenVectorDim = vectors.length;
	let pairs = Array.from({
		length: eigsCount
	}, (_, i) => {
		let vector = vectors.map(v => v[i]);
		return {
			value: values[i],
			vec: vector
		};
	});
	pairs.sort((a, b) => b.value - a.value);
	let sortedValues = pairs.map(_ref => {
		let {
			value
		} = _ref;
		return value;
	});
	let sortedVectors = pairs.map(_ref2 => {
		let {
			vec
		} = _ref2;
		return vec;
	});
	return [sortedValues, sortedVectors];
}
function dominentPrincipalVector(matrix) {
	let [, [dominentVector]] = eigens(matrix);
	return dominentVector;
}

class Vec3 {
	constructor() {
		let x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		let y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
		let z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : x;
		this._values = [x, y, z];
	}
	get x() {
		return this._values[0];
	}
	get y() {
		return this._values[1];
	}
	get z() {
		return this._values[2];
	}
	set x(value) {
		this._values[0] = value;
	}
	set y(value) {
		this._values[1] = value;
	}
	set z(value) {
		this._values[2] = value;
	}
	get length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	get lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	get normalized() {
		if (this.length === 0) return null;
		return Vec3.multScalar(this, 1 / this.length);
	}
	get colorInt() {
		const floatToInt = value => {
			const result = parseInt(value * 255 + 0.5);
			return Math.max(Math.min(result, 255), 0);
		};
		return this._values.map(floatToInt);
	}
	clone() {
		return new Vec3(this.x, this.y, this.z);
	}
	set(x) {
		let y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
		let z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : x;
		this._values[0] = x;
		this._values[1] = y;
		this._values[2] = z;
		return this;
	}
	toVec4() {
		let w = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
		return new Vec4(this.x, this.y, this.z, w);
	}
	addVector(v) {
		this._values[0] += v.x;
		this._values[1] += v.y;
		this._values[2] += v.z;
		return this;
	}
	addScaledVector(v, scalar) {
		this._values[0] += v.x * scalar;
		this._values[1] += v.y * scalar;
		this._values[2] += v.z * scalar;
		return this;
	}
	mult(scalar) {
		this._values[0] *= scalar;
		this._values[1] *= scalar;
		this._values[2] *= scalar;
		return this;
	}
	multVector(vec) {
		this._values[0] *= vec.x;
		this._values[1] *= vec.y;
		this._values[2] *= vec.z;
		return this;
	}
	clamp(min, max) {
		const clamper = v => min > v ? min : max < v ? max : v;
		this._values[0] = clamper(this._values[0]);
		this._values[1] = clamper(this._values[1]);
		this._values[2] = clamper(this._values[2]);
		return this;
	}
	clampGrid() {
		const clamper = v => 0 > v ? 0 : 1 < v ? 1 : v;
		const gridClamper = (value, grid) => Math.trunc(clamper(value) * grid + 0.5) / grid;
		this._values[0] = gridClamper(this._values[0], 31);
		this._values[1] = gridClamper(this._values[1], 63);
		this._values[2] = gridClamper(this._values[2], 31);
		return this;
	}
	normalize() {
		this._values[0] /= this.length;
		this._values[1] /= this.length;
		this._values[2] /= this.length;
		return this;
	}
	toString() {
		return "Vec3( ".concat(this._values.join(", "), " )");
	}
	static add(a, b) {
		return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
	}
	static sub(a, b) {
		return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
	}
	static dot(a, b) {
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}
	static multScalar(a, scalar) {
		return new Vec3(a.x * scalar, a.y * scalar, a.z * scalar);
	}
	static multVector(a, b) {
		return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
	}
	static interpolate(a, b, p) {
		let a_ = Vec3.multScalar(a, 1 - p);
		let b_ = Vec3.multScalar(b, p);
		return Vec3.add(a_, b_);
	}
}
class Vec4 {
	constructor() {
		let x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
		let y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
		let z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : x;
		let w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : x;
		this._values = [x, y, z, w];
	}
	get x() {
		return this._values[0];
	}
	get y() {
		return this._values[1];
	}
	get z() {
		return this._values[2];
	}
	get w() {
		return this._values[3];
	}
	set x(value) {
		this._values[0] = value;
	}
	set y(value) {
		this._values[1] = value;
	}
	set z(value) {
		this._values[2] = value;
	}
	set w(value) {
		this._values[3] = value;
	}
	get length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}
	get lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}
	get normalized() {
		if (this.length === 0) return null;
		return Vec4.multScalar(this, 1 / this.length);
	}
	get xyz() {
		return new Vec3(this.x, this.y, this.z);
	}
	get splatX() {
		return new Vec4(this.x);
	}
	get splatY() {
		return new Vec4(this.y);
	}
	get splatZ() {
		return new Vec4(this.z);
	}
	get splatW() {
		return new Vec4(this.w);
	}
	clone() {
		return new Vec4(this.x, this.y, this.z, this.w);
	}
	set(x) {
		let y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
		let z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : x;
		let w = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : x;
		this._values[0] = x;
		this._values[1] = y;
		this._values[2] = z;
		this._values[3] = w;
		return this;
	}
	toVec3() {
		return this.xyz;
	}
	addVector(v) {
		this._values[0] += v.x;
		this._values[1] += v.y;
		this._values[2] += v.z;
		this._values[3] += v.w;
		return this;
	}
	addScaledVector(v, scalar) {
		this._values[0] += v.x * scalar;
		this._values[1] += v.y * scalar;
		this._values[2] += v.z * scalar;
		this._values[3] += v.w * scalar;
		return this;
	}
	subVector(v) {
		this._values[0] -= v.x;
		this._values[1] -= v.y;
		this._values[2] -= v.z;
		this._values[3] -= v.w;
		return this;
	}
	mult(scalar) {
		this._values[0] *= scalar;
		this._values[1] *= scalar;
		this._values[2] *= scalar;
		this._values[3] *= scalar;
		return this;
	}
	multVector(vec) {
		this._values[0] *= vec.x;
		this._values[1] *= vec.y;
		this._values[2] *= vec.z;
		this._values[3] *= vec.w;
		return this;
	}
	reciprocal() {
		this._values[0] = 1 / this._values[0];
		this._values[1] = 1 / this._values[1];
		this._values[2] = 1 / this._values[2];
		this._values[3] = 1 / this._values[3];
		return this;
	}
	clamp(min, max) {
		const clamper = v => min > v ? min : max < v ? max : v;
		this._values[0] = clamper(this._values[0]);
		this._values[1] = clamper(this._values[1]);
		this._values[2] = clamper(this._values[2]);
		this._values[3] = clamper(this._values[3]);
		return this;
	}
	clampGrid() {
		const clamper = v => 0 > v ? 0 : 1 < v ? 1 : v;
		const gridClamper = (value, grid) => Math.trunc(clamper(value) * grid + 0.5) / grid;
		this._values[0] = gridClamper(this._values[0], 31);
		this._values[1] = gridClamper(this._values[1], 63);
		this._values[2] = gridClamper(this._values[2], 31);
		this._values[3] = clamper(this._values[3]);
		return this;
	}
	truncate() {
		this._values[0] = Math.trunc(this._values[0]);
		this._values[1] = Math.trunc(this._values[1]);
		this._values[2] = Math.trunc(this._values[2]);
		this._values[3] = Math.trunc(this._values[3]);
		return this;
	}
	normalize() {
		this._values[0] /= this.length;
		this._values[1] /= this.length;
		this._values[2] /= this.length;
		this._values[3] /= this.length;
		return this;
	}
	toString() {
		return "Vec4( ".concat(this._values.join(", "), " )");
	}
	static add(a, b) {
		return new Vec4(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w);
	}
	static sub(a, b) {
		return new Vec4(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
	}
	static dot(a, b) {
		return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
	}
	static multScalar(a, scalar) {
		return new Vec4(a.x * scalar, a.y * scalar, a.z * scalar, a.w * scalar);
	}
	static multVector(a, b) {
		return new Vec4(a.x * b.x, a.y * b.y, a.z * b.z, a.w * b.w);
	}
	static interpolate(a, b, p) {
		let a_ = Vec4.multScalar(a, 1 - p);
		let b_ = Vec4.multScalar(b, p);
		return Vec4.add(a_, b_);
	}
	static multiplyAdd(a, b, c) {
		return new Vec4(a.x * b.x + c.x, a.y * b.y + c.y, a.z * b.z + c.z, a.w * b.w + c.w);
	}
	static negativeMultiplySubtract(a, b, c) {
		return new Vec4(c.x - a.x * b.x, c.y - a.y * b.y, c.z - a.z * b.z, c.w - a.w * b.w);
	}
	static compareAnyLessThan(left, right) {
		return left.x < right.x || left.y < right.y || left.z < right.z || left.w < right.w;
	}
}
function computeWeightedCovariance(values, weights) {
	let total = 0;
	let mean = values.reduce((sum, value, i) => {
		total += weights[i];
		sum.addScaledVector(value, weights[i]);
		return sum;
	}, new Vec3(0));
	mean.mult(1 / total);
	let covariance = values.reduce((sum, value, i) => {
		let weight = weights[i];
		let v = Vec3.sub(value, mean);
		sum[0][0] += v.x * v.x * weight;
		sum[0][1] += v.x * v.y * weight;
		sum[0][2] += v.x * v.z * weight;
		sum[1][1] += v.y * v.y * weight;
		sum[1][2] += v.y * v.z * weight;
		sum[2][2] += v.z * v.z * weight;
		return sum;
	}, [[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
	covariance[1][0] = covariance[0][1];
	covariance[2][0] = covariance[0][2];
	covariance[2][1] = covariance[1][2];
	return covariance;
}
function computePCA(values, weights) {
	const covariance = computeWeightedCovariance(values, weights);
	return new Vec3(...dominentPrincipalVector(covariance));
}

const lookup_5_3 = [[[0, 0, 0], [0, 0, 0]], [[0, 0, 1], [0, 0, 1]], [[0, 0, 2], [0, 0, 2]], [[0, 0, 3], [0, 1, 1]], [[0, 0, 4], [0, 1, 0]], [[1, 0, 3], [0, 1, 1]], [[1, 0, 2], [0, 1, 2]], [[1, 0, 1], [0, 2, 1]], [[1, 0, 0], [0, 2, 0]], [[1, 0, 1], [0, 2, 1]], [[1, 0, 2], [0, 2, 2]], [[1, 0, 3], [0, 3, 1]], [[1, 0, 4], [0, 3, 0]], [[2, 0, 3], [0, 3, 1]], [[2, 0, 2], [0, 3, 2]], [[2, 0, 1], [0, 4, 1]], [[2, 0, 0], [0, 4, 0]], [[2, 0, 1], [0, 4, 1]], [[2, 0, 2], [0, 4, 2]], [[2, 0, 3], [0, 5, 1]], [[2, 0, 4], [0, 5, 0]], [[3, 0, 3], [0, 5, 1]], [[3, 0, 2], [0, 5, 2]], [[3, 0, 1], [0, 6, 1]], [[3, 0, 0], [0, 6, 0]], [[3, 0, 1], [0, 6, 1]], [[3, 0, 2], [0, 6, 2]], [[3, 0, 3], [0, 7, 1]], [[3, 0, 4], [0, 7, 0]], [[4, 0, 4], [0, 7, 1]], [[4, 0, 3], [0, 7, 2]], [[4, 0, 2], [1, 7, 1]], [[4, 0, 1], [1, 7, 0]], [[4, 0, 0], [0, 8, 0]], [[4, 0, 1], [0, 8, 1]], [[4, 0, 2], [2, 7, 1]], [[4, 0, 3], [2, 7, 0]], [[4, 0, 4], [0, 9, 0]], [[5, 0, 3], [0, 9, 1]], [[5, 0, 2], [3, 7, 1]], [[5, 0, 1], [3, 7, 0]], [[5, 0, 0], [0, 10, 0]], [[5, 0, 1], [0, 10, 1]], [[5, 0, 2], [0, 10, 2]], [[5, 0, 3], [0, 11, 1]], [[5, 0, 4], [0, 11, 0]], [[6, 0, 3], [0, 11, 1]], [[6, 0, 2], [0, 11, 2]], [[6, 0, 1], [0, 12, 1]], [[6, 0, 0], [0, 12, 0]], [[6, 0, 1], [0, 12, 1]], [[6, 0, 2], [0, 12, 2]], [[6, 0, 3], [0, 13, 1]], [[6, 0, 4], [0, 13, 0]], [[7, 0, 3], [0, 13, 1]], [[7, 0, 2], [0, 13, 2]], [[7, 0, 1], [0, 14, 1]], [[7, 0, 0], [0, 14, 0]], [[7, 0, 1], [0, 14, 1]], [[7, 0, 2], [0, 14, 2]], [[7, 0, 3], [0, 15, 1]], [[7, 0, 4], [0, 15, 0]], [[8, 0, 4], [0, 15, 1]], [[8, 0, 3], [0, 15, 2]], [[8, 0, 2], [1, 15, 1]], [[8, 0, 1], [1, 15, 0]], [[8, 0, 0], [0, 16, 0]], [[8, 0, 1], [0, 16, 1]], [[8, 0, 2], [2, 15, 1]], [[8, 0, 3], [2, 15, 0]], [[8, 0, 4], [0, 17, 0]], [[9, 0, 3], [0, 17, 1]], [[9, 0, 2], [3, 15, 1]], [[9, 0, 1], [3, 15, 0]], [[9, 0, 0], [0, 18, 0]], [[9, 0, 1], [0, 18, 1]], [[9, 0, 2], [0, 18, 2]], [[9, 0, 3], [0, 19, 1]], [[9, 0, 4], [0, 19, 0]], [[10, 0, 3], [0, 19, 1]], [[10, 0, 2], [0, 19, 2]], [[10, 0, 1], [0, 20, 1]], [[10, 0, 0], [0, 20, 0]], [[10, 0, 1], [0, 20, 1]], [[10, 0, 2], [0, 20, 2]], [[10, 0, 3], [0, 21, 1]], [[10, 0, 4], [0, 21, 0]], [[11, 0, 3], [0, 21, 1]], [[11, 0, 2], [0, 21, 2]], [[11, 0, 1], [0, 22, 1]], [[11, 0, 0], [0, 22, 0]], [[11, 0, 1], [0, 22, 1]], [[11, 0, 2], [0, 22, 2]], [[11, 0, 3], [0, 23, 1]], [[11, 0, 4], [0, 23, 0]], [[12, 0, 4], [0, 23, 1]], [[12, 0, 3], [0, 23, 2]], [[12, 0, 2], [1, 23, 1]], [[12, 0, 1], [1, 23, 0]], [[12, 0, 0], [0, 24, 0]], [[12, 0, 1], [0, 24, 1]], [[12, 0, 2], [2, 23, 1]], [[12, 0, 3], [2, 23, 0]], [[12, 0, 4], [0, 25, 0]], [[13, 0, 3], [0, 25, 1]], [[13, 0, 2], [3, 23, 1]], [[13, 0, 1], [3, 23, 0]], [[13, 0, 0], [0, 26, 0]], [[13, 0, 1], [0, 26, 1]], [[13, 0, 2], [0, 26, 2]], [[13, 0, 3], [0, 27, 1]], [[13, 0, 4], [0, 27, 0]], [[14, 0, 3], [0, 27, 1]], [[14, 0, 2], [0, 27, 2]], [[14, 0, 1], [0, 28, 1]], [[14, 0, 0], [0, 28, 0]], [[14, 0, 1], [0, 28, 1]], [[14, 0, 2], [0, 28, 2]], [[14, 0, 3], [0, 29, 1]], [[14, 0, 4], [0, 29, 0]], [[15, 0, 3], [0, 29, 1]], [[15, 0, 2], [0, 29, 2]], [[15, 0, 1], [0, 30, 1]], [[15, 0, 0], [0, 30, 0]], [[15, 0, 1], [0, 30, 1]], [[15, 0, 2], [0, 30, 2]], [[15, 0, 3], [0, 31, 1]], [[15, 0, 4], [0, 31, 0]], [[16, 0, 4], [0, 31, 1]], [[16, 0, 3], [0, 31, 2]], [[16, 0, 2], [1, 31, 1]], [[16, 0, 1], [1, 31, 0]], [[16, 0, 0], [4, 28, 0]], [[16, 0, 1], [4, 28, 1]], [[16, 0, 2], [2, 31, 1]], [[16, 0, 3], [2, 31, 0]], [[16, 0, 4], [4, 29, 0]], [[17, 0, 3], [4, 29, 1]], [[17, 0, 2], [3, 31, 1]], [[17, 0, 1], [3, 31, 0]], [[17, 0, 0], [4, 30, 0]], [[17, 0, 1], [4, 30, 1]], [[17, 0, 2], [4, 30, 2]], [[17, 0, 3], [4, 31, 1]], [[17, 0, 4], [4, 31, 0]], [[18, 0, 3], [4, 31, 1]], [[18, 0, 2], [4, 31, 2]], [[18, 0, 1], [5, 31, 1]], [[18, 0, 0], [5, 31, 0]], [[18, 0, 1], [5, 31, 1]], [[18, 0, 2], [5, 31, 2]], [[18, 0, 3], [6, 31, 1]], [[18, 0, 4], [6, 31, 0]], [[19, 0, 3], [6, 31, 1]], [[19, 0, 2], [6, 31, 2]], [[19, 0, 1], [7, 31, 1]], [[19, 0, 0], [7, 31, 0]], [[19, 0, 1], [7, 31, 1]], [[19, 0, 2], [7, 31, 2]], [[19, 0, 3], [8, 31, 1]], [[19, 0, 4], [8, 31, 0]], [[20, 0, 4], [8, 31, 1]], [[20, 0, 3], [8, 31, 2]], [[20, 0, 2], [9, 31, 1]], [[20, 0, 1], [9, 31, 0]], [[20, 0, 0], [12, 28, 0]], [[20, 0, 1], [12, 28, 1]], [[20, 0, 2], [10, 31, 1]], [[20, 0, 3], [10, 31, 0]], [[20, 0, 4], [12, 29, 0]], [[21, 0, 3], [12, 29, 1]], [[21, 0, 2], [11, 31, 1]], [[21, 0, 1], [11, 31, 0]], [[21, 0, 0], [12, 30, 0]], [[21, 0, 1], [12, 30, 1]], [[21, 0, 2], [12, 30, 2]], [[21, 0, 3], [12, 31, 1]], [[21, 0, 4], [12, 31, 0]], [[22, 0, 3], [12, 31, 1]], [[22, 0, 2], [12, 31, 2]], [[22, 0, 1], [13, 31, 1]], [[22, 0, 0], [13, 31, 0]], [[22, 0, 1], [13, 31, 1]], [[22, 0, 2], [13, 31, 2]], [[22, 0, 3], [14, 31, 1]], [[22, 0, 4], [14, 31, 0]], [[23, 0, 3], [14, 31, 1]], [[23, 0, 2], [14, 31, 2]], [[23, 0, 1], [15, 31, 1]], [[23, 0, 0], [15, 31, 0]], [[23, 0, 1], [15, 31, 1]], [[23, 0, 2], [15, 31, 2]], [[23, 0, 3], [16, 31, 1]], [[23, 0, 4], [16, 31, 0]], [[24, 0, 4], [16, 31, 1]], [[24, 0, 3], [16, 31, 2]], [[24, 0, 2], [17, 31, 1]], [[24, 0, 1], [17, 31, 0]], [[24, 0, 0], [20, 28, 0]], [[24, 0, 1], [20, 28, 1]], [[24, 0, 2], [18, 31, 1]], [[24, 0, 3], [18, 31, 0]], [[24, 0, 4], [20, 29, 0]], [[25, 0, 3], [20, 29, 1]], [[25, 0, 2], [19, 31, 1]], [[25, 0, 1], [19, 31, 0]], [[25, 0, 0], [20, 30, 0]], [[25, 0, 1], [20, 30, 1]], [[25, 0, 2], [20, 30, 2]], [[25, 0, 3], [20, 31, 1]], [[25, 0, 4], [20, 31, 0]], [[26, 0, 3], [20, 31, 1]], [[26, 0, 2], [20, 31, 2]], [[26, 0, 1], [21, 31, 1]], [[26, 0, 0], [21, 31, 0]], [[26, 0, 1], [21, 31, 1]], [[26, 0, 2], [21, 31, 2]], [[26, 0, 3], [22, 31, 1]], [[26, 0, 4], [22, 31, 0]], [[27, 0, 3], [22, 31, 1]], [[27, 0, 2], [22, 31, 2]], [[27, 0, 1], [23, 31, 1]], [[27, 0, 0], [23, 31, 0]], [[27, 0, 1], [23, 31, 1]], [[27, 0, 2], [23, 31, 2]], [[27, 0, 3], [24, 31, 1]], [[27, 0, 4], [24, 31, 0]], [[28, 0, 4], [24, 31, 1]], [[28, 0, 3], [24, 31, 2]], [[28, 0, 2], [25, 31, 1]], [[28, 0, 1], [25, 31, 0]], [[28, 0, 0], [28, 28, 0]], [[28, 0, 1], [28, 28, 1]], [[28, 0, 2], [26, 31, 1]], [[28, 0, 3], [26, 31, 0]], [[28, 0, 4], [28, 29, 0]], [[29, 0, 3], [28, 29, 1]], [[29, 0, 2], [27, 31, 1]], [[29, 0, 1], [27, 31, 0]], [[29, 0, 0], [28, 30, 0]], [[29, 0, 1], [28, 30, 1]], [[29, 0, 2], [28, 30, 2]], [[29, 0, 3], [28, 31, 1]], [[29, 0, 4], [28, 31, 0]], [[30, 0, 3], [28, 31, 1]], [[30, 0, 2], [28, 31, 2]], [[30, 0, 1], [29, 31, 1]], [[30, 0, 0], [29, 31, 0]], [[30, 0, 1], [29, 31, 1]], [[30, 0, 2], [29, 31, 2]], [[30, 0, 3], [30, 31, 1]], [[30, 0, 4], [30, 31, 0]], [[31, 0, 3], [30, 31, 1]], [[31, 0, 2], [30, 31, 2]], [[31, 0, 1], [31, 31, 1]], [[31, 0, 0], [31, 31, 0]]];
const lookup_6_3 = [[[0, 0, 0], [0, 0, 0]], [[0, 0, 1], [0, 1, 1]], [[0, 0, 2], [0, 1, 0]], [[1, 0, 1], [0, 2, 1]], [[1, 0, 0], [0, 2, 0]], [[1, 0, 1], [0, 3, 1]], [[1, 0, 2], [0, 3, 0]], [[2, 0, 1], [0, 4, 1]], [[2, 0, 0], [0, 4, 0]], [[2, 0, 1], [0, 5, 1]], [[2, 0, 2], [0, 5, 0]], [[3, 0, 1], [0, 6, 1]], [[3, 0, 0], [0, 6, 0]], [[3, 0, 1], [0, 7, 1]], [[3, 0, 2], [0, 7, 0]], [[4, 0, 1], [0, 8, 1]], [[4, 0, 0], [0, 8, 0]], [[4, 0, 1], [0, 9, 1]], [[4, 0, 2], [0, 9, 0]], [[5, 0, 1], [0, 10, 1]], [[5, 0, 0], [0, 10, 0]], [[5, 0, 1], [0, 11, 1]], [[5, 0, 2], [0, 11, 0]], [[6, 0, 1], [0, 12, 1]], [[6, 0, 0], [0, 12, 0]], [[6, 0, 1], [0, 13, 1]], [[6, 0, 2], [0, 13, 0]], [[7, 0, 1], [0, 14, 1]], [[7, 0, 0], [0, 14, 0]], [[7, 0, 1], [0, 15, 1]], [[7, 0, 2], [0, 15, 0]], [[8, 0, 1], [0, 16, 1]], [[8, 0, 0], [0, 16, 0]], [[8, 0, 1], [0, 17, 1]], [[8, 0, 2], [0, 17, 0]], [[9, 0, 1], [0, 18, 1]], [[9, 0, 0], [0, 18, 0]], [[9, 0, 1], [0, 19, 1]], [[9, 0, 2], [0, 19, 0]], [[10, 0, 1], [0, 20, 1]], [[10, 0, 0], [0, 20, 0]], [[10, 0, 1], [0, 21, 1]], [[10, 0, 2], [0, 21, 0]], [[11, 0, 1], [0, 22, 1]], [[11, 0, 0], [0, 22, 0]], [[11, 0, 1], [0, 23, 1]], [[11, 0, 2], [0, 23, 0]], [[12, 0, 1], [0, 24, 1]], [[12, 0, 0], [0, 24, 0]], [[12, 0, 1], [0, 25, 1]], [[12, 0, 2], [0, 25, 0]], [[13, 0, 1], [0, 26, 1]], [[13, 0, 0], [0, 26, 0]], [[13, 0, 1], [0, 27, 1]], [[13, 0, 2], [0, 27, 0]], [[14, 0, 1], [0, 28, 1]], [[14, 0, 0], [0, 28, 0]], [[14, 0, 1], [0, 29, 1]], [[14, 0, 2], [0, 29, 0]], [[15, 0, 1], [0, 30, 1]], [[15, 0, 0], [0, 30, 0]], [[15, 0, 1], [0, 31, 1]], [[15, 0, 2], [0, 31, 0]], [[16, 0, 2], [1, 31, 1]], [[16, 0, 1], [1, 31, 0]], [[16, 0, 0], [0, 32, 0]], [[16, 0, 1], [2, 31, 0]], [[16, 0, 2], [0, 33, 0]], [[17, 0, 1], [3, 31, 0]], [[17, 0, 0], [0, 34, 0]], [[17, 0, 1], [4, 31, 0]], [[17, 0, 2], [0, 35, 0]], [[18, 0, 1], [5, 31, 0]], [[18, 0, 0], [0, 36, 0]], [[18, 0, 1], [6, 31, 0]], [[18, 0, 2], [0, 37, 0]], [[19, 0, 1], [7, 31, 0]], [[19, 0, 0], [0, 38, 0]], [[19, 0, 1], [8, 31, 0]], [[19, 0, 2], [0, 39, 0]], [[20, 0, 1], [9, 31, 0]], [[20, 0, 0], [0, 40, 0]], [[20, 0, 1], [10, 31, 0]], [[20, 0, 2], [0, 41, 0]], [[21, 0, 1], [11, 31, 0]], [[21, 0, 0], [0, 42, 0]], [[21, 0, 1], [12, 31, 0]], [[21, 0, 2], [0, 43, 0]], [[22, 0, 1], [13, 31, 0]], [[22, 0, 0], [0, 44, 0]], [[22, 0, 1], [14, 31, 0]], [[22, 0, 2], [0, 45, 0]], [[23, 0, 1], [15, 31, 0]], [[23, 0, 0], [0, 46, 0]], [[23, 0, 1], [0, 47, 1]], [[23, 0, 2], [0, 47, 0]], [[24, 0, 1], [0, 48, 1]], [[24, 0, 0], [0, 48, 0]], [[24, 0, 1], [0, 49, 1]], [[24, 0, 2], [0, 49, 0]], [[25, 0, 1], [0, 50, 1]], [[25, 0, 0], [0, 50, 0]], [[25, 0, 1], [0, 51, 1]], [[25, 0, 2], [0, 51, 0]], [[26, 0, 1], [0, 52, 1]], [[26, 0, 0], [0, 52, 0]], [[26, 0, 1], [0, 53, 1]], [[26, 0, 2], [0, 53, 0]], [[27, 0, 1], [0, 54, 1]], [[27, 0, 0], [0, 54, 0]], [[27, 0, 1], [0, 55, 1]], [[27, 0, 2], [0, 55, 0]], [[28, 0, 1], [0, 56, 1]], [[28, 0, 0], [0, 56, 0]], [[28, 0, 1], [0, 57, 1]], [[28, 0, 2], [0, 57, 0]], [[29, 0, 1], [0, 58, 1]], [[29, 0, 0], [0, 58, 0]], [[29, 0, 1], [0, 59, 1]], [[29, 0, 2], [0, 59, 0]], [[30, 0, 1], [0, 60, 1]], [[30, 0, 0], [0, 60, 0]], [[30, 0, 1], [0, 61, 1]], [[30, 0, 2], [0, 61, 0]], [[31, 0, 1], [0, 62, 1]], [[31, 0, 0], [0, 62, 0]], [[31, 0, 1], [0, 63, 1]], [[31, 0, 2], [0, 63, 0]], [[32, 0, 2], [1, 63, 1]], [[32, 0, 1], [1, 63, 0]], [[32, 0, 0], [16, 48, 0]], [[32, 0, 1], [2, 63, 0]], [[32, 0, 2], [16, 49, 0]], [[33, 0, 1], [3, 63, 0]], [[33, 0, 0], [16, 50, 0]], [[33, 0, 1], [4, 63, 0]], [[33, 0, 2], [16, 51, 0]], [[34, 0, 1], [5, 63, 0]], [[34, 0, 0], [16, 52, 0]], [[34, 0, 1], [6, 63, 0]], [[34, 0, 2], [16, 53, 0]], [[35, 0, 1], [7, 63, 0]], [[35, 0, 0], [16, 54, 0]], [[35, 0, 1], [8, 63, 0]], [[35, 0, 2], [16, 55, 0]], [[36, 0, 1], [9, 63, 0]], [[36, 0, 0], [16, 56, 0]], [[36, 0, 1], [10, 63, 0]], [[36, 0, 2], [16, 57, 0]], [[37, 0, 1], [11, 63, 0]], [[37, 0, 0], [16, 58, 0]], [[37, 0, 1], [12, 63, 0]], [[37, 0, 2], [16, 59, 0]], [[38, 0, 1], [13, 63, 0]], [[38, 0, 0], [16, 60, 0]], [[38, 0, 1], [14, 63, 0]], [[38, 0, 2], [16, 61, 0]], [[39, 0, 1], [15, 63, 0]], [[39, 0, 0], [16, 62, 0]], [[39, 0, 1], [16, 63, 1]], [[39, 0, 2], [16, 63, 0]], [[40, 0, 1], [17, 63, 1]], [[40, 0, 0], [17, 63, 0]], [[40, 0, 1], [18, 63, 1]], [[40, 0, 2], [18, 63, 0]], [[41, 0, 1], [19, 63, 1]], [[41, 0, 0], [19, 63, 0]], [[41, 0, 1], [20, 63, 1]], [[41, 0, 2], [20, 63, 0]], [[42, 0, 1], [21, 63, 1]], [[42, 0, 0], [21, 63, 0]], [[42, 0, 1], [22, 63, 1]], [[42, 0, 2], [22, 63, 0]], [[43, 0, 1], [23, 63, 1]], [[43, 0, 0], [23, 63, 0]], [[43, 0, 1], [24, 63, 1]], [[43, 0, 2], [24, 63, 0]], [[44, 0, 1], [25, 63, 1]], [[44, 0, 0], [25, 63, 0]], [[44, 0, 1], [26, 63, 1]], [[44, 0, 2], [26, 63, 0]], [[45, 0, 1], [27, 63, 1]], [[45, 0, 0], [27, 63, 0]], [[45, 0, 1], [28, 63, 1]], [[45, 0, 2], [28, 63, 0]], [[46, 0, 1], [29, 63, 1]], [[46, 0, 0], [29, 63, 0]], [[46, 0, 1], [30, 63, 1]], [[46, 0, 2], [30, 63, 0]], [[47, 0, 1], [31, 63, 1]], [[47, 0, 0], [31, 63, 0]], [[47, 0, 1], [32, 63, 1]], [[47, 0, 2], [32, 63, 0]], [[48, 0, 2], [33, 63, 1]], [[48, 0, 1], [33, 63, 0]], [[48, 0, 0], [48, 48, 0]], [[48, 0, 1], [34, 63, 0]], [[48, 0, 2], [48, 49, 0]], [[49, 0, 1], [35, 63, 0]], [[49, 0, 0], [48, 50, 0]], [[49, 0, 1], [36, 63, 0]], [[49, 0, 2], [48, 51, 0]], [[50, 0, 1], [37, 63, 0]], [[50, 0, 0], [48, 52, 0]], [[50, 0, 1], [38, 63, 0]], [[50, 0, 2], [48, 53, 0]], [[51, 0, 1], [39, 63, 0]], [[51, 0, 0], [48, 54, 0]], [[51, 0, 1], [40, 63, 0]], [[51, 0, 2], [48, 55, 0]], [[52, 0, 1], [41, 63, 0]], [[52, 0, 0], [48, 56, 0]], [[52, 0, 1], [42, 63, 0]], [[52, 0, 2], [48, 57, 0]], [[53, 0, 1], [43, 63, 0]], [[53, 0, 0], [48, 58, 0]], [[53, 0, 1], [44, 63, 0]], [[53, 0, 2], [48, 59, 0]], [[54, 0, 1], [45, 63, 0]], [[54, 0, 0], [48, 60, 0]], [[54, 0, 1], [46, 63, 0]], [[54, 0, 2], [48, 61, 0]], [[55, 0, 1], [47, 63, 0]], [[55, 0, 0], [48, 62, 0]], [[55, 0, 1], [48, 63, 1]], [[55, 0, 2], [48, 63, 0]], [[56, 0, 1], [49, 63, 1]], [[56, 0, 0], [49, 63, 0]], [[56, 0, 1], [50, 63, 1]], [[56, 0, 2], [50, 63, 0]], [[57, 0, 1], [51, 63, 1]], [[57, 0, 0], [51, 63, 0]], [[57, 0, 1], [52, 63, 1]], [[57, 0, 2], [52, 63, 0]], [[58, 0, 1], [53, 63, 1]], [[58, 0, 0], [53, 63, 0]], [[58, 0, 1], [54, 63, 1]], [[58, 0, 2], [54, 63, 0]], [[59, 0, 1], [55, 63, 1]], [[59, 0, 0], [55, 63, 0]], [[59, 0, 1], [56, 63, 1]], [[59, 0, 2], [56, 63, 0]], [[60, 0, 1], [57, 63, 1]], [[60, 0, 0], [57, 63, 0]], [[60, 0, 1], [58, 63, 1]], [[60, 0, 2], [58, 63, 0]], [[61, 0, 1], [59, 63, 1]], [[61, 0, 0], [59, 63, 0]], [[61, 0, 1], [60, 63, 1]], [[61, 0, 2], [60, 63, 0]], [[62, 0, 1], [61, 63, 1]], [[62, 0, 0], [61, 63, 0]], [[62, 0, 1], [62, 63, 1]], [[62, 0, 2], [62, 63, 0]], [[63, 0, 1], [63, 63, 1]], [[63, 0, 0], [63, 63, 0]]];
const lookup_5_4 = [[[0, 0, 0], [0, 0, 0]], [[0, 0, 1], [0, 1, 1]], [[0, 0, 2], [0, 1, 0]], [[0, 0, 3], [0, 1, 1]], [[0, 0, 4], [0, 2, 1]], [[1, 0, 3], [0, 2, 0]], [[1, 0, 2], [0, 2, 1]], [[1, 0, 1], [0, 3, 1]], [[1, 0, 0], [0, 3, 0]], [[1, 0, 1], [1, 2, 1]], [[1, 0, 2], [1, 2, 0]], [[1, 0, 3], [0, 4, 0]], [[1, 0, 4], [0, 5, 1]], [[2, 0, 3], [0, 5, 0]], [[2, 0, 2], [0, 5, 1]], [[2, 0, 1], [0, 6, 1]], [[2, 0, 0], [0, 6, 0]], [[2, 0, 1], [2, 3, 1]], [[2, 0, 2], [2, 3, 0]], [[2, 0, 3], [0, 7, 0]], [[2, 0, 4], [1, 6, 1]], [[3, 0, 3], [1, 6, 0]], [[3, 0, 2], [0, 8, 0]], [[3, 0, 1], [0, 9, 1]], [[3, 0, 0], [0, 9, 0]], [[3, 0, 1], [0, 9, 1]], [[3, 0, 2], [0, 10, 1]], [[3, 0, 3], [0, 10, 0]], [[3, 0, 4], [2, 7, 1]], [[4, 0, 4], [2, 7, 0]], [[4, 0, 3], [0, 11, 0]], [[4, 0, 2], [1, 10, 1]], [[4, 0, 1], [1, 10, 0]], [[4, 0, 0], [0, 12, 0]], [[4, 0, 1], [0, 13, 1]], [[4, 0, 2], [0, 13, 0]], [[4, 0, 3], [0, 13, 1]], [[4, 0, 4], [0, 14, 1]], [[5, 0, 3], [0, 14, 0]], [[5, 0, 2], [2, 11, 1]], [[5, 0, 1], [2, 11, 0]], [[5, 0, 0], [0, 15, 0]], [[5, 0, 1], [1, 14, 1]], [[5, 0, 2], [1, 14, 0]], [[5, 0, 3], [0, 16, 0]], [[5, 0, 4], [0, 17, 1]], [[6, 0, 3], [0, 17, 0]], [[6, 0, 2], [0, 17, 1]], [[6, 0, 1], [0, 18, 1]], [[6, 0, 0], [0, 18, 0]], [[6, 0, 1], [2, 15, 1]], [[6, 0, 2], [2, 15, 0]], [[6, 0, 3], [0, 19, 0]], [[6, 0, 4], [1, 18, 1]], [[7, 0, 3], [1, 18, 0]], [[7, 0, 2], [0, 20, 0]], [[7, 0, 1], [0, 21, 1]], [[7, 0, 0], [0, 21, 0]], [[7, 0, 1], [0, 21, 1]], [[7, 0, 2], [0, 22, 1]], [[7, 0, 3], [0, 22, 0]], [[7, 0, 4], [2, 19, 1]], [[8, 0, 4], [2, 19, 0]], [[8, 0, 3], [0, 23, 0]], [[8, 0, 2], [1, 22, 1]], [[8, 0, 1], [1, 22, 0]], [[8, 0, 0], [0, 24, 0]], [[8, 0, 1], [0, 25, 1]], [[8, 0, 2], [0, 25, 0]], [[8, 0, 3], [0, 25, 1]], [[8, 0, 4], [0, 26, 1]], [[9, 0, 3], [0, 26, 0]], [[9, 0, 2], [2, 23, 1]], [[9, 0, 1], [2, 23, 0]], [[9, 0, 0], [0, 27, 0]], [[9, 0, 1], [1, 26, 1]], [[9, 0, 2], [1, 26, 0]], [[9, 0, 3], [0, 28, 0]], [[9, 0, 4], [0, 29, 1]], [[10, 0, 3], [0, 29, 0]], [[10, 0, 2], [0, 29, 1]], [[10, 0, 1], [0, 30, 1]], [[10, 0, 0], [0, 30, 0]], [[10, 0, 1], [2, 27, 1]], [[10, 0, 2], [2, 27, 0]], [[10, 0, 3], [0, 31, 0]], [[10, 0, 4], [1, 30, 1]], [[11, 0, 3], [1, 30, 0]], [[11, 0, 2], [4, 24, 0]], [[11, 0, 1], [1, 31, 1]], [[11, 0, 0], [1, 31, 0]], [[11, 0, 1], [1, 31, 1]], [[11, 0, 2], [2, 30, 1]], [[11, 0, 3], [2, 30, 0]], [[11, 0, 4], [2, 31, 1]], [[12, 0, 4], [2, 31, 0]], [[12, 0, 3], [4, 27, 0]], [[12, 0, 2], [3, 30, 1]], [[12, 0, 1], [3, 30, 0]], [[12, 0, 0], [4, 28, 0]], [[12, 0, 1], [3, 31, 1]], [[12, 0, 2], [3, 31, 0]], [[12, 0, 3], [3, 31, 1]], [[12, 0, 4], [4, 30, 1]], [[13, 0, 3], [4, 30, 0]], [[13, 0, 2], [6, 27, 1]], [[13, 0, 1], [6, 27, 0]], [[13, 0, 0], [4, 31, 0]], [[13, 0, 1], [5, 30, 1]], [[13, 0, 2], [5, 30, 0]], [[13, 0, 3], [8, 24, 0]], [[13, 0, 4], [5, 31, 1]], [[14, 0, 3], [5, 31, 0]], [[14, 0, 2], [5, 31, 1]], [[14, 0, 1], [6, 30, 1]], [[14, 0, 0], [6, 30, 0]], [[14, 0, 1], [6, 31, 1]], [[14, 0, 2], [6, 31, 0]], [[14, 0, 3], [8, 27, 0]], [[14, 0, 4], [7, 30, 1]], [[15, 0, 3], [7, 30, 0]], [[15, 0, 2], [8, 28, 0]], [[15, 0, 1], [7, 31, 1]], [[15, 0, 0], [7, 31, 0]], [[15, 0, 1], [7, 31, 1]], [[15, 0, 2], [8, 30, 1]], [[15, 0, 3], [8, 30, 0]], [[15, 0, 4], [10, 27, 1]], [[16, 0, 4], [10, 27, 0]], [[16, 0, 3], [8, 31, 0]], [[16, 0, 2], [9, 30, 1]], [[16, 0, 1], [9, 30, 0]], [[16, 0, 0], [12, 24, 0]], [[16, 0, 1], [9, 31, 1]], [[16, 0, 2], [9, 31, 0]], [[16, 0, 3], [9, 31, 1]], [[16, 0, 4], [10, 30, 1]], [[17, 0, 3], [10, 30, 0]], [[17, 0, 2], [10, 31, 1]], [[17, 0, 1], [10, 31, 0]], [[17, 0, 0], [12, 27, 0]], [[17, 0, 1], [11, 30, 1]], [[17, 0, 2], [11, 30, 0]], [[17, 0, 3], [12, 28, 0]], [[17, 0, 4], [11, 31, 1]], [[18, 0, 3], [11, 31, 0]], [[18, 0, 2], [11, 31, 1]], [[18, 0, 1], [12, 30, 1]], [[18, 0, 0], [12, 30, 0]], [[18, 0, 1], [14, 27, 1]], [[18, 0, 2], [14, 27, 0]], [[18, 0, 3], [12, 31, 0]], [[18, 0, 4], [13, 30, 1]], [[19, 0, 3], [13, 30, 0]], [[19, 0, 2], [16, 24, 0]], [[19, 0, 1], [13, 31, 1]], [[19, 0, 0], [13, 31, 0]], [[19, 0, 1], [13, 31, 1]], [[19, 0, 2], [14, 30, 1]], [[19, 0, 3], [14, 30, 0]], [[19, 0, 4], [14, 31, 1]], [[20, 0, 4], [14, 31, 0]], [[20, 0, 3], [16, 27, 0]], [[20, 0, 2], [15, 30, 1]], [[20, 0, 1], [15, 30, 0]], [[20, 0, 0], [16, 28, 0]], [[20, 0, 1], [15, 31, 1]], [[20, 0, 2], [15, 31, 0]], [[20, 0, 3], [15, 31, 1]], [[20, 0, 4], [16, 30, 1]], [[21, 0, 3], [16, 30, 0]], [[21, 0, 2], [18, 27, 1]], [[21, 0, 1], [18, 27, 0]], [[21, 0, 0], [16, 31, 0]], [[21, 0, 1], [17, 30, 1]], [[21, 0, 2], [17, 30, 0]], [[21, 0, 3], [20, 24, 0]], [[21, 0, 4], [17, 31, 1]], [[22, 0, 3], [17, 31, 0]], [[22, 0, 2], [17, 31, 1]], [[22, 0, 1], [18, 30, 1]], [[22, 0, 0], [18, 30, 0]], [[22, 0, 1], [18, 31, 1]], [[22, 0, 2], [18, 31, 0]], [[22, 0, 3], [20, 27, 0]], [[22, 0, 4], [19, 30, 1]], [[23, 0, 3], [19, 30, 0]], [[23, 0, 2], [20, 28, 0]], [[23, 0, 1], [19, 31, 1]], [[23, 0, 0], [19, 31, 0]], [[23, 0, 1], [19, 31, 1]], [[23, 0, 2], [20, 30, 1]], [[23, 0, 3], [20, 30, 0]], [[23, 0, 4], [22, 27, 1]], [[24, 0, 4], [22, 27, 0]], [[24, 0, 3], [20, 31, 0]], [[24, 0, 2], [21, 30, 1]], [[24, 0, 1], [21, 30, 0]], [[24, 0, 0], [24, 24, 0]], [[24, 0, 1], [21, 31, 1]], [[24, 0, 2], [21, 31, 0]], [[24, 0, 3], [21, 31, 1]], [[24, 0, 4], [22, 30, 1]], [[25, 0, 3], [22, 30, 0]], [[25, 0, 2], [22, 31, 1]], [[25, 0, 1], [22, 31, 0]], [[25, 0, 0], [24, 27, 0]], [[25, 0, 1], [23, 30, 1]], [[25, 0, 2], [23, 30, 0]], [[25, 0, 3], [24, 28, 0]], [[25, 0, 4], [23, 31, 1]], [[26, 0, 3], [23, 31, 0]], [[26, 0, 2], [23, 31, 1]], [[26, 0, 1], [24, 30, 1]], [[26, 0, 0], [24, 30, 0]], [[26, 0, 1], [26, 27, 1]], [[26, 0, 2], [26, 27, 0]], [[26, 0, 3], [24, 31, 0]], [[26, 0, 4], [25, 30, 1]], [[27, 0, 3], [25, 30, 0]], [[27, 0, 2], [28, 24, 0]], [[27, 0, 1], [25, 31, 1]], [[27, 0, 0], [25, 31, 0]], [[27, 0, 1], [25, 31, 1]], [[27, 0, 2], [26, 30, 1]], [[27, 0, 3], [26, 30, 0]], [[27, 0, 4], [26, 31, 1]], [[28, 0, 4], [26, 31, 0]], [[28, 0, 3], [28, 27, 0]], [[28, 0, 2], [27, 30, 1]], [[28, 0, 1], [27, 30, 0]], [[28, 0, 0], [28, 28, 0]], [[28, 0, 1], [27, 31, 1]], [[28, 0, 2], [27, 31, 0]], [[28, 0, 3], [27, 31, 1]], [[28, 0, 4], [28, 30, 1]], [[29, 0, 3], [28, 30, 0]], [[29, 0, 2], [30, 27, 1]], [[29, 0, 1], [30, 27, 0]], [[29, 0, 0], [28, 31, 0]], [[29, 0, 1], [29, 30, 1]], [[29, 0, 2], [29, 30, 0]], [[29, 0, 3], [29, 30, 1]], [[29, 0, 4], [29, 31, 1]], [[30, 0, 3], [29, 31, 0]], [[30, 0, 2], [29, 31, 1]], [[30, 0, 1], [30, 30, 1]], [[30, 0, 0], [30, 30, 0]], [[30, 0, 1], [30, 31, 1]], [[30, 0, 2], [30, 31, 0]], [[30, 0, 3], [30, 31, 1]], [[30, 0, 4], [31, 30, 1]], [[31, 0, 3], [31, 30, 0]], [[31, 0, 2], [31, 30, 1]], [[31, 0, 1], [31, 31, 1]], [[31, 0, 0], [31, 31, 0]]];
const lookup_6_4 = [[[0, 0, 0], [0, 0, 0]], [[0, 0, 1], [0, 1, 0]], [[0, 0, 2], [0, 2, 0]], [[1, 0, 1], [0, 3, 1]], [[1, 0, 0], [0, 3, 0]], [[1, 0, 1], [0, 4, 0]], [[1, 0, 2], [0, 5, 0]], [[2, 0, 1], [0, 6, 1]], [[2, 0, 0], [0, 6, 0]], [[2, 0, 1], [0, 7, 0]], [[2, 0, 2], [0, 8, 0]], [[3, 0, 1], [0, 9, 1]], [[3, 0, 0], [0, 9, 0]], [[3, 0, 1], [0, 10, 0]], [[3, 0, 2], [0, 11, 0]], [[4, 0, 1], [0, 12, 1]], [[4, 0, 0], [0, 12, 0]], [[4, 0, 1], [0, 13, 0]], [[4, 0, 2], [0, 14, 0]], [[5, 0, 1], [0, 15, 1]], [[5, 0, 0], [0, 15, 0]], [[5, 0, 1], [0, 16, 0]], [[5, 0, 2], [1, 15, 0]], [[6, 0, 1], [0, 17, 0]], [[6, 0, 0], [0, 18, 0]], [[6, 0, 1], [0, 19, 0]], [[6, 0, 2], [3, 14, 0]], [[7, 0, 1], [0, 20, 0]], [[7, 0, 0], [0, 21, 0]], [[7, 0, 1], [0, 22, 0]], [[7, 0, 2], [4, 15, 0]], [[8, 0, 1], [0, 23, 0]], [[8, 0, 0], [0, 24, 0]], [[8, 0, 1], [0, 25, 0]], [[8, 0, 2], [6, 14, 0]], [[9, 0, 1], [0, 26, 0]], [[9, 0, 0], [0, 27, 0]], [[9, 0, 1], [0, 28, 0]], [[9, 0, 2], [7, 15, 0]], [[10, 0, 1], [0, 29, 0]], [[10, 0, 0], [0, 30, 0]], [[10, 0, 1], [0, 31, 0]], [[10, 0, 2], [9, 14, 0]], [[11, 0, 1], [0, 32, 0]], [[11, 0, 0], [0, 33, 0]], [[11, 0, 1], [2, 30, 0]], [[11, 0, 2], [0, 34, 0]], [[12, 0, 1], [0, 35, 0]], [[12, 0, 0], [0, 36, 0]], [[12, 0, 1], [3, 31, 0]], [[12, 0, 2], [0, 37, 0]], [[13, 0, 1], [0, 38, 0]], [[13, 0, 0], [0, 39, 0]], [[13, 0, 1], [5, 30, 0]], [[13, 0, 2], [0, 40, 0]], [[14, 0, 1], [0, 41, 0]], [[14, 0, 0], [0, 42, 0]], [[14, 0, 1], [6, 31, 0]], [[14, 0, 2], [0, 43, 0]], [[15, 0, 1], [0, 44, 0]], [[15, 0, 0], [0, 45, 0]], [[15, 0, 1], [8, 30, 0]], [[15, 0, 2], [0, 46, 0]], [[16, 0, 2], [0, 47, 0]], [[16, 0, 1], [1, 46, 0]], [[16, 0, 0], [0, 48, 0]], [[16, 0, 1], [0, 49, 0]], [[16, 0, 2], [0, 50, 0]], [[17, 0, 1], [2, 47, 0]], [[17, 0, 0], [0, 51, 0]], [[17, 0, 1], [0, 52, 0]], [[17, 0, 2], [0, 53, 0]], [[18, 0, 1], [4, 46, 0]], [[18, 0, 0], [0, 54, 0]], [[18, 0, 1], [0, 55, 0]], [[18, 0, 2], [0, 56, 0]], [[19, 0, 1], [5, 47, 0]], [[19, 0, 0], [0, 57, 0]], [[19, 0, 1], [0, 58, 0]], [[19, 0, 2], [0, 59, 0]], [[20, 0, 1], [7, 46, 0]], [[20, 0, 0], [0, 60, 0]], [[20, 0, 1], [0, 61, 0]], [[20, 0, 2], [0, 62, 0]], [[21, 0, 1], [8, 47, 0]], [[21, 0, 0], [0, 63, 0]], [[21, 0, 1], [1, 62, 0]], [[21, 0, 2], [1, 63, 0]], [[22, 0, 1], [10, 46, 0]], [[22, 0, 0], [2, 62, 0]], [[22, 0, 1], [2, 63, 0]], [[22, 0, 2], [3, 62, 0]], [[23, 0, 1], [11, 47, 0]], [[23, 0, 0], [3, 63, 0]], [[23, 0, 1], [4, 62, 0]], [[23, 0, 2], [4, 63, 0]], [[24, 0, 1], [13, 46, 0]], [[24, 0, 0], [5, 62, 0]], [[24, 0, 1], [5, 63, 0]], [[24, 0, 2], [6, 62, 0]], [[25, 0, 1], [14, 47, 0]], [[25, 0, 0], [6, 63, 0]], [[25, 0, 1], [7, 62, 0]], [[25, 0, 2], [7, 63, 0]], [[26, 0, 1], [16, 45, 0]], [[26, 0, 0], [8, 62, 0]], [[26, 0, 1], [8, 63, 0]], [[26, 0, 2], [9, 62, 0]], [[27, 0, 1], [16, 48, 0]], [[27, 0, 0], [9, 63, 0]], [[27, 0, 1], [10, 62, 0]], [[27, 0, 2], [10, 63, 0]], [[28, 0, 1], [16, 51, 0]], [[28, 0, 0], [11, 62, 0]], [[28, 0, 1], [11, 63, 0]], [[28, 0, 2], [12, 62, 0]], [[29, 0, 1], [16, 54, 0]], [[29, 0, 0], [12, 63, 0]], [[29, 0, 1], [13, 62, 0]], [[29, 0, 2], [13, 63, 0]], [[30, 0, 1], [16, 57, 0]], [[30, 0, 0], [14, 62, 0]], [[30, 0, 1], [14, 63, 0]], [[30, 0, 2], [15, 62, 0]], [[31, 0, 1], [16, 60, 0]], [[31, 0, 0], [15, 63, 0]], [[31, 0, 1], [24, 46, 0]], [[31, 0, 2], [16, 62, 0]], [[32, 0, 2], [16, 63, 0]], [[32, 0, 1], [17, 62, 0]], [[32, 0, 0], [25, 47, 0]], [[32, 0, 1], [17, 63, 0]], [[32, 0, 2], [18, 62, 0]], [[33, 0, 1], [18, 63, 0]], [[33, 0, 0], [27, 46, 0]], [[33, 0, 1], [19, 62, 0]], [[33, 0, 2], [19, 63, 0]], [[34, 0, 1], [20, 62, 0]], [[34, 0, 0], [28, 47, 0]], [[34, 0, 1], [20, 63, 0]], [[34, 0, 2], [21, 62, 0]], [[35, 0, 1], [21, 63, 0]], [[35, 0, 0], [30, 46, 0]], [[35, 0, 1], [22, 62, 0]], [[35, 0, 2], [22, 63, 0]], [[36, 0, 1], [23, 62, 0]], [[36, 0, 0], [31, 47, 0]], [[36, 0, 1], [23, 63, 0]], [[36, 0, 2], [24, 62, 0]], [[37, 0, 1], [24, 63, 0]], [[37, 0, 0], [32, 47, 0]], [[37, 0, 1], [25, 62, 0]], [[37, 0, 2], [25, 63, 0]], [[38, 0, 1], [26, 62, 0]], [[38, 0, 0], [32, 50, 0]], [[38, 0, 1], [26, 63, 0]], [[38, 0, 2], [27, 62, 0]], [[39, 0, 1], [27, 63, 0]], [[39, 0, 0], [32, 53, 0]], [[39, 0, 1], [28, 62, 0]], [[39, 0, 2], [28, 63, 0]], [[40, 0, 1], [29, 62, 0]], [[40, 0, 0], [32, 56, 0]], [[40, 0, 1], [29, 63, 0]], [[40, 0, 2], [30, 62, 0]], [[41, 0, 1], [30, 63, 0]], [[41, 0, 0], [32, 59, 0]], [[41, 0, 1], [31, 62, 0]], [[41, 0, 2], [31, 63, 0]], [[42, 0, 1], [32, 61, 0]], [[42, 0, 0], [32, 62, 0]], [[42, 0, 1], [32, 63, 0]], [[42, 0, 2], [41, 46, 0]], [[43, 0, 1], [33, 62, 0]], [[43, 0, 0], [33, 63, 0]], [[43, 0, 1], [34, 62, 0]], [[43, 0, 2], [42, 47, 0]], [[44, 0, 1], [34, 63, 0]], [[44, 0, 0], [35, 62, 0]], [[44, 0, 1], [35, 63, 0]], [[44, 0, 2], [44, 46, 0]], [[45, 0, 1], [36, 62, 0]], [[45, 0, 0], [36, 63, 0]], [[45, 0, 1], [37, 62, 0]], [[45, 0, 2], [45, 47, 0]], [[46, 0, 1], [37, 63, 0]], [[46, 0, 0], [38, 62, 0]], [[46, 0, 1], [38, 63, 0]], [[46, 0, 2], [47, 46, 0]], [[47, 0, 1], [39, 62, 0]], [[47, 0, 0], [39, 63, 0]], [[47, 0, 1], [40, 62, 0]], [[47, 0, 2], [48, 46, 0]], [[48, 0, 2], [40, 63, 0]], [[48, 0, 1], [41, 62, 0]], [[48, 0, 0], [41, 63, 0]], [[48, 0, 1], [48, 49, 0]], [[48, 0, 2], [42, 62, 0]], [[49, 0, 1], [42, 63, 0]], [[49, 0, 0], [43, 62, 0]], [[49, 0, 1], [48, 52, 0]], [[49, 0, 2], [43, 63, 0]], [[50, 0, 1], [44, 62, 0]], [[50, 0, 0], [44, 63, 0]], [[50, 0, 1], [48, 55, 0]], [[50, 0, 2], [45, 62, 0]], [[51, 0, 1], [45, 63, 0]], [[51, 0, 0], [46, 62, 0]], [[51, 0, 1], [48, 58, 0]], [[51, 0, 2], [46, 63, 0]], [[52, 0, 1], [47, 62, 0]], [[52, 0, 0], [47, 63, 0]], [[52, 0, 1], [48, 61, 0]], [[52, 0, 2], [48, 62, 0]], [[53, 0, 1], [56, 47, 0]], [[53, 0, 0], [48, 63, 0]], [[53, 0, 1], [49, 62, 0]], [[53, 0, 2], [49, 63, 0]], [[54, 0, 1], [58, 46, 0]], [[54, 0, 0], [50, 62, 0]], [[54, 0, 1], [50, 63, 0]], [[54, 0, 2], [51, 62, 0]], [[55, 0, 1], [59, 47, 0]], [[55, 0, 0], [51, 63, 0]], [[55, 0, 1], [52, 62, 0]], [[55, 0, 2], [52, 63, 0]], [[56, 0, 1], [61, 46, 0]], [[56, 0, 0], [53, 62, 0]], [[56, 0, 1], [53, 63, 0]], [[56, 0, 2], [54, 62, 0]], [[57, 0, 1], [62, 47, 0]], [[57, 0, 0], [54, 63, 0]], [[57, 0, 1], [55, 62, 0]], [[57, 0, 2], [55, 63, 0]], [[58, 0, 1], [56, 62, 1]], [[58, 0, 0], [56, 62, 0]], [[58, 0, 1], [56, 63, 0]], [[58, 0, 2], [57, 62, 0]], [[59, 0, 1], [57, 63, 1]], [[59, 0, 0], [57, 63, 0]], [[59, 0, 1], [58, 62, 0]], [[59, 0, 2], [58, 63, 0]], [[60, 0, 1], [59, 62, 1]], [[60, 0, 0], [59, 62, 0]], [[60, 0, 1], [59, 63, 0]], [[60, 0, 2], [60, 62, 0]], [[61, 0, 1], [60, 63, 1]], [[61, 0, 0], [60, 63, 0]], [[61, 0, 1], [61, 62, 0]], [[61, 0, 2], [61, 63, 0]], [[62, 0, 1], [62, 62, 1]], [[62, 0, 0], [62, 62, 0]], [[62, 0, 1], [62, 63, 0]], [[62, 0, 2], [63, 62, 0]], [[63, 0, 1], [63, 63, 1]], [[63, 0, 0], [63, 63, 0]]];

function floatToInt(value, limit) {
	const integer = parseInt(value + 0.5);
	if (integer < 0) return 0;
	if (integer > limit) return integer;
	return integer;
}
function floatTo565(color) {
	const r = floatToInt(31.0 * color.x, 31);
	const g = floatToInt(63.0 * color.y, 63);
	const b = floatToInt(31.0 * color.z, 31);
	return r << 11 | g << 5 | b;
}
function writeColourBlock(firstColor, secondColor, indices, result, blockOffset) {
	result[blockOffset + 0] = firstColor & 0xff;
	result[blockOffset + 1] = firstColor >> 8;
	result[blockOffset + 2] = secondColor & 0xff;
	result[blockOffset + 3] = secondColor >> 8;
	for (let y = 0; y < 4; y++) {
		result[blockOffset + 4 + y] = indices[4 * y + 0] | indices[4 * y + 1] << 2 | indices[4 * y + 2] << 4 | indices[4 * y + 3] << 6;
	}
}
function writeColourBlock3(start, end, indices, result, blockOffset) {
	let firstColor = floatTo565(start);
	let secondColor = floatTo565(end);
	let remapped;
	if (firstColor <= secondColor) {
		remapped = indices.slice();
	} else {
		[firstColor, secondColor] = [secondColor, firstColor];
		remapped = indices.map(index => index === 0 ? 1 : index === 1 ? 0 : index);
	}
	writeColourBlock(firstColor, secondColor, remapped, result, blockOffset);
}
function writeColourBlock4(start, end, indices, result, blockOffset) {
	let firstColor = floatTo565(start);
	let secondColor = floatTo565(end);
	let remapped;
	if (firstColor < secondColor) {
		[firstColor, secondColor] = [secondColor, firstColor];
		remapped = indices.map(index => (index ^ 0x1) & 0x3);
	} else if (firstColor == secondColor) {
		remapped = new Array(16).fill(0);
	} else {
		remapped = indices.slice();
	}
	writeColourBlock(firstColor, secondColor, remapped, result, blockOffset);
}

class ColorSet {
	constructor(rgba, mask, flags) {
		this.flags = flags;
		this._count = 0;
		this._transparent = false;
		this._remap = [];
		this._weights = [];
		this._points = [];
		const isDxt1 = (this.flags & kDxt1) != 0;
		const weightByAlpha = (this.flags & kWeightColourByAlpha) != 0;
		for (let i = 0; i < 16; i++) {
			const bit = 1 << i;
			if ((mask & bit) == 0) {
				this._remap[i] = -1;
				continue;
			}
			if (isDxt1 && rgba[4 * i + 3] < 128) {
				this._remap[i] = -1;
				this._transparent = true;
				continue;
			}
			for (let j = 0;; j++) {
				if (j == i) {
					const r = rgba[4 * i] / 255.0;
					const g = rgba[4 * i + 1] / 255.0;
					const b = rgba[4 * i + 2] / 255.0;
					const a = (rgba[4 * i + 3] + 1) / 256.0;
					this._points[this._count] = new Vec3(r, g, b);
					this._weights[this._count] = weightByAlpha ? a : 1.0;
					this._remap[i] = this._count;
					this._count++;
					break;
				}
				const oldbit = 1 << j;
				const match = (mask & oldbit) != 0 && rgba[4 * i] == rgba[4 * j] && rgba[4 * i + 1] == rgba[4 * j + 1] && rgba[4 * i + 2] == rgba[4 * j + 2] && (rgba[4 * j + 3] >= 128 || !isDxt1);
				if (match) {
					const index = this._remap[j];
					const w = (rgba[4 * i + 3] + 1) / 256.0;
					this._weights[index] += weightByAlpha ? w : 1.0;
					this._remap[i] = index;
					break;
				}
			}
		}
		for (let i = 0; i < this._count; ++i) this._weights[i] = Math.sqrt(this._weights[i]);
	}
	get transparent() {
		return this._transparent;
	}
	get count() {
		return this._count;
	}
	get points() {
		return Object.freeze(this._points.slice());
	}
	get weights() {
		return Object.freeze(this._weights.slice());
	}
	remapIndicesSingle(singleIndex, target) {
		const result = this._remap.map(index => index === -1 ? 3 : singleIndex);
		target.forEach((_, i) => target[i] = result[i]);
	}
	remapIndices(indexMap, target) {
		const result = this._remap.map(index => index === -1 ? 3 : indexMap[index]);
		target.forEach((_, i) => target[i] = result[i]);
	}
}
class ColorFit {
	constructor(colorSet) {
		this.colors = colorSet;
		this.flags = colorSet.flags;
	}
	compress(result, offset) {
		const isDxt1 = (this.flags & kDxt1) != 0;
		if (isDxt1) {
			this.compress3(result, offset);
			if (!this.colors.transparent) this.compress4(result, offset);
		} else this.compress4(result, offset);
	}
	compress3(result, offset) {}
	compress4(result, offset) {}
}
class SingleColourFit extends ColorFit {
	constructor(colorSet) {
		super(colorSet);
		const singleColor = colorSet.points[0];
		this.color = singleColor.colorInt;
		this.start = new Vec3(0);
		this.end = new Vec3(0);
		this.index = 0;
		this.error = Infinity;
		this.bestError = Infinity;
	}
	compressBase(lookups, saveFunc) {
		this.computeEndPoints(lookups);
		if (this.error < this.bestError) {
			const indices = new Uint8Array(16);
			this.colors.remapIndicesSingle(this.index, indices);
			saveFunc(this.start, this.end, indices);
			this.bestError = this.error;
		}
	}
	compress3(result, offset) {
		const lookups = [lookup_5_3, lookup_6_3, lookup_5_3];
		const saveFunc = (start, end, indices) => writeColourBlock3(start, end, indices, result, offset);
		this.compressBase(lookups, saveFunc);
	}
	compress4(result, offset) {
		const lookups = [lookup_5_4, lookup_6_4, lookup_5_4];
		const saveFunc = (start, end, indices) => writeColourBlock4(start, end, indices, result, offset);
		this.compressBase(lookups, saveFunc);
	}
	computeEndPoints(lookups) {
		this.error = Infinity;
		for (let index = 0; index < 2; index++) {
			const sources = [];
			let error = 0;
			for (let channel = 0; channel < 3; channel++) {
				const lookup = lookups[channel];
				const target = this.color[channel];
				sources[channel] = lookup[target][index];
				const diff = sources[channel][2];
				error += diff * diff;
			}
			if (error < this.error) {
				this.start = new Vec3(sources[0][0] / 31.0, sources[1][0] / 63.0, sources[2][0] / 31.0);
				this.end = new Vec3(sources[0][1] / 31.0, sources[1][1] / 63.0, sources[2][1] / 31.0);
				this.index = 2 * index;
				this.error = error;
			}
		}
	}
}
class RangeFit extends ColorFit {
	constructor(colorSet) {
		super(colorSet);
		this.metric = new Vec3(1);
		if ((this.flags & kColourMetricPerceptual) !== 0) {
			this.metric.set(0.2126, 0.7152, 0.0722);
		}
		this.start = new Vec3(0);
		this.end = new Vec3(0);
		this.bestError = Infinity;
		this.computePoints();
	}
	compressBase(codes, saveFunc) {
		const {
			points: values
		} = this.colors;
		let error = 0;
		const closest = values.map(color => {
			let minDist = Infinity;
			const packedIndex = codes.reduce((idx, code, j) => {
				const dist = Vec3.sub(color, code).multVector(this.metric).lengthSq;
				if (dist >= minDist) return idx;
				minDist = dist;
				return j;
			}, 0);
			error += minDist;
			return packedIndex;
		});
		if (error < this.bestError) {
			let indices = new Uint8Array(16);
			this.colors.remapIndices(closest, indices);
			saveFunc(this.start, this.end, indices);
			this.bestError = error;
		}
	}
	compress3(result, offset) {
		const codes = [this.start.clone(), this.end.clone(), Vec3.interpolate(this.start, this.end, 0.5)];
		const saveFunc = (start, end, indices) => writeColourBlock3(start, end, indices, result, offset);
		this.compressBase(codes, saveFunc);
	}
	compress4(result, offset) {
		const codes = [this.start.clone(), this.end.clone(), Vec3.interpolate(this.start, this.end, 1 / 3), Vec3.interpolate(this.start, this.end, 2 / 3)];
		const saveFunc = (start, end, indices) => writeColourBlock4(start, end, indices, result, offset);
		this.compressBase(codes, saveFunc);
	}
	computePoints() {
		const {
			count,
			points: values,
			weights
		} = this.colors;
		if (count <= 0) return;
		const principle = computePCA(values, weights);
		let start, end, min, max;
		start = end = values[0];
		min = max = Vec3.dot(start, principle);
		for (let i = 1; i < count; i++) {
			let value = Vec3.dot(values[i], principle);
			if (value < min) {
				start = values[i];
				min = value;
			} else if (value > max) {
				end = values[i];
				max = value;
			}
		}
		this.start = start.clampGrid().clone();
		this.end = end.clampGrid().clone();
	}
}
class ClusterFit extends ColorFit {
	constructor(colorSet) {
		super(colorSet);
		const kMaxIterations = 8;
		this.iterationCount = colorSet.flags & kColourIterativeClusterFit ? kMaxIterations : 1;
		this.bestError = Infinity;
		this.metric = new Vec4(1);
		if ((this.flags & kColourMetricPerceptual) !== 0) {
			this.metric.set(0.2126, 0.7152, 0.0722, 0);
		}
		const {
			points: values,
			weights
		} = this.colors;
		this.principle = computePCA(values, weights);
		this.order = new Uint8Array(16 * kMaxIterations);
		this.pointsWeights = [];
		this.xSum_wSum = new Vec4(0);
	}
	constructOrdering(axis, iteration) {
		const currentOrder = this.makeOrder(axis);
		this.copyOrderToThisOrder(currentOrder, iteration);
		const uniqueOrder = this.checkOrderUnique(currentOrder, iteration);
		if (!uniqueOrder) return false;
		this.copyOrderWeight(currentOrder);
		return true;
	}
	compress3(result, offset) {
		const aabbx = _ref => {
			let [part0,, part1, part2] = _ref;
			const const1_2 = new Vec4(1 / 2, 1 / 2, 1 / 2, 1 / 4);
			const alphax_sum = Vec4.multiplyAdd(part1, const1_2, part0);
			const alpha2_sum = alphax_sum.splatW;
			const betax_sum = Vec4.multiplyAdd(part1, const1_2, part2);
			const beta2_sum = betax_sum.splatW;
			const alphabeta_sum = Vec4.multVector(part1, const1_2).splatW;
			return {
				ax: alphax_sum,
				aa: alpha2_sum,
				bx: betax_sum,
				bb: beta2_sum,
				ab: alphabeta_sum
			};
		};
		const saveFunc = (start, end, indices) => writeColourBlock3(start, end, indices, result, offset);
		this.compressBase(aabbx, saveFunc, 2);
	}
	compress4(result, offset) {
		const aabbx = _ref2 => {
			let [part0, part1, part2, part3] = _ref2;
			const const1_3 = new Vec4(1 / 3, 1 / 3, 1 / 3, 1 / 9);
			const const2_3 = new Vec4(2 / 3, 2 / 3, 2 / 3, 4 / 9);
			const const2_9 = new Vec4(2 / 9);
			const alphax_sum = Vec4.multiplyAdd(part2, const1_3, Vec4.multiplyAdd(part1, const2_3, part0));
			const alpha2_sum = alphax_sum.splatW;
			const betax_sum = Vec4.multiplyAdd(part1, const1_3, Vec4.multiplyAdd(part2, const2_3, part3));
			const beta2_sum = betax_sum.splatW;
			const alphabeta_sum = Vec4.multVector(const2_9, Vec4.add(part1, part2)).splatW;
			return {
				ax: alphax_sum,
				aa: alpha2_sum,
				bx: betax_sum,
				bb: beta2_sum,
				ab: alphabeta_sum
			};
		};
		const saveFunc = (start, end, indices) => writeColourBlock4(start, end, indices, result, offset);
		this.compressBase(aabbx, saveFunc, 3);
	}
	compressBase(aabbFunc, saveFunc) {
		let repeater = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
		this.constructOrdering(this.principle, 0);
		let best = {
			start: new Vec4(0),
			end: new Vec4(0),
			error: this.bestError,
			iteration: 0,
			bestI: 0,
			bestJ: 0
		};
		if (repeater === 3) best.bestK = 0;
		const leastSquares = (parts, internalIndices) => {
			const aabbx = aabbFunc(parts);
			const internalBest = this.computeOptimalPoints(aabbx);
			if (internalBest.error < best.error) {
				best = _objectSpread2(_objectSpread2({}, internalBest), internalIndices);
				return true;
			}
			return false;
		};
		for (let iterationIndex = 0;;) {
			this.clusterIterate(iterationIndex, leastSquares, repeater);
			if (best.iteration != iterationIndex) break;
			iterationIndex++;
			if (iterationIndex == this.iterationCount) break;
			const newAxis = Vec4.sub(best.end, best.start).xyz;
			if (!this.constructOrdering(newAxis, iterationIndex)) break;
		}
		if (best.error < this.bestError) this.saveBlock(best, saveFunc);
	}
	makeOrder(axis) {
		const {
			count,
			points: values
		} = this.colors;
		const dotProducts = values.map((color, i) => Vec3.dot(color, axis));
		return Array.from({
			length: count
		}, (_, i) => i).sort((a, b) => {
			if (dotProducts[a] - dotProducts[b] != 0) return dotProducts[a] - dotProducts[b];
			return a - b;
		});
	}
	copyOrderToThisOrder(order, iteration) {
		const orderOffset = iteration * 16;
		order.forEach((ord, i) => {
			this.order[orderOffset + i] = ord;
		});
	}
	checkOrderUnique(order, iteration) {
		const {
			count
		} = this.colors;
		for (let it = 0; it < iteration; it++) {
			let prevOffset = it * 16;
			let same = true;
			for (let i = 0; i < count; i++) {
				if (order[i] !== this.order[prevOffset + i]) {
					same = false;
					break;
				}
			}
			if (same) return false;
		}
		return true;
	}
	copyOrderWeight(order) {
		const {
			count,
			points: unweighted,
			weights
		} = this.colors;
		this.xSum_wSum.set(0);
		for (let i = 0; i < count; i++) {
			const j = order[i];
			const p = unweighted[j].toVec4(1);
			const w = new Vec4(weights[j]);
			const x = Vec4.multVector(p, w);
			this.pointsWeights[i] = x;
			this.xSum_wSum.addVector(x);
		}
	}
	computeOptimalPoints(vectorPoint) {
		const {
			ax,
			bx,
			aa,
			bb,
			ab
		} = vectorPoint;
		const factor = Vec4.negativeMultiplySubtract(ab, ab, Vec4.multVector(aa, bb)).reciprocal();
		let a = Vec4.negativeMultiplySubtract(bx, ab, Vec4.multVector(ax, bb)).multVector(factor);
		let b = Vec4.negativeMultiplySubtract(ax, ab, Vec4.multVector(bx, aa)).multVector(factor);
		a.clampGrid();
		b.clampGrid();
		let error = this.computeError(_objectSpread2({
			a,
			b
		}, vectorPoint));
		return {
			start: a,
			end: b,
			error
		};
	}
	computeError(_ref3) {
		let {
			a,
			b,
			ax,
			bx,
			aa,
			bb,
			ab
		} = _ref3;
		const two = new Vec4(2);
		const e1 = Vec4.multiplyAdd(Vec4.multVector(a, a), aa, Vec4.multVector(b, b).multVector(bb));
		const e2 = Vec4.negativeMultiplySubtract(a, ax, Vec4.multVector(a, b).multVector(ab));
		const e3 = Vec4.negativeMultiplySubtract(b, bx, e2);
		const e4 = Vec4.multiplyAdd(two, e3, e1);
		const e5 = Vec4.multVector(e4, this.metric);
		return e5.x + e5.y + e5.z;
	}
	saveBlock(best, writeFunc) {
		const {
			count
		} = this.colors;
		const {
			start,
			end,
			iteration,
			error,
			bestI,
			bestJ,
			bestK = -1
		} = best;
		const orderOffset = iteration * 16;
		const unordered = new Uint8Array(16);
		const mapper = m => {
			if (m < bestI) return 0;
			if (m < bestJ) return 2;
			if (m < bestK) return 3;
			return 1;
		};
		for (let i = 0; i < count; i++) {
			unordered[this.order[orderOffset + i]] = mapper(i);
		}
		const bestIndices = new Uint8Array(16);
		this.colors.remapIndices(unordered, bestIndices);
		writeFunc(start.xyz, end.xyz, bestIndices);
		this.bestError = error;
	}
	clusterIterate(index, func) {
		let iterCount = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;
		const {
			count
		} = this.colors;
		const indexMapper = (i, j, k) => {
			const mapper = {
				bestI: i,
				bestJ: iterCount === 2 ? k : j,
				iteration: index
			};
			if (iterCount === 3) mapper.bestK = k;
			return mapper;
		};
		let part0 = new Vec4(0.0);
		for (let i = 0; i < count; i++) {
			let part1 = new Vec4(0.0);
			for (let j = i;;) {
				let preLastPart = j == 0 ? this.pointsWeights[0].clone() : new Vec4(0.0);
				const kmin = j == 0 ? 1 : j;
				for (let k = kmin;;) {
					const restPart = Vec4.sub(this.xSum_wSum, preLastPart).subVector(part1).subVector(part0);
					func([part0, part1, preLastPart, restPart], indexMapper(i, j, k));
					if (k == count) break;
					preLastPart.addVector(this.pointsWeights[k]);
					k++;
				}
				if (iterCount === 2) break;
				if (j === count) break;
				part1.addVector(this.pointsWeights[j]);
				j++;
			}
			part0.addVector(this.pointsWeights[i]);
		}
	}
}

function quantise(alpha) {
	const GRID = 15;
	let result = Math.floor(alpha * (GRID / 255) + 0.5);
	if (result < 0) return 0;
	if (result > GRID) return GRID;
	return result;
}
function compressAlphaDxt3(rgba, mask, result, offset) {
	for (let i = 0; i < 8; i++) {
		let quant1 = quantise(rgba[8 * i + 3]);
		let quant2 = quantise(rgba[8 * i + 7]);
		const bit1 = 1 << 2 * i;
		const bit2 = 1 << 2 * i + 1;
		if ((mask & bit1) == 0) quant1 = 0;
		if ((mask & bit2) == 0) quant2 = 0;
		result[offset + i] = quant1 | quant2 << 4;
	}
}
function compressAlphaDxt5(rgba, mask, result, offset) {
	let step5 = interpolateAlpha(rgba, mask, 5);
	let step7 = interpolateAlpha(rgba, mask, 7);
	if (step5.error <= step7.error) writeAlphaBlock5(step5, result, offset);else writeAlphaBlock7(step7, result, offset);
}
function interpolateAlpha(rgba, mask, steps) {
	let {
		min,
		max
	} = setAlphaRange(rgba, mask, steps);
	let code = setAlphaCodeBook(min, max, steps);
	let indices = new Uint8Array(16);
	let error = fitCodes(rgba, mask, code, indices);
	return {
		min,
		max,
		indices,
		error
	};
}
function setAlphaRange(rgba, mask, steps) {
	let min = 255;
	let max = 0;
	for (let i = 0; i < 16; i++) {
		let bit = 1 << i;
		if ((mask & bit) == 0) continue;
		let value = rgba[4 * i + 3];
		if (steps === 5) {
			if (value !== 0 && value < min) min = value;
			if (value !== 255 && value > max) max = value;
		} else {
			if (value < min) min = value;
			if (value > max) max = value;
		}
	}
	if (min > max) min = max;
	if (max - min < steps) max = Math.min(min + steps, 255);
	if (max - min < steps) min = Math.max(max - steps, 0);
	return {
		min,
		max
	};
}
function setAlphaCodeBook(min, max, steps) {
	let codes = [min, max, ...Array.from({
		length: steps - 1
	}, (_, i) => {
		return Math.floor(((steps - (i + 1)) * min + (i + 1) * max) / steps);
	})];
	if (steps === 5) {
		codes[6] = 0;
		codes[7] = 255;
	}
	return codes;
}
function fitCodes(rgba, mask, codes, indices) {
	let err = 0;
	for (let i = 0; i < 16; ++i) {
		let bit = 1 << i;
		if ((mask & bit) == 0) {
			indices[i] = 0;
			continue;
		}
		let value = rgba[4 * i + 3];
		let least = Infinity;
		let index = 0;
		for (let j = 0; j < 8; ++j) {
			let dist = value - codes[j];
			dist *= dist;
			if (dist < least) {
				least = dist;
				index = j;
			}
		}
		indices[i] = index;
		err += least;
	}
	return err;
}
function writeAlphaBlock5(_ref, result, offset) {
	let {
		min: alpha0,
		max: alpha1,
		indices
	} = _ref;
	if (alpha0 > alpha1) {
		const swapped = indices.map(index => {
			if (index === 0) return 1;
			if (index === 1) return 0;
			if (index <= 5) return 7 - index;
			return index;
		});
		writeAlphaBlock(alpha1, alpha0, swapped, result, offset);
	} else writeAlphaBlock(alpha0, alpha1, indices, result, offset);
}
function writeAlphaBlock7(_ref2, result, offset) {
	let {
		min: alpha0,
		max: alpha1,
		indices
	} = _ref2;
	if (alpha0 > alpha1) {
		const swapped = indices.map(index => {
			if (index === 0) return 1;
			if (index === 1) return 0;
			return 9 - index;
		});
		writeAlphaBlock(alpha1, alpha0, swapped, result, offset);
	} else writeAlphaBlock(alpha0, alpha1, indices, result, offset);
}
function writeAlphaBlock(alpha0, alpha1, indices, result, offset) {
	result[offset] = alpha0;
	result[offset + 1] = alpha1;
	let indicesPointer = 0;
	let resultPointer = offset + 2;
	for (let i = 0; i < 2; i++) {
		let value = 0;
		for (let j = 0; j < 8; ++j) {
			let index = indices[indicesPointer];
			value |= index << 3 * j;
			indicesPointer++;
		}
		for (let j = 0; j < 3; ++j) {
			let byte = value >> 8 * j & 0xff;
			result[resultPointer] = byte;
			resultPointer++;
		}
	}
}

function unpack565(color16bit) {
	const red = color16bit >> 11 & 0x1f;
	const green = color16bit >> 5 & 0x3f;
	const blue = color16bit & 0x1f;
	return [red << 3 | red >> 2, green << 2 | green >> 4, blue << 3 | blue >> 2, 255];
}
function interpolateColorArray(a, b, amount) {
	const result = a.map((aColor, i) => Math.floor(aColor * (1 - amount) + b[i] * amount));
	result[3] = 255;
	return result;
}
function unpackColorCodes(block, offset, isDxt1) {
	const color1 = block[offset] | block[offset + 1] << 8;
	const color2 = block[offset + 2] | block[offset + 3] << 8;
	const unpackedColor1 = unpack565(color1);
	const unpackedColor2 = unpack565(color2);
	return [unpackedColor1, unpackedColor2, isDxt1 && color1 <= color2 ? interpolateColorArray(unpackedColor1, unpackedColor2, 1 / 2) : interpolateColorArray(unpackedColor1, unpackedColor2, 1 / 3), isDxt1 && color1 <= color2 ? [0, 0, 0, 0] : interpolateColorArray(unpackedColor1, unpackedColor2, 2 / 3)];
}
function unpackIndices(block, blockOffset) {
	let offset = blockOffset + 4;
	let result = new Uint8Array(16);
	for (let i = 0; i < 4; i++) {
		let packedIndices = block[offset + i];
		result[i * 4 + 0] = packedIndices & 0x3;
		result[i * 4 + 1] = packedIndices >> 2 & 0x3;
		result[i * 4 + 2] = packedIndices >> 4 & 0x3;
		result[i * 4 + 3] = packedIndices >> 6 & 0x3;
	}
	return result;
}
function decompressColor(rgba, block, offset, isDxt1) {
	const colorCode = unpackColorCodes(block, offset, isDxt1);
	const indices = unpackIndices(block, offset);
	for (let i = 0; i < 16; i++) {
		for (let j = 0; j < 4; j++) {
			rgba[4 * i + j] = colorCode[indices[i]][j];
		}
	}
}
function decompressAlphaDxt3(rgba, block, offset) {
	for (let i = 0; i < 8; ++i) {
		let quant = block[offset + i];
		let lo = quant & 0x0f;
		let hi = quant & 0xf0;
		rgba[8 * i + 3] = lo | lo << 4;
		rgba[8 * i + 7] = hi | hi >> 4;
	}
}
function decompressAlphaDxt5(rgba, block, offset) {
	let alpha0 = block[offset + 0];
	let alpha1 = block[offset + 1];
	let codes = setAlphaCodeBook(alpha0, alpha1, alpha0 <= alpha1 ? 5 : 7);
	let indices = new Uint8Array(16);
	let indicePointer = 0;
	let bytePointer = 2;
	for (let i = 0; i < 2; i++) {
		let value = 0;
		for (let j = 0; j < 3; j++) {
			let byte = block[offset + bytePointer];
			value |= byte << 8 * j;
			bytePointer++;
		}
		for (let j = 0; j < 8; j++) {
			let index = value >> 3 * j & 0x7;
			indices[indicePointer] = index;
			indicePointer++;
		}
	}
	for (let i = 0; i < 16; ++i) {
		rgba[4 * i + 3] = codes[indices[i]];
	}
}

/** @license
-----------------------------------------------------------------------------
	Copyright (c) 2006 Simon Brown													si@sjbrown.co.uk
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the 
	"Software"), to	deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to 
	permit persons to whom the Software is furnished to do so, subject to 
	the following conditions:
	The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
-------------------------------------------------------------------------- */
const DXT1_COMPRESSED_BYTES = 8;
const DXT5_COMPRESSED_BYTES = 16;
const COLORS = 4;
const DECOMPRESSED_BLOCK_SIZE = 16;
function blockRepeat(width, height, func) {
	for (let y = 0; y < height; y += 4) {
		for (let x = 0; x < width; x += 4) {
			func(x, y);
		}
	}
}
function rectRepeat(func) {
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			func(x, y);
		}
	}
}
function FixFlags(flags) {
	let method = flags & (kDxt1 | kDxt3 | kDxt5);
	let fit = flags & (kColourIterativeClusterFit | kColourClusterFit | kColourRangeFit);
	let metric = flags & (kColourMetricPerceptual | kColourMetricUniform);
	const extra = flags & kWeightColourByAlpha;
	if (method != kDxt3 && method != kDxt5) method = kDxt1;
	if (fit != kColourRangeFit && fit != kColourIterativeClusterFit) fit = kColourClusterFit;
	if (metric != kColourMetricUniform) metric = kColourMetricPerceptual;
	return method | fit | metric | extra;
}
function GetStorageRequirements(width, height, flags) {
	flags = FixFlags(flags);
	const blockcount = Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4);
	const blocksize = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	return blockcount * blocksize;
}
function extractColorBlock(img) {
	let {
		x = 0,
		y = 0,
		width = 0,
		height = 0
	} = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	const block = new Uint8Array(DECOMPRESSED_BLOCK_SIZE * COLORS);
	let mask = 0;
	let blockColorOffset = 0;
	rectRepeat(function (px, py) {
		let sx = x + px;
		let sy = y + py;
		if (sx < width && sy < height) {
			let sourceColorOffset = COLORS * (width * sy + sx);
			for (let i = 0; i < COLORS; i++) {
				block[blockColorOffset++] = img[sourceColorOffset++];
			}
			mask |= 1 << 4 * py + px;
		} else blockColorOffset += COLORS;
	});
	return {
		block,
		mask
	};
}
function copyBuffer(result, block) {
	let {
		x = 0,
		y = 0,
		width = 0,
		height = 0
	} = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	let blockColorOffset = 0;
	rectRepeat(function (px, py) {
		let sx = x + px;
		let sy = y + py;
		if (sx < width && sy < height) {
			let resultColorOffset = COLORS * (width * sy + sx);
			for (let i = 0; i < COLORS; i++) {
				result[resultColorOffset + i] = block[blockColorOffset++];
			}
		} else blockColorOffset += COLORS;
	});
}
function getCompressor(colorSet) {
	if (colorSet.count === 1) return new SingleColourFit(colorSet);
	if ((colorSet.flags & kColourRangeFit) != 0 || colorSet.count == 0) return new RangeFit(colorSet);
	return new ClusterFit(colorSet);
}
function CompressMasked(rgba, mask, result, offset, flags) {
	flags = FixFlags(flags);
	let colorOffset = (flags & (kDxt3 | kDxt5)) !== 0 ? 8 : 0;
	const colors = new ColorSet(rgba, mask, flags);
	const compressor = getCompressor(colors);
	compressor.compress(result, offset + colorOffset);
	if ((flags & kDxt3) !== 0) compressAlphaDxt3(rgba, mask, result, offset);else if ((flags & kDxt5) !== 0) compressAlphaDxt5(rgba, mask, result, offset);
}
function decompressBlock(result, block, offset, flags) {
	flags = FixFlags(flags);
	let colorOffset = (flags & (kDxt3 | kDxt5)) !== 0 ? 8 : 0;
	decompressColor(result, block, offset + colorOffset, (flags & kDxt1) !== 0);
	if ((flags & kDxt3) !== 0) decompressAlphaDxt3(result, block, offset);else if ((flags & kDxt5) !== 0) decompressAlphaDxt5(result, block, offset);
}
function compressImage(source, width, height, result, flags) {
	flags = FixFlags(flags);
	const bytesPerBlock = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	let targetBlockPointer = 0;
	blockRepeat(width, height, function (x, y) {
		const {
			block: sourceRGBA,
			mask
		} = extractColorBlock(source, {
			x,
			y,
			width,
			height
		});
		CompressMasked(sourceRGBA, mask, result, targetBlockPointer, flags);
		targetBlockPointer += bytesPerBlock;
	});
}
function decompressImage(result, width, height, source, flags) {
	flags = FixFlags(flags);
	const bytesPerBlock = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	let sourceBlockPointer = 0;
	for (let y = 0; y < height; y += 4) {
		for (let x = 0; x < width; x += 4) {
			const targetRGBA = new Uint8Array(DECOMPRESSED_BLOCK_SIZE * COLORS);
			decompressBlock(targetRGBA, source, sourceBlockPointer, flags);
			copyBuffer(result, targetRGBA, {
				x,
				y,
				width,
				height
			});
			sourceBlockPointer += bytesPerBlock;
		}
	}
}
const flags = {
	DXT1: kDxt1,
	DXT3: kDxt3,
	DXT5: kDxt5,
	ColourIterativeClusterFit: kColourIterativeClusterFit,
	ColourClusterFit: kColourClusterFit,
	ColourRangeFit: kColourRangeFit,
	ColourMetricPerceptual: kColourMetricPerceptual,
	ColourMetricUniform: kColourMetricUniform,
	WeightColourByAlpha: kWeightColourByAlpha
};
function compress(inputData, width, height, flags) {
	let source = inputData instanceof ArrayBuffer ? new Uint8Array(inputData) : inputData;
	const targetSize = GetStorageRequirements(width, height, flags);
	const result = new Uint8Array(targetSize);
	compressImage(source, width, height, result, flags);
	return result;
}
function decompress(inputData, width, height, flags) {
	let source = inputData instanceof ArrayBuffer ? new Uint8Array(inputData) : inputData;
	const targetSize = width * height * 4;
	const result = new Uint8Array(targetSize);
	decompressImage(result, width, height, source, flags);
	return result;
}

function extractBits(bitData, amount, offset) {
	return bitData >> offset & 2 ** amount - 1;
}
function colorToBgra5551(red, green, blue, alpha) {
	const r = Math.round(red / 255 * 31);
	const g = Math.round(green / 255 * 31);
	const b = Math.round(blue / 255 * 31);
	const a = Math.round(alpha / 255);
	return a << 15 | r << 10 | g << 5 | b;
}
function bgra5551ToColor(bgra5551) {
	const r = extractBits(bgra5551, 5, 10);
	const g = extractBits(bgra5551, 5, 5);
	const b = extractBits(bgra5551, 5, 0);
	const a = bgra5551 >> 15 & 1;
	const scaleUp = value => value << 3 | value >> 2;
	const [red, green, blue] = [r, g, b].map(scaleUp);
	return [red, green, blue, a * 255];
}
function convertTo5551(colorBuffer) {
	const colorArray = new Uint8Array(colorBuffer);
	const length = colorArray.length / 4;
	const convertedArray = new Uint8Array(length * 2);
	for (let i = 0; i < length; i++) {
		const red = colorArray[i * 4];
		const green = colorArray[i * 4 + 1];
		const blue = colorArray[i * 4 + 2];
		const alpha = colorArray[i * 4 + 3];
		const bgra5551 = colorToBgra5551(red, green, blue, alpha);
		convertedArray[i * 2] = bgra5551 & 0xff;
		convertedArray[i * 2 + 1] = bgra5551 >> 8;
	}
	return convertedArray;
}
function convertFrom5551(colorBuffer) {
	const colorArray = new Uint8Array(colorBuffer);
	const length = colorArray.length / 2;
	const convertedArray = new Uint8Array(length * 4);
	for (let i = 0; i < length; i++) {
		const colors = bgra5551ToColor(colorArray[i * 2] | colorArray[i * 2 + 1] << 8);
		[convertedArray[i * 4], convertedArray[i * 4 + 1], convertedArray[i * 4 + 2], convertedArray[i * 4 + 3]] = colors;
	}
	return convertedArray;
}

class Texture2DReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Texture2DReader':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const int32Reader = new Int32Reader();
		const uint32Reader = new UInt32Reader();
		let format = int32Reader.read(buffer);
		let width = uint32Reader.read(buffer);
		let height = uint32Reader.read(buffer);
		let mipCount = uint32Reader.read(buffer);
		let usedWidth = null;
		let usedHeight = null;
		if (mipCount > 1) console.warn("Found mipcount of ".concat(mipCount, ", only the first will be used."));
		let dataSize = uint32Reader.read(buffer);
		if (width * height * 4 > dataSize) {
			usedWidth = width >> 16 & 0xffff;
			width = width & 0xffff;
			usedHeight = height >> 16 & 0xffff;
			height = height & 0xffff;
			if (width * height * 4 !== dataSize) {
				console.warn("invalid width & height! ".concat(width, " x ").concat(height));
			}
		}
		let data = buffer.read(dataSize);
		if (format == 4) data = decompress(data, width, height, flags.DXT1);else if (format == 5) data = decompress(data, width, height, flags.DXT3);else if (format == 6) data = decompress(data, width, height, flags.DXT5);else if (format == 2) {
			data = convertFrom5551(data);
		} else if (format != 0) throw new Error("Non-implemented Texture2D format type (".concat(format, ") found."));
		if (data instanceof ArrayBuffer) data = new Uint8Array(data);
		for (let i = 0; i < data.length; i += 4) {
			let inverseAlpha = 255 / data[i + 3];
			data[i] = Math.min(Math.ceil(data[i] * inverseAlpha), 255);
			data[i + 1] = Math.min(Math.ceil(data[i + 1] * inverseAlpha), 255);
			data[i + 2] = Math.min(Math.ceil(data[i + 2] * inverseAlpha), 255);
		}
		const result = {
			format,
			export: {
				type: this.type,
				data,
				width,
				height
			}
		};
		if (usedWidth !== null) result.additional = {
			usedWidth,
			usedHeight
		};
		return result;
	}
	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const uint32Reader = new UInt32Reader();
		this.writeIndex(buffer, resolver);
		let width = content.export.width;
		let height = content.export.height;
		if (content.additional != null) {
			width = width | content.additional.usedWidth << 16;
			height = height | content.additional.usedHeight << 16;
		}
		int32Reader.write(buffer, content.format, null);
		uint32Reader.write(buffer, width, null);
		uint32Reader.write(buffer, height, null);
		uint32Reader.write(buffer, 1, null);
		let data = content.export.data;
		for (let i = 0; i < data.length; i += 4) {
			const alpha = data[i + 3] / 255;
			data[i] = Math.floor(data[i] * alpha);
			data[i + 1] = Math.floor(data[i + 1] * alpha);
			data[i + 2] = Math.floor(data[i + 2] * alpha);
		}
		if (content.format === 4) data = compress(data, width, height, flags.DXT1);else if (content.format === 5) data = compress(data, width, height, flags.DXT3);else if (content.format === 6) data = compress(data, width, height, flags.DXT5);else if (content.format === 2) data = convertTo5551(data);
		uint32Reader.write(buffer, data.length, null);
		buffer.concat(data);
	}
	isValueType() {
		return false;
	}
}

class Vector3Reader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Vector3Reader':
			case 'Microsoft.Xna.Framework.Vector3':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const singleReader = new SingleReader();
		let x = singleReader.read(buffer);
		let y = singleReader.read(buffer);
		let z = singleReader.read(buffer);
		return {
			x,
			y,
			z
		};
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const singleReader = new SingleReader();
		singleReader.write(buffer, content.x, null);
		singleReader.write(buffer, content.y, null);
		singleReader.write(buffer, content.z, null);
	}
}

class SpriteFontReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.SpriteFontReader':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["SpriteFont", "Texture2D", 'List<Rectangle>', 'Rectangle', 'List<Rectangle>', 'Rectangle', 'List<Char>', 'Char', null, null, 'List<Vector3>', 'Vector3', 'Nullable<Char>', 'Char'];
	}
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
			buffer.alloc(100000);
			rectangleListReader.write(buffer, content.glyphs, resolver);
			rectangleListReader.write(buffer, content.cropping, resolver);
			charListReader.write(buffer, content.characterMap, resolver);
			int32Reader.write(buffer, content.verticalLineSpacing, null);
			singleReader.write(buffer, content.horizontalSpacing, null);
			vector3ListReader.write(buffer, content.kerning, resolver);
			nullableCharReader.write(buffer, content.defaultCharacter, null);
		} catch (ex) {
			throw ex;
		}
	}
	isValueType() {
		return false;
	}
}

class TBinReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'xTile.Pipeline.TideReader':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const int32Reader = new Int32Reader();
		let size = int32Reader.read(buffer);
		let data = buffer.read(size);
		return {
			export: {
				type: this.type,
				data
			}
		};
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const data = content.export.data;
		const int32Reader = new Int32Reader();
		int32Reader.write(buffer, data.byteLength, null);
		buffer.concat(data);
	}
	isValueType() {
		return false;
	}
}

class LightweightTexture2DReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Texture2DReader':
				return true;
			default:
				return false;
		}
	}
	static type() {
		return "Texture2D";
	}
	read(buffer) {
		const int32Reader = new Int32Reader();
		const uint32Reader = new UInt32Reader();
		let format = int32Reader.read(buffer);
		let width = uint32Reader.read(buffer);
		let height = uint32Reader.read(buffer);
		let mipCount = uint32Reader.read(buffer);
		if (mipCount > 1) console.warn("Found mipcount of ".concat(mipCount, ", only the first will be used."));
		let dataSize = uint32Reader.read(buffer);
		let data = buffer.read(dataSize);
		data = new Uint8Array(data);
		if (format != 0) throw new Error("Compressed texture format is not supported!");
		for (let i = 0; i < data.length; i += 4) {
			let inverseAlpha = 255 / data[i + 3];
			data[i] = Math.min(Math.ceil(data[i] * inverseAlpha), 255);
			data[i + 1] = Math.min(Math.ceil(data[i + 1] * inverseAlpha), 255);
			data[i + 2] = Math.min(Math.ceil(data[i + 2] * inverseAlpha), 255);
		}
		return {
			format,
			export: {
				type: this.type,
				data,
				width,
				height
			}
		};
	}
	write(buffer, content, resolver) {
		if (content.format != 0) throw new Error("Compressed texture format is not supported!");
		const int32Reader = new Int32Reader();
		const uint32Reader = new UInt32Reader();
		this.writeIndex(buffer, resolver);
		const width = content.export.width;
		const height = content.export.height;
		int32Reader.write(buffer, content.format, null);
		uint32Reader.write(buffer, content.export.width, null);
		uint32Reader.write(buffer, content.export.height, null);
		uint32Reader.write(buffer, 1, null);
		let data = content.export.data;
		for (let i = 0; i < data.length; i += 4) {
			const alpha = data[i + 3] / 255;
			data[i] = Math.floor(data[i] * alpha);
			data[i + 1] = Math.floor(data[i + 1] * alpha);
			data[i + 2] = Math.floor(data[i + 2] * alpha);
		}
		uint32Reader.write(buffer, data.length, null);
		buffer.concat(data);
	}
	isValueType() {
		return false;
	}
	get type() {
		return "Texture2D";
	}
}

class Vector2Reader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Vector2Reader':
			case 'Microsoft.Xna.Framework.Vector2':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const singleReader = new SingleReader();
		let x = singleReader.read(buffer);
		let y = singleReader.read(buffer);
		return {
			x,
			y
		};
	}
	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const singleReader = new SingleReader();
		singleReader.write(buffer, content.x, null);
		singleReader.write(buffer, content.y, null);
	}
}

class Vector4Reader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'Microsoft.Xna.Framework.Content.Vector4Reader':
			case 'Microsoft.Xna.Framework.Vector4':
				return true;
			default:
				return false;
		}
	}
	read(buffer) {
		const singleReader = new SingleReader();
		let x = singleReader.read(buffer);
		let y = singleReader.read(buffer);
		let z = singleReader.read(buffer);
		let w = singleReader.read(buffer);
		return {
			x,
			y,
			z,
			w
		};
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

class MovieSceneReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieScene':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["MovieScene", null, "Nullable<String>", 'String', "Nullable<String>", 'String', null, "Nullable<String>", 'String', "Nullable<String>", 'String', null, "Nullable<String>", 'String', 'String'];
	}
	static type() {
		return "Reflective<MovieScene>";
	}
	read(buffer, resolver) {
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();
		const nullableStringReader = new NullableReader(new StringReader());
		let Image = int32Reader.read(buffer, null);
		let Music = nullableStringReader.read(buffer, resolver);
		let Sound = nullableStringReader.read(buffer, resolver);
		let MessageDelay = int32Reader.read(buffer, null);
		let Script = nullableStringReader.read(buffer, resolver);
		let Text = nullableStringReader.read(buffer, resolver);
		let Shake = booleanReader.read(buffer);
		let ResponsePoint = nullableStringReader.read(buffer, resolver);
		let ID = resolver.read(buffer);
		return {
			Image,
			Music,
			Sound,
			MessageDelay,
			Script,
			Text,
			Shake,
			ResponsePoint,
			ID
		};
	}
	write(buffer, content, resolver) {
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();
		const nullableStringReader = new NullableReader(new StringReader());
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		int32Reader.write(buffer, content.Image, null);
		nullableStringReader.write(buffer, content.Music, resolver);
		nullableStringReader.write(buffer, content.Sound, resolver);
		int32Reader.write(buffer, content.MessageDelay, null);
		nullableStringReader.write(buffer, content.Script, resolver);
		nullableStringReader.write(buffer, content.Text, resolver);
		booleanReader.write(buffer, content.Shake, null);
		nullableStringReader.write(buffer, content.ResponsePoint, resolver);
		stringReader.write(buffer, content.ID, resolver);
	}
	isValueType() {
		return false;
	}
}

class CharacterResponseReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.CharacterResponse':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["CharacterResponse", "Nullable<String>:1", "String", "Nullable<String>:1", "String", "Nullable<String>:1", "String"];
	}
	static type() {
		return "Reflective<CharacterResponse>";
	}
	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const ResponsePoint = nullableStringReader.read(buffer, resolver);
		const Script = nullableStringReader.read(buffer, resolver);
		const Text = nullableStringReader.read(buffer, resolver);
		return {
			ResponsePoint,
			Script,
			Text
		};
	}
	write(buffer, content, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		this.writeIndex(buffer, resolver);
		nullableStringReader.write(buffer, content.ResponsePoint, resolver);
		nullableStringReader.write(buffer, content.Script, resolver);
		nullableStringReader.write(buffer, content.Text, resolver);
	}
	isValueType() {
		return false;
	}
}

class SpecialResponsesReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.SpecialResponses':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["SpecialResponses", "Nullable<CharacterResponse>:7", ...CharacterResponseReader.parseTypeList(), "Nullable<CharacterResponse>:7", ...CharacterResponseReader.parseTypeList(), "Nullable<CharacterResponse>:7", ...CharacterResponseReader.parseTypeList()];
	}
	static type() {
		return "Reflective<SpecialResponses>";
	}
	read(buffer, resolver) {
		const nullableCharacterResponseReader = new NullableReader(new CharacterResponseReader());
		const BeforeMovie = nullableCharacterResponseReader.read(buffer, resolver);
		const DuringMovie = nullableCharacterResponseReader.read(buffer, resolver);
		const AfterMovie = nullableCharacterResponseReader.read(buffer, resolver);
		return {
			BeforeMovie,
			DuringMovie,
			AfterMovie
		};
	}
	write(buffer, content, resolver) {
		const nullableCharacterResponseReader = new NullableReader(new CharacterResponseReader());
		this.writeIndex(buffer, resolver);
		nullableCharacterResponseReader.write(buffer, content.BeforeMovie, resolver);
		nullableCharacterResponseReader.write(buffer, content.DuringMovie, resolver);
		nullableCharacterResponseReader.write(buffer, content.AfterMovie, resolver);
	}
	isValueType() {
		return false;
	}
}

class MovieReactionReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieReaction':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["MovieReaction", "String", "Nullable<String>:1", "String", "Nullable<List<String>>:2", "List<String>", "String", "Nullable<SpecialResponses>:25", ...SpecialResponsesReader.parseTypeList(), "String"];
	}
	static type() {
		return "Reflective<MovieReaction>";
	}
	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const nullableSpecialResponsesReader = new NullableReader(new SpecialResponsesReader());
		const Tag = resolver.read(buffer);
		const Response = nullableStringReader.read(buffer, resolver) || "like";
		const Whitelist = nullableStringListReader.read(buffer, resolver) || [];
		const SpecialResponses = nullableSpecialResponsesReader.read(buffer, resolver);
		const ID = resolver.read(buffer);
		return {
			Tag,
			Response,
			Whitelist,
			SpecialResponses,
			ID
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const nullableSpecialResponsesReader = new NullableReader(new SpecialResponsesReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Tag, resolver);
		nullableStringReader.write(buffer, content.Response, resolver);
		nullableStringListReader.write(buffer, content.Whitelist, resolver);
		nullableSpecialResponsesReader.write(buffer, content.SpecialResponses, resolver);
		stringReader.write(buffer, content.ID, resolver);
	}
	isValueType() {
		return false;
	}
}

class MovieCharacterReactionReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieCharacterReaction':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["MovieCharacterReaction", "String", "Nullable<List<MovieReaction>>:34", "List<MovieReaction>", ...MovieReactionReader.parseTypeList()];
	}
	static type() {
		return "Reflective<MovieCharacterReaction>";
	}
	read(buffer, resolver) {
		const nullableReactionListReader = new NullableReader(new ListReader(new MovieReactionReader()));
		const NPCName = resolver.read(buffer);
		const Reactions = nullableReactionListReader.read(buffer, resolver);
		return {
			NPCName,
			Reactions
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableReactionListReader = new NullableReader(new ListReader(new MovieReactionReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.NPCName, resolver);
		nullableReactionListReader.write(buffer, content.Reactions, resolver);
	}
	isValueType() {
		return false;
	}
}

class ConcessionItemDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.ConcessionItemData':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["ConcessionItemData", 'String', 'String', 'String', 'String', null, 'String', null, 'Nullable<List<String>>:2', "List<String>", 'String'];
	}
	static type() {
		return "Reflective<ConcessionItemData>";
	}
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		let ID = resolver.read(buffer);
		let Name = resolver.read(buffer);
		let DisplayName = resolver.read(buffer);
		let Description = resolver.read(buffer);
		let Price = int32Reader.read(buffer);
		let Texture = resolver.read(buffer);
		let SpriteIndex = int32Reader.read(buffer);
		let ItemTags = nullableStringListReader.read(buffer, resolver);
		return {
			ID,
			Name,
			DisplayName,
			Description,
			Price,
			Texture,
			SpriteIndex,
			ItemTags
		};
	}
	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.Name, resolver);
		stringReader.write(buffer, content.DisplayName, resolver);
		stringReader.write(buffer, content.Description, resolver);
		int32Reader.write(buffer, content.Price, null);
		stringReader.write(buffer, content.Texture, resolver);
		int32Reader.write(buffer, content.SpriteIndex, null);
		nullableStringListReader.write(buffer, content.ItemTags, resolver);
	}
	isValueType() {
		return false;
	}
}

class ConcessionTasteReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.ConcessionTaste':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["ConcessionTaste", 'String', 'Nullable<List<String>>:2', "List<String>", 'String', 'Nullable<List<String>>:2', "List<String>", 'String', 'Nullable<List<String>>:2', "List<String>", 'String'];
	}
	static type() {
		return "Reflective<ConcessionTaste>";
	}
	read(buffer, resolver) {
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		let Name = resolver.read(buffer);
		let LovedTags = nullableStringListReader.read(buffer, resolver);
		let LikedTags = nullableStringListReader.read(buffer, resolver);
		let DislikedTags = nullableStringListReader.read(buffer, resolver);
		return {
			Name,
			LovedTags,
			LikedTags,
			DislikedTags
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Name, resolver);
		nullableStringListReader.write(buffer, content.LovedTags, resolver);
		nullableStringListReader.write(buffer, content.LikedTags, resolver);
		nullableStringListReader.write(buffer, content.DislikedTags, resolver);
	}
	isValueType() {
		return false;
	}
}

class FishPondRewardReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.FishPonds.FishPondReward':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["FishPondReward", null, null, "String", null, null];
	}
	static type() {
		return "Reflective<FishPondReward>";
	}
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const RequiredPopulation = int32Reader.read(buffer);
		const Chance = Math.round(floatReader.read(buffer) * 100000) / 100000;
		const ItemId = resolver.read(buffer);
		const MinQuantity = int32Reader.read(buffer);
		const MaxQuantity = int32Reader.read(buffer);
		return {
			RequiredPopulation,
			Chance,
			ItemId,
			MinQuantity,
			MaxQuantity
		};
	}
	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		int32Reader.write(buffer, content.RequiredPopulation, null);
		floatReader.write(buffer, content.Chance, null);
		stringReader.write(buffer, content.ItemId, resolver);
		int32Reader.write(buffer, content.MinQuantity, null);
		int32Reader.write(buffer, content.MaxQuantity, null);
	}
	isValueType() {
		return false;
	}
}

class FishPondDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.FishPonds.FishPondData':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["FishPondData", "String", "List<String>", "String", null, null, "List<FishPondReward>:6", ...FishPondRewardReader.parseTypeList(), "Nullable<Dictionary<Int32,List<String>>>:4", "Dictionary<Int32,List<String>>", "Int32", "List<String>", "String", "Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String"];
	}
	static type() {
		return "Reflective<FishPondData>";
	}
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const stringListDictReader = new NullableReader(new DictionaryReader(new Int32Reader(), new ListReader(new StringReader())));
		const stringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		const Id = resolver.read(buffer);
		const RequiredTags = resolver.read(buffer);
		const Precedence = int32Reader.read(buffer);
		const SpawnTime = int32Reader.read(buffer);
		const ProducedItems = resolver.read(buffer);
		const PopulationGates = stringListDictReader.read(buffer, resolver);
		const CustomFields = stringDictReader.read(buffer, resolver);
		return {
			Id,
			RequiredTags,
			Precedence,
			SpawnTime,
			ProducedItems,
			PopulationGates,
			CustomFields
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const stringListReader = new ListReader(new StringReader());
		const int32Reader = new Int32Reader();
		const fishPondRewardListReader = new ListReader(new FishPondRewardReader());
		const stringListDictReader = new NullableReader(new DictionaryReader(new Int32Reader(), new ListReader(new StringReader())));
		const stringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Id, resolver);
		stringListReader.write(buffer, content.RequiredTags, resolver);
		int32Reader.write(buffer, content.Precedence, null);
		int32Reader.write(buffer, content.SpawnTime, null);
		fishPondRewardListReader.write(buffer, content.ProducedItems, resolver);
		stringListDictReader.write(buffer, content.PopulationGates, resolver);
		stringDictReader.write(buffer, content.CustomFields, resolver);
	}
	isValueType() {
		return false;
	}
}

class TailorItemRecipeReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Crafting.TailorItemRecipe':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["TailorItemRecipe", "Nullable<String>:1", "String", "Nullable<List<String>>:2", "List<String>", "String", "Nullable<List<String>>:2", "List<String>", "String", null, "Nullable<String>:1", "String", "Nullable<List<String>>:2", "List<String>", "String", "Nullable<String>:1", "String"];
	}
	static type() {
		return "Reflective<TailorItemRecipe>";
	}
	read(buffer, resolver) {
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const booleanReader = new BooleanReader();
		const Id = nullableStringReader.read(buffer);
		const FirstItemTags = nullableStringListReader.read(buffer, resolver);
		const SecondItemTags = nullableStringListReader.read(buffer, resolver);
		const SpendingRightItem = booleanReader.read(buffer);
		const CraftedItemID = nullableStringReader.read(buffer, resolver);
		const CraftedItemIDs = nullableStringListReader.read(buffer, resolver);
		const CraftedItemIdFeminine = nullableStringReader.read(buffer, resolver);
		return {
			Id,
			FirstItemTags,
			SecondItemTags,
			SpendingRightItem,
			CraftedItemID,
			CraftedItemIDs,
			CraftedItemIdFeminine
		};
	}
	write(buffer, content, resolver) {
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const booleanReader = new BooleanReader();
		this.writeIndex(buffer, resolver);
		nullableStringReader.write(buffer, content.Id, resolver);
		nullableStringListReader.write(buffer, content.FirstItemTags, resolver);
		nullableStringListReader.write(buffer, content.SecondItemTags, resolver);
		booleanReader.write(buffer, content.SpendingRightItem, null);
		nullableStringReader.write(buffer, content.CraftedItemID, resolver);
		nullableStringListReader.write(buffer, content.CraftedItemIDs, resolver);
		nullableStringReader.write(buffer, content.CraftedItemIdFeminine, resolver);
	}
	isValueType() {
		return false;
	}
}

class RenovationValueReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.RenovationValue':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["RenovationValue", "String", "String", "String"];
	}
	static type() {
		return "Reflective<RenovationValue>";
	}
	read(buffer, resolver) {
		const Type = resolver.read(buffer);
		const Key = resolver.read(buffer);
		const Value = resolver.read(buffer);
		return {
			Type,
			Key,
			Value
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Type, resolver);
		stringReader.write(buffer, content.Key, resolver);
		stringReader.write(buffer, content.Value, resolver);
	}
	isValueType() {
		return false;
	}
}

class RectReader extends RectangleReader {
	static isTypeOf(type) {
		if (super.isTypeOf(type)) return true;
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.Rect':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["Rect"];
	}
	static type() {
		return "Reflective<Rect>";
	}
	read(buffer) {
		const {
			x,
			y,
			width,
			height
		} = super.read(buffer);
		return {
			X: x,
			Y: y,
			Width: width,
			Height: height
		};
	}
	write(buffer, content, resolver) {
		const {
			X: x,
			Y: y,
			Width: width,
			Height: height
		} = content;
		super.write(buffer, {
			x,
			y,
			width,
			height
		}, resolver);
	}
	isValueType() {
		return false;
	}
}

class RectGroupReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.RectGroup':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["RectGroup", "List<Rect>", "Rect"];
	}
	static type() {
		return "Reflective<RectGroup>";
	}
	read(buffer, resolver) {
		const Rects = resolver.read(buffer);
		return {
			Rects
		};
	}
	write(buffer, content, resolver) {
		const rectListReader = new ListReader(new RectReader());
		this.writeIndex(buffer, resolver);
		rectListReader.write(buffer, content.Rects, resolver);
	}
	isValueType() {
		return false;
	}
}

class HomeRenovationReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.HomeRenovation':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["HomeRenovation", "String", "String", null, null, "Nullable<String>", "String", "List<RenovationValue>", ...RenovationValueReader.parseTypeList(), "List<RenovationValue>", ...RenovationValueReader.parseTypeList(), "Nullable<List<RectGroup>>:4", "List<RectGroup>", ...RectGroupReader.parseTypeList(), "Nullable<String>", "String", "Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String"];
	}
	static type() {
		return "Reflective<HomeRenovation>";
	}
	read(buffer, resolver) {
		const booleanReader = new BooleanReader();
		const intReader = new Int32Reader();
		const nullableRectGroupListReader = new NullableReader(new ListReader(new RectGroupReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		const TextStrings = resolver.read(buffer);
		const AnimationType = resolver.read(buffer);
		const CheckForObstructions = booleanReader.read(buffer);
		const Price = intReader.read(buffer);
		const RoomId = nullableStringReader.read(buffer, resolver);
		const Requirements = resolver.read(buffer);
		const RenovateActions = resolver.read(buffer);
		const RectGroups = nullableRectGroupListReader.read(buffer, resolver);
		const SpecialRect = nullableStringReader.read(buffer, resolver);
		const CustomFields = nullableStringDictReader.read(buffer, resolver);
		return {
			TextStrings,
			AnimationType,
			CheckForObstructions,
			Price,
			RoomId,
			Requirements,
			RenovateActions,
			RectGroups,
			SpecialRect,
			CustomFields
		};
	}
	write(buffer, content, resolver) {
		const booleanReader = new BooleanReader();
		const intReader = new Int32Reader();
		const stringReader = new StringReader();
		const renovationValueListReader = new ListReader(new RenovationValueReader());
		const nullableRectGroupListReader = new NullableReader(new ListReader(new RectGroupReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.TextStrings, resolver);
		stringReader.write(buffer, content.AnimationType, resolver);
		booleanReader.write(buffer, content.CheckForObstructions, null);
		intReader.write(buffer, content.Price, null);
		nullableStringReader.write(buffer, content.RoomId, resolver);
		renovationValueListReader.write(buffer, content.Requirements, resolver);
		renovationValueListReader.write(buffer, content.RenovateActions, resolver);
		nullableRectGroupListReader.write(buffer, content.RectGroups, resolver);
		nullableStringReader.write(buffer, content.SpecialRect, resolver);
		nullableStringDictReader.write(buffer, content.CustomFields, resolver);
	}
	isValueType() {
		return false;
	}
}

class BundleDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.BundleData':
			case "StardewValley.GameData.Bundles.BundleData":
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["BundleData", "String", null, "String", "String", "String", null, null, "String"];
	}
	static type() {
		return "Reflective<BundleData>";
	}
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		let Name = resolver.read(buffer);
		let Index = int32Reader.read(buffer);
		let Sprite = resolver.read(buffer);
		let Color = resolver.read(buffer);
		let Items = resolver.read(buffer);
		let Pick = int32Reader.read(buffer);
		let RequiredItems = int32Reader.read(buffer);
		let Reward = resolver.read(buffer);
		return {
			Name,
			Index,
			Sprite,
			Color,
			Items,
			Pick,
			RequiredItems,
			Reward
		};
	}
	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Name, resolver);
		int32Reader.write(buffer, content.Index, null);
		stringReader.write(buffer, content.Sprite, resolver);
		stringReader.write(buffer, content.Color, resolver);
		stringReader.write(buffer, content.Items, resolver);
		int32Reader.write(buffer, content.Pick, null);
		int32Reader.write(buffer, content.RequiredItems, null);
		stringReader.write(buffer, content.Reward, resolver);
	}
	isValueType() {
		return false;
	}
}

class BundleSetDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Bundles.BundleSetData':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["BundleSetData", "String", "List<BundleData>", ...BundleDataReader.parseTypeList()];
	}
	static type() {
		return "Reflective<BundleSetData>";
	}
	read(buffer, resolver) {
		let Id = resolver.read(buffer);
		let Bundles = resolver.read(buffer);
		return {
			Id,
			Bundles
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const bundleListReader = new ListReader(new BundleDataReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Id, resolver);
		bundleListReader.write(buffer, content.Bundles, resolver);
	}
	isValueType() {
		return false;
	}
}

class RandomBundleDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Bundles.RandomBundleData':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["RandomBundleData", "String", "String", "Nullable<List<BundleSetData>>:14", "List<BundleSetData>", ...BundleSetDataReader.parseTypeList(), "Nullable<List<BundleData>>:11", "List<BundleData>", ...BundleDataReader.parseTypeList()];
	}
	static type() {
		return "Reflective<RandomBundleData>";
	}
	read(buffer, resolver) {
		const nullableBundleSetListReader = new NullableReader(new ListReader(new BundleSetDataReader()));
		const nullableBundleListReader = new NullableReader(new ListReader(new BundleDataReader()));
		let AreaName = resolver.read(buffer);
		let Keys = resolver.read(buffer);
		let BundleSets = nullableBundleSetListReader.read(buffer, resolver);
		let Bundles = nullableBundleListReader.read(buffer, resolver);
		return {
			AreaName,
			Keys,
			BundleSets,
			Bundles
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableBundleSetListReader = new NullableReader(new ListReader(new BundleSetDataReader()));
		const nullableBundleListReader = new NullableReader(new ListReader(new BundleDataReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.AreaName, resolver);
		stringReader.write(buffer, content.Keys, resolver);
		nullableBundleSetListReader.write(buffer, content.BundleSets, resolver);
		nullableBundleListReader.write(buffer, content.Bundles, resolver);
	}
	isValueType() {
		return false;
	}
}

class RandomizedElementItemReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrders.RandomizedElementItem':
			case 'StardewValley.GameData.RandomizedElementItem':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["RandomizedElementItem", "Nullable<String>", "String", "String"];
	}
	static type() {
		return "Reflective<RandomizedElementItem>";
	}
	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const RequiredTags = nullableStringReader.read(buffer, resolver) || "";
		const Value = resolver.read(buffer);
		return {
			RequiredTags,
			Value
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		this.writeIndex(buffer, resolver);
		nullableStringReader.write(buffer, content.RequiredTags, resolver);
		stringReader.write(buffer, content.Value, resolver);
	}
	isValueType() {
		return false;
	}
}

class RandomizedElementReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrders.RandomizedElement':
			case 'StardewValley.GameData.RandomizedElement':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["RandomizedElement", "String", "List<RandomizedElementItem>", ...RandomizedElementItemReader.parseTypeList()];
	}
	static type() {
		return "Reflective<RandomizedElement>";
	}
	read(buffer, resolver) {
		const Name = resolver.read(buffer);
		const Values = resolver.read(buffer);
		return {
			Name,
			Values
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const itemListReader = new ListReader(new RandomizedElementItemReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Name, resolver);
		itemListReader.write(buffer, content.Values, resolver);
	}
	isValueType() {
		return false;
	}
}

class SpecialOrderObjectiveDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrders.SpecialOrderObjectiveData':
			case 'StardewValley.GameData.SpecialOrderObjectiveData':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["SpecialOrderObjectiveData", "String", "String", "String", "Dictionary<String,String>", "String", "String"];
	}
	static type() {
		return "Reflective<SpecialOrderObjectiveData>";
	}
	read(buffer, resolver) {
		const Type = resolver.read(buffer);
		const Text = resolver.read(buffer);
		const RequiredCount = resolver.read(buffer);
		const Data = resolver.read(buffer);
		return {
			Type,
			Text,
			RequiredCount,
			Data
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const stringDictReader = new DictionaryReader(new StringReader(), new StringReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Type, resolver);
		stringReader.write(buffer, content.Text, resolver);
		stringReader.write(buffer, content.RequiredCount, resolver);
		stringDictReader.write(buffer, content.Data, resolver);
	}
	isValueType() {
		return false;
	}
}

class SpecialOrderRewardDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrders.SpecialOrderRewardData':
			case 'StardewValley.GameData.SpecialOrderRewardData':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["SpecialOrderRewardData", "String", "Dictionary<String,String>", "String", "String"];
	}
	static type() {
		return "Reflective<SpecialOrderRewardData>";
	}
	read(buffer, resolver) {
		const Type = resolver.read(buffer);
		const Data = resolver.read(buffer);
		return {
			Type,
			Data
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const stringDictReader = new DictionaryReader(new StringReader(), new StringReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Type, resolver);
		stringDictReader.write(buffer, content.Data, resolver);
	}
	isValueType() {
		return false;
	}
}

class SpecialOrderDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrders.SpecialOrderData':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["SpecialOrderData", "String", "String", null, null, "Nullable<String>", "String", "Nullable<String>", "String", "Nullable<String>", "String", "Nullable<String>", "String", "String", "Nullable<String>", "String", "Nullable<String>", "String", "Nullable<List<RandomizedElement>>:8", "List<RandomizedElement>", ...RandomizedElementReader.parseTypeList(), "List<SpecialOrderObjectiveData>", ...SpecialOrderObjectiveDataReader.parseTypeList(), "List<SpecialOrderRewardData>", ...SpecialOrderRewardDataReader.parseTypeList(), "Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String"];
	}
	static type() {
		return "Reflective<SpecialOrderData>";
	}
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableRandomizedElemListReader = new NullableReader(new ListReader(new RandomizedElementReader()));
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		const Name = resolver.read(buffer);
		const Requester = resolver.read(buffer);
		const Duration = int32Reader.read(buffer);
		const Repeatable = booleanReader.read(buffer);
		const RequiredTags = nullableStringReader.read(buffer, resolver);
		const Condition = nullableStringReader.read(buffer, resolver);
		const OrderType = nullableStringReader.read(buffer, resolver);
		const SpecialRule = nullableStringReader.read(buffer, resolver);
		const Text = resolver.read(buffer);
		const ItemToRemoveOnEnd = nullableStringReader.read(buffer, resolver);
		const MailToRemoveOnEnd = nullableStringReader.read(buffer, resolver);
		const RandomizedElements = nullableRandomizedElemListReader.read(buffer, resolver);
		const Objectives = resolver.read(buffer);
		const Rewards = resolver.read(buffer);
		const CustomFields = nullableStringDictReader.read(buffer, resolver);
		return {
			Name,
			Requester,
			Duration,
			Repeatable,
			RequiredTags,
			Condition,
			OrderType,
			SpecialRule,
			Text,
			ItemToRemoveOnEnd,
			MailToRemoveOnEnd,
			RandomizedElements,
			Objectives,
			Rewards,
			CustomFields
		};
	}
	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableRandomizedElemListReader = new NullableReader(new ListReader(new RandomizedElementReader()));
		const objectiveListReader = new ListReader(new SpecialOrderObjectiveDataReader());
		const rewardListReader = new ListReader(new SpecialOrderRewardDataReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Name, resolver);
		stringReader.write(buffer, content.Requester, resolver);
		int32Reader.write(buffer, content.Duration, null);
		booleanReader.write(buffer, content.Repeatable, null);
		nullableStringReader.write(buffer, content.RequiredTags, resolver);
		nullableStringReader.write(buffer, content.Condition, resolver);
		nullableStringReader.write(buffer, content.OrderType, resolver);
		nullableStringReader.write(buffer, content.SpecialRule, resolver);
		stringReader.write(buffer, content.Text, resolver);
		nullableStringReader.write(buffer, content.ItemToRemoveOnEnd, resolver);
		nullableStringReader.write(buffer, content.MailToRemoveOnEnd, resolver);
		nullableRandomizedElemListReader.write(buffer, content.RandomizedElements, resolver);
		objectiveListReader.write(buffer, content.Objectives, resolver);
		rewardListReader.write(buffer, content.Rewards, resolver);
		nullableStringDictReader.write(buffer, content.CustomFields, resolver);
	}
	isValueType() {
		return false;
	}
}

class ModFarmTypeReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModFarmType':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["ModFarmType", "String", "String", "String", "Nullable<String>:1", "String", "Nullable<String>:1", "String", null, "Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String", "Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String"];
	}
	static type() {
		return "Reflective<ModFarmType>";
	}
	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		const booleanReader = new BooleanReader();
		const ID = resolver.read(buffer);
		const TooltipStringPath = resolver.read(buffer);
		const MapName = resolver.read(buffer);
		const IconTexture = nullableStringReader.read(buffer, resolver);
		const WorldMapTexture = nullableStringReader.read(buffer, resolver);
		const SpawnMonstersByDefault = booleanReader.read(buffer);
		const ModData = nullableStringDictReader.read(buffer, resolver);
		const CustomFields = nullableStringDictReader.read(buffer, resolver);
		return {
			ID,
			TooltipStringPath,
			MapName,
			IconTexture,
			WorldMapTexture,
			SpawnMonstersByDefault,
			ModData,
			CustomFields
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader()));
		const booleanReader = new BooleanReader();
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.TooltipStringPath, resolver);
		stringReader.write(buffer, content.MapName, resolver);
		nullableStringReader.write(buffer, content.IconTexture, resolver);
		nullableStringReader.write(buffer, content.WorldMapTexture, resolver);
		booleanReader.write(buffer, content.SpawnMonstersByDefault, null);
		nullableStringDictReader.write(buffer, content.ModData, resolver);
		nullableStringDictReader.write(buffer, content.CustomFields, resolver);
	}
	isValueType() {
		return false;
	}
}

class ModLanguageReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModLanguage':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["ModLanguage", "String", "String", "String", null, "Nullable<String>:1", "String", null, null, null, null, "Nullable<String>:1", "String", "String", "String", "String", "Nullable<Dictionary<String,String>>:3", "Dictionary<String,String>", "String", "String"];
	}
	static type() {
		return "Reflective<ModLanguage>";
	}
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		const ID = resolver.read(buffer);
		const LanguageCode = resolver.read(buffer);
		const ButtonTexture = resolver.read(buffer);
		const UseLatinFont = booleanReader.read(buffer);
		const FontFile = nullableStringReader.read(buffer, resolver);
		const FontPixelZoom = floatReader.read(buffer);
		const FontApplyYOffset = booleanReader.read(buffer);
		const SmallFontLineSpacing = int32Reader.read(buffer);
		const UseGenderedCharacterTranslations = booleanReader.read(buffer);
		const NumberComma = nullableStringReader.read(buffer, resolver);
		const TimeFormat = resolver.read(buffer);
		const ClockTimeFormat = resolver.read(buffer);
		const ClockDateFormat = resolver.read(buffer);
		const CustomFields = nullableStringDictReader.read(buffer, resolver);
		return {
			ID,
			LanguageCode,
			ButtonTexture,
			UseLatinFont,
			FontFile,
			FontPixelZoom,
			FontApplyYOffset,
			SmallFontLineSpacing,
			UseGenderedCharacterTranslations,
			NumberComma,
			TimeFormat,
			ClockTimeFormat,
			ClockDateFormat,
			CustomFields
		};
	}
	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader(), new StringReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.LanguageCode, resolver);
		stringReader.write(buffer, content.ButtonTexture, resolver);
		booleanReader.write(buffer, content.UseLatinFont, null);
		nullableStringReader.write(buffer, content.FontFile, resolver);
		floatReader.write(buffer, content.FontPixelZoom, null);
		booleanReader.write(buffer, content.FontApplyYOffset, null);
		int32Reader.write(buffer, content.SmallFontLineSpacing, null);
		booleanReader.write(buffer, content.UseGenderedCharacterTranslations, null);
		nullableStringReader.write(buffer, content.NumberComma, resolver);
		stringReader.write(buffer, content.TimeFormat, resolver);
		stringReader.write(buffer, content.ClockTimeFormat, resolver);
		stringReader.write(buffer, content.ClockDateFormat, resolver);
		nullableStringDictReader.write(buffer, content.CustomFields, resolver);
	}
	isValueType() {
		return false;
	}
}

class ModWallpaperOrFlooringReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModWallpaperOrFlooring':
				return true;
			default:
				return false;
		}
	}
	static parseTypeList() {
		return ["ModWallpaperOrFlooring", "String", "String", null, null];
	}
	static type() {
		return "Reflective<ModWallpaperOrFlooring>";
	}
	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const ID = resolver.read(buffer);
		const Texture = resolver.read(buffer);
		const IsFlooring = booleanReader.read(buffer);
		const Count = int32Reader.read(buffer);
		return {
			ID,
			Texture,
			IsFlooring,
			Count
		};
	}
	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.Texture, resolver);
		booleanReader.write(buffer, content.IsFlooring, null);
		int32Reader.write(buffer, content.Count, null);
	}
	isValueType() {
		return false;
	}
}

var readers = /*#__PURE__*/Object.freeze({
	__proto__: null,
	MovieSceneReader: MovieSceneReader,
	MovieCharacterReactionReader: MovieCharacterReactionReader,
	MovieReactionReader: MovieReactionReader,
	SpecialResponsesReader: SpecialResponsesReader,
	CharacterResponseReader: CharacterResponseReader,
	ConcessionItemDataReader: ConcessionItemDataReader,
	ConcessionTasteReader: ConcessionTasteReader,
	FishPondDataReader: FishPondDataReader,
	FishPondRewardReader: FishPondRewardReader,
	TailorItemRecipeReader: TailorItemRecipeReader,
	HomeRenovationReader: HomeRenovationReader,
	RenovationValueReader: RenovationValueReader,
	RectGroupReader: RectGroupReader,
	RectReader: RectReader,
	RandomBundleDataReader: RandomBundleDataReader,
	BundleSetDataReader: BundleSetDataReader,
	BundleDataReader: BundleDataReader,
	SpecialOrderDataReader: SpecialOrderDataReader,
	RandomizedElementReader: RandomizedElementReader,
	RandomizedElementItemReader: RandomizedElementItemReader,
	SpecialOrderObjectiveDataReader: SpecialOrderObjectiveDataReader,
	SpecialOrderRewardDataReader: SpecialOrderRewardDataReader,
	ModFarmTypeReader: ModFarmTypeReader,
	ModLanguageReader: ModLanguageReader,
	ModWallpaperOrFlooringReader: ModWallpaperOrFlooringReader
});

var genericSpawnItemData = {
	$Id: "String",
	$ItemId: "String",
	$RandomItemId: ["String"],
	$MaxItems: "Int32",
	MinStack: "Int32",
	MaxStack: "Int32",
	Quality: "Int32",
	$ObjectInternalName: "String",
	$ObjectDisplayName: "String",
	ToolUpgradeLevel: "Int32",
	IsRecipe: "Boolean",
	$StackModifiers: ["StardewValley.GameData.QuantityModifier"],
	StackModifierMode: "Int32",
	$QualityModifiers: ["StardewValley.GameData.QuantityModifier"],
	QualityModifierMode: "Int32",
	$ModData: {
		"String": "String"
	},
	$PerItemCondition: "String"
};

var genericSpawnItemDataWithCondition = _objectSpread2(_objectSpread2({}, genericSpawnItemData), {}, {
	$Condition: "String"
});

var audioCueData = {
	Id: "String",
	$FilePaths: ["String"],
	$Category: "String",
	StreamedVoorbis: "Boolean",
	Looped: "Boolean",
	UseReverb: "Boolean",
	$CustomFields: {
		"String": "String"
	}
};

var incomingPhoneCallData = {
	$TriggerCondition: "String",
	$RingCondition: "String",
	$FromNpc: "String",
	$FromPortrait: "String",
	$FromDisplayName: "String",
	Dialogue: "String",
	IgnoreBaseChance: "Boolean",
	$SimpleDialogueSplitBy: "String",
	MaxCalls: "Int32",
	$CustomFields: {
		"String": "String"
	}
};

var jukeboxTrackData = {
	Name: "String",
	$Available: "Boolean",
	$AlternativeTrackIds: ["String"]
};

var mannequinData = {
	ID: "String",
	DisplayName: "String",
	Description: "String",
	Texture: "String",
	FarmerTexture: "String",
	SheetIndex: "Int32",
	DisplaysClothingAsMale: "Boolean",
	Cursed: "Boolean",
	$CustomFields: {
		"String": "String"
	}
};

var monsterSlayerQuestData = {
	DisplayName: "String",
	Targets: ["String"],
	Count: "Int32",
	$RewardItmeId: "String",
	RewardItemPrice: "Int32",
	$RewardDialogue: "String",
	$RewardDialogueFlag: "String",
	$RewardFlag: "String",
	$RewardFlagAll: "String",
	$RewardMail: "String",
	$RewardMailAll: "String",
	$CustomFields: {
		"String": "String"
	}
};

var passiveFestivalData = {
	DisplayName: "String",
	Condition: "String",
	ShowOnCalendar: "Boolean",
	Season: "Int32",
	StartDay: "Int32",
	EndDay: "Int32",
	StartTime: "Int32",
	StartMessage: "String",
	OnlyShowMessageOnFirstDay: "Boolean",
	$MapReplacements: {
		"String": "String"
	},
	$DailySetupMethod: "String",
	$CleanupMethod: "String",
	$CustomFields: {
		"String": "String"
	}
};

var triggerActionData = {
	Id: "String",
	Trigger: "String",
	Condition: "String",
	HostOnly: "Boolean",
	$Action: "String",
	$Actions: ["String"],
	$CustomFields: {
		"String": "String"
	},
	MarkActionApplied: "Boolean"
};

var trinketData = {
	Id: "String",
	DisplayName: "String",
	Description: "String",
	Texture: "String",
	SheetIndex: "Int32",
	TrinketEffectClass: "String",
	DropsNaturally: "Boolean",
	CanBeReforged: "Boolean",
	$TrinketMetadata: {
		"String": "String"
	}
};

var plantableRule = {
	Id: "String",
	$Condition: "String",
	PlantedIn: "Int32",
	Result: "Int32",
	$DeniedMessage: "String"
};

var quantityModiier = {
	Id: "String",
	$Condition: "String",
	Modification: "Int32",
	Amount: "Single",
	$RandomAmount: ["Single"]
};

var statIncrement = {
	Id: "String",
	$RequiredItemId: "String",
	$RequiredTags: ["String"],
	StatName: "String"
};

var temporaryAnimatedSpriteDefinition = {
	Id: "String",
	$Condition: "String",
	Texture: "String",
	SourceRect: "Rectangle",
	Interval: "Single",
	Frames: "Int32",
	Loops: "Int32",
	PositionOffset: "Vector2",
	Flicker: "Boolean",
	Flip: "Boolean",
	SortOffset: "Single",
	AlphaFade: "Single",
	Scale: "Single",
	ScaleChange: "Single",
	Rotation: "Single",
	RotationChange: "Single",
	$Color: "String"
};

var bigCraftableData = {
	Name: "String",
	DisplayName: "String",
	Description: "String",
	Price: "Int32",
	Fragility: "Int32",
	CanBePlacedOutdoors: "Boolean",
	CanBePlacedIndoors: "Boolean",
	IsLamp: "Boolean",
	$Texture: "String",
	SpriteIndex: "Int32",
	$ContextTags: ["String"],
	$CustomFields: {
		"String": "String"
	}
};

var buffData = {
	DisplayName: "String",
	$Description: "String",
	IsDebuff: "Boolean",
	$GlowColor: "String",
	Duration: "Int32",
	MaxDuration: "Int32",
	IconTexture: "String",
	IconSpriteIndex: "Int32",
	$Effects: "StardewValley.GameData.Buffs.BuffAttributesData",
	$ActionsOnApply: ["String"],
	$CustomFields: {
		"String": "String"
	}
};

var buffAttributesData = {
	FarmingLevel: "Single",
	FishingLevel: "Single",
	MiningLevel: "Single",
	LuckLevel: "Single",
	ForagingLevel: "Single",
	MaxStamina: "Single",
	MagneticRadius: "Single",
	Speed: "Single",
	Defense: "Single",
	Attack: "Single"
};

var buildingData = {
	Name: "String",
	Description: "String",
	Texture: "String",
	$Skins: ["StardewValley.GameData.Buildings.BuildingSkin"],
	DrawShadow: "Boolean",
	UpgradeSignTile: "Vector2",
	UpgradeSignHeight: "Single",
	Size: "Point",
	FadeWhenBehind: "Boolean",
	SourceRect: "Rectangle",
	SeasonOffset: "Point",
	DrawOffset: "Vector2",
	SortTileOffset: "Single",
	$CollisionMap: "String",
	$AdditionalPlacementTiles: ["StardewValley.GameData.Buildings.BuildingPlacementTile"],
	$BuildingType: "String",
	$Builder: "String",
	$BuildCondition: "String",
	BuildDays: "Int32",
	BuildCost: "Int32",
	$BuildMaterials: ["StardewValley.GameData.Buildings.BuildingMaterial"],
	$BuildingToUpgrade: "String",
	MagicalConstruction: "Boolean",
	BuildMenuDrawOffset: "Point",
	HumanDoor: "Point",
	AnimalDoor: "Rectangle",
	AnimalDoorOpenDuration: "Single",
	$AnimalDoorOpenSound: "String",
	AnimalDoorCloseDuration: "Single",
	$AnimalDoorCloseSound: "String",
	$NonInstancedIndoorLocation: "String",
	$IndoorMap: "String",
	$IndoorMapType: "String",
	MaxOccupants: "Int32",
	$ValidOccupantTypes: ["String"],
	AllowAnimalPregnancy: "Boolean",
	$IndoorItemMoves: ["StardewValley.GameData.Buildings.IndoorItemMove"],
	$IndoorItems: ["StardewValley.GameData.Buildings.IndoorItemAdd"],
	$AddMailOnBuild: ["String"],
	$MetaData: {
		"String": "String"
	},
	$ModData: {
		"String": "String"
	},
	HayCapacity: "Int32",
	$Chests: ["StardewValley.GameData.Buildings.BuildingChest"],
	$DefaultAction: "String",
	AdditionalTilePropertyRadius: "Int32",
	AllowsFlooringUnderneath: "Boolean",
	$ActionTiles: ["StardewValley.GameData.Buildings.BuildingActionTile"],
	$TileProperties: ["StardewValley.GameData.Buildings.BuildingTileProperty"],
	$ItemConversions: ["StardewValley.GameData.Buildings.BuildingItemConversion"],
	$DrawLayers: ["StardewValley.GameData.Buildings.BuildingDrawLayer"],
	$CustomFields: {
		"String": "String"
	}
};

var buildingActionTile = {
	Id: "String",
	Tile: "Point",
	Action: "String"
};

var buildingChest = {
	Id: "String",
	Type: "Int32",
	$Sound: "String",
	$InvalidItemMessage: "String",
	$InvalidItemMessageCondition: "String",
	$InvalidCountMessage: "String",
	$ChestFullMessage: "String",
	DisplayTile: "Vector2",
	DisplayHeight: "Single"
};

var buildingDrawLayer = {
	Id: "String",
	$Texture: "String",
	SourceRect: "Rectangle",
	DrawPosition: "Vector2",
	DrawInBackground: "Boolean",
	SortTileOffset: "Single",
	$OnlyDrawIfChestHasContents: "String",
	FrameDuration: "Int32",
	FrameCount: "Int32",
	FramesPerRow: "Int32",
	AnimalDoorOffset: "Point"
};

var buildingItemConversion = {
	Id: "String",
	RequiredTags: ["String"],
	RequiredCount: "Int32",
	MaxDailyConversions: "Int32",
	SourceChest: "String",
	DestinationChest: "String",
	ProducedItems: ["StardewValley.GameData.GenericSpawnItemDataWithCondition"]
};

var buildingMaterial = {
	ItemId: "String",
	Amount: "Int32"
};

var buildingPlacementTile = {
	TileArea: "Rectangle",
	OnlyNeedsToBePassable: "Boolean"
};

var buildingSkin = {
	Id: "String",
	$Name: "String",
	$Description: "String",
	Texture: "String",
	$Condition: "String",
	$BuildDays: "Int32",
	$BuildCost: "Int32",
	$BuildMaterials: ["StardewValley.GameData.Buildings.BuildingMaterial"],
	ShowAsSeparateConstructionEntry: "Boolean",
	$Metadata: {
		"String": "String"
	}
};

var buildingTileProperty = {
	Id: "String",
	Name: "String",
	$Value: "String",
	Layer: "String",
	TileArea: "Rectangle"
};

var indoorItemAdd = {
	Id: "String",
	ItemId: "String",
	Tile: "Point",
	Indestructible: "Boolean"
};

var indoorItemMove = {
	Id: "String",
	Source: "Point",
	Destination: "Point",
	Size: "Point",
	$UnlessItemId: "String"
};

var characterData = {
	"DisplayName": "String",
	"$BirthSeason": "Int32",
	"BirthDay": "Int32",
	"$HomeRegion": "String",
	"Language": "Int32",
	"Gender": "Int32",
	"Age": "Int32",
	"Manner": "Int32",
	"SocialAnxiety": "Int32",
	"Optimism": "Int32",
	"IsDarkSkinned": "Boolean",
	"CanBeRomanced": "Boolean",
	"$LoveInterest": "String",
	"Calendar": "Int32",
	"SocialTab": "Int32",
	"$CanSocialize": "String",
	"CanReceiveGifts": "Boolean",
	"CanGreetNearbyCharacters": "Boolean",
	"$CanCommentOnPurchasedShopItems": "Boolean",
	"$CanVisitIsland": "String",
	"$IntroductionsQuest": "Boolean",
	"$ItemDeliveryQuests": "String",
	"PerfectionScore": "Boolean",
	"EndSlideShow": "Int32",
	"$SpouseAdopts": "String",
	"$SpouseWantsChildren": "String",
	"$SpouseGiftJealousy": "String",
	"SpouseGiftJealousyFriendshipChange": "Int32",
	"$SpouseRoom": "StardewValley.GameData.Characters.CharacterSpouseRoomData",
	"$SpousePatio": "StardewValley.GameData.Characters.CharacterSpousePatioData",
	"$SpouseFloors": ["String"],
	"$SpouseWallpapers": ["String"],
	"DumpsterDiveFriendshipEffect": "Int32",
	"$DumpsterDiveEmote": "Int32",
	"$FriendsAndFamily": {
		"String": "String"
	},
	"$FlowerDanceCanDance": "Boolean",
	"$WinterStarGifts": ["StardewValley.GameData.GenericSpawnItemDataWithCondition"],
	"$WinterStarParticipant": "String",
	"$UnlockConditions": "String",
	"SpawnIfMissing": "Boolean",
	"$Home": ["StardewValley.GameData.Characters.CharacterHomeData"],
	"$TextureName": "String",
	"$Appearance": ["StardewValley.GameData.Characters.CharacterAppearanceData"],
	"$MugShotSourceRect": "Rectangle",
	"Size": "Point",
	"Breather": "Boolean",
	"$BreathChestRect": "Rectangle",
	"$BreathChestPosition": "Point",
	"$Shadow": "StardewValley.GameData.Characters.CharacterShadowData",
	"EmoteOffset": "Point",
	"$ShakePortraits": ["Int32"],
	"KissSpriteIndex": "Int32",
	"KissSpriteFacingRight": "Boolean",
	"$HiddenProfileEmoteSound": "String",
	"HiddenProfileEmoteDuration": "Int32",
	"HiddenProfileEmoteStartFrame": "Int32",
	"HiddenProfileEmoteFrameCount": "Int32",
	"HiddenProfileEmoteFrameDuration": "Single",
	"$FormerCharacterNames": ["String"],
	"FestivalVanillaActorIndex": "Int32",
	"$CustomFields": {
		"String": "String"
	}
};

var characterAppearanceData = {
	"Id": "String",
	"$Condition": "String",
	"$Season": "Int32",
	"Indoors": "Boolean",
	"Outdoors": "Boolean",
	"$Portrait": "String",
	"$Sprite": "String",
	"IsIslandAttire": "Boolean",
	"Precedence": "Int32",
	"Weight": "Int32"
};

var characterHomeData = {
	"Id": "String",
	"$Condition": "String",
	"Location": "String",
	"Tile": "Point",
	"$Direction": "String"
};

var characterShadowData = {
	"Visible": "Boolean",
	"Offset": "Point",
	"Scale": "Single"
};

var characterSpousePatioData = {
	"$MapAsset": "String",
	"MapSourceRect": "Rectangle",
	"$SpriteAnimationFrames": ["Array<Int32>"],
	"SpriteAnimationPixelOffset": "Point"
};

var characterSpouseRoomData = {
	"$MapAsset": "String",
	"MapSourceRect": "Rectangle"
};

var cropData = {
	"Seasons": ["Int32"],
	"DaysInPhase": ["Int32"],
	"RegrowDays": "Int32",
	"IsRaised": "Boolean",
	"IsPaddyCrop": "Boolean",
	"NeedsWatering": "Boolean",
	"$PlantableLocationRules": ["StardewValley.GameData.PlantableRule"],
	"HarvestItemId": "String",
	"HarvestMinStack": "Int32",
	"HarvestMaxStack": "Int32",
	"HarvestMaxIncreasePerFarmingLevel": "Single",
	"ExtraHarvestChance": "Double",
	"HarvestMethod": "Int32",
	"HarvestMinQuality": "Int32",
	"$HarvestMaxQuality": "Int32",
	"$TintColors": ["String"],
	"Texture": "String",
	"SpriteIndex": "Int32",
	"CountForMonoculture": "Boolean",
	"CountForPolyculture": "Boolean",
	"$CustomFields": {
		"String": "String"
	}
};

var farmAnimalData = {
	"$DisplayName": "String",
	"$House": "String",
	"Gender": "Int32",
	"PurchasePrice": "Int32",
	"SellPrice": "Int32",
	"$ShopTexture": "String",
	"ShopSourceRect": "Rectangle",
	"$ShopDisplayName": "String",
	"$ShopDescription": "String",
	"$ShopMissingBuildingDescription": "String",
	"$RequiredBuilding": "String",
	"$UnlockCondition": "String",
	"$AlternatePurchaseTypes": ["StardewValley.GameData.FarmAnimals.AlternatePurchaseAnimals"],
	"$EggItemIds": ["String"],
	"IncubationTime": "Int32",
	"IncubatorParentSheetOffset": "Int32",
	"$BirthText": "String",
	"DaysToMature": "Int32",
	"CanGetPregnant": "Boolean",
	"DaysToProduce": "Int32",
	"HarvestType": "Int32",
	"$HarvestTool": "String",
	"$ProduceItemIds": ["StardewValley.GameData.FarmAnimals.FarmAnimalProduce"],
	"$DeluxeProduceItemIds": ["StardewValley.GameData.FarmAnimals.FarmAnimalProduce"],
	"ProduceOnMature": "Boolean",
	"FriendshipForFasterProduce": "Int32",
	"DeluxeProduceMinimumFriendship": "Int32",
	"DeluxeProduceCareDivisor": "Single",
	"DeluxeProduceLuckMultiplier": "Single",
	"CanEatGoldenCrackers": "Boolean",
	"ProfessionForHappinessBoost": "Int32",
	"ProfessionForQualityBoost": "Int32",
	"ProfessionForFasterProduce": "Int32",
	"$Sound": "String",
	"$BabySound": "String",
	"Texture": "String",
	"$HarvestedTexture": "String",
	"$BabyTexture": "String",
	"UseFlippedRightForLeft": "Boolean",
	"SpriteWidth": "Int32",
	"SpriteHeight": "Int32",
	"UseDoubleUniqueAnimationFrames": "Boolean",
	"SleepFrame": "Int32",
	"EmoteOffset": "Point",
	"SwimOffset": "Point",
	"$Skins": ["StardewValley.GameData.FarmAnimals.FarmAnimalSkin"],
	"$ShadowWhenBabySwims": "StardewValley.GameData.FarmAnimals.FarmAnimalShadowData",
	"$ShadowWhenBaby": "StardewValley.GameData.FarmAnimals.FarmAnimalShadowData",
	"$ShadowWhenAdultSwims": "StardewValley.GameData.FarmAnimals.FarmAnimalShadowData",
	"$ShadowWhenAdult": "StardewValley.GameData.FarmAnimals.FarmAnimalShadowData",
	"CanSwim": "Boolean",
	"BabiesFollowAdults": "Boolean",
	"GrassEatAmount": "Int32",
	"HappinessDrain": "Int32",
	"UpDownPetHitboxTileSize": "Vector2",
	"LeftRightPetHitboxTileSize": "Vector2",
	"BabyUpDownPetHitboxTileSize": "Vector2",
	"BabyLeftRightPetHitboxTileSize": "Vector2",
	"$StatToIncrementOnProduce": ["StardewValley.GameData.StatIncrement"],
	"ShowInSummitCredits": "Boolean",
	"$CustomFields": {
		"String": "String"
	}
};

var alternatePurchaseAnimals = {
	Id: "String",
	$Condition: "String",
	AnimalIds: ["String"]
};

var farmAnimalProduce = {
	"$Id": "String",
	"$Condition": "String",
	"MinimumFriendship": "Int32",
	"ItemId": "String"
};

var farmAnimalShadowData = {
	"Visible": "Boolean",
	"$Offset": "Point",
	"$Scale": "Single"
};

var farmAnimalSkin = {
	"Id": "String",
	"Weight": "Single",
	"$Texture": "String",
	"$HarvestedTexture": "String",
	"$BabyTexture": "String"
};

var fenceData = {
	Health: "Int32",
	RepairHealthAdjustmentMinimum: "Single",
	RepairHealthAdjustmentMaximum: "Single",
	Texture: "String",
	PlacementSound: "String",
	$RemovalSound: "String",
	$RemovalToolIds: ["String"],
	$RemovalToolTypes: ["String"],
	RemovalDebrisType: "Int32",
	HeldObjectDrawOffset: "Vector2",
	LeftEndHeldObjectDrawX: "Single",
	RightEndHeldObjectDrawX: "Single"
};

var floorPathData = {
	"Id": "String",
	"ItemId": "String",
	"Texture": "String",
	"Corner": "Point",
	"WinterTexture": "String",
	"WinterCorner": "Point",
	"PlacementSound": "String",
	"$RemovalSound": "String",
	"RemovalDebrisType": "Int32",
	"FootstepSound": "String",
	"ConnectType": "Int32",
	"ShadowType": "Int32",
	"CornerSize": "Int32",
	"FarmSpeedBuff": "Single"
};

var fruitTreeData = {
	"DisplayName": "String",
	"Seasons": ["Int32"],
	"Fruit": ["StardewValley.GameData.FruitTrees.FruitTreeFruitData"],
	"Texture": "String",
	"TextureSpriteRow": "Int32",
	"$CustomFields": {
		"String": "String"
	},
	"$PlantableLocationRules": ["StardewValley.GameData.PlantableRule"]
};

var fruitTreeFruitData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	"$Season": "Int32",
	"Chance": "Single"
});

var garbageCanData = {
	DefaultBaseChance: "Single",
	BeforeAll: ["StardewValley.GameData.GarbageCans.GarbageCanItemData"],
	AfterAll: ["StardewValley.GameData.GarbageCans.GarbageCanItemData"],
	GarbageCans: {
		"String": "StardewValley.GameData.GarbageCans.GarbageCanEntryData"
	}
};

var garbageCanEntryData = {
	BaseChance: "Single",
	Items: ["StardewValley.GameData.GarbageCans.GarbageCanItemData"],
	$CustomFields: {
		"String": "String"
	}
};

var garbageCanItemData = _objectSpread2(_objectSpread2({}, genericSpawnItemData), {}, {
	$Condition: "String",
	IgnoreBaseChance: "Boolean",
	IsMegaSuccess: "Boolean",
	IsDoubleMegaSuccess: "Boolean",
	AddToInventoryDirectly: "Boolean",
	CreateMultipleDebris: "Boolean"
});

var giantCropData = {
	"FromItemId": "String",
	"HarvestItems": ["StardewValley.GameData.GiantCrops.GiantCropHarvestItemData"],
	"Texture": "String",
	"TexturePosition": "Point",
	"TileSize": "Point",
	"Health": "Int32",
	"Chance": "Single",
	"$Condition": "String",
	"$CustomFields": {
		"String": "String"
	}
};

var giantCropHarvestItemData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	"Chance": "Single",
	"$ForShavingEnchantment": "Boolean",
	"$ScaledMinStackWhenShaving": "Int32",
	"$ScaledMaxStackWhenShaving": "Int32"
});

var locationContextData = {
	"$SeasonOverride": "Int32",
	"$DefaultMusic": "String",
	"$DefaultMusicCondition": "String",
	"DefaultMusicDelayOneScreen": "Boolean",
	"$Music": ["StardewValley.GameData.Locations.LocationMusicData"],
	"$DayAmbience": "String",
	"$NightAmbience": "String",
	"PlayRandomAmbientSounds": "Boolean",
	"AllowRainTotem": "Boolean",
	"$RainTotemAffectsContext": "String",
	"$WeatherConditions": ["StardewValley.GameData.LocationContexts.WeatherCondition"],
	"$CopyWeatherFromLocation": "String",
	"$ReviveLocations": ["StardewValley.GameData.LocationContexts.ReviveLocation"],
	"MaxPassOutCost": "Int32",
	"$PassOutMail": ["StardewValley.GameData.LocationContexts.PassOutMailData"],
	"$PassOutLocations": ["StardewValley.GameData.LocationContexts.ReviveLocation"],
	"$CustomFields": {
		"String": "String"
	}
};

var passOutMailData = {
	"Id": "String",
	"$Condition": "String",
	"Mail": "String",
	"MaxPassOutCost": "Int32",
	"SkipRandomSelection": "Boolean"
};

var reviveLocation = {
	"Id": "String",
	"$Condition": "String",
	"Location": "String",
	"Position": "Point"
};

var weatherCondition = {
	"Id": "String",
	"$Condition": "String",
	"Weather": "String"
};

var locationData = {
	"$DisplayName": "String",
	"$DefaultArrivalTile": "Point",
	"ExcludeFromNpcPathfinding": "Boolean",
	"$CreateOnLoad": "StardewValley.GameData.Locations.CreateLocationData",
	"$FormerLocationNames": ["String"],
	"$CanPlantHere": "Boolean",
	"CanHaveGreenRainSpawns": "Boolean",
	"$ArtifactSpots": ["StardewValley.GameData.Locations.ArtifactSpotDropData"],
	"$FishAreas": {
		"String": "StardewValley.GameData.Locations.FishAreaData"
	},
	"$Fish": ["StardewValley.GameData.Locations.SpawnFishData"],
	"$Forage": ["StardewValley.GameData.Locations.SpawnForageData"],
	"MinDailyWeeds": "Int32",
	"MaxDailyWeeds": "Int32",
	"FirstDayWeedMultiplier": "Int32",
	"MinDailyForageSpawn": "Int32",
	"MaxDailyForageSpawn": "Int32",
	"MaxSpawnedForageAtOnce": "Int32",
	"ChanceForClay": "Double",
	"$Music": ["StardewValley.GameData.Locations.LocationMusicData"],
	"$MusicDefault": "String",
	"MusicContext": "Int32",
	"MusicIgnoredInRain": "Boolean",
	"MusicIgnoredInSpring": "Boolean",
	"MusicIgnoredInSummer": "Boolean",
	"MusicIgnoredInFall": "Boolean",
	"MusicIgnoredInFallDebris": "Boolean",
	"MusicIgnoredInWinter": "Boolean",
	"MusicIsTownTheme": "Boolean",
	"$CustomFields": {
		"String": "String"
	}
};

var artifactSpotDropData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	"Chance": "Double",
	"ApplyGenerousEnchantment": "Boolean",
	"OneDebrisPerDrop": "Boolean",
	"Precedence": "Int32",
	"ContinueOnDrop": "Boolean"
});

var createLocationData = {
	"MapPath": "String",
	"$Type": "String",
	"AlwaysActive": "Boolean"
};

var fishAreaData = {
	"$DisplayName": "String",
	"$Position": "Rectangle",
	"$CrabPotFishTypes": ["String"],
	"CrabPotJunkChance": "Single"
};

var locationMusicData = {
	"$Id": "String",
	"Track": "String",
	"$Condition": "String"
};

var spawnFishData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	"Chance": "Single",
	"$Season": "Int32",
	"$FishAreaId": "String",
	"$BobberPosition": "Rectangle",
	"$PlayerPosition": "Rectangle",
	"MinFishingLevel": "Int32",
	"MinDistanceFromShore": "Int32",
	"MaxDistanceFromShore": "Int32",
	"ApplyDailyLuck": "Boolean",
	"CuriosityLureBuff": "Single",
	"SpecificBaitBuff": "Single",
	"SpecificBaitMultiplier": "Single",
	"CatchLimit": "Int32",
	"$CanUseTrainingRod": "Boolean",
	"IsBossFish": "Boolean",
	"$SetFlagOnCatch": "String",
	"RequireMagicBait": "Boolean",
	"Precedence": "Int32",
	"IgnoreFishDataRequirements": "Boolean",
	"CanBeInherited": "Boolean",
	"$ChanceModifiers": ["StardewValley.GameData.QuantityModifier"],
	"ChanceModifierMode": "Int32",
	"ChanceBoostPerLuckLevel": "Single",
	"UseFishCaughtSeededRandom": "Boolean"
});

var spawnForageData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	Chance: "Double",
	$Season: "Int32"
});

var machineData = {
	"HasInput": "Boolean",
	"HasOutput": "Boolean",
	"$InteractMethod": "String",
	"$OutputRules": ["StardewValley.GameData.Machines.MachineOutputRule"],
	"$AdditionalConsumedItems": ["StardewValley.GameData.Machines.MachineItemAdditionalConsumedItems"],
	"$PreventTimePass": ["Int32"],
	"$ReadyTimeModifiers": ["StardewValley.GameData.QuantityModifier"],
	"ReadyTimeModifierMode": "Int32",
	"$InvalidItemMessage": "String",
	"$InvalidItemMessageCondition": "String",
	"$InvalidCountMessage": "String",
	"$LoadEffects": ["StardewValley.GameData.Machines.MachineEffects"],
	"$WorkingEffects": ["StardewValley.GameData.Machines.MachineEffects"],
	"WorkingEffectChance": "Single",
	"AllowLoadWhenFull": "Boolean",
	"WobbleWhileWorking": "Boolean",
	"$LightWhileWorking": "StardewValley.GameData.Machines.MachineLight",
	"ShowNextIndexWhileWorking": "Boolean",
	"ShowNextIndexWhenReady": "Boolean",
	"AllowFairyDust": "Boolean",
	"IsIncubator": "Boolean",
	"OnlyCompleteOvernight": "Boolean",
	"$ClearContentsOvernightCondition": "String",
	"$StatsToIncrementWhenLoaded": ["StardewValley.GameData.StatIncrement"],
	"$StatsToIncrementWhenHarvested": ["StardewValley.GameData.StatIncrement"],
	"$ExperienceGainOnHarvest": "String",
	"$CustomFields": {
		"String": "String"
	}
};

var machineEffects = {
	"Id": "String",
	"$Condition": "String",
	"$Sounds": ["StardewValley.GameData.Machines.MachineSoundData"],
	"Interval": "Int32",
	"$Frames": ["Int32"],
	"ShakeDuration": "Int32",
	"$TemporarySprites": ["StardewValley.GameData.TemporaryAnimatedSpriteDefinition"]
};

var machineItemAdditionalConsumedItems = {
	"ItemId": "String",
	"RequiredCount": "Int32",
	"InvalidCountMessage": "String"
};

var machineItemOutput = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	"$OutputMethod": "String",
	"CopyColor": "Boolean",
	"CopyPrice": "Boolean",
	"CopyQuality": "Boolean",
	"$PreserveType": "String",
	"$PreserveId": "String",
	"IncrementMachineParentSheetIndex": "Int32",
	"$PriceModifiers": ["StardewValley.GameData.QuantityModifier"],
	"PriceModifierMode": "Int32",
	"$CustomData": {
		"String": "String"
	}
});

var machineLight = {
	Radius: "Single",
	$Color: "String"
};

var machineOutputRule = {
	"Id": "String",
	"Triggers": ["StardewValley.GameData.Machines.MachineOutputTriggerRule"],
	"UseFirstValidOutput": "Boolean",
	"$OutputItem": ["StardewValley.GameData.Machines.MachineItemOutput"],
	"MinutesUntilReady": "Int32",
	"DaysUntilReady": "Int32",
	"$InvalidCountMessage": "String",
	"RecalculateOnCollect": "Boolean"
};

var machineOutputTriggerRule = {
	$Id: "String",
	Trigger: "Int32",
	$RequiredItemId: "String",
	$RequiredTags: ["String"],
	RequiredCount: "Int32",
	$Condition: "String"
};

var machineSoundData = {
	Id: "String",
	Delay: "Int32"
};

var makeoverOutfit = {
	Id: "String",
	OutfitParts: ["StardewValley.GameData.MakeoverOutfits.MakeoverItem"],
	$Gender: "String"
};

var makeoverItem = {
	$Id: "String",
	$ItemId: "String",
	$Color: "String"
};

var minecartNetworkData = {
	"$UnlockCondition": "String",
	"$LockedMessage": "String",
	"$ChooseDestinationMessage": "String",
	"$BuyTicketMessage": "String",
	"Destinations": ["StardewValley.GameData.Minecarts.MinecartDestinationData"]
};

var minecartDestinationData = {
	"Id": "String",
	"DisplayName": "String",
	"$Condition": "String",
	"Price": "Int32",
	"$BuyTicketMessage": "String",
	"TargetLocation": "String",
	"TargetTile": "Point",
	"$TargetDirection": "String",
	"$CustomFields": {
		"String": "String"
	}
};

var movieData = {
	"$Id": "String",
	"$Seasons": ["Int32"],
	"$YearModulus": "Int32",
	"$YearRemainder": "Int32",
	"$Texture": "String",
	"SheetIndex": "Int32",
	"Title": "String",
	"Description": "String",
	"$Tags": ["String"],
	"$CranePrizes": ["StardewValley.GameData.Movies.MovieCranePrizeData"],
	"$ClearDefaultCranePrizeGroups": ["Int32"],
	"Scenes": ["MovieScene"],
	"$CustomFields": {
		"String": "String"
	}
};

var movieCranePrizeData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	Rarity: "Int32"
});

var museumRewards = {
	"TargetContextTags": ["StardewValley.GameData.Museum.MuseumDonationRequirement"],
	"$RewardItemId": "String",
	"RewardItemCount": "Int32",
	"RewardItemIsSpecial": "Boolean",
	"RewardItemIsRecipe": "Boolean",
	"$RewardActions": ["String"],
	"FlagOnCompletion": "Boolean",
	"$CustomFields": {
		"String": "String"
	}
};

var museumDonationRequirement = {
	Tag: "String",
	Count: "Int32"
};

var objectData = {
	"Name": "String",
	"DisplayName": "String",
	"Description": "String",
	"Type": "String",
	"Category": "Int32",
	"Price": "Int32",
	"$Texture": "String",
	"SpriteIndex": "Int32",
	"Edibility": "Int32",
	"IsDrink": "Boolean",
	"$Buffs": ["StardewValley.GameData.Objects.ObjectBuffData"],
	"GeodeDropsDefaultItems": "Boolean",
	"$GeodeDrops": ["StardewValley.GameData.Objects.ObjectGeodeDropData"],
	"$ArtifactSpotChances": {
		"String": "Single"
	},
	"ExcludeFromFishingCollection": "Boolean",
	"ExcludeFromShippingCollection": "Boolean",
	"ExcludeFromRandomSale": "Boolean",
	"$ContextTags": ["String"],
	"$CustomFields": {
		"String": "String"
	}
};

var objectBuffData = {
	"$Id": "String",
	"$BuffId": "String",
	"$IconTexture": "String",
	"IconSpriteIndex": "Int32",
	"Duration": "Int32",
	"IsDebuff": "Boolean",
	"$GlowColor": "String",
	"$CustomAttributes": "StardewValley.GameData.Buffs.BuffAttributesData",
	"$CustomFields": {
		"String": "String"
	}
};

var objectGeodeDropData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	Chance: "Double",
	$SetFlagOnPickup: "String",
	Precedence: "Int32"
});

var shirtData = {
	"$Name": "String",
	"$DisplayName": "String",
	"$Description": "String",
	"Price": "Int32",
	"$Texture": "String",
	"SpriteIndex": "Int32",
	"$DefaultColor": "String",
	"CanBeDyed": "Boolean",
	"IsPrismatic": "Boolean",
	"HasSleeves": "Boolean",
	"CanChooseDuringCharacterCustomization": "Boolean",
	"$CustomFields": {
		"String": "String"
	}
};

var pantsData = {
	"Name": "String",
	"DisplayName": "String",
	"Description": "String",
	"Price": "Int32",
	"$Texture": "String",
	"SpriteIndex": "Int32",
	"$DefaultColor": "String",
	"CanBeDyed": "Boolean",
	"IsPrismatic": "Boolean",
	"CanChooseDuringCharacterCustomization": "Boolean",
	"$CustomFields": {
		"String": "String"
	}
};

var petData = {
	"DisplayName": "String",
	"BarkSound": "String",
	"ContentSound": "String",
	"RepeatContentSoundAfter": "Int32",
	"EmoteOffset": "Point",
	"EventOffset": "Point",
	"$AdoptionEventLocation": "String",
	"$AdoptionEventId": "String",
	"SummitPerfectionEvent": "StardewValley.GameData.Pets.PetSummitPerfectionEventData",
	"MoveSpeed": "Int32",
	"SleepOnBedChance": "Single",
	"SleepNearBedChance": "Single",
	"SleepOnRugChance": "Single",
	"Behaviors": ["StardewValley.GameData.Pets.PetBehavior"],
	"GiftChance": "Single",
	"$Gifts": ["StardewValley.GameData.Pets.PetGift"],
	"Breeds": ["StardewValley.GameData.Pets.PetBreed"],
	"$CustomFields": {
		"String": "String"
	}
};

var petAnimationFrame = {
	"Frame": "Int32",
	"Duration": "Int32",
	"HitGround": "Boolean",
	"Jump": "Boolean",
	"$Sound": "String",
	"SoundRangeFromBorder": "Int32",
	"SoundRange": "Int32",
	"SoundIsVoice": "Boolean"
};

var petBehavior = {
	"Id": "String",
	"IsSideBehavior": "Boolean",
	"RandomizeDirection": "Boolean",
	"$Direction": "String",
	"WalkInDirection": "Boolean",
	"MoveSpeed": "Int32",
	"$SoundOnStart": "String",
	"SoundRangeFromBorder": "Int32",
	"SoundRange": "Int32",
	"SoundIsVoice": "Boolean",
	"Shake": "Int32",
	"$Animation": ["StardewValley.GameData.Pets.PetAnimationFrame"],
	"LoopMode": "Int32",
	"AnimationMinimumLoops": "Int32",
	"AnimationMaximumLoops": "Int32",
	"$AnimationEndBehaviorChanges": ["StardewValley.GameData.Pets.PetBehaviorChanges"],
	"Duration": "Int32",
	"MinimumDuration": "Int32",
	"MaximumDuration": "Int32",
	"$TimeoutBehaviorChanges": ["StardewValley.GameData.Pets.PetBehaviorChanges"],
	"$PlayerNearbyBehaviorChanges": ["StardewValley.GameData.Pets.PetBehaviorChanges"],
	"RandomBehaviorChangeChance": "Single",
	"$RandomBehaviorChanges": ["StardewValley.GameData.Pets.PetBehaviorChanges"],
	"$JumpLandBehaviorChanges": ["StardewValley.GameData.Pets.PetBehaviorChanges"]
};

var petBehaviorChanges = {
	"Weight": "Single",
	"OutsideOnly": "Boolean",
	"$UpBehavior": "String",
	"$DownBehavior": "String",
	"$LeftBehavior": "String",
	"$RightBehavior": "String",
	"$Behavior": "String"
};

var petBreed = {
	"Id": "String",
	"Texture": "String",
	"IconTexture": "String",
	"IconSourceRect": "Rectangle",
	"CanBeChosenAtStart": "Boolean",
	"CanBeAdoptedFromMarnie": "Boolean",
	"AdoptionPrice": "Int32",
	"$BarkOverride": "String",
	"VoicePitch": "Single"
};

var petGift = {
	"Id": "String",
	"MinimumFriendshipThreshold": "Int32",
	"Weight": "Single",
	"QualifiedItemID": "String",
	"Stack": "Int32"
};

var petSummitPerfectionEventData = {
	"SourceRect": "Rectangle",
	"AnimationLength": "Int32",
	"Flipped": "Boolean",
	"Motion": "Vector2",
	"PingPong": "Boolean"
};

var powerData = {
	"DisplayName": "String",
	"$Description": "String",
	"TexturePath": "String",
	"TexturePosition": "Point",
	"UnlockedCondition": "String",
	"$CustomFields": {
		"String": "String"
	}
};

var shopData = {
	"$ApplyProfitMargins": "Boolean",
	"Currency": "Int32",
	"$StackSizeVisibility": "Int32",
	"$OpenSound": "String",
	"$PurchaseSound": "String",
	"$PurchaseRepeatSound": "String",
	"$PriceModifiers": ["StardewValley.GameData.QuantityModifier"],
	"PriceModifierMode": "Int32",
	"$Owners": ["StardewValley.GameData.Shops.ShopOwnerData"],
	"$VisualTheme": ["StardewValley.GameData.Shops.ShopThemeData"],
	"$SalableItemTags": ["String"],
	"Items": ["StardewValley.GameData.Shops.ShopItemData"],
	"$CustomFields": {
		"String": "String"
	}
};

var shopDialogueData = {
	Id: "String",
	$Condition: "String",
	$Dialogue: "String",
	$RandomDialogue: ["String"]
};

var shopItemData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	"$TradeItemId": "String",
	"TradeItemAmount": "Int32",
	"Price": "Int32",
	"$ApplyProfitMargins": "Boolean",
	"AvailableStock": "Int32",
	"AvailableStockLimit": "Int32",
	"AvoidRepeat": "Boolean",
	"UseObjectDataPrice": "Boolean",
	"IgnoreShopPriceModifiers": "Boolean",
	"$PriceModifiers": ["StardewValley.GameData.QuantityModifier"],
	"PriceModifierMode": "Int32",
	"$AvailableStockModifiers": ["StardewValley.GameData.QuantityModifier"],
	"AvailableStockModifierMode": "Int32",
	"$ActionsOnPurchase": ["String"],
	"$CustomFields": {
		"String": "String"
	}
});

var shopOwnerData = {
	$Id: "String",
	$Name: "String",
	"$Condition": "String",
	"$Portrait": "String",
	"$Dialogues": ["StardewValley.GameData.Shops.ShopDialogueData"],
	"RandomizeDialogueOnOpen": "Boolean",
	"$ClosedMessage": "String"
};

var shopThemeData = {
	"$Condition": "String",
	"$WindowBorderTexture": "String",
	"$WindowBorderSourceRect": "Rectangle",
	"$PortraitBackgroundTexture": "String",
	"$PortraitBackgroundSourceRect": "Rectangle",
	"$DialogueBackgroundTexture": "String",
	"$DialogueBackgroundSourceRect": "Rectangle",
	"$DialogueColor": "String",
	"$DialogueShadowColor": "String",
	"$ItemRowBackgroundTexture": "String",
	"$ItemRowBackgroundSourceRect": "Rectangle",
	"$ItemRowBackgroundHoverColor": "String",
	"$ItemRowTextColor": "String",
	"$ItemIconBackgroundTexture": "String",
	"$ItemIconBackgroundSourceRect": "Rectangle",
	"$ScrollUpTexture": "String",
	"$ScrollUpSourceRect": "Rectangle",
	"$ScrollDownTexture": "String",
	"$ScrollDownSourceRect": "Rectangle",
	"$ScrollBarFrontTexture": "String",
	"$ScrollBarFrontSourceRect": "Rectangle",
	"$ScrollBarBackTexture": "String",
	"$ScrollBarBackSourceRect": "Rectangle"
};

var toolData = {
	"ClassName": "String",
	"Name": "String",
	"AttachmentSlots": "Int32",
	"SalePrice": "Int32",
	"DisplayName": "String",
	"Description": "String",
	"Texture": "String",
	"SpriteIndex": "Int32",
	"MenuSpriteIndex": "Int32",
	"UpgradeLevel": "Int32",
	"ApplyUpgradeLevelToDisplayName": "Boolean",
	"$ConventionalUpgradeFrom": "String",
	"$UpgradeFrom": ["StardewValley.GameData.Tools.ToolUpgradeData"],
	"CanBeLostOnDeath": "Boolean",
	"$SetProperties": {
		"String": "String"
	},
	"$ModData": {
		"String": "String"
	},
	"$CustomFields": {
		"String": "String"
	}
};

var toolUpgradeData = {
	"$Condition": "String",
	"Price": "Int32",
	"$RequireToolId": "String",
	"$TradeItemId": "String",
	"TradeItemAmount": "Int32"
};

var weaponData = {
	"Name": "String",
	"DisplayName": "String",
	"Description": "String",
	"MinDamage": "Int32",
	"MaxDamage": "Int32",
	"Knockback": "Single",
	"Speed": "Int32",
	"Precision": "Int32",
	"Defense": "Int32",
	"Type": "Int32",
	"MineBaseLevel": "Int32",
	"MineMinLevel": "Int32",
	"AreaOfEffect": "Int32",
	"CritChance": "Single",
	"CritMultiplier": "Single",
	"CanBeLostOnDeath": "Boolean",
	"Texture": "String",
	"SpriteIndex": "Int32",
	"$Projectiles": ["StardewValley.GameData.Weapons.WeaponProjectile"],
	"$CustomFields": {
		"String": "String"
	}
};

var weaponProjectile = {
	"Id": "String",
	"Damage": "Int32",
	"Explodes": "Boolean",
	"Bounces": "Int32",
	"MaxDistance": "Int32",
	"Velocity": "Int32",
	"RotationVelocity": "Int32",
	"TailLength": "Int32",
	"$FireSound": "String",
	"$BounceSound": "String",
	"$CollisionSound": "String",
	"MinAngleOffset": "Single",
	"MaxAngleOffset": "Single",
	"SpriteIndex": "Int32",
	"$Item": "StardewValley.GameData.GenericSpawnItemData"
};

var weddingData = {
	EventScript: {
		"String": "String"
	},
	Attendees: {
		"String": "StardewValley.GameData.Weddings.WeddingAttendeeData"
	}
};

var weddingAttendeeData = {
	Id: "String",
	$Condition: "String",
	Setup: "String",
	$Celebration: "String",
	IgnoreUnlockConditions: "Boolean"
};

var wildTreeData = {
	"Textures": ["StardewValley.GameData.WildTrees.WildTreeTextureData"],
	"SeedItemId": "String",
	"SeedPlantable": "Boolean",
	"GrowthChance": "Single",
	"FertilizedGrowthChance": "Single",
	"SeedSpreadChance": "Single",
	"SeedOnShakeChance": "Single",
	"SeedOnChopChance": "Single",
	"DropWoodOnChop": "Boolean",
	"DropHardwoodOnLumberChop": "Boolean",
	"IsLeafy": "Boolean",
	"IsLeafyInWinter": "Boolean",
	"IsLeafyInFall": "Boolean",
	"$PlantableLocationRules": ["StardewValley.GameData.PlantableRule"],
	"GrowsInWinter": "Boolean",
	"IsStumpDuringWinter": "Boolean",
	"AllowWoodpeckers": "Boolean",
	"UseAlternateSpriteWhenNotShaken": "Boolean",
	"UseAlternateSpriteWhenSeedReady": "Boolean",
	"$DebrisColor": "String",
	"$SeedDropItems": ["StardewValley.GameData.WildTrees.WildTreeSeedDropItemData"],
	"$ChopItems": ["StardewValley.GameData.WildTrees.WildTreeChopItemData"],
	"$TapItems": ["StardewValley.GameData.WildTrees.WildTreeTapItemData"],
	"$ShakeItems": ["StardewValley.GameData.WildTrees.WildTreeItemData"],
	"$CustomFields": {
		"String": "String"
	},
	"GrowsMoss": "Boolean"
};

var wildTreeItemData = _objectSpread2(_objectSpread2({}, genericSpawnItemDataWithCondition), {}, {
	$Season: "Int32",
	Chance: "Single"
});

var wildTreeChopItemData = _objectSpread2(_objectSpread2({}, wildTreeItemData), {}, {
	"$MinSize": "Int32",
	"$MaxSize": "Int32",
	"$ForStump": "Boolean"
});

var wildTreeSeedDropItemData = _objectSpread2(_objectSpread2({}, wildTreeItemData), {}, {
	ContinueOnDrop: "Boolean"
});

var wildTreeTapItemData = _objectSpread2(_objectSpread2({}, wildTreeItemData), {}, {
	$PreviousItemId: ["String"],
	DaysUntilReady: "Int32",
	$DaysUntilReadyModifiers: ["StardewValley.GameData.QuantityModifier"],
	DaysUntilReadyModifierMode: "Int32"
});

var wildTreeTextureData = {
	"$Condition": "String",
	"$Season": "Int32",
	"Texture": "String"
};

var worldMapAreaData = {
	"Id": "String",
	"$Condition": "String",
	"PixelArea": "Rectangle",
	"$ScrollText": "String",
	"$Textures": ["StardewValley.GameData.WorldMaps.WorldMapTextureData"],
	"$Tooltips": ["StardewValley.GameData.WorldMaps.WorldMapTooltipData"],
	"$WorldPositions": ["StardewValley.GameData.WorldMaps.WorldMapAreaPositionData"],
	"$CustomFields": {
		"String": "String"
	}
};

var worldMapAreaPositionData = {
	Id: "String",
	$Condition: "String",
	$LocationContext: "String",
	$LocationName: "String",
	$LocationNames: ["String"],
	TileArea: "Rectangle",
	$ExtendedTileArea: "Rectangle",
	MapPixelArea: "Rectangle",
	$ScrollText: "String",
	$ScrollTextZones: ["StardewValley.GameData.WorldMaps.WorldMapAreaPositionScrollTextZoneData"]
};

var worldMapAreaPositionScrollTextZoneData = {
	Id: "String",
	TileArea: "Rectangle",
	$ScrollText: "String"
};

var worldMapRegionData = {
	"BaseTexture": ["StardewValley.GameData.WorldMaps.WorldMapTextureData"],
	"$MapNeighborIdAliases": {
		"String": "String"
	},
	"MapAreas": ["StardewValley.GameData.WorldMaps.WorldMapAreaData"]
};

var worldMapTextureData = {
	"Id": "String",
	"$Condition": "String",
	"Texture": "String",
	"SourceRect": "Rectangle",
	"MapPixelArea": "Rectangle"
};

var worldMapTooltipData = {
	"Id": "String",
	"$Condition": "String",
	"$KnownCondition": "String",
	"PixelArea": "Rectangle",
	"Text": "String",
	"LeftNeighbor": "String",
	"RightNeighbor": "String",
	"UpNeighbor": "String",
	"DownNeighbor": "String"
};

const schemes = {
	"StardewValley.GameData.GenericSpawnItemData": genericSpawnItemData,
	"StardewValley.GameData.GenericSpawnItemDataWithCondition": genericSpawnItemDataWithCondition,
	"StardewValley.GameData.AudioCueData": audioCueData,
	"StardewValley.GameData.IncomingPhoneCallData": incomingPhoneCallData,
	"StardewValley.GameData.JukeboxTrackData": jukeboxTrackData,
	"StardewValley.GameData.MannequinData": mannequinData,
	"StardewValley.GameData.MonsterSlayerQuestData": monsterSlayerQuestData,
	"StardewValley.GameData.PassiveFestivalData": passiveFestivalData,
	"StardewValley.GameData.TriggerActionData": triggerActionData,
	"StardewValley.GameData.TrinketData": trinketData,
	"StardewValley.GameData.PlantableRule": plantableRule,
	"StardewValley.GameData.QuantityModifier": quantityModiier,
	"StardewValley.GameData.StatIncrement": statIncrement,
	"StardewValley.GameData.TemporaryAnimatedSpriteDefinition": temporaryAnimatedSpriteDefinition,
	"StardewValley.GameData.BigCraftables.BigCraftableData": bigCraftableData,
	"StardewValley.GameData.Buffs.BuffData": buffData,
	"StardewValley.GameData.Buffs.BuffAttributesData": buffAttributesData,
	"StardewValley.GameData.Buildings.BuildingData": buildingData,
	"StardewValley.GameData.Buildings.BuildingActionTile": buildingActionTile,
	"StardewValley.GameData.Buildings.BuildingChest": buildingChest,
	"StardewValley.GameData.Buildings.BuildingDrawLayer": buildingDrawLayer,
	"StardewValley.GameData.Buildings.BuildingItemConversion": buildingItemConversion,
	"StardewValley.GameData.Buildings.BuildingMaterial": buildingMaterial,
	"StardewValley.GameData.Buildings.BuildingPlacementTile": buildingPlacementTile,
	"StardewValley.GameData.Buildings.BuildingSkin": buildingSkin,
	"StardewValley.GameData.Buildings.BuildingTileProperty": buildingTileProperty,
	"StardewValley.GameData.Buildings.IndoorItemAdd": indoorItemAdd,
	"StardewValley.GameData.Buildings.IndoorItemMove": indoorItemMove,
	"StardewValley.GameData.Characters.CharacterData": characterData,
	"StardewValley.GameData.Characters.CharacterAppearanceData": characterAppearanceData,
	"StardewValley.GameData.Characters.CharacterHomeData": characterHomeData,
	"StardewValley.GameData.Characters.CharacterShadowData": characterShadowData,
	"StardewValley.GameData.Characters.CharacterSpousePatioData": characterSpousePatioData,
	"StardewValley.GameData.Characters.CharacterSpouseRoomData": characterSpouseRoomData,
	"StardewValley.GameData.Crops.CropData": cropData,
	"StardewValley.GameData.FarmAnimals.FarmAnimalData": farmAnimalData,
	"StardewValley.GameData.FarmAnimals.AlternatePurchaseAnimals": alternatePurchaseAnimals,
	"StardewValley.GameData.FarmAnimals.FarmAnimalProduce": farmAnimalProduce,
	"StardewValley.GameData.FarmAnimals.FarmAnimalShadowData": farmAnimalShadowData,
	"StardewValley.GameData.FarmAnimals.FarmAnimalSkin": farmAnimalSkin,
	"StardewValley.GameData.Fences.FenceData": fenceData,
	"StardewValley.GameData.FloorsAndPaths.FloorPathData": floorPathData,
	"StardewValley.GameData.FruitTrees.FruitTreeData": fruitTreeData,
	"StardewValley.GameData.FruitTrees.FruitTreeFruitData": fruitTreeFruitData,
	"StardewValley.GameData.GarbageCans.GarbageCanData": garbageCanData,
	"StardewValley.GameData.GarbageCans.GarbageCanEntryData": garbageCanEntryData,
	"StardewValley.GameData.GarbageCans.GarbageCanItemData": garbageCanItemData,
	"StardewValley.GameData.GiantCrops.GiantCropData": giantCropData,
	"StardewValley.GameData.GiantCrops.GiantCropHarvestItemData": giantCropHarvestItemData,
	"StardewValley.GameData.LocationContexts.LocationContextData": locationContextData,
	"StardewValley.GameData.LocationContexts.PassOutMailData": passOutMailData,
	"StardewValley.GameData.LocationContexts.ReviveLocation": reviveLocation,
	"StardewValley.GameData.LocationContexts.WeatherCondition": weatherCondition,
	"StardewValley.GameData.Locations.LocationData": locationData,
	"StardewValley.GameData.Locations.ArtifactSpotDropData": artifactSpotDropData,
	"StardewValley.GameData.Locations.CreateLocationData": createLocationData,
	"StardewValley.GameData.Locations.FishAreaData": fishAreaData,
	"StardewValley.GameData.Locations.LocationMusicData": locationMusicData,
	"StardewValley.GameData.Locations.SpawnFishData": spawnFishData,
	"StardewValley.GameData.Locations.SpawnForageData": spawnForageData,
	"StardewValley.GameData.Machines.MachineData": machineData,
	"StardewValley.GameData.Machines.MachineEffects": machineEffects,
	"StardewValley.GameData.Machines.MachineItemAdditionalConsumedItems": machineItemAdditionalConsumedItems,
	"StardewValley.GameData.Machines.MachineItemOutput": machineItemOutput,
	"StardewValley.GameData.Machines.MachineLight": machineLight,
	"StardewValley.GameData.Machines.MachineOutputRule": machineOutputRule,
	"StardewValley.GameData.Machines.MachineOutputTriggerRule": machineOutputTriggerRule,
	"StardewValley.GameData.Machines.MachineSoundData": machineSoundData,
	"StardewValley.GameData.MakeoverOutfits.MakeoverOutfit": makeoverOutfit,
	"StardewValley.GameData.MakeoverOutfits.MakeoverItem": makeoverItem,
	"StardewValley.GameData.Minecarts.MinecartNetworkData": minecartNetworkData,
	"StardewValley.GameData.Minecarts.MinecartDestinationData": minecartDestinationData,
	"StardewValley.GameData.Movies.MovieData": movieData,
	"StardewValley.GameData.Movies.MovieCranePrizeData": movieCranePrizeData,
	"StardewValley.GameData.Museum.MuseumRewards": museumRewards,
	"StardewValley.GameData.Museum.MuseumDonationRequirement": museumDonationRequirement,
	"StardewValley.GameData.Objects.ObjectData": objectData,
	"StardewValley.GameData.Objects.ObjectBuffData": objectBuffData,
	"StardewValley.GameData.Objects.ObjectGeodeDropData": objectGeodeDropData,
	"StardewValley.GameData.Shirts.ShirtData": shirtData,
	"StardewValley.GameData.Pants.PantsData": pantsData,
	"StardewValley.GameData.Pets.PetData": petData,
	"StardewValley.GameData.Pets.PetAnimationFrame": petAnimationFrame,
	"StardewValley.GameData.Pets.PetBehavior": petBehavior,
	"StardewValley.GameData.Pets.PetBehaviorChanges": petBehaviorChanges,
	"StardewValley.GameData.Pets.PetBreed": petBreed,
	"StardewValley.GameData.Pets.PetGift": petGift,
	"StardewValley.GameData.Pets.PetSummitPerfectionEventData": petSummitPerfectionEventData,
	"StardewValley.GameData.Powers.PowersData": powerData,
	"StardewValley.GameData.Shops.ShopData": shopData,
	"StardewValley.GameData.Shops.ShopDialogueData": shopDialogueData,
	"StardewValley.GameData.Shops.ShopItemData": shopItemData,
	"StardewValley.GameData.Shops.ShopOwnerData": shopOwnerData,
	"StardewValley.GameData.Shops.ShopThemeData": shopThemeData,
	"StardewValley.GameData.Tools.ToolData": toolData,
	"StardewValley.GameData.Tools.ToolUpgradeData": toolUpgradeData,
	"StardewValley.GameData.Weapons.WeaponData": weaponData,
	"StardewValley.GameData.Weapons.WeaponProjectile": weaponProjectile,
	"StardewValley.GameData.Weddings.WeddingData": weddingData,
	"StardewValley.GameData.Weddings.WeddingAttendeeData": weddingAttendeeData,
	"StardewValley.GameData.WildTrees.WildTreeData": wildTreeData,
	"StardewValley.GameData.WildTrees.WildTreeItemData": wildTreeItemData,
	"StardewValley.GameData.WildTrees.WildTreeChopItemData": wildTreeChopItemData,
	"StardewValley.GameData.WildTrees.WildTreeSeedDropItemData": wildTreeSeedDropItemData,
	"StardewValley.GameData.WildTrees.WildTreeTapItemData": wildTreeTapItemData,
	"StardewValley.GameData.WildTrees.WildTreeTextureData": wildTreeTextureData,
	"StardewValley.GameData.WorldMaps.WorldMapAreaData": worldMapAreaData,
	"StardewValley.GameData.WorldMaps.WorldMapAreaPositionData": worldMapAreaPositionData,
	"StardewValley.GameData.WorldMaps.WorldMapAreaPositionScrollTextZoneData": worldMapAreaPositionScrollTextZoneData,
	"StardewValley.GameData.WorldMaps.WorldMapRegionData": worldMapRegionData,
	"StardewValley.GameData.WorldMaps.WorldMapTextureData": worldMapTextureData,
	"StardewValley.GameData.WorldMaps.WorldMapTooltipData": worldMapTooltipData,
	"System.Object": {}
};

var enums = ["StardewValley.GameData.QuantityModifier+ModificationType", "StardewValley.GameData.QuantityModifier+QuantityModifierMode", "StardewValley.GameData.MusicContext", "StardewValley.GameData.PlantableResult", "StardewValley.GameData.PlantableRuleContext", "StardewValley.GameData.Buildings.BuildingChestType", "StardewValley.Gender", "StardewValley.GameData.Characters.CalendarBehavior", "StardewValley.GameData.Characters.EndSlideShowBehavior", "StardewValley.GameData.Characters.NpcAge", "StardewValley.GameData.Characters.NpcLanguage", "StardewValley.GameData.Characters.NpcManner", "StardewValley.GameData.Characters.NpcOptimism", "StardewValley.GameData.Characters.NpcSocialAnxiety", "StardewValley.GameData.Characters.SocialTabBehavior", "StardewValley.Season", "StardewValley.GameData.Crops.HarvestMethod", "StardewValley.GameData.FloorsAndPaths.FloorPathConnectType", "StardewValley.GameData.FloorsAndPaths.FloorPathShadowType", "StardewValley.GameData.Machines.MachineOutputTrigger", "StardewValley.GameData.Machines.MachineTimeBlockers", "StardewValley.GameData.Pets.PetAnimationLoopMode", "StardewValley.GameData.Shops.LimitedStockMode", "StardewValley.GameData.Shops.ShopOwnerType", "StardewValley.GameData.Shops.StackSizeVisibility", "StardewValley.GameData.SpecialOrders.QuestDuration", "StardewValley.GameData.WildTrees.WildTreeGrowthStage"];

exports.enums = enums;
exports.readers = readers;
exports.schemes = schemes;
