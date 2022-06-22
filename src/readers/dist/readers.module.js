/** 
 * xnb.js 1.2.0
 * made by Lybell( https://github.com/lybell-art/ )
 * This library is based on the XnbCli made by Leonblade.
 * 
 * xnb.js is licensed under the LGPL 3.0 License.
 * 
*/

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
		uint32Reader.write(buffer, content.length, resolver);

		for (let i = 0; i < content.length; i++) this.reader.write(buffer, content[i], this.reader.isValueType() ? null : resolver);
	}

	isValueType() {
		return false;
	}

	get type() {
		return "Array<".concat(this.reader.type, ">");
	}

	parseTypeList() {
		return [this.type, ...this.reader.parseTypeList()];
	}

}

const UTF16_BITES = [0xD800, 0xDC00];
const UTF16_MASK = 0b1111111111;

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

		for (let data of Object.values(content)) {
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
		return [this.type, ...this.reader.parseTypeList()];
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

		if (resolver === null) {
			booleanReader.read(buffer);
			return this.reader.read(buffer);
		}

		return this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer);
	}

	write(buffer) {
		let content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
		let resolver = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

		if (content === null) {
			buffer.writeByte(0);
			return;
		}

		if (resolver === null) buffer.writeByte(1);
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
	vectors.length;
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
		if (mipCount > 1) console.warn("Found mipcount of ".concat(mipCount, ", only the first will be used."));
		let dataSize = uint32Reader.read(buffer);
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
		content.export.width;
		content.export.height;
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

}

export { ArrayReader, BaseReader, BmFontReader, BooleanReader, CharReader, DictionaryReader, DoubleReader, EffectReader, Int32Reader, LightweightTexture2DReader, ListReader, NullableReader, RectangleReader, ReflectiveReader, SingleReader, SpriteFontReader, StringReader, TBinReader, Texture2DReader, UInt32Reader, Vector2Reader, Vector3Reader, Vector4Reader };
