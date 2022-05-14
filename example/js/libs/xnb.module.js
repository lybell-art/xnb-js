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

const UTF8_FIRST_BITES = [0xC0, 0xE0, 0xF0];
const UTF8_SECOND_BITES = 0x80;
const UTF8_MASK = 0b111111;
const UTF16_BITES = [0xD800, 0xDC00];
const UTF16_MASK = 0b1111111111;

function UTF8Encode(code) {
	//0x0000 ~ 0x007F
	if (code < 0x80) return [code]; //0x0080 ~ 0x07FF

	if (code < 0x800) return [UTF8_FIRST_BITES[0] | code >> 6, UTF8_SECOND_BITES | code & UTF8_MASK]; //0x0800 ~ 0xFFFF

	if (code < 0x10000) return [UTF8_FIRST_BITES[1] | code >> 12, UTF8_SECOND_BITES | code >> 6 & UTF8_MASK, UTF8_SECOND_BITES | code & UTF8_MASK]; //0x10000 ~

	return [UTF8_FIRST_BITES[2] | code >> 18, UTF8_SECOND_BITES | code >> 12 & UTF8_MASK, UTF8_SECOND_BITES | code >> 6 & UTF8_MASK, UTF8_SECOND_BITES | code & UTF8_MASK];
}

function UTF16Encode(code) {
	//0x0000 ~ 0xFFFF
	if (code < 0xFFFF) return [code]; //0x10000 ~

	code -= 0x10000;
	return [UTF16_BITES[0] | code >> 10 & UTF16_MASK, UTF16_BITES[1] | code & UTF16_MASK];
}

function UTF8Decode(codeSet) {
	var _codeSet;

	if (typeof codeSet === "number") codeSet = [codeSet];
	if (!((_codeSet = codeSet) !== null && _codeSet !== void 0 && _codeSet.length)) throw new Error("Invalid codeset!");
	const codeSetRange = codeSet.length; //0x0000 ~ 0x007F

	if (codeSetRange === 1) return codeSet[0]; //0x0080 ~ 0x07FF

	if (codeSetRange === 2) return ((codeSet[0] ^ UTF8_FIRST_BITES[0]) << 6) + (codeSet[1] ^ UTF8_SECOND_BITES); //0x0800 ~ 0xFFFF

	if (codeSetRange === 3) {
		return ((codeSet[0] ^ UTF8_FIRST_BITES[1]) << 12) + ((codeSet[1] ^ UTF8_SECOND_BITES) << 6) + (codeSet[2] ^ UTF8_SECOND_BITES);
	} //0x10000 ~


	return ((codeSet[0] ^ UTF8_FIRST_BITES[2]) << 18) + ((codeSet[1] ^ UTF8_SECOND_BITES) << 12) + ((codeSet[2] ^ UTF8_SECOND_BITES) << 6) + (codeSet[3] ^ UTF8_SECOND_BITES);
}

function UTF16Decode(codeSet) {
	var _codeSet2;

	if (typeof codeSet === "number") codeSet = [codeSet];
	if (!((_codeSet2 = codeSet) !== null && _codeSet2 !== void 0 && _codeSet2.length)) throw new Error("Invalid codeset!");
	const codeSetRange = codeSet.length; //0x0000 ~ 0xFFFF

	if (codeSetRange === 1) return codeSet[0]; //0x10000 ~

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
	} //for bigger strings


	const blockSize = 65536;
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
	/**
	 * Creates instance of Reader class.
	 * @constructor
	 * @param {ArrayBuffer} target buffer to trace
	 */
	constructor(buffer) {
		let endianus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : LITTLE_ENDIAN;

		/**
		 * Sets the endianness of the buffer stream
		 * @private
		 * @type {Number}
		 */
		this._endianus = endianus;
		/**
		 * internal buffer for the reader
		 * @private
		 * @type {ArrayBuffer}
		 */

		this._buffer = buffer.slice();
		/**
		 * internal buffer for the reader
		 * @private
		 * @type {DataView}
		 */

		this._dataView = new DataView(this._buffer);
		/**
		 * Seek index for the internal buffer.
		 * @private
		 * @type {Number}
		 */

		this._offset = 0;
		/**
		 * Bit offset for bit reading.
		 * @private
		 * @type {Number}
		 */

		this._bitOffset = 0;
	}
	/**
	* Seeks to a specific index in the buffer.
	* @public
	* @param {Number} index Sets the buffer seek index.
	* @param {Number} origin Location to seek from
	*/


	seek(index) {
		let origin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._offset;
		const offset = this._offset;
		this._offset = Math.max(origin + Number.parseInt(index), 0);
		if (this._offset < 0 || this._offset > this.buffer.length) throw new RangeError("Buffer seek out of bounds! ".concat(this._offset, " ").concat(this.buffer.length));
		return this._offset - offset;
	}
	/**
	 * Gets the seek index of the buffer.
	 * @public
	 * @property bytePosition
	 * @return {Number} Reurns the buffer seek index.
	 */


	get bytePosition() {
		return Number.parseInt(this._offset);
	}
	/**
	 * Sets the seek index of the buffer.
	 * @public
	 * @property bytePosition
	 * @param {Number} value
	 */


	set bytePosition(value) {
		this._offset = value;
	}
	/**
	 * Gets the current position for bit reading.
	 * @public
	 * @property _bitPosition
	 * @returns {Number}
	 */


	get bitPosition() {
		return Number.parseInt(this._bitOffset);
	}
	/**
	 * Sets the bit position clamped at 16-bit frames
	 * @public
	 * @property bitPosition
	 * @param {Number} offset
	 */


	set bitPosition(offset) {
		// when rewinding, reset it back to
		if (offset < 0) offset = 16 - offset; // set the offset and clamp to 16-bit frame

		this._bitOffset = offset % 16; // get byte seek for bit ranges that wrap past 16-bit frames

		const byteSeek = (offset - Math.abs(offset) % 16) / 16 * 2; // seek ahead for overflow on 16-bit frames

		this.seek(byteSeek);
	}
	/**
	 * Get the buffer size.
	 * @public
	 * @property size
	 * @return {Number} Returns the size of the buffer.
	 */


	get size() {
		return this.buffer.byteLength;
	}
	/**
	 * Returns the buffer.
	 * @public
	 * @property buffer
	 * @returns {Buffer} Returns the internal buffer.
	 */


	get buffer() {
		return this._buffer;
	}
	/**
	 * Writes another buffer into this buffer.
	 * @public
	 * @method write
	 * @param {Buffer} buffer
	 * @param {Number} targetIndex
	 * @param {Number} sourceIndex
	 * @param {Number} length
	 */


	copyFrom(buffer) {
		let targetIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
		let sourceIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
		let length = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : buffer.byteLength;
		const sourceView = new Uint8Array(buffer);
		const isOverflow = this.buffer.byteLength < length + targetIndex;
		let targetBuffer = this.buffer;
		let targetView = this._dataView; // we need to resize the buffer to fit the contents

		if (isOverflow) {
			// create a temporary buffer of the new size
			targetBuffer = new ArrayBuffer(this.buffer.byteLength + (length + targetIndex - this.buffer.byteLength));
			targetView = new DataView(targetBuffer); // copy our buffer into the temp buffer

			for (let i = 0; i < this.buffer.byteLength; i++) {
				targetView.setUint8(i, this._dataView.getUint8(i));
			}
		} // copy the buffer into our buffer


		for (let i = sourceIndex, j = targetIndex; i < length; i++, j++) {
			targetView.setUint8(j, sourceView[i]);
		} // assign our buffer to the temporary buffer


		if (isOverflow) {
			this._buffer = targetBuffer;
			this._dataView = targetView;
		}
	}
	/**
	 * Reads a specific number of bytes.
	 * @public
	 * @method read
	 * @param {Number} count Number of bytes to read.
	 * @returns {Buffer} Contents of the buffer.
	 */


	read(count) {
		// read from the buffer
		const buffer = this.buffer.slice(this._offset, this._offset + count); // advance seek offset

		this.seek(count); // return the read buffer

		return buffer;
	}
	/**
	 * Reads a single byte
	 * @public
	 * @returns {Number}
	 */


	readByte() {
		return this.readUInt();
	}
	/**
	 * Reads an int8
	 * @public
	 * @returns {Number}
	 */


	readInt() {
		const value = this._dataView.getInt8(this._offset);

		this.seek(1);
		return value;
	}
	/**
	 * Reads an uint8
	 * @public
	 * @returns {Number}
	 */


	readUInt() {
		const value = this._dataView.getUint8(this._offset);

		this.seek(1);
		return value;
	}
	/**
	 * Reads a uint16
	 * @public
	 * @returns {Number}
	 */


	readUInt16() {
		const value = this._dataView.getUint16(this._offset, this._endianus);

		this.seek(2);
		return value;
	}
	/**
	 * Reads a uint32
	 * @public
	 * @returns {Number}
	 */


	readUInt32() {
		const value = this._dataView.getUint32(this._offset, this._endianus);

		this.seek(4);
		return value;
	}
	/**
	 * Reads an int16
	 * @public
	 * @returns {Number}
	 */


	readInt16() {
		const value = this._dataView.getInt16(this._offset, this._endianus);

		this.seek(2);
		return value;
	}
	/**
	 * Reads an int32
	 * @public
	 * @returns {Number}
	 */


	readInt32() {
		const value = this._dataView.getInt32(this._offset, this._endianus);

		this.seek(4);
		return value;
	}
	/**
	 * Reads a float
	 * @public
	 * @returns {Number}
	 */


	readSingle() {
		const value = this._dataView.getFloat32(this._offset, this._endianus);

		this.seek(4);
		return value;
	}
	/**
	 * Reads a double
	 * @public
	 * @returns {Number}
	 */


	readDouble() {
		const value = this._dataView.getFloat32(this._offset, this._endianus);

		this.seek(8);
		return value;
	}
	/**
	 * Reads a string
	 * @public
	 * @param {Number} [count]
	 * @returns {String}
	 */


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
	/**
	 * Peeks ahead in the buffer without actually seeking ahead.
	 * @public
	 * @method peek
	 * @param {Number} count Number of bytes to peek.
	 * @returns {Buffer} Contents of the buffer.
	 */


	peek(count) {
		// read from the buffer
		const buffer = this.read(count); // rewind the buffer

		this.seek(-count); // return the buffer

		return buffer;
	}
	/**
	 * Peeks a single byte
	 * @public
	 * @returns {Number}
	 */


	peekByte() {
		return this.peekUInt();
	}
	/**
	 * Peeks an int8
	 * @public
	 * @returns {Number}
	 */


	peekInt() {
		const value = this._dataView.getInt8(this._offset);

		return value;
	}
	/**
	 * Peeks an uint8
	 * @public
	 * @returns {Number}
	 */


	peekUInt() {
		const value = this._dataView.getUint8(this._offset);

		return value;
	}
	/**
	 * Peeks a uint16
	 * @public
	 * @returns {Number}
	 */


	peekUInt16() {
		const value = this._dataView.getUint16(this._offset, this._endianus);

		return value;
	}
	/**
	 * Peeks a uint32
	 * @public
	 * @returns {Number}
	 */


	peekUInt32() {
		const value = this._dataView.getUint32(this._offset, this._endianus);

		return value;
	}
	/**
	 * Peeks an int16
	 * @public
	 * @returns {Number}
	 */


	peekInt16() {
		const value = this._dataView.getInt16(this._offset, this._endianus);

		return value;
	}
	/**
	 * Peeks an int32
	 * @public
	 * @returns {Number}
	 */


	peekInt32() {
		const value = this._dataView.getInt32(this._offset, this._endianus);

		return value;
	}
	/**
	 * Peeks a float
	 * @public
	 * @returns {Number}
	 */


	peekSingle() {
		const value = this._dataView.getFloat32(this._offset, this._endianus);

		return value;
	}
	/**
	 * Peeks a double
	 * @public
	 * @returns {Number}
	 */


	peekDouble() {
		const value = this._dataView.getFloat64(this._offset, this._endianus);

		return value;
	}
	/**
	 * Peeks a string
	 * @public
	 * @param {Number} [count]
	 * @returns {String}
	 */


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
		} // restore the byte position


		this.bytePosition = startOffset;
		return UTF8ToString(chars);
	}
	/**
	 * Reads a 7-bit number.
	 * @public
	 * @method read7BitNumber
	 * @returns {Number} Returns the number read.
	 */


	read7BitNumber() {
		let result = 0;
		let bitsRead = 0;
		let value; // loop over bits

		do {
			value = this.readByte();
			result |= (value & 0x7F) << bitsRead;
			bitsRead += 7;
		} while (value & 0x80);

		return result;
	}
	/**
	 * Reads bits used for LZX compression.
	 * @public
	 * @method readLZXBits
	 * @param {Number} bits
	 * @returns {Number}
	 */


	readLZXBits(bits) {
		// initialize values for the loop
		let bitsLeft = bits;
		let read = 0; // read bits in 16-bit chunks

		while (bitsLeft > 0) {
			// peek in a 16-bit value
			const peek = this._dataView.getUint16(this._offset, true); // clamp bits into the 16-bit frame we have left only read in as much as we have left


			const bitsInFrame = Math.min(Math.max(bitsLeft, 0), 16 - this.bitPosition); // set the offset based on current position in and bit count

			const offset = 16 - this.bitPosition - bitsInFrame; // create mask and shift the mask up to the offset <<
			// and then shift the return back down into mask space >>

			const value = (peek & 2 ** bitsInFrame - 1 << offset) >> offset; // remove the bits we read from what we have left

			bitsLeft -= bitsInFrame; // add the bits read to the bit position

			this.bitPosition += bitsInFrame; // assign read with the value shifted over for reading in loops

			read |= value << bitsLeft;
		} // return the read bits


		return read;
	}
	/**
	 * Used to peek bits.
	 * @public
	 * @method peekLZXBits
	 * @param {Number} bits
	 * @returns {Number}
	 */


	peekLZXBits(bits) {
		// get the current bit position to store
		let bitPosition = this.bitPosition; // get the current byte position to store

		let bytePosition = this.bytePosition; // read the bits like normal

		const read = this.readLZXBits(bits); // just rewind the bit position, this will also rewind bytes where needed

		this.bitPosition = bitPosition; // restore the byte position

		this.bytePosition = bytePosition; // return the peeked value

		return read;
	}
	/**
	 * Reads a 16-bit integer from a LZX bitstream
	 *
	 * bytes are reverse as the bitstream sequences 16 bit integers stored as LSB -> MSB (bytes)
	 * abc[...]xyzABCDEF as bits would be stored as:
	 * [ijklmnop][abcdefgh][yzABCDEF][qrstuvwx]
	 *
	 * @public
	 * @method readLZXInt16
	 * @param {Boolean} seek
	 * @returns {Number}
	 */


	readLZXInt16() {
		let seek = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
		// read in the next two bytes worth of data
		const lsB = this.readByte();
		const msB = this.readByte(); // rewind the seek head

		if (!seek) this.seek(-2); // set the value

		return lsB << 8 | msB;
	}
	/**
	 * Aligns to 16-bit offset.
	 * @public
	 * @method align
	 */


	align() {
		if (this.bitPosition > 0) this.bitPosition += 16 - this.bitPosition;
	}

} // export the BufferReader class

class BufferWriter {
	constructor() {
		let size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2048;

		/**
		 * internal buffer for the writer
		 * @private
		 * @type {ArrayBuffer}
		 */
		this._buffer = new ArrayBuffer(size);
		/**
		 * internal buffer for the reader
		 * @private
		 * @type {DataView}
		 */

		this._dataView = new DataView(this._buffer);
		/**
		 * Seek index for the internal buffer.
		 * @private
		 * @type {Number}
		 */

		this.bytePosition = 0;
	}
	/**
	 * Returns the buffer.
	 * @public
	 * @property buffer
	 * @returns {Buffer} Returns the internal buffer.
	 */


	get buffer() {
		return this._buffer;
	} //Reconnect the DataView to the current ArrayBuffer


	reconnectDataView() {
		this._dataView = new DataView(this._buffer);
	} // trim the buffer to the byte position


	trim() {
		let pending = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
		this._buffer = this.buffer.slice(0, this.bytePosition);
		if (!pending) this.reconnectDataView();
	}
	/**
	 * Allocates number of bytes into the buffer and assigns more space if needed
	 * @param {Number} bytes Number of bytes to allocate into the buffer
	 */


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
	/**
	 * Writes bytes to the buffer
	 * @param {Mixed} bytes 
	 */


	write(bytes) {
		const targetBufferView = new Uint8Array(bytes);
		const newPosition = this.bytePosition + targetBufferView.length;
		this.alloc(targetBufferView.length);

		for (let i = this.bytePosition; i < newPosition; i++) {
			this._dataView.setUint8(i, targetBufferView[i - this.bytePosition]);
		}

		this.bytePosition = newPosition;
	}
	/**
	 * Writes string to the buffer
	 * @param {String} string 
	 */


	writeString(str) {
		let utf8Data = stringToUTF8(str);
		this.write(utf8Data);
	}
	/**
	 * Write a byte to the buffer
	 * @param {Mixed} byte 
	 */


	writeByte(byte) {
		this.alloc(1)._dataView.setUint8(this.bytePosition, byte);

		this.bytePosition++;
	}
	/**
	 * Write an int8 to the buffer
	 * @param {Number} number 
	 */


	writeInt(number) {
		this.alloc(1)._dataView.setInt8(this.bytePosition, number);

		this.bytePosition++;
	}
	/**
	 * Write a uint8 to the buffer
	 * @param {Number} number 
	 */


	writeUInt(number) {
		this.alloc(1)._dataView.setUint8(this.bytePosition, number);

		this.bytePosition++;
	}
	/**
	 * Write a int16 to the buffer
	 * @param {Number} number 
	 */


	writeInt16(number) {
		this.alloc(2)._dataView.setInt16(this.bytePosition, number, true);

		this.bytePosition += 2;
	}
	/**
	 * Write a uint16 to the buffer
	 * @param {Number} number 
	 */


	writeUInt16(number) {
		this.alloc(2)._dataView.setUint16(this.bytePosition, number, true);

		this.bytePosition += 2;
	}
	/**
	 * Write a int32 to the buffer
	 * @param {Number} number 
	 */


	writeInt32(number) {
		this.alloc(4)._dataView.setInt32(this.bytePosition, number, true);

		this.bytePosition += 4;
	}
	/**
	 * Write a uint32 to the buffer
	 * @param {Number} number 
	 */


	writeUInt32(number) {
		this.alloc(4)._dataView.setUint32(this.bytePosition, number, true);

		this.bytePosition += 4;
	}
	/**
	 * Write a float to the buffer
	 * @param {Number} number 
	 */


	writeSingle(number) {
		this.alloc(4)._dataView.setFloat32(this.bytePosition, number, true);

		this.bytePosition += 4;
	}
	/**
	 * Write a double to the buffer
	 * @param {Number} number 
	 */


	writeDouble(number) {
		this.alloc(8)._dataView.setFloat64(this.bytePosition, number, true);

		this.bytePosition += 8;
	}
	/**
	 * Write a 7-bit number to the buffer
	 * @param {Number} number 
	 */


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

} // export the BufferWriter class

class XnbError extends Error {
	constructor() {
		let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		Error.captureStackTrace(this, XnbError);
	}

}

/**
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
 */

const MIN_MATCH = 2; // smallest allowable match length

const NUM_CHARS = 256; // number of uncompressed character types

const BLOCKTYPE = {
	INVALID: 0,
	VERBATIM: 1,
	ALIGNED: 2,
	UNCOMPRESSED: 3
};
const PRETREE_NUM_ELEMENTS = 20;
const ALIGNED_NUM_ELEMENTS = 8; // aligned offset tree elements

const NUM_PRIMARY_LENGTHS = 7;
const NUM_SECONDARY_LENGTHS = 249; // number of elements in length tree
// LZX Huffman Constants

const PRETREE_MAXSYMBOLS = PRETREE_NUM_ELEMENTS;
const PRETREE_TABLEBITS = 6;
const MAINTREE_MAXSYMBOLS = NUM_CHARS + 50 * 8;
const MAINTREE_TABLEBITS = 12;
const LENGTH_MAXSYMBOLS = NUM_SECONDARY_LENGTHS + 1;
const LENGTH_TABLEBITS = 12;
const ALIGNED_MAXSYMBOLS = ALIGNED_NUM_ELEMENTS;
const ALIGNED_TABLEBITS = 7;

/**
 * LZX Static Data Tables
 *
 * LZX uses 'position slots' to represent match offsets.	For every match,
 * a small 'position slot' number and a small offset from that slot are
 * encoded instead of one large offset.
 *
 * Lzx.position_base[] is an index to the position slot bases
 *
 * Lzx.extra_bits[] states how many bits of offset-from-base data is needed.
 */

/**
 * Used to compress and decompress LZX format buffer.
 * @class
 * @public
 */

class Lzx {
	/**
	 * Creates an instance of LZX with a given window frame.
	 * @constructor
	 * @param {Number} window_bits
	 */
	constructor(window_bits) {
		// get the window size from window bits
		this.window_size = 1 << window_bits; // LZX supports window sizes of 2^15 (32 KB) to 2^21 (2 MB)

		if (window_bits < 15 || window_bits > 21) throw new XnbError('Window size out of range!'); // initialize static tables

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
		/**
		 * calculate required position slots
		 *
		 * window bits:		 15 16 17 18 19 20 21
		 * position slots:	30 32 34 36 38 42 50
		 */


		const posn_slots = window_bits == 21 ? 50 : window_bits == 20 ? 42 : window_bits << 1; // repeated offsets

		this.R0 = this.R1 = this.R2 = 1; // set the number of main elements

		this.main_elements = NUM_CHARS + (posn_slots << 3); // state of header being read used for when looping over multiple blocks

		this.header_read = false; // set the block remaining

		this.block_remaining = 0; // set the default block type

		this.block_type = BLOCKTYPE.INVALID; // window position

		this.window_posn = 0; // frequently used tables

		this.pretree_table = [];
		this.pretree_len = [];
		this.aligned_table = [];
		this.aligned_len = [];
		this.length_table = [];
		this.length_len = [];
		this.maintree_table = [];
		this.maintree_len = []; // initialize main tree and length tree for use with delta operations

		for (let i = 0; i < MAINTREE_MAXSYMBOLS; i++) this.maintree_len[i] = 0;

		for (let i = 0; i < NUM_SECONDARY_LENGTHS; i++) this.length_len[i] = 0; // the decompression window


		this.win = [];
	}
	/**
	 * Decompress the buffer with given frame and block size
	 * @param {BufferReader} buffer
	 * @param {Number} frame_size
	 * @param {Number} block_size
	 * @returns {Number[]}
	 */


	decompress(buffer, frame_size, block_size) {
		// read header if we haven't already
		if (!this.header_read) {
			// read the intel call
			const intel = buffer.readLZXBits(1); // don't care about intel e8

			if (intel != 0) throw new XnbError("Intel E8 Call found, invalid for XNB files."); // the header has been read

			this.header_read = true;
		} // set what's left to go to the frame size


		let togo = frame_size; // loop over what's left of the frame

		while (togo > 0) {
			// this is a new block
			if (this.block_remaining == 0) {
				// read in the block type
				this.block_type = buffer.readLZXBits(3); // read 24-bit value for uncompressed bytes in this block

				const hi = buffer.readLZXBits(16);
				const lo = buffer.readLZXBits(8); // number of uncompressed bytes for this block left

				this.block_remaining = hi << 8 | lo; // switch over the valid block types

				switch (this.block_type) {
					case BLOCKTYPE.ALIGNED:
						// aligned offset tree
						for (let i = 0; i < 8; i++) this.aligned_len[i] = buffer.readLZXBits(3); // decode table for aligned tree


						this.aligned_table = this.decodeTable(ALIGNED_MAXSYMBOLS, ALIGNED_TABLEBITS, this.aligned_len);
					// NOTE: rest of aligned block type is the same as verbatim block type

					case BLOCKTYPE.VERBATIM:
						// read the first 256 elements for main tree
						this.readLengths(buffer, this.maintree_len, 0, 256); // read the rest of the elements for the main tree

						this.readLengths(buffer, this.maintree_len, 256, this.main_elements); // decode the main tree into a table

						this.maintree_table = this.decodeTable(MAINTREE_MAXSYMBOLS, MAINTREE_TABLEBITS, this.maintree_len); // read path lengths for the length tree

						this.readLengths(buffer, this.length_len, 0, NUM_SECONDARY_LENGTHS); // decode the length tree

						this.length_table = this.decodeTable(LENGTH_MAXSYMBOLS, LENGTH_TABLEBITS, this.length_len);
						break;

					case BLOCKTYPE.UNCOMPRESSED:
						// align the bit buffer to byte range
						buffer.align(); // read the offsets

						this.R0 = buffer.readInt32();
						this.R1 = buffer.readInt32();
						this.R2 = buffer.readInt32();
						break;

					default:
						throw new XnbError("Invalid Blocktype Found: ".concat(this.block_type));
				}
			} // iterate over the block remaining


			let this_run = this.block_remaining; // loop over the bytes left in the buffer to run out our output

			while ((this_run = this.block_remaining) > 0 && togo > 0) {
				// if this run is somehow higher than togo then just cap it
				if (this_run > togo) this_run = togo; // reduce togo and block remaining by this iteration

				togo -= this_run;
				this.block_remaining -= this_run; // apply 2^x-1 mask

				this.window_posn &= this.window_size - 1; // run cannot exceed frame size

				if (this.window_posn + this_run > this.window_size) throw new XnbError('Cannot run outside of window frame.');

				switch (this.block_type) {
					case BLOCKTYPE.ALIGNED:
						while (this_run > 0) {
							// get the element of this run
							let main_element = this.readHuffSymbol(buffer, this.maintree_table, this.maintree_len, MAINTREE_MAXSYMBOLS, MAINTREE_TABLEBITS); // main element is an unmatched character

							if (main_element < NUM_CHARS) {
								this.win[this.window_posn++] = main_element;
								this_run--;
								continue;
							}

							main_element -= NUM_CHARS;
							let length_footer;
							let match_length = main_element & NUM_PRIMARY_LENGTHS;

							if (match_length == NUM_PRIMARY_LENGTHS) {
								// get the length footer
								length_footer = this.readHuffSymbol(buffer, this.length_table, this.length_len, LENGTH_MAXSYMBOLS, LENGTH_TABLEBITS); // increase match length by the footer

								match_length += length_footer;
							}

							match_length += MIN_MATCH;
							let match_offset = main_element >> 3;

							if (match_offset > 2) {
								// not repeated offset
								let extra = Lzx.extra_bits[match_offset];
								match_offset = Lzx.position_base[match_offset] - 2;

								if (extra > 3) {
									// verbatim and aligned bits
									extra -= 3;
									let verbatim_bits = buffer.readLZXBits(extra);
									match_offset += verbatim_bits << 3;
									let aligned_bits = this.readHuffSymbol(buffer, this.aligned_table, this.aligned_len, ALIGNED_MAXSYMBOLS, ALIGNED_TABLEBITS);
									match_offset += aligned_bits;
								} else if (extra == 3) {
									// aligned bits only
									match_offset += this.readHuffSymbol(buffer, this.aligned_table, this.aligned_len, ALIGNED_MAXSYMBOLS, ALIGNED_TABLEBITS);
								} else if (extra > 0) // verbatim bits only
									match_offset += buffer.readLZXBits(extra);else match_offset = 1; // ???
								// update repeated offset LRU queue


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
							this_run -= match_length; // copy any wrapped around source data

							if (this.window_posn >= match_offset) runsrc = rundest - match_offset; // no wrap
							else {
								runsrc = rundest + (this.window_size - match_offset);
								let copy_length = match_offset - this.window_posn;

								if (copy_length < match_length) {
									match_length -= copy_length;
									this.window_posn += copy_length;

									while (copy_length-- > 0) this.win[rundest++] = this.win[runsrc++];

									runsrc = 0;
								}
							}
							this.window_posn += match_length; // copy match data - no worrries about destination wraps

							while (match_length-- > 0) this.win[rundest++] = this.win[runsrc++];
						}

						break;

					case BLOCKTYPE.VERBATIM:
						while (this_run > 0) {
							// get the element of this run
							let main_element = this.readHuffSymbol(buffer, this.maintree_table, this.maintree_len, MAINTREE_MAXSYMBOLS, MAINTREE_TABLEBITS); // main element is an unmatched character

							if (main_element < NUM_CHARS) {
								this.win[this.window_posn++] = main_element;
								this_run--;
								continue;
							} // match: NUM_CHARS + ((slot << 3) | length_header (3 bits))


							main_element -= NUM_CHARS;
							let length_footer;
							let match_length = main_element & NUM_PRIMARY_LENGTHS;

							if (match_length == NUM_PRIMARY_LENGTHS) {
								// read the length footer
								length_footer = this.readHuffSymbol(buffer, this.length_table, this.length_len, LENGTH_MAXSYMBOLS, LENGTH_TABLEBITS);
								match_length += length_footer;
							}

							match_length += MIN_MATCH;
							let match_offset = main_element >> 3;

							if (match_offset > 2) {
								// not repeated offset
								if (match_offset != 3) {
									let extra = Lzx.extra_bits[match_offset];
									let verbatim_bits = buffer.readLZXBits(extra);
									match_offset = Lzx.position_base[match_offset] - 2 + verbatim_bits;
								} else match_offset = 1; // update repeated offset LRU queue


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
							this_run -= match_length; // copy any wrapped around source data

							if (this.window_posn >= match_offset) runsrc = rundest - match_offset; // no wrap
							else {
								runsrc = rundest + (this.window_size - match_offset);
								let copy_length = match_offset - this.window_posn;

								if (copy_length < match_length) {
									match_length -= copy_length;
									this.window_posn += copy_length;

									while (copy_length-- > 0) this.win[rundest++] = this.win[runsrc++];

									runsrc = 0;
								}
							}
							this.window_posn += match_length; // copy match data - no worrries about destination wraps

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
		} // there is still more left


		if (togo != 0) throw new XnbError('EOF reached with data left to go.'); // ensure the buffer is aligned

		buffer.align(); // get the start window position

		const start_window_pos = (this.window_posn == 0 ? this.window_size : this.window_posn) - frame_size; // return the window

		return this.win.slice(start_window_pos, start_window_pos + frame_size);
	}
	/**
	 * Reads in code lengths for symbols first to last in the given table
	 * The code lengths are stored in their own special LZX way.
	 * @public
	 * @method readLengths
	 * @param {BufferReader} buffer
	 * @param {Array} table
	 * @param {Number} first
	 * @param {Number} last
	 * @returns {Array}
	 */


	readLengths(buffer, table, first, last) {
		// read in the 4-bit pre-tree deltas
		for (let i = 0; i < 20; i++) this.pretree_len[i] = buffer.readLZXBits(4); // create pre-tree table from lengths


		this.pretree_table = this.decodeTable(PRETREE_MAXSYMBOLS, PRETREE_TABLEBITS, this.pretree_len); // loop through the lengths from first to last

		for (let i = first; i < last;) {
			// read in the huffman symbol
			let symbol = this.readHuffSymbol(buffer, this.pretree_table, this.pretree_len, PRETREE_MAXSYMBOLS, PRETREE_TABLEBITS); // code = 17, run of ([read 4 bits] + 4) zeros

			if (symbol == 17) {
				// read in number of zeros as a 4-bit number + 4
				let zeros = buffer.readLZXBits(4) + 4; // iterate over zeros counter and add them to the table

				while (zeros-- != 0) table[i++] = 0;
			} // code = 18, run of ([read 5 bits] + 20) zeros
			else if (symbol == 18) {
				// read in number of zeros as a 5-bit number + 20
				let zeros = buffer.readLZXBits(5) + 20; // add the number of zeros into the table array

				while (zeros-- != 0) table[i++] = 0;
			} // code = 19 run of ([read 1 bit] + 4) [read huffman symbol]
			else if (symbol == 19) {
				// read for how many of the same huffman symbol to repeat
				let same = buffer.readLZXBits(1) + 4; // read another huffman symbol

				symbol = this.readHuffSymbol(buffer, this.pretree_table, this.pretree_len, PRETREE_MAXSYMBOLS, PRETREE_TABLEBITS);
				symbol = table[i] - symbol;
				if (symbol < 0) symbol += 17;

				while (same-- != 0) table[i++] = symbol;
			} // code 0 -> 16, delta current length entry
			else {
				symbol = table[i] - symbol;
				if (symbol < 0) symbol += 17;
				table[i++] = symbol;
			}
		} // return the table created


		return table;
	}
	/**
	 * Build a decode table from a canonical huffman lengths table
	 * @public
	 * @method makeDecodeTable
	 * @param {Number} symbols Total number of symbols in tree.
	 * @param {Number} bits Any symbols less than this can be decoded in one lookup of table.
	 * @param {Number[]} length Table for lengths of given table to decode.
	 * @returns {Number[]} Decoded table, length should be ((1<<nbits) + (nsyms*2))
	 */


	decodeTable(symbols, bits, length) {
		// decoded table to act on and return
		let table = [];
		let pos = 0;
		let table_mask = 1 << bits;
		let bit_mask = table_mask >> 1; // loop across all bit positions

		for (let bit_num = 1; bit_num <= bits; bit_num++) {
			// loop over the symbols we're decoding
			for (let symbol = 0; symbol < symbols; symbol++) {
				// if the symbol isn't in this iteration of length then just ignore
				if (length[symbol] == bit_num) {
					let leaf = pos; // if the position has gone past the table mask then we're overrun

					if ((pos += bit_mask) > table_mask) {
						throw new XnbError('Overrun table!');
					} // fill all possible lookups of this symbol with the symbol itself


					let fill = bit_mask;

					while (fill-- > 0) table[leaf++] = symbol;
				}
			} // advance bit mask down the bit positions


			bit_mask >>= 1;
		} // exit with success if table is complete


		if (pos == table_mask) return table; // mark all remaining table entries as unused

		for (let symbol = pos; symbol < table_mask; symbol++) table[symbol] = 0xFFFF; // next_symbol = base of allocation for long codes


		let next_symbol = table_mask >> 1 < symbols ? symbols : table_mask >> 1; // allocate space for 16-bit values

		pos <<= 16;
		table_mask <<= 16;
		bit_mask = 1 << 15; // loop again over the bits

		for (let bit_num = bits + 1; bit_num <= 16; bit_num++) {
			// loop over the symbol range
			for (let symbol = 0; symbol < symbols; symbol++) {
				// if the current length iteration doesn't mach our bit then just ignore
				if (length[symbol] != bit_num) continue; // get leaf shifted away from 16 bit padding

				let leaf = pos >> 16; // loop over fill to flood table with

				for (let fill = 0; fill < bit_num - bits; fill++) {
					// if this path hasn't been taken yet, 'allocate' two entries
					if (table[leaf] == 0xFFFF) {
						table[next_symbol << 1] = 0xFFFF;
						table[(next_symbol << 1) + 1] = 0xFFFF;
						table[leaf] = next_symbol++;
					} // follow the path and select either left or right for the next bit


					leaf = table[leaf] << 1;
					if (pos >> 15 - fill & 1) leaf++;
				}

				table[leaf] = symbol; // bit position has overun the table mask

				if ((pos += bit_mask) > table_mask) throw new XnbError('Overrun table during decoding.');
			}

			bit_mask >>= 1;
		} // we have reached table mask


		if (pos == table_mask) return table; // something else went wrong

		throw new XnbError('Decode table did not reach table mask.');
	}
	/**
	 * Decodes the next huffman symbol from the bitstream.
	 * @public
	 * @method readHuffSymbol
	 * @param {BufferReader} buffer
	 * @param {Number[]} table
	 * @param {Number[]} length
	 * @param {Number} symbols
	 * @param {Number} bits
	 * @returns {Number}
	 */


	readHuffSymbol(buffer, table, length, symbols, bits) {
		// peek the specified bits ahead
		let bit = buffer.peekLZXBits(32) >>> 0; // (>>> 0) allows us to get a 32-bit uint

		let i = table[buffer.peekLZXBits(bits)]; // if our table is accessing a symbol beyond our range

		if (i >= symbols) {
			let j = 1 << 32 - bits;

			do {
				j >>= 1;
				i <<= 1;
				i |= (bit & j) != 0 ? 1 : 0;
				if (j == 0) return 0;
			} while ((i = table[i]) >= symbols);
		} // seek past this many bits


		buffer.bitPosition += length[i]; // return the symbol

		return i;
	}
	/**
	 * Sets the shortest match.
	 * @param {Number} X
	 */


	set RRR(X) {
		// No match, R2 <- R1, R1 <- R0, R0 <- X
		if (this.R0 != X && this.R1 != X && this.R2 != X) {
			// shift all offsets down
			this.R2 = this.R1;
			this.R1 = this.R0;
			this.R0 = X;
		} // X = R1, Swap R0 <-> R1
		else if (this.R1 == X) {
			let R1 = this.R1;
			this.R1 = this.R0;
			this.R0 = R1;
		} // X = R2, Swap R0 <-> R2
		else if (this.R2 == X) {
			let R2 = this.R2;
			this.R2 = this.R0;
			this.R0 = R2;
		}
	}

}

Lzx.position_base = [];
Lzx.extra_bits = [];

/**
 * Used to compress and decompress LZX.
 * @class
 * @public
 */

class Presser {
	/**
	 * Decompress a certain amount of bytes.
	 * @public
	 * @static
	 * @param {BufferReader} buffer
	 * @returns {Buffer}
	 */
	static decompress(buffer, compressedTodo, decompressedTodo) {
		// current index into the buffer
		let pos = 0; // allocate variables for block and frame size

		let block_size;
		let frame_size; // create the LZX instance with 16-bit window frame

		const lzx = new Lzx(16); // the full decompressed array

		let decompressed = new BufferWriter(decompressedTodo);

		while (pos < compressedTodo) {
			// flag is for determining if frame_size is fixed or not
			const flag = buffer.readByte(); // if flag is set to 0xFF that means we will read in frame size

			if (flag == 0xFF) {
				// read in the frame size
				frame_size = buffer.readLZXInt16(); // read in the block size

				block_size = buffer.readLZXInt16(); // advance the byte position forward

				pos += 5;
			} else {
				// rewind the buffer
				buffer.seek(-1); // read in the block size

				block_size = buffer.readLZXInt16(this.buffer); // set the frame size

				frame_size = 0x8000; // advance byte position forward

				pos += 2;
			} // ensure the block and frame size aren't empty


			if (block_size == 0 || frame_size == 0) break; // ensure the block and frame size don't exceed size of integers

			if (block_size > 0x10000 || frame_size > 0x10000) throw new XnbError('Invalid size read in compression content.'); // decompress the file based on frame and block size

			decompressed.write(lzx.decompress(buffer, frame_size, block_size)); // increase position counter

			pos += block_size;
		} // we have finished decompressing the file


		console.log('File has been successfully decompressed!'); // return a decompressed buffer

		decompressed.trim();
		return decompressed.buffer;
	}

}

// Original Code by: https://github.com/Benzinga/lz4js/
class LZ4Utils {
	// Simple hash function, from: http://burtleburtle.net/bob/hash/integer.html.
	// Chosen because it doesn't use multiply and achieves full avalanche.
	static hashU32(a) {
		a = a | 0;
		a = a + 2127912214 + (a << 12) | 0;
		a = a ^ -949894596 ^ a >>> 19;
		a = a + 374761393 + (a << 5) | 0;
		a = a + -744332180 ^ a << 9;
		a = a + -42973499 + (a << 3) | 0;
		return a ^ -1252372727 ^ a >>> 16 | 0;
	} // Reads a 64-bit little-endian integer from an array.


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
	} // Reads a 32-bit little-endian integer from an array.


	static readU32(b, n) {
		var x = 0;
		x |= b[n++] << 0;
		x |= b[n++] << 8;
		x |= b[n++] << 16;
		x |= b[n++] << 24;
		return x;
	} // Writes a 32-bit little-endian integer from an array.


	static writeU32(b, n, x) {
		b[n++] = x >> 0 & 0xff;
		b[n++] = x >> 8 & 0xff;
		b[n++] = x >> 16 & 0xff;
		b[n++] = x >> 24 & 0xff;
	} // Multiplies two numbers using 32-bit integer multiplication.
	// Algorithm from Emscripten.


	static imul(a, b) {
		var ah = a >>> 16;
		var al = a & 65535;
		var bh = b >>> 16;
		var bl = b & 65535;
		return al * bl + (ah * bl + al * bh << 16) | 0;
	}

}

// xxh32.js - implementation of xxhash32 in plain JavaScript

const prime1 = 0x9e3779b1;
const prime2 = 0x85ebca77;
const prime3 = 0xc2b2ae3d;
const prime4 = 0x27d4eb2f;
const prime5 = 0x165667b1; // Utility functions/primitives
// --

function rotl32(x, r) {
	x = x | 0;
	r = r | 0;
	return x >>> (32 - r | 0) | x << r | 0;
}

function rotmul32(h, r, m) {
	h = h | 0;
	r = r | 0;
	m = m | 0;
	return LZ4Utils.imul(h >>> (32 - r | 0) | h << r, m) | 0;
}

function shiftxor32(h, s) {
	h = h | 0;
	s = s | 0;
	return h >>> s ^ h | 0;
} // Implementation
// --


function xxhapply(h, src, m0, s, m1) {
	return rotmul32(LZ4Utils.imul(src, m0) + h, s, m1);
}

function xxh1(h, src, index) {
	return rotmul32(h + LZ4Utils.imul(src[index], prime5), 11, prime1);
}

function xxh4(h, src, index) {
	return xxhapply(h, LZ4Utils.readU32(src, index), prime3, 17, prime4);
}

function xxh16(h, src, index) {
	return [xxhapply(h[0], LZ4Utils.readU32(src, index + 0), prime2, 13, prime1), xxhapply(h[1], LZ4Utils.readU32(src, index + 4), prime2, 13, prime1), xxhapply(h[2], LZ4Utils.readU32(src, index + 8), prime2, 13, prime1), xxhapply(h[3], LZ4Utils.readU32(src, index + 12), prime2, 13, prime1)];
}

function xxh32(seed, src, index, len) {
	var h, l;
	l = len;

	if (len >= 16) {
		h = [seed + prime1 + prime2, seed + prime2, seed, seed - prime1];

		while (len >= 16) {
			h = xxh16(h, src, index);
			index += 16;
			len -= 16;
		}

		h = rotl32(h[0], 1) + rotl32(h[1], 7) + rotl32(h[2], 12) + rotl32(h[3], 18) + l;
	} else {
		h = seed + prime5 + len >>> 0;
	}

	while (len >= 4) {
		h = xxh4(h, src, index);
		index += 4;
		len -= 4;
	}

	while (len > 0) {
		h = xxh1(h, src, index);
		index++;
		len--;
	}

	h = shiftxor32(LZ4Utils.imul(shiftxor32(LZ4Utils.imul(shiftxor32(h, 15), prime2), 13), prime3), 16);
	return h >>> 0;
}

// Original Code by: https://github.com/Benzinga/lz4js/
// --
// Compression format parameters/constants.

const minMatch = 4;
const minLength = 13;
const searchLimit = 5;
const skipTrigger = 6;
const hashSize = 1 << 16; // Token constants.

const mlBits = 4;
const mlMask = (1 << mlBits) - 1;
const runBits = 4;
const runMask = (1 << runBits) - 1; // Shared buffers

const blockBuf = makeBuffer(5 << 20);
const hashTable = makeHashTable(); // Frame constants.

const magicNum = 0x184D2204; // Frame descriptor flags.

const fdContentChksum = 0x4;
const fdContentSize = 0x8;
const fdBlockChksum = 0x10; // const fdBlockIndep = 0x20;

const fdVersion = 0x40;
const fdVersionMask = 0xC0; // Block sizes.

const bsUncompressed = 0x80000000;
const bsDefault = 7;
const bsShift = 4;
const bsMask = 7;
const bsMap = {
	4: 0x10000,
	5: 0x40000,
	6: 0x100000,
	7: 0x400000
}; // Utility functions/primitives
// --
// Makes our hashtable. On older browsers, may return a plain array.

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
} // Clear hashtable.


function clearHashTable(table) {
	for (var i = 0; i < hashSize; i++) {
		hashTable[i] = 0;
	}
} // Makes a byte buffer. On older browsers, may return a plain array.


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

function sliceArray(array, start, end) {
	if (typeof array.buffer !== undefined) {
		if (Uint8Array.prototype.slice) {
			return array.slice(start, end);
		} else {
			// Uint8Array#slice polyfill.
			var len = array.length; // Calculate start.

			start = start | 0;
			start = start < 0 ? Math.max(len + start, 0) : Math.min(start, len); // Calculate end.

			end = end === undefined ? len : end | 0;
			end = end < 0 ? Math.max(len + end, 0) : Math.min(end, len); // Copy into new array.

			var arraySlice = new Uint8Array(end - start);

			for (var i = start, n = 0; i < end;) {
				arraySlice[n++] = array[i++];
			}

			return arraySlice;
		}
	} else {
		// Assume normal array.
		return array.slice(start, end);
	}
} // Implementation
// --
// Calculates an upper bound for lz4 compression.


function compressBound(n) {
	return n + n / 255 + 16 | 0;
}

function decompressBound(src) {
	var sIndex = 0; // Read magic number

	if (LZ4Utils.readU32(src, sIndex) !== magicNum) {
		throw new Error('invalid magic number');
	}

	sIndex += 4; // Read descriptor

	var descriptor = src[sIndex++]; // Check version

	if ((descriptor & fdVersionMask) !== fdVersion) {
		throw new Error('incompatible descriptor version ' + (descriptor & fdVersionMask));
	} // Read flags


	var useBlockSum = (descriptor & fdBlockChksum) !== 0;
	var useContentSize = (descriptor & fdContentSize) !== 0; // Read block size

	var bsIdx = src[sIndex++] >> bsShift & bsMask;

	if (bsMap[bsIdx] === undefined) {
		throw new Error('invalid block size ' + bsIdx);
	}

	var maxBlockSize = bsMap[bsIdx]; // Get content size

	if (useContentSize) {
		return LZ4Utils.readU64(src, sIndex);
	} // Checksum


	sIndex++; // Read blocks.

	var maxSize = 0;

	while (true) {
		var blockSize = LZ4Utils.readU32(src, sIndex);
		sIndex += 4;

		if (blockSize & bsUncompressed) {
			blockSize &= ~bsUncompressed;
			maxSize += blockSize;
		} else if (blockSize > 0) {
			maxSize += maxBlockSize;
		}

		if (blockSize === 0) {
			return maxSize;
		}

		if (useBlockSum) {
			sIndex += 4;
		}

		sIndex += blockSize;
	}
}

function decompressBlock$1(src, dst, sIndex, sLength, dIndex) {
	var mLength, mOffset, sEnd, n, i;
	var hasCopyWithin = dst.copyWithin !== undefined && dst.fill !== undefined; // Setup initial state.

	sEnd = sIndex + sLength; // Consume entire input block.

	while (sIndex < sEnd) {
		var token = src[sIndex++]; // Copy literals.

		var literalCount = token >> 4;

		if (literalCount > 0) {
			// Parse length.
			if (literalCount === 0xf) {
				while (true) {
					literalCount += src[sIndex];

					if (src[sIndex++] !== 0xff) {
						break;
					}
				}
			} // Copy literals


			for (n = sIndex + literalCount; sIndex < n;) {
				dst[dIndex++] = src[sIndex++];
			}
		}

		if (sIndex >= sEnd) {
			break;
		} // Copy match.


		mLength = token & 0xf; // Parse offset.

		mOffset = src[sIndex++] | src[sIndex++] << 8; // Parse length.

		if (mLength === 0xf) {
			while (true) {
				mLength += src[sIndex];

				if (src[sIndex++] !== 0xff) {
					break;
				}
			}
		}

		mLength += minMatch; // Copy match
		// prefer to use typedarray.copyWithin for larger matches
		// NOTE: copyWithin doesn't work as required by LZ4 for overlapping sequences
		// e.g. mOffset=1, mLength=30 (repeach char 30 times)
		// we special case the repeat char w/ array.fill

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
	var literalCount, dIndex, sEnd, n; // Setup initial state.

	dIndex = 0;
	sEnd = sLength + sIndex;
	mAnchor = sIndex; // Process only if block is large enough.

	if (sLength >= minLength) {
		var searchMatchCount = (1 << skipTrigger) + 3; // Consume until last n literals (Lz4 spec limitation.)

		while (sIndex + minMatch < sEnd - searchLimit) {
			var seq = LZ4Utils.readU32(src, sIndex);
			var hash = LZ4Utils.hashU32(seq) >>> 0; // Crush hash to 16 bits.

			hash = (hash >> 16 ^ hash) >>> 0 & 0xffff; // Look for a match in the hashtable. NOTE: remove one; see below.

			mIndex = hashTable[hash] - 1; // Put pos in hash table. NOTE: add one so that zero = invalid.

			hashTable[hash] = sIndex + 1; // Determine if there is a match (within range.)

			if (mIndex < 0 || sIndex - mIndex >>> 16 > 0 || LZ4Utils.readU32(src, mIndex) !== seq) {
				mStep = searchMatchCount++ >> skipTrigger;
				sIndex += mStep;
				continue;
			}

			searchMatchCount = (1 << skipTrigger) + 3; // Calculate literal count and offset.

			literalCount = sIndex - mAnchor;
			mOffset = sIndex - mIndex; // We've already matched one word, so get that out of the way.

			sIndex += minMatch;
			mIndex += minMatch; // Determine match length.
			// N.B.: mLength does not include minMatch, Lz4 adds it back
			// in decoding.

			mLength = sIndex;

			while (sIndex < sEnd - searchLimit && src[sIndex] === src[mIndex]) {
				sIndex++;
				mIndex++;
			}

			mLength = sIndex - mLength; // Write token + literal count.

			var token = mLength < mlMask ? mLength : mlMask;

			if (literalCount >= runMask) {
				dst[dIndex++] = (runMask << mlBits) + token;

				for (n = literalCount - runMask; n >= 0xff; n -= 0xff) {
					dst[dIndex++] = 0xff;
				}

				dst[dIndex++] = n;
			} else {
				dst[dIndex++] = (literalCount << mlBits) + token;
			} // Write literals.


			for (var i = 0; i < literalCount; i++) {
				dst[dIndex++] = src[mAnchor + i];
			} // Write offset.


			dst[dIndex++] = mOffset;
			dst[dIndex++] = mOffset >> 8; // Write match length.

			if (mLength >= mlMask) {
				for (n = mLength - mlMask; n >= 0xff; n -= 0xff) {
					dst[dIndex++] = 0xff;
				}

				dst[dIndex++] = n;
			} // Move the anchor.


			mAnchor = sIndex;
		}
	} // Nothing was encoded.


	if (mAnchor === 0) {
		return 0;
	} // Write remaining literals.
	// Write literal token+count.


	literalCount = sEnd - mAnchor;

	if (literalCount >= runMask) {
		dst[dIndex++] = runMask << mlBits;

		for (n = literalCount - runMask; n >= 0xff; n -= 0xff) {
			dst[dIndex++] = 0xff;
		}

		dst[dIndex++] = n;
	} else {
		dst[dIndex++] = literalCount << mlBits;
	} // Write literals.


	sIndex = mAnchor;

	while (sIndex < sEnd) {
		dst[dIndex++] = src[sIndex++];
	}

	return dIndex;
}

function decompressFrame(src, dst) {
	var useBlockSum, useContentSum, useContentSize, descriptor;
	var sIndex = 0;
	var dIndex = 0; // Read magic number

	if (LZ4Utils.readU32(src, sIndex) !== magicNum) {
		throw new Error('invalid magic number');
	}

	sIndex += 4; // Read descriptor

	descriptor = src[sIndex++]; // Check version

	if ((descriptor & fdVersionMask) !== fdVersion) {
		throw new Error('incompatible descriptor version');
	} // Read flags


	useBlockSum = (descriptor & fdBlockChksum) !== 0;
	useContentSum = (descriptor & fdContentChksum) !== 0;
	useContentSize = (descriptor & fdContentSize) !== 0; // Read block size

	var bsIdx = src[sIndex++] >> bsShift & bsMask;

	if (bsMap[bsIdx] === undefined) {
		throw new Error('invalid block size');
	}

	if (useContentSize) {
		// TODO: read content size
		sIndex += 8;
	}

	sIndex++; // Read blocks.

	while (true) {
		var compSize;
		compSize = LZ4Utils.readU32(src, sIndex);
		sIndex += 4;

		if (compSize === 0) {
			break;
		}

		if (useBlockSum) {
			// TODO: read block checksum
			sIndex += 4;
		} // Check if block is compressed


		if ((compSize & bsUncompressed) !== 0) {
			// Mask off the 'uncompressed' bit
			compSize &= ~bsUncompressed; // Copy uncompressed data into destination buffer.

			for (var j = 0; j < compSize; j++) {
				dst[dIndex++] = src[sIndex++];
			}
		} else {
			// Decompress into blockBuf
			dIndex = decompressBlock$1(src, dst, sIndex, compSize, dIndex);
			sIndex += compSize;
		}
	}

	if (useContentSum) {
		// TODO: read content checksum
		sIndex += 4;
	}

	return dIndex;
}

function compressFrame(src, dst) {
	var dIndex = 0; // Write magic number.

	LZ4Utils.writeU32(dst, dIndex, magicNum);
	dIndex += 4; // Descriptor flags.

	dst[dIndex++] = fdVersion;
	dst[dIndex++] = bsDefault << bsShift; // Descriptor checksum.

	dst[dIndex] = xxh32(0, dst, 4, dIndex - 4) >> 8;
	dIndex++; // Write blocks.

	var maxBlockSize = bsMap[bsDefault];
	var remaining = src.length;
	var sIndex = 0; // Clear the hashtable.

	clearHashTable(); // Split input into blocks and write.

	while (remaining > 0) {
		var compSize = 0;
		var blockSize = remaining > maxBlockSize ? maxBlockSize : remaining;
		compSize = compressBlock(src, blockBuf, sIndex, blockSize, hashTable);

		if (compSize > blockSize || compSize === 0) {
			// Output uncompressed.
			LZ4Utils.writeU32(dst, dIndex, 0x80000000 | blockSize);
			dIndex += 4;

			for (var z = sIndex + blockSize; sIndex < z;) {
				dst[dIndex++] = src[sIndex++];
			}

			remaining -= blockSize;
		} else {
			// Output compressed.
			LZ4Utils.writeU32(dst, dIndex, compSize);
			dIndex += 4;

			for (var j = 0; j < compSize;) {
				dst[dIndex++] = blockBuf[j++];
			}

			sIndex += blockSize;
			remaining -= blockSize;
		}
	} // Write blank end block.


	LZ4Utils.writeU32(dst, dIndex, 0);
	dIndex += 4;
	return dIndex;
}
// provided, a maximum size will be determined by examining the data. The
// buffer returned will always be perfectly-sized.

function decompress$1(src, maxSize) {
	var dst, size;

	if (maxSize === undefined) {
		maxSize = decompressBound(src);
	}

	dst = makeBuffer(maxSize);
	size = decompressFrame(src, dst);

	if (size !== maxSize) {
		dst = sliceArray(dst, 0, size);
	}

	return dst;
}
// a buffer will be created based on the theoretical worst output size for a
// given input size. The buffer returned will always be perfectly-sized.

function compress$1(src, maxSize) {
	var dst, size;

	if (maxSize === undefined) {
		maxSize = compressBound(src.length);
	}

	dst = makeBuffer(maxSize);
	size = compressFrame(src, dst);

	if (size !== maxSize) {
		dst = sliceArray(dst, 0, size);
	}

	return dst;
}

/**
 * Class used to read the XNB types using the readers
 * @class
 */

class ReaderResolver {
	/**
	 * Creating a new instance of ReaderResolver
	 * @constructor
	 * @param {BaseReader[]} readers Array of BaseReaders
	 */
	constructor(readers) {
		/**
		 * Array of base readers
		 * @type {BaseReader[]}
		 */
		this.readers = readers;
	}
	/**
	 * Read the XNB file contents
	 * @method read
	 * @public
	 * @param {BufferReader} buffer The buffer to read from.
	 */


	read(buffer) {
		// read the index of which reader to use
		let index = buffer.read7BitNumber() - 1;
		if (this.readers[index] == null) throw new XnbError("Invalid reader index ".concat(index)); // read the buffer using the selected reader

		return this.readers[index].read(buffer, this);
	}
	/**
	 * Writes the XNB file contents
	 * @param {BufferWriter} buffer
	 * @param {Object} content 
	 */


	write(buffer, content) {
		this.readers[0].write(buffer, content, this);
	}
	/**
	 * Returns the index of the reader
	 * @param {BaseReader} reader 
	 * @param {Number}
	 */


	getIndex(reader) {
		for (let i in this.readers) if (reader.toString() == this.readers[i].toString()) return i;
	}

}

/**
 * Base class for all readers.
 * @abstract
 * @class
 */

class BaseReader {
	/**
	 * Returns if type normally requires a special reader.
	 * @public
	 * @method
	 * @returns {Boolean} Returns true if type is primitive.
	 */
	isValueType() {
		return true;
	}
	/**
	 * Returns string type of reader
	 * @public
	 * @property
	 * @returns {string}
	 */


	get type() {
		return this.constructor.name.slice(0, -6);
	}
	/**
	 * Reads the buffer by the specification of the type reader.
	 * @public
	 * @param {BufferReader} buffer The buffer to read from.
	 * @param {ReaderResolver} resolver The content reader to resolve readers from.
	 * @returns {mixed} Returns the type as specified by the type reader.
	 */


	read(buffer, resolver) {
		throw new XnbError('Cannot invoke methods on abstract class.');
	}
	/**
	 * Writes into the buffer
	 * @param {BufferWriter} buffer The buffer to write to
	 * @param {Mixed} data The data to parse to write to the buffer
	 * @param {ReaderResolver} resolver ReaderResolver to write non-primitive types
	 */


	write(buffer, content, resolver) {
		throw new XnbError('Cannot invoke methods on abstract class.');
	}
	/**
	 * Writes the index of this reader to the buffer
	 * @param {BufferWriter} buffer
	 * @param {ReaderResolver} resolver 
	 */


	writeIndex(buffer, resolver) {
		if (resolver != null) buffer.write7BitNumber(Number.parseInt(resolver.getIndex(this)) + 1);
	}
	/**
	 * When printing out in a string.
	 * @returns {String}
	 */


	toString() {
		return this.type;
	}

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

/**
 * String Reader
 * @class
 * @extends BaseReader
 */

class StringReader extends BaseReader {
	/**
	 * Reads String from buffer.
	 * @param {BufferReader} buffer
	 * @returns {String}
	 */
	read(buffer) {
		// read in the length of the string
		let length = buffer.read7BitNumber(); // read in the UTF-8 encoded string

		return buffer.readString(length);
	}
	/**
	 * Writes the string to the buffer.
	 * @param {BufferWriter} buffer 
	 * @param {String} string 
	 * @param {ReaderResolver} resolver
	 */


	write(buffer, string, resolver) {
		// write the index
		this.writeIndex(buffer, resolver); // get the size of UTF-8 encoded string

		const size = UTF8Length(string); // write the length of the string

		buffer.write7BitNumber(size); // write the string

		buffer.writeString(string);
	}

	isValueType() {
		return false;
	}

}

/**
 * UInt32 Reader
 * @class
 * @extends BaseReader
 */

class UInt32Reader extends BaseReader {
	/**
	 * Reads UInt32 from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Number}
	 */
	read(buffer) {
		return buffer.readUInt32();
	}
	/**
	 * 
	 * @param {BufferWriter} buffer 
	 * @param {Number} content 
	 * @param {ReaderResolver} resolver 
	 */


	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeUInt32(content);
	}

}

/**
 * Array Reader
 * @class
 * @extends BaseReader
 */

class ArrayReader extends BaseReader {
	/**
	 * Constructor for the ArrayReader
	 * @param {BaseReader} reader The reader used for the array elements
	 */
	constructor(reader) {
		super();
		/** @type {BaseReader} */

		this.reader = reader;
	}
	/**
	 * Reads Array from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {Array}
	 */


	read(buffer, resolver) {
		// create a uint32 reader
		const uint32Reader = new UInt32Reader(); // read the number of elements in the array

		let size = uint32Reader.read(buffer); // create local array

		let array = []; // loop size number of times for the array elements

		for (let i = 0; i < size; i++) {
			// get value from buffer
			let value = this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer); // push into local array

			array.push(value);
		} // return the array


		return array;
	}
	/**
	 * Writes Array into buffer
	 * @param {BufferWriter} buffer
	 * @param {Array} data
	 * @param {ReaderResolver} resolver
	 */


	write(buffer, content, resolver) {
		// write the index
		this.writeIndex(buffer, resolver); // create a uint32 reader

		const uint32Reader = new UInt32Reader(); // write the number of elements in the array

		uint32Reader.write(buffer, content.length, resolver); // loop over array to write array contents

		for (let i = 0; i < content.length; i++) this.reader.write(buffer, content[i], this.reader.isValueType() ? null : resolver);
	}

	isValueType() {
		return false;
	}

	get type() {
		return "Array<".concat(this.reader.type, ">");
	}

}

/**
 * BmFont Reader
 * @class
 * @extends BaseReader
 */

class BmFontReader extends BaseReader {
	/**
	 * Reads BmFont from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Object}
	 */
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
	/**
	 * Writes BmFont into buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data
	 * @param {ReaderResolver}
	 */


	write(buffer, content, resolver) {
		// write index of reader
		this.writeIndex(buffer, resolver);
		const stringReader = new StringReader();
		stringReader.write(buffer, content.export.data, null);
	}

	isValueType() {
		return false;
	}

}

/**
 * Boolean Reader
 * @class
 * @extends BaseReader
 */

class BooleanReader extends BaseReader {
	/**
	 * Reads Boolean from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Boolean}
	 */
	read(buffer) {
		return Boolean(buffer.readInt());
	}
	/**
	 * Writes Boolean into buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data
	 * @param {ReaderResolver}
	 */


	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeByte(content);
	}

}

/**
 * Char Reader
 * @class
 * @extends BaseReader
 */

class CharReader extends BaseReader {
	/**
	 * Reads Char from the buffer.
	 * @param {BufferReader} buffer
	 * @returns {String}
	 */
	read(buffer) {
		let charSize = this._getCharSize(buffer.peekInt());

		return buffer.readString(charSize);
	}
	/**
	 * Writes Char into buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data
	 * @param {ReaderResolver}
	 */


	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeString(content);
	}
	/**
	 * Gets size of char for some special characters that are more than one byte.
	 * @param {Number} byte
	 * @returns {Number}
	 */


	_getCharSize(byte) {
		return (0xE5000000 >> (byte >> 3 & 0x1e) & 3) + 1;
	}

}

/**
 * Dictionary Reader
 * @class
 * @extends BaseReader
 */

class DictionaryReader extends BaseReader {
	/**
	 * Constructor for DictionaryReader.
	 * @constructor
	 * @param {BaseReader} key The BaseReader for the dictionary key.
	 * @param {BaseReader} value The BaseReader for the dictionary value.
	 */
	constructor(key, value) {
		// verify key and value are specified
		if (key == undefined || value == undefined) throw new XnbError('Cannot create instance of DictionaryReader without Key and Value.'); // call base constructor

		super();
		/** @type {BaseReader} */

		this.key = key;
		/** @type {BaseReader} */

		this.value = value;
	}
	/**
	 * Reads Dictionary from buffer.
	 * @param {BufferReader} buffer Buffer to read from.
	 * @param {ReaderResolver} resolver ReaderResolver to read non-primitive types.
	 * @returns {object}
	 */


	read(buffer, resolver) {
		// the dictionary to return
		let dictionary = {}; // read in the size of the dictionary

		const uint32Reader = new UInt32Reader();
		const size = uint32Reader.read(buffer); // loop over the size of the dictionary and read in the data

		for (let i = 0; i < size; i++) {
			// get the key
			let key = this.key.isValueType() ? this.key.read(buffer) : resolver.read(buffer); // get the value

			let value = this.value.isValueType() ? this.value.read(buffer) : resolver.read(buffer); // assign KV pair to the dictionary

			dictionary[key] = value;
		} // return the dictionary object


		return dictionary;
	}
	/**
	 * Writes Dictionary into buffer
	 * @param {BufferWriter} buffer
	 * @param {Object} data The data to parse for the 
	 * @param {ReaderResolver} resolver ReaderResolver to write non-primitive types
	 * @returns {Buffer} buffer instance with the data in it
	 */


	write(buffer, content, resolver) {
		// write the index
		this.writeIndex(buffer, resolver); // write the amount of entries in the Dictionary

		buffer.writeUInt32(Object.keys(content).length); // loop over the entries

		for (let key of Object.keys(content)) {
			// write the key
			this.key.write(buffer, key, this.key.isValueType() ? null : resolver); // write the value

			this.value.write(buffer, content[key], this.value.isValueType() ? null : resolver);
		}
	}

	isValueType() {
		return false;
	}

	get type() {
		return "Dictionary<".concat(this.key.type, ",").concat(this.value.type, ">");
	}

}

/**
 * Double Reader
 * @class
 * @extends BaseReader
 */

class DoubleReader extends BaseReader {
	/**
	 * Reads Double from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Number}
	 */
	read(buffer) {
		return buffer.readDouble();
	}
	/**
	 * Writes Double into buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data
	 * @param {ReaderResolver}
	 */


	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeDouble(content);
	}

}

/**
 * Effect Reader
 * @class
 * @extends BaseReader
 */

class EffectReader extends BaseReader {
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
	/**
	 * Writes Effects into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */


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

/**
 * Int32 Reader
 * @class
 * @extends BaseReader
 */

class Int32Reader extends BaseReader {
	/**
	 * Reads Int32 from buffer.
	 * @param {BufferReader} buffer
	 * @returns {Number}
	 */
	read(buffer) {
		return buffer.readInt32();
	}
	/**
	 * Writes Int32 and returns buffer
	 * @param {BufferWriter} buffer
	 * @param {Number} content
	 * @param {ReaderResolver} resolver
	 */


	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeInt32(content);
	}

}

/**
 * List Reader
 * @class
 * @extends BaseReader
 */

class ListReader extends BaseReader {
	constructor(reader) {
		super();
		/** @type {BaseReader} */

		this.reader = reader;
	}
	/**
	 * Reads List from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {Array}
	 */


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
	/**
	 * Writes List into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */


	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const uint32Reader = new UInt32Reader();
		uint32Reader.write(buffer, content.length, null);

		for (let data of Object.values(content)) {
			this.reader.write(buffer, data, this.reader.isValueType() ? null : resolver);
		}
	}

	get type() {
		return "List<".concat(this.reader.type, ">");
	}

}

/**
 * Nullable Reader
 * @class
 * @extends BaseReader
 */

class NullableReader extends BaseReader {
	/**
	 * @constructor
	 * @param {BaseReader} reader
	 */
	constructor(reader) {
		super();
		/**
		 * Nullable type
		 * @type {BaseReader}
		 */

		this.reader = reader;
	}
	/**
	 * Reads Nullable type from buffer.
	 * @param {BufferReader} buffer
	 * @param {ReaderResolver} resolver
	 * @returns {mixed|null}
	 */


	read(buffer, resolver) {
		// get an instance of boolean reader
		const booleanReader = new BooleanReader(); // read in if the nullable has a value or not

		const hasValue = booleanReader.read(buffer); // return the value

		return hasValue ? this.reader.isValueType() ? this.reader.read(buffer) : resolver.read(buffer) : null;
	}
	/**
	 * Writes Nullable into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */


	write(buffer, content, resolver) {
		buffer.writeByte(content != null);
		if (content != null) this.reader.write(buffer, content, this.reader.isValueType() ? null : resolver);
	}

	isValueType() {
		return false;
	}

	get type() {
		return "Nullable<".concat(this.reader.type, ">");
	}

}

/**
 * Rectangle Reader
 * @class
 * @extends BaseReader
 */

class RectangleReader extends BaseReader {
	/**
	 * Reads Rectangle from buffer.
	 * @param {BufferReader} buffer
	 * @returns {object}
	 */
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
	/**
	 * Writes Effects into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */


	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		const int32Reader = new Int32Reader();
		int32Reader.write(buffer, content.x, null);
		int32Reader.write(buffer, content.y, null);
		int32Reader.write(buffer, content.width, null);
		int32Reader.write(buffer, content.height, null);
	}

}

/**
 * Single Reader
 * @class
 * @extends BaseReader
 */

class SingleReader extends BaseReader {
	/**
	 * Reads Single from the buffer.
	 * @param {BufferReader} buffer
	 * @returns {Number}
	 */
	read(buffer) {
		return buffer.readSingle();
	}

	write(buffer, content, resolver) {
		this.writeIndex(buffer, resolver);
		buffer.writeSingle(content);
	}

}

//constant values
const kDxt1 = 1 << 0; //! Use DXT1 compression.

const kDxt3 = 1 << 1; //! Use DXT3 compression.

const kDxt5 = 1 << 2; //! Use DXT5 compression.

const kColourIterativeClusterFit = 1 << 8; //! Use a very slow but very high quality colour compressor.

const kColourClusterFit = 1 << 3; //! Use a slow but high quality colour compressor (the default).

const kColourRangeFit = 1 << 4; //! Use a fast but low quality colour compressor.

const kColourMetricPerceptual = 1 << 5; //! Use a perceptual metric for colour error (the default).

const kColourMetricUniform = 1 << 6; //! Use a uniform metric for colour error.

const kWeightColourByAlpha = 1 << 7; //! Weight the colour by alpha during cluster fit (disabled by default).

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

/*
 * get Eigen-values and Eigen-vectors from symmetric matrix
 * I can use it directly because covarience matrix is symmetric - Lybell
 * from DiagonalizeJS : https://github.com/arkajitmandal/DiagonalizeJS
 * made by Arkajit Mandal
 */
// Rotation Matrix
function Rot(theta) {
	let Mat = [[Math.cos(theta), Math.sin(theta)], [-Math.sin(theta), Math.cos(theta)]];
	return Mat;
} // Givens Matrix


function Rij(k, l, theta, N) {
	let Mat = Array(N);

	for (let i = 0; i < N; i++) {
		Mat[i] = Array(N);
	} // Identity Matrix


	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			Mat[i][j] = (i === j) * 1.0;
		}
	}

	let Rotij = Rot(theta); // Put Rotation part in i, j

	Mat[k][k] = Rotij[0][0]; // 11

	Mat[l][l] = Rotij[1][1]; // 22

	Mat[k][l] = Rotij[0][1]; // 12

	Mat[l][k] = Rotij[1][0]; // 21

	return Mat;
} // get angle


function getTheta(aii, ajj, aij) {
	let th = 0.0;
	let denom = ajj - aii;

	if (Math.abs(denom) <= 1E-12) {
		th = Math.PI / 4.0;
	} else {
		th = 0.5 * Math.atan(2.0 * aij / (ajj - aii));
	}

	return th;
} // get max off-diagonal value from Upper Diagonal


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
} // Unitary Rotation UT x H x U


function unitary(U, H) {
	let N = U.length; // empty NxN matrix

	let Mat = Array(N);

	for (let i = 0; i < N; i++) {
		Mat[i] = Array(N);
	} // compute element


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
} // Matrix Multiplication


function AxB(A, B) {
	let N = A.length; // empty NxN matrix

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
	let e0 = Math.abs(convergence / N); // initial vector

	let Sij = Array(N);

	for (let i = 0; i < N; i++) {
		Sij[i] = Array(N);
	} // Sij is Identity Matrix


	for (let i = 0; i < N; i++) {
		for (let j = 0; j < N; j++) {
			Sij[i][j] = (i === j) * 1.0;
		}
	} // initial error


	let Vab = getAij(Hij); //	jacobi iterations

	while (Math.abs(Vab[1]) >= Math.abs(e0)) {
		// block index to be rotated
		let i = Vab[0][0];
		let j = Vab[0][1]; // get theta

		let psi = getTheta(Hij[i][i], Hij[j][j], Hij[i][j]); // Givens matrix

		let Gij = Rij(i, j, psi, N); // rotate Hamiltonian using Givens

		Hij = unitary(Gij, Hij); // Update vectors

		Sij = AxB(Sij, Gij); // update error 

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
	} // idk what is "splat", but these functions returns new Vec4 filled with (x,x,x,x).


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
	} // returns a*b + c


	static multiplyAdd(a, b, c) {
		return new Vec4(a.x * b.x + c.x, a.y * b.y + c.y, a.z * b.z + c.z, a.w * b.w + c.w);
	} // returns c - a*b


	static negativeMultiplySubtract(a, b, c) {
		return new Vec4(c.x - a.x * b.x, c.y - a.y * b.y, c.z - a.z * b.z, c.w - a.w * b.w);
	}

	static compareAnyLessThan(left, right) {
		return left.x < right.x || left.y < right.y || left.z < right.z || left.w < right.w;
	}

}

function computeWeightedCovariance(values, weights) {
	//compute the mean vector
	let total = 0;
	let mean = values.reduce((sum, value, i) => {
		total += weights[i];
		sum.addScaledVector(value, weights[i]);
		return sum;
	}, new Vec3(0));
	mean.mult(1 / total); //compute the covariance matrix
	//sigma( (x-m)*(x-m)^T )
	// [0(xx) 1(xy) 2(xz)]
	// [1(xy) 3(yy) 4(yz)]
	// [2(xz) 4(yz) 5(zz)]

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
	}, [[0, 0, 0], [0, 0, 0], [0, 0, 0]]); //post-processing

	covariance[1][0] = covariance[0][1];
	covariance[2][0] = covariance[0][2];
	covariance[2][1] = covariance[1][2]; // there is no need to divide by total since the eigenvector of the scalar multiplied matrix
	// is the same as the eigenvector of the original matrix.

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
	// use ANSI round-to-zero behaviour to get round-to-nearest
	const integer = parseInt(value + 0.5); // clamp to the limit

	if (integer < 0) return 0;
	if (integer > limit) return integer;
	return integer;
}

function floatTo565(color) {
	// get the components in the correct range
	const r = floatToInt(31.0 * color.x, 31);
	const g = floatToInt(63.0 * color.y, 63);
	const b = floatToInt(31.0 * color.z, 31); // pack into a single value

	return r << 11 | g << 5 | b;
}
/**
 * @param {int} packed 16bit first color
 * @param {int} packed 16bit second color
 * @param {Array(int)} each pixel block's index data
 * @param {Uint8Array} the array to save result
 * @param {int} the array's offset
 */


function writeColourBlock(firstColor, secondColor, indices, result, blockOffset) {
	// write the endpoints as little endian
	result[blockOffset + 0] = firstColor & 0xff;
	result[blockOffset + 1] = firstColor >> 8;
	result[blockOffset + 2] = secondColor & 0xff;
	result[blockOffset + 3] = secondColor >> 8; // write the indices as big endian like [33221100]

	for (let y = 0; y < 4; y++) {
		result[blockOffset + 4 + y] = indices[4 * y + 0] | indices[4 * y + 1] << 2 | indices[4 * y + 2] << 4 | indices[4 * y + 3] << 6;
	}
}
/**
 * @param {Vec3} first color
 * @param {Vec3} second color
 * @param {Array(int)} each pixel block's index data
 * @param {Uint8Array} the array to save result
 * @param {int} the array's offset
 */


function writeColourBlock3(start, end, indices, result, blockOffset) {
	// get the packed values
	let firstColor = floatTo565(start);
	let secondColor = floatTo565(end); // remap the indices

	let remapped;

	if (firstColor <= secondColor) {
		// use the indices directly
		remapped = indices.slice();
	} else {
		// swap a and b
		[firstColor, secondColor] = [secondColor, firstColor];
		remapped = indices.map(index => index === 0 ? 1 : index === 1 ? 0 : index);
	} // write the block


	writeColourBlock(firstColor, secondColor, remapped, result, blockOffset);
}

function writeColourBlock4(start, end, indices, result, blockOffset) {
	// get the packed values
	let firstColor = floatTo565(start);
	let secondColor = floatTo565(end); // remap the indices

	let remapped;

	if (firstColor < secondColor) {
		// swap a and b
		[firstColor, secondColor] = [secondColor, firstColor];
		remapped = indices.map(index => (index ^ 0x1) & 0x3);
	} else if (firstColor == secondColor) {
		// use index 0
		remapped = new Array(16).fill(0);
	} else {
		// use the indices directly
		remapped = indices.slice();
	} // write the block


	writeColourBlock(firstColor, secondColor, remapped, result, blockOffset);
}

class ColorSet {
	constructor(rgba, mask, flags) {
		/**
		 * this colorset's flags
		 * @public
		 * @type {Number}
		 */
		this.flags = flags;
		/**
		 * the number of colors
		 * @private
		 * @type {Number}
		 */

		this._count = 0;
		/**
		 * the number of colors
		 * @private
		 * @type {boolean}
		 */

		this._transparent = false;
		/**
		 * the indices of color
		 * @private
		 * @type {Array(Number)}
		 */

		this._remap = [];
		/**
		 * Weighted by how many colors there are
		 * @private
		 * @type {Array(Number)}
		 */

		this._weights = [];
		/**
		 * the color data
		 * @private
		 * @type {Array(Vec3)}
		 */

		this._points = [];
		const isDxt1 = (this.flags & kDxt1) != 0;
		const weightByAlpha = (this.flags & kWeightColourByAlpha) != 0; // create the minimal set

		for (let i = 0; i < 16; i++) {
			// check this pixel is enabled
			const bit = 1 << i;

			if ((mask & bit) == 0) {
				this._remap[i] = -1;
				continue;
			} // check for transparent pixels when using dxt1


			if (isDxt1 && rgba[4 * i + 3] < 128) {
				this._remap[i] = -1;
				this._transparent = true;
				continue;
			} // loop over previous points for a match


			for (let j = 0;; j++) {
				// allocate a new point
				if (j == i) {
					// normalise coordinates to [0,1]
					const r = rgba[4 * i] / 255.0;
					const g = rgba[4 * i + 1] / 255.0;
					const b = rgba[4 * i + 2] / 255.0; // ensure there is always non-zero weight even for zero alpha

					const a = (rgba[4 * i + 3] + 1) / 256.0; // add the point

					this._points[this._count] = new Vec3(r, g, b);
					this._weights[this._count] = weightByAlpha ? a : 1.0;
					this._remap[i] = this._count; // advance

					this._count++;
					break;
				} // check for a match


				const oldbit = 1 << j;
				const match = (mask & oldbit) != 0 && rgba[4 * i] == rgba[4 * j] && rgba[4 * i + 1] == rgba[4 * j + 1] && rgba[4 * i + 2] == rgba[4 * j + 2] && (rgba[4 * j + 3] >= 128 || !isDxt1);

				if (match) {
					// get the index of the match
					const index = this._remap[j]; // ensure there is always non-zero weight even for zero alpha

					const w = (rgba[4 * i + 3] + 1) / 256.0; // map to this point and increase the weight

					this._weights[index] += weightByAlpha ? w : 1.0;
					this._remap[i] = index;
					break;
				}
			}
		} // square root the weights


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
	/**
	 * @param {int} index no
	 * @param {Uint8Array} Colormap index to store the result
	 */


	remapIndicesSingle(singleIndex, target) {
		const result = this._remap.map(index => index === -1 ? 3 : singleIndex);

		target.forEach((_, i) => target[i] = result[i]);
	}
	/**
	 * @example
	 * 	this.remap=[0,1,2,3, 2,2,3,4, 3,4,6,6, 7,5,5,0]
	 *	indexMap = [0,0,1,1,2,2,3,3]
	 *	target(result) => [0,0,1,1, 1,1,1,2, 1,1,3,3, 3,2,2,0]
	 * @param {Uint8Array} map of index numbers to fill
	 * @param {Uint8Array} Colormap index to store the result
	 */


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
		super(colorSet); // grab the single colour

		const singleColor = colorSet.points[0];
		this.color = singleColor.colorInt; // private property

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
		// check each index combination (endpoint or intermediate)
		this.error = Infinity;

		for (let index = 0; index < 2; index++) {
			// check the error for this codebook index
			const sources = []; //source : [channel][start/end/error]

			let error = 0;

			for (let channel = 0; channel < 3; channel++) {
				// grab the lookup table and index for this channel
				const lookup = lookups[channel]; //lookup : [rgb-raw index][startpoint/midpoint]

				const target = this.color[channel]; // store a pointer to the source for this channel

				sources[channel] = lookup[target][index]; // accumulate the error

				const diff = sources[channel][2];
				error += diff * diff;
			} // keep it if the error is lower


			if (error < this.error) {
				this.start = new Vec3(sources[0][0] / 31.0, sources[1][0] / 63.0, sources[2][0] / 31.0);
				this.end = new Vec3(sources[0][1] / 31.0, sources[1][1] / 63.0, sources[2][1] / 31.0);
				this.index = 2 * index; // 0:startpoint, 2:midpoint

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
		} // private property


		this.start = new Vec3(0);
		this.end = new Vec3(0);
		this.bestError = Infinity; //compute start&end points

		this.computePoints();
	}

	compressBase(codes, saveFunc) {
		const {
			points: values
		} = this.colors;
		let error = 0; // Map the closest code of each color

		const closest = values.map(color => {
			let minDist = Infinity; // find the closest code

			const packedIndex = codes.reduce((idx, code, j) => {
				const dist = Vec3.sub(color, code).multVector(this.metric).lengthSq;
				if (dist >= minDist) return idx;
				minDist = dist;
				return j;
			}, 0); // accumulate the error

			error += minDist; // save the index

			return packedIndex;
		}); // save this scheme if it wins

		if (error < this.bestError) {
			// remap the indices
			let indices = new Uint8Array(16);
			this.colors.remapIndices(closest, indices); // save the block

			saveFunc(this.start, this.end, indices); // save the error

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
		if (count <= 0) return; //dimension regression

		const principle = computePCA(values, weights);
		let start, end, min, max;
		start = end = values[0];
		min = max = Vec3.dot(start, principle); //compute the range

		for (let i = 1; i < count; i++) {
			let value = Vec3.dot(values[i], principle);

			if (value < min) {
				start = values[i];
				min = value;
			} else if (value > max) {
				end = values[i];
				max = value;
			}
		} // clamp to the grid and save


		this.start = start.clampGrid().clone();
		this.end = end.clampGrid().clone();
	}

}

class ClusterFit extends ColorFit {
	constructor(colorSet) {
		super(colorSet); // set the iteration count

		const kMaxIterations = 8;
		this.iterationCount = colorSet.flags & kColourIterativeClusterFit ? kMaxIterations : 1; // initialise the best error

		this.bestError = Infinity; // initialise the metric

		this.metric = new Vec4(1);

		if ((this.flags & kColourMetricPerceptual) !== 0) {
			this.metric.set(0.2126, 0.7152, 0.0722, 0);
		} // dimension regression


		const {
			points: values,
			weights
		} = this.colors;
		this.principle = computePCA(values, weights); // private property

		this.order = new Uint8Array(16 * kMaxIterations);
		this.pointsWeights = []; //Array(Vec4)[16]

		this.xSum_wSum = new Vec4(0); //Vec4
	}
	/*
	 * main Logics
	 */


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
		// prepare an ordering using the principle axis
		this.constructOrdering(this.principle, 0); // check all possible clusters and iterate on the total order

		let best = {
			start: new Vec4(0),
			end: new Vec4(0),
			error: this.bestError,
			iteration: 0,
			bestI: 0,
			bestJ: 0
		};
		if (repeater === 3) best.bestK = 0; // inner least squares terms function

		const leastSquares = (parts, internalIndices) => {
			const aabbx = aabbFunc(parts);
			const internalBest = this.computeOptimalPoints(aabbx);

			if (internalBest.error < best.error) {
				// keep the solution if it wins
				best = _objectSpread2(_objectSpread2({}, internalBest), internalIndices);
				return true;
			}

			return false;
		}; // loop over iterations (we avoid the case that all points in first or last cluster)


		for (let iterationIndex = 0;;) {
			this.clusterIterate(iterationIndex, leastSquares, repeater); // stop if we didn't improve in this iteration

			if (best.iteration != iterationIndex) break; // advance if possible

			iterationIndex++;
			if (iterationIndex == this.iterationCount) break; // stop if a new iteration is an ordering that has already been tried

			const newAxis = Vec4.sub(best.end, best.start).xyz;
			if (!this.constructOrdering(newAxis, iterationIndex)) break;
		} // save the block if win


		if (best.error < this.bestError) this.saveBlock(best, saveFunc);
	}
	/*
	 * for constructOrdering function
	 */


	makeOrder(axis) {
		const {
			count,
			points: values
		} = this.colors; // map dot products and stable sort
		// result : [1st index of color, 2nd index of color, ...]

		const dotProducts = values.map((color, i) => Vec3.dot(color, axis));
		return Array.from({
			length: count
		}, (_, i) => i).sort((a, b) => {
			if (dotProducts[a] - dotProducts[b] != 0) return dotProducts[a] - dotProducts[b];
			return a - b;
		});
	}

	copyOrderToThisOrder(order, iteration) {
		//copy currentOrder array to this.order
		const orderOffset = iteration * 16;
		order.forEach((ord, i) => {
			this.order[orderOffset + i] = ord;
		});
	}

	checkOrderUnique(order, iteration) {
		// check this ordering is unique
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
		// copy the ordering and weight all the points
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
	/*
	 * for compress function
	 */


	computeOptimalPoints(vectorPoint) {
		// constant vectors
		const {
			ax,
			bx,
			aa,
			bb,
			ab
		} = vectorPoint; // compute the least-squares optimal points

		const factor = Vec4.negativeMultiplySubtract(ab, ab, Vec4.multVector(aa, bb)).reciprocal();
		let a = Vec4.negativeMultiplySubtract(bx, ab, Vec4.multVector(ax, bb)).multVector(factor);
		let b = Vec4.negativeMultiplySubtract(ax, ab, Vec4.multVector(bx, aa)).multVector(factor); // clamp to the grid

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
		const two = new Vec4(2); // compute the error (we skip the constant xxsum)

		const e1 = Vec4.multiplyAdd(Vec4.multVector(a, a), aa, Vec4.multVector(b, b).multVector(bb));
		const e2 = Vec4.negativeMultiplySubtract(a, ax, Vec4.multVector(a, b).multVector(ab));
		const e3 = Vec4.negativeMultiplySubtract(b, bx, e2);
		const e4 = Vec4.multiplyAdd(two, e3, e1); // apply the metric to the error term

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
		const orderOffset = iteration * 16; // remap the indices

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
		this.colors.remapIndices(unordered, bestIndices); // save the block

		writeFunc(start.xyz, end.xyz, bestIndices); // save the error

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
		}; // first cluster [0,i) is at the start


		let part0 = new Vec4(0.0);

		for (let i = 0; i < count; i++) {
			// second cluster [i,j) is half along
			let part1 = new Vec4(0.0);

			for (let j = i;;) {
				// third cluster [j,k) is two thirds along
				let preLastPart = j == 0 ? this.pointsWeights[0].clone() : new Vec4(0.0);
				const kmin = j == 0 ? 1 : j;

				for (let k = kmin;;) {
					// last cluster [k,count) is at the end
					const restPart = Vec4.sub(this.xSum_wSum, preLastPart).subVector(part1).subVector(part0);
					func([part0, part1, preLastPart, restPart], indexMapper(i, j, k)); // advance

					if (k == count) break;
					preLastPart.addVector(this.pointsWeights[k]);
					k++;
				} // if iterCount === 2(=using Compress3), j iteration is not used


				if (iterCount === 2) break; // advance

				if (j === count) break;
				part1.addVector(this.pointsWeights[j]);
				j++;
			} // advance


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
	// quantise and pack the alpha values pairwise
	// repeat by 1byte (= 4bit * 2)
	for (let i = 0; i < 8; i++) {
		// quantise down to 4 bits
		let quant1 = quantise(rgba[8 * i + 3]);
		let quant2 = quantise(rgba[8 * i + 7]); // set alpha to zero where masked

		const bit1 = 1 << 2 * i;
		const bit2 = 1 << 2 * i + 1;
		if ((mask & bit1) == 0) quant1 = 0;
		if ((mask & bit2) == 0) quant2 = 0; // pack into the byte

		result[offset + i] = quant1 | quant2 << 4;
	}
}

function compressAlphaDxt5(rgba, mask, result, offset) {
	let step5 = interpolateAlpha(rgba, mask, 5);
	let step7 = interpolateAlpha(rgba, mask, 7); // save the block with least error

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
		// check this pixel is valid
		let bit = 1 << i;
		if ((mask & bit) == 0) continue; // incorporate into the min/max

		let value = rgba[4 * i + 3];

		if (steps === 5) {
			if (value !== 0 && value < min) min = value;
			if (value !== 255 && value > max) max = value;
		} else {
			if (value < min) min = value;
			if (value > max) max = value;
		}
	} // handle the case that no valid range was found


	if (min > max) min = max; // fix range

	if (max - min < steps) max = Math.min(min + steps, 255);
	if (max - min < steps) min = Math.max(max - steps, 0);
	return {
		min,
		max
	};
}

function setAlphaCodeBook(min, max, steps) {
	// set up the alpha code book
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
	// fit each alpha value to the codebook
	let err = 0;

	for (let i = 0; i < 16; ++i) {
		// check this pixel is valid
		let bit = 1 << i;

		if ((mask & bit) == 0) {
			// use the first code
			indices[i] = 0;
			continue;
		} // find the least error and corresponding index


		let value = rgba[4 * i + 3];
		let least = Infinity;
		let index = 0;

		for (let j = 0; j < 8; ++j) {
			// get the squared error from this code
			let dist = value - codes[j];
			dist *= dist; // compare with the best so far

			if (dist < least) {
				least = dist;
				index = j;
			}
		} // save this index and accumulate the error


		indices[i] = index;
		err += least;
	} // return the total error


	return err;
}

function writeAlphaBlock5(_ref, result, offset) {
	let {
		min: alpha0,
		max: alpha1,
		indices
	} = _ref;

	// check the relative values of the endpoints
	if (alpha0 > alpha1) {
		//swap the indices;
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

	// check the relative values of the endpoints
	if (alpha0 > alpha1) {
		//swap the indices;
		const swapped = indices.map(index => {
			if (index === 0) return 1;
			if (index === 1) return 0;
			return 9 - index;
		});
		writeAlphaBlock(alpha1, alpha0, swapped, result, offset);
	} else writeAlphaBlock(alpha0, alpha1, indices, result, offset);
}

function writeAlphaBlock(alpha0, alpha1, indices, result, offset) {
	// write the first two bytes
	result[offset] = alpha0;
	result[offset + 1] = alpha1; // pack the indices with 3 bits each

	let indicesPointer = 0;
	let resultPointer = offset + 2;

	for (let i = 0; i < 2; i++) {
		// pack 8 3-bit values
		let value = 0;

		for (let j = 0; j < 8; ++j) {
			let index = indices[indicesPointer];
			value |= index << 3 * j;
			indicesPointer++;
		} // store in 3 bytes


		for (let j = 0; j < 3; ++j) {
			let byte = value >> 8 * j & 0xff;
			result[resultPointer] = byte;
			resultPointer++;
		}
	}
}

function unpack565(color16bit) {
	// get the components in the stored range
	const red = color16bit >> 11 & 0x1f;
	const green = color16bit >> 5 & 0x3f;
	const blue = color16bit & 0x1f; // scale up to 8 bits

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
	// unpack the indices
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
/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 * @param {boolean} is using DXT1
 */


function decompressColor(rgba, block, offset, isDxt1) {
	const colorCode = unpackColorCodes(block, offset, isDxt1);
	const indices = unpackIndices(block, offset); // store out the colours

	for (let i = 0; i < 16; i++) {
		for (let j = 0; j < 4; j++) {
			rgba[4 * i + j] = colorCode[indices[i]][j];
		}
	}
}
/*
	compressed color bites are like this:
	[color1(low)]
	[color1(high)]
	[color2(low)]
	[color2(high)]
	[id3|id2|id1|id0]
	[id7|id6|id5|id4]
	[id11|id10|id9|id8]
	[id15|id14|id13|id12]
*/

/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 */


function decompressAlphaDxt3(rgba, block, offset) {
	// unpack the alpha values pairwise
	for (let i = 0; i < 8; ++i) {
		// quantise down to 4 bits
		let quant = block[offset + i]; // unpack the values

		let lo = quant & 0x0f;
		let hi = quant & 0xf0; // convert back up to bytes

		rgba[8 * i + 3] = lo | lo << 4;
		rgba[8 * i + 7] = hi | hi >> 4;
	}
}
/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 */


function decompressAlphaDxt5(rgba, block, offset) {
	// get the two alpha values
	let alpha0 = block[offset + 0];
	let alpha1 = block[offset + 1]; // compare the values to build the codebook

	let codes = setAlphaCodeBook(alpha0, alpha1, alpha0 <= alpha1 ? 5 : 7); // decode the indices

	let indices = new Uint8Array(16);
	let indicePointer = 0;
	let bytePointer = 2;

	for (let i = 0; i < 2; i++) {
		// grab 3 bytes
		let value = 0;

		for (let j = 0; j < 3; j++) {
			let byte = block[offset + bytePointer];
			value |= byte << 8 * j;
			bytePointer++;
		} // unpack 8 3-bit values from it


		for (let j = 0; j < 8; j++) {
			let index = value >> 3 * j & 0x7;
			indices[indicePointer] = index;
			indicePointer++;
		}
	} // write out the indexed codebook values


	for (let i = 0; i < 16; ++i) {
		rgba[4 * i + 3] = codes[indices[i]];
	}
}

/* -----------------------------------------------------------------------------
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
const DECOMPRESSED_BLOCK_SIZE = 16; //---------------------------------------------------------------------------//

/**
 * image-block repeat function
 * @param {function(int, int)} callback function to perform per iteration
 * 	@param {int} x-coord
 *	@param {int} y-coord
 */

function blockRepeat(width, height, func) {
	for (let y = 0; y < height; y += 4) {
		for (let x = 0; x < width; x += 4) {
			func(x, y);
		}
	}
}
/**
 * 4x4 block repeat function
 * @param {function(int, int)} callback function to perform per iteration
 * 	@param {int} x-coord
 *	@param {int} y-coord
 */


function rectRepeat(func) {
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			func(x, y);
		}
	}
}

function FixFlags(flags) {
	// grab the flag bits
	let method = flags & (kDxt1 | kDxt3 | kDxt5);
	let fit = flags & (kColourIterativeClusterFit | kColourClusterFit | kColourRangeFit);
	let metric = flags & (kColourMetricPerceptual | kColourMetricUniform);
	const extra = flags & kWeightColourByAlpha; // set defaults

	if (method != kDxt3 && method != kDxt5) method = kDxt1;
	if (fit != kColourRangeFit && fit != kColourIterativeClusterFit) fit = kColourClusterFit;
	if (metric != kColourMetricUniform) metric = kColourMetricPerceptual; // done

	return method | fit | metric | extra;
}

function GetStorageRequirements(width, height, flags) {
	// fix any bad flags
	flags = FixFlags(flags); // compute the storage requirements

	const blockcount = Math.floor((width + 3) / 4) * Math.floor((height + 3) / 4); // if it uses dxt1 compression, blocksize is 8, else it is 16

	const blocksize = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	return blockcount * blocksize;
} //---------------------------------------------------------------------------//

/**
 * @param {Uint8Array} image data
 * @param {object} result data's position data
 */


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
		let sy = y + py; //if (sx, sy) is in range, copy the rgba value

		if (sx < width && sy < height) {
			// copy the rgba value
			let sourceColorOffset = COLORS * (width * sy + sx);

			for (let i = 0; i < COLORS; i++) {
				block[blockColorOffset++] = img[sourceColorOffset++];
			} // enable this pixel


			mask |= 1 << 4 * py + px;
		} else blockColorOffset += COLORS;
	});
	return {
		block,
		mask
	};
}
/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {Uint8Array} decompressed block
 * @param {object} result data's position data
 */


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
		let sy = y + py; //if (sx, sy) is in range, copy the color

		if (sx < width && sy < height) {
			let resultColorOffset = COLORS * (width * sy + sx);

			for (let i = 0; i < COLORS; i++) {
				result[resultColorOffset + i] = block[blockColorOffset++];
			}
		} else blockColorOffset += COLORS;
	});
} //---------------------------------------------------------------------------//


function getCompressor(colorSet) {
	// check the compression type and compress colour
	if (colorSet.count === 1) return new SingleColourFit(colorSet); // always do a single colour fit

	if ((colorSet.flags & kColourRangeFit) != 0 || colorSet.count == 0) return new RangeFit(colorSet); // do a range fit

	return new ClusterFit(colorSet); // default to a cluster fit (could be iterative or not)
}
/**
 * @param {Uint8Array} Buffer in which the uncompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 * @param {int} flags
 */


function CompressMasked(rgba, mask, result, offset, flags) {
	// fix any bad flags
	flags = FixFlags(flags); // if data using dxt3/dxt5 compression, data structure is [alpha][color] - idk

	let colorOffset = (flags & (kDxt3 | kDxt5)) !== 0 ? 8 : 0; // create the minimal point set

	const colors = new ColorSet(rgba, mask, flags);
	const compressor = getCompressor(colors);
	compressor.compress(result, offset + colorOffset); // compress alpha separately if necessary

	if ((flags & kDxt3) !== 0) compressAlphaDxt3(rgba, mask, result, offset);else if ((flags & kDxt5) !== 0) compressAlphaDxt5(rgba, mask, result, offset);
}
/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 * @param {int} flags
 */


function decompressBlock(result, block, offset, flags) {
	// fix any bad flags
	flags = FixFlags(flags); // if data using dxt3/dxt5 compression, data structure is [alpha][color] - idk

	let colorOffset = (flags & (kDxt3 | kDxt5)) !== 0 ? 8 : 0; // decompress color

	decompressColor(result, block, offset + colorOffset, (flags & kDxt1) !== 0); // decompress alpha

	if ((flags & kDxt3) !== 0) decompressAlphaDxt3(result, block, offset);else if ((flags & kDxt5) !== 0) decompressAlphaDxt5(result, block, offset);
} //---------------------------------------------------------------------------//

/**
 * @param {Uint8Array} image data
 * @param {int} width
 * @param {int} height
 * @param {Uint8Array} Buffer in which the compressed result will be stored
 * @param {int} flags
 * @return {Uint8Array}
 */


function compressImage(source, width, height, result, flags) {
	// fix any bad flags
	flags = FixFlags(flags); // initialise the block input

	const bytesPerBlock = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	let targetBlockPointer = 0; // loop over blocks

	blockRepeat(width, height, function (x, y) {
		// build the 4x4 block of pixels
		const {
			block: sourceRGBA,
			mask
		} = extractColorBlock(source, {
			x,
			y,
			width,
			height
		}); // compress it into the output

		CompressMasked(sourceRGBA, mask, result, targetBlockPointer, flags); // advance

		targetBlockPointer += bytesPerBlock;
	});
}
/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {int} width
 * @param {int} height
 * @param {Uint8Array} compressed data
 * @param {int} flags
 */


function decompressImage(result, width, height, source, flags) {
	// fix any bad flags
	flags = FixFlags(flags); // initialise the block input

	const bytesPerBlock = (flags & kDxt1) !== 0 ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	let sourceBlockPointer = 0; // loop over blocks

	for (let y = 0; y < height; y += 4) {
		for (let x = 0; x < width; x += 4) {
			//decompress the block
			const targetRGBA = new Uint8Array(DECOMPRESSED_BLOCK_SIZE * COLORS);
			decompressBlock(targetRGBA, source, sourceBlockPointer, flags); //copy the block to result buffer

			copyBuffer(result, targetRGBA, {
				x,
				y,
				width,
				height
			}); // advance

			sourceBlockPointer += bytesPerBlock;
		}
	}
} //---------------------------------------------------------------------------//


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
/**
 * @param {Uint8Array / ArrayBuffer} inputData to compress
 * @param {int} width
 * @param {int} height
 * @param {int} flags
 * @return {Uint8Array}
 */

function compress(inputData, width, height, flags) {
	let source = inputData instanceof ArrayBuffer ? new Uint8Array(inputData) : inputData;
	const targetSize = GetStorageRequirements(width, height, flags);
	const result = new Uint8Array(targetSize);
	compressImage(source, width, height, result, flags);
	return result;
}
/**
 * @param {Uint8Array / ArrayBuffer} inputData to decompress
 * @param {int} width
 * @param {int} height
 * @param {int} flags
 * @return {Uint8Array}
 */


function decompress(inputData, width, height, flags) {
	let source = inputData instanceof ArrayBuffer ? new Uint8Array(inputData) : inputData;
	const targetSize = width * height * 4;
	const result = new Uint8Array(targetSize);
	decompressImage(result, width, height, source, flags);
	return result;
}

/**
 * Texture2D Reader
 * @class
 * @extends BaseReader
 */

class Texture2DReader extends BaseReader {
	/**
	 * Reads Texture2D from buffer.
	 * @param {BufferReader} buffer
	 * @returns {object}
	 */
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
			// require('fs').writeFileSync('texture.bin', data);
			throw new XnbError('Texture2D format type ECT1 not implemented!');
		} else if (format != 0) throw new XnbError("Non-implemented Texture2D format type (".concat(format, ") found.")); // add the alpha channel into the image

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
	/**
	 * Writes Texture2D into the buffer
	 * @param {BufferWriter} buffer
	 * @param {Mixed} data The data
	 * @param {ReaderResolver} resolver
	 */


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

		if (content.format == 4) data = compress(data, width, height, flags.DXT1);else if (content.format == 5) data = compress(data, width, height, flags.DXT3);else if (content.format == 6) data = compress(data, width, height, flags.DXT5);
		uint32Reader.write(buffer, data.length, null);
		buffer.concat(data);
	}

	isValueType() {
		return false;
	}

}

/**
 * Vector3 Reader
 * @class
 * @extends BaseReader
 */

class Vector3Reader extends BaseReader {
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

/**
 * SpriteFont Reader
 * @class
 * @extends BaseReader
 */

class SpriteFontReader extends BaseReader {
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
			texture2DReader.write(buffer, content.texture, resolver); // Allocate space in the buffer in advance to minimize reallocation to improve performance.

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

		console.log("writing complitd!");
	}

	isValueType() {
		return false;
	}

}

/**
 * TBin Reader
 * @class
 * @extends BaseReader
 */

class TBinReader extends BaseReader {
	read(buffer) {
		const int32Reader = new Int32Reader(); // read in the size of the data block

		let size = int32Reader.read(buffer); // read in the data block

		let data = buffer.read(size); // return the data

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

/**
 * Vector2 Reader
 * @class
 * @extends BaseReader
 */

class Vector2Reader extends BaseReader {
	/**
	 * Reads Vector2 from buffer.
	 * @param {BufferReader} buffer
	 * @returns {object}
	 */
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

/**
 * Vector4 Reader
 * @class
 * @extends BaseReader
 */

class Vector4Reader extends BaseReader {
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
		return {
			x,
			y,
			z,
			w
		};
	}

}

const Readers = {
	ArrayReader,
	BaseReader,
	BmFontReader,
	BooleanReader,
	CharReader,
	DictionaryReader,
	DoubleReader,
	EffectReader,
	Int32Reader,
	ListReader,
	NullableReader,
	RectangleReader,
	SingleReader,
	SpriteFontReader,
	StringReader,
	TBinReader,
	Texture2DReader,
	UInt32Reader,
	Vector2Reader,
	Vector3Reader,
	Vector4Reader
};

/**
 * Used to simplify type from XNB file.
 * @function simplifyType
 * @param	{String} type The long verbose type read from XNB file.
 * @returns {String} returns shorthand simplified type for use within this tool.
 */

const simplifyType = type => {
	// gets the first part of the type
	let simple = type.split(/`|,/)[0]; // check if its an array or not

	let isArray = simple.endsWith('[]'); // if its an array then get the array type

	if (isArray) return "Array<".concat(simplifyType(simple.slice(0, -2)), ">"); // switch over the possible types regisered with this tool

	switch (simple) {
		// Boolean
		case 'Microsoft.Xna.Framework.Content.BooleanReader':
		case 'System.Boolean':
			return 'Boolean';
		// Char

		case 'Microsoft.Xna.Framework.Content.CharReader':
		case 'System.Char':
			return 'Char';
		// Int32

		case 'Microsoft.Xna.Framework.Content.Int32Reader':
		case 'System.Int32':
			return 'Int32';
		// String

		case 'Microsoft.Xna.Framework.Content.StringReader':
		case 'System.String':
			return 'String';
		// Dictionary

		case 'Microsoft.Xna.Framework.Content.DictionaryReader':
			let subtypes = parseSubtypes(type).map(simplifyType);
			return "Dictionary<".concat(subtypes[0], ",").concat(subtypes[1], ">");
		// Array

		case 'Microsoft.Xna.Framework.Content.ArrayReader':
			let arrayType = parseSubtypes(type).map(simplifyType);
			return "Array<".concat(arrayType, ">");
		// List

		case 'Microsoft.Xna.Framework.Content.ListReader':
		case 'System.Collections.Generic.List':
			let listType = parseSubtypes(type).map(simplifyType);
			return "List<".concat(listType, ">");
		// Texture2D

		case 'Microsoft.Xna.Framework.Content.Texture2DReader':
			return 'Texture2D';
		// Vector2

		case 'Microsoft.Xna.Framework.Content.Vector2Reader':
		case 'Microsoft.Xna.Framework.Vector2':
			return 'Vector2';
		// Vector3

		case 'Microsoft.Xna.Framework.Content.Vector3Reader':
		case 'Microsoft.Xna.Framework.Vector3':
			return 'Vector3';
		// Vector3

		case 'Microsoft.Xna.Framework.Content.Vector4Reader':
		case 'Microsoft.Xna.Framework.Vector4':
			return 'Vector4';
		// SpriteFont

		case 'Microsoft.Xna.Framework.Content.SpriteFontReader':
			return 'SpriteFont';
		// Rectangle

		case 'Microsoft.Xna.Framework.Content.RectangleReader':
		case 'Microsoft.Xna.Framework.Rectangle':
			return 'Rectangle';
		// Effect

		case 'Microsoft.Xna.Framework.Content.EffectReader':
		case 'Microsoft.Xna.Framework.Graphics.Effect':
			return 'Effect';
		// xTile TBin

		case 'xTile.Pipeline.TideReader':
			return 'TBin';
		// BmFont

		case 'BmFont.XmlSourceReader':
			return 'BmFont';
		// unimplemented type catch

		default:
			throw new XnbError("Non-implemented type found, cannot resolve type \"".concat(simple, "\", \"").concat(type, "\"."));
	}
};
/**
 * Parses subtypes from a type like Dictionary or List
 * @function parseSubtypes
 * @param	{String} type The type to parse with subtypes in.
 * @returns {String[]} returns an array of subtypes
 */


const parseSubtypes = type => {
	// split the string by the ` after the type
	let subtype = type.split('`')[1]; // get the number of types following the ` in type string

	subtype.slice(0, 1); // get the contents of the wrapped array

	subtype = subtype.slice(2, -1); // regex pattern to match the subtypes

	let pattern = /\[(([a-zA-Z0-9\.\,\=\`]+)(\[\])?(\, |\])){1,}/g; // get matches

	let matches = subtype.match(pattern).map(e => {
		return e.slice(1, -1);
	}); // return the matches

	return matches;
};
/**
 * Get type info from simple type
 * @param	 {String} type Simple type to get info from.
 * @returns {Object} returns an object containing information about the type.
 */


const getTypeInfo = type => {
	// get type before angle brackets for complex types
	let mainType = type.match(/[^<]+/)[0]; // get the subtypes within brackets

	let subtypes = type.match(/<(.+)>/); // if we do have subtypes then split and trim them

	subtypes = subtypes ? subtypes[1].split(',').map(type => type.trim()) : []; // return info object

	return {
		type: mainType,
		subtypes
	};
};
/**
 * Gets an XnbReader instance based on type.
 * @function getReader
 * @param {String} type The simplified type to get reader based off of.
 * @returns {BaseReader} returns an instance of BaseReader for given type.
 */


const getReader = typeString => {
	// get type info for complex types
	let {
		type,
		subtypes
	} = getTypeInfo(typeString); // loop over subtypes and resolve readers for them

	subtypes = subtypes.map(getReader); // if we have a reader then use one

	if (Readers.hasOwnProperty("".concat(type, "Reader"))) return new Readers["".concat(type, "Reader")](...subtypes); // throw an error as type is not supported

	throw new XnbError("Invalid reader type \"".concat(typeString, "\" passed, unable to resolve!"));
};

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

const HIDEF_MASK = 0x1;
const COMPRESSED_LZ4_MASK = 0x40;
const COMPRESSED_LZX_MASK = 0x80;
const XNB_COMPRESSED_PROLOGUE_SIZE = 14;
/**
 * XNB file class used to read and write XNB files
 * @class
 * @public
 */

class XnbConverter {
	/**
	 * Creates new instance of Xnb class
	 * @constructor
	 */
	constructor() {
		// target platform
		this.target = ''; // format version

		this.formatVersion = 0; // HiDef flag

		this.hidef = false; // Compressed flag

		this.compressed = false; // compression type

		this.compressionType = 0; // the XNB buffer reader

		this.buffer = null; // the file size

		this.fileSize = 0;
		/**
		 * Array of readers that are used by the XNB file.
		 * @type {BaseReader[]}
		 */

		this.readers = [];
		/**
		 * Array of shared resources
		 * @type {Array}
		 */

		this.sharedResources = [];
	}
	/**
	 * Loads a file into the XNB class.
	 * @param {ArrayBuffer} XNB file's array buffer
	 */


	load(arrayBuffer) {
		// create a new instance of reader
		this.buffer = new BufferReader(arrayBuffer); // validate the XNB file header

		this._validateHeader(); // we validated the file successfully


		console.info('XNB file validated successfully!'); // read the file size

		this.fileSize = this.buffer.readUInt32(); // verify the size

		if (this.buffer.size != this.fileSize) throw new XnbError('XNB file has been truncated!'); // print out the file size
		// if the file is compressed then we need to decompress it

		if (this.compressed) {
			// get the decompressed size
			const decompressedSize = this.buffer.readUInt32(); // decompress LZX format

			if (this.compressionType == COMPRESSED_LZX_MASK) {
				// get the amount of data to compress
				const compressedTodo = this.fileSize - XNB_COMPRESSED_PROLOGUE_SIZE; // decompress the buffer based on the file size

				const decompressed = Presser.decompress(this.buffer, compressedTodo, decompressedSize); // copy the decompressed buffer into the file buffer

				this.buffer.copyFrom(decompressed, XNB_COMPRESSED_PROLOGUE_SIZE, 0, decompressedSize); // reset the byte seek head to read content

				this.buffer.bytePosition = XNB_COMPRESSED_PROLOGUE_SIZE;
			} // decompress LZ4 format
			else if (this.compressionType == COMPRESSED_LZ4_MASK) {
				// allocate Uint8 Array for LZ4 decode
				const trimmed = this.buffer.buffer.slice(XNB_COMPRESSED_PROLOGUE_SIZE);
				const trimmedArray = new Uint8Array(trimmed); // decode the trimmed buffer into decompressed buffer

				const {
					buffer: decompressed
				} = decompress$1(trimmedArray, decompressedSize); // copy the decompressed buffer into our buffer

				this.buffer.copyFrom(decompressed, XNB_COMPRESSED_PROLOGUE_SIZE, 0, decompressedSize); // reset the byte seek head to read content

				this.buffer.bytePosition = XNB_COMPRESSED_PROLOGUE_SIZE;
			}
		} // NOTE: assuming the buffer is now decompressed
		// get the 7-bit value for readers


		let count = this.buffer.read7BitNumber(); // log how many readers there are
		// create an instance of string reader

		const stringReader = new StringReader(); // a local copy of readers for the export

		const readers = []; // loop over the number of readers we have

		for (let i = 0; i < count; i++) {
			// read the type
			const type = stringReader.read(this.buffer); // read the version

			const version = this.buffer.readInt32(); // get the reader for this type

			const simpleType = simplifyType(type);
			const reader = getReader(simpleType); // add reader to the list

			this.readers.push(reader); // add local reader

			readers.push({
				type,
				version
			});
		} // get the 7-bit value for shared resources


		const shared = this.buffer.read7BitNumber(); // log the shared resources count
		// don't accept shared resources since SDV XNB files don't have any

		if (shared != 0) throw new XnbError("Unexpected (".concat(shared, ") shared resources.")); // create content reader from the readers loaded

		const content = new ReaderResolver(this.readers); // read the content in

		const result = content.read(this.buffer); // we loaded the XNB file successfully

		console.log('Successfuly read XNB file!'); // return the loaded XNB object

		return new XnbData({
			target: this.target,
			formatVersion: this.formatVersion,
			hidef: this.hidef,
			compressed: this.compressed
		}, readers, result);
	}
	/**
	 * Converts JSON into XNB file structure
	 * @param {Object} The JSON to convert into a XNB file
	 */


	convert(json) {
		// the output buffer for this file
		const buffer = new BufferWriter(); // create an instance of string reader

		const stringReader = new StringReader(); // set the header information

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
		this.compressed = lz4Compression ? true : false; // support android LZ4 compression
		// write the header into the buffer

		buffer.writeString("XNB");
		buffer.writeString(this.target);
		buffer.writeByte(this.formatVersion); // write the LZ4 mask for android compression only
		// todo:LZX compression. There are currently NO open source libraries implementing the LZX compression algorithm.

		buffer.writeByte(this.hidef | (this.compressed && lz4Compression ? COMPRESSED_LZ4_MASK : 0)); // write temporary filesize

		buffer.writeUInt32(0); // write the decompression size temporarily if android

		if (lz4Compression) buffer.writeUInt32(0); // write the amount of readers

		buffer.write7BitNumber(json.readers.length); // loop over the readers and load the types

		for (let reader of json.readers) {
			this.readers.push(getReader(simplifyType(reader.type))); // simplyify the type then get the reader of it

			stringReader.write(buffer, reader.type);
			buffer.writeUInt32(reader.version);
		} // write 0 shared resources


		buffer.write7BitNumber(0); // create reader resolver for content and write it

		const content = new ReaderResolver(this.readers); // write the content to the reader resolver

		content.write(buffer, json.content); // trim excess space in the buffer 
		// NOTE: this buffer allocates default with 500 bytes

		buffer.trim(); // LZ4 compression

		if (lz4Compression) {
			// allocate Uint8 Array for LZ4 encode
			const trimmed = buffer.buffer.slice(XNB_COMPRESSED_PROLOGUE_SIZE);
			const trimmedArray = new Uint8Array(trimmed);
			let compressedSize = compressBound(trimmedArray.length); // encode the trimmed buffer into decompressed buffer

			const {
				buffer: compressed,
				length: newCompressedSize
			} = compress$1(trimmedArray, compressedSize);
			compressedSize = newCompressedSize; // write the file size & decompressed size into the buffer

			buffer.bytePosition = 6;
			buffer.writeUInt32(XNB_COMPRESSED_PROLOGUE_SIZE + compressedSize);
			buffer.writeUInt32(trimmedArray.length); // write compressed data

			buffer.concat(compressed); // slice off the excess

			let returnBuffer = buffer.buffer.slice(0, XNB_COMPRESSED_PROLOGUE_SIZE + compressedSize); // return the buffer

			return returnBuffer;
		} // write the file size into the buffer


		let fileSize = buffer.bytePosition;
		buffer.bytePosition = 6;
		buffer.writeUInt32(fileSize, 6); // return the buffer

		return buffer.buffer;
	}
	/**
	 * Ensures the XNB file header is valid.
	 * @private
	 * @method _validateHeader
	 */


	_validateHeader() {
		// ensure buffer isn't null
		if (this.buffer == null) throw new XnbError('Buffer is null'); // get the magic from the beginning of the file

		const magic = this.buffer.readString(3); // check to see if the magic is correct

		if (magic != 'XNB') throw new XnbError("Invalid file magic found, expecting \"XNB\", found \"".concat(magic, "\"")); // debug print that valid XNB magic was found
		// load the target platform

		this.target = this.buffer.readString(1).toLowerCase(); // read the format version

		this.formatVersion = this.buffer.readByte(); // read the flag bits

		const flags = this.buffer.readByte(1); // get the HiDef flag

		this.hidef = (flags & HIDEF_MASK) != 0; // get the compressed flag

		this.compressed = flags & COMPRESSED_LZX_MASK || (flags & COMPRESSED_LZ4_MASK) != 0; // set the compression type
		// NOTE: probably a better way to do both lines but sticking with this for now

		this.compressionType = (flags & COMPRESSED_LZX_MASK) != 0 ? COMPRESSED_LZX_MASK : flags & COMPRESSED_LZ4_MASK ? COMPRESSED_LZ4_MASK : 0; // debug content information
		// log compressed state
	}

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

/**
 * from https://github.com/draivin/XNBNode
 * XnbExtract is using this code to parse yaml
 */
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
		//boolean & number
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
		case 'Char':
		case 'String':
		case '':
		case 'Vector2':
		case 'Vector3':
		case 'Vector4':
		case 'Rectangle':
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
		const reader = readers[index]; //primitive

		if (isPrimitiveReaderType(reader)) {
			return {
				converted: {
					type: reader,
					data: obj
				},
				traversed: index
			};
		} //null reader


		if (reader === null) {
			return {
				converted: obj,
				traversed: index
			};
		} //nullable


		if (reader.startsWith('Nullable')) {
			return {
				converted: {
					type: reader,
					data: {
						data: {
							type: readers[index + 1],
							data: obj
						}
					}
				},
				traversed: index + 1
			};
		} //exportable


		if (isExportReaderType(reader)) {
			//texture2D
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
			} //tbin


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
		} // complex data(list, dictionary, spritefont, etc...)


		let data;
		if (Array.isArray(obj)) data = [];else data = {};
		let traversed = index;
		let first = true;
		let isComplex = !reader.startsWith("Dictionary") && !reader.startsWith("Array") && !reader.startsWith("List");

		for (let [key, value] of Object.entries(obj)) {
			let newIndex;

			if (reader.startsWith("Dictionary")) {
				if (getTypeInfo(reader).subtypes[1] === readers[index + 2]) newIndex = index + 2;else newIndex = index + 1;
			} else if (reader.startsWith("Array") || reader.startsWith("List")) newIndex = index + 1;else newIndex = traversed + 1;

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
} // convert from inner json content of XnbExtract
// remove {type:"aaa" data:"..."} and pick only "..."


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
} // convert json file to yaml compatible with XnbExtract


function toXnbNodeData(json) {
	const toYamlJson = {};
	const {
		compressed,
		formatVersion,
		hidef: hiDef,
		target
	} = json.header;
	let readerData = deepCopy(json.readers); // set header

	toYamlJson.xnbData = {
		target,
		compressed: !!compressed,
		hiDef,
		readerData,
		numSharedResources: 0
	}; // set contents

	const rawContent = deepCopy(json.content);
	let readersTypeList = readerData.map(_ref => {
		let {
			type
		} = _ref;
		return simplifyType(type);
	});

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
	const result = {}; // set header data

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
	result.readers = deepCopy(readerData); // set content data

	result.content = convertJsonContentsFromXnbNode(json.content); // this program uses verticalLineSpacing, not verticalSpacing

	if (simplifyType(result.readers[0].type) === 'SpriteFont') {
		result.content.verticalLineSpacing = result.content.verticalSpacing;
		delete result.content.verticalSpacing;
	}

	return result;
}

function searchElement(parent, element) {
	// ensure object is defined and is an object
	if (!parent || typeof parent != 'object') return; // if property exists then return it

	if (parent.hasOwnProperty(element)) {
		return {
			parent,
			value: parent[element]
		};
	} // search the objects for keys


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
		// json data
		case "JSON":
			return "json";
		// yaml data

		case "yaml":
			return "yaml";
		// png image

		case "Texture2D":
			return "png";
		// compiled effects

		case "Effect":
			return "cso";
		// tbin map file

		case 'TBin':
			return "tbin";
		// BmFont Xml

		case 'BmFont':
			return "xml";
	}

	return "bin";
}

function getMimeType(dataType) {
	switch (dataType) {
		// json data
		case "JSON":
			return "application/json";
		// yaml data

		case "yaml":
			return "text/plain";
		// png image

		case "Texture2D":
			return "image/png";
		// compiled effects

		case "Effect":
			return "application/x-cso";
		// BmFont Xml

		case 'BmFont':
			return "application/xml";
	}

	return "application/octet-stream";
}

function makeBlob(data, dataType) {
	//blob is avaliable
	if (Blob !== undefined) return {
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
		} = value; // transform to png

		if (dataType === "Texture2D") {
			data = s(value.width, value.height, new Uint8Array(data));
		}

		return makeBlob(data, dataType);
	} // if contentOnly == true, export json data file


	if (jsonContent) {
		let contentJson = JSON.stringify(content, null, 4);
		return makeBlob(contentJson, "JSON");
	}

	return null;
}
/**
 * decompressed xnb object to real file blobs.
 * @param {XnbData} decompressed xnb objects (returned by bufferToXnb() / Xnb.load())
 * @param {Object} config (yaml:export file as yaml, contentOnly:export content file only) (optional)
 * @param {String} exported file's name (optional)
 */


function exportFiles(xnbObject) {
	let configs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	let fileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	// set config
	let {
		yaml: isYaml = false,
		contentOnly = false
	} = configs;
	if (isYaml && contentOnly) isYaml = false; // ensure we have content field

	if (!xnbObject.hasOwnProperty('content')) throw new XnbError('Invalid object!');
	const blobs = [];
	const {
		content
	} = xnbObject; // export content files

	const contentBlob = exportContent(content, contentOnly);
	if (contentBlob !== null) blobs.push(contentBlob);
	if (contentOnly) return blobs; // export json/yaml header files

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
	if (str === "lz4") return 0x40; //	if(str === "lzx") return 0x80;

	return null;
}

async function readExternFiles(extension, files) {
	// Texture2D to PNG
	if (extension === "png") {
		// get binary file
		const rawPng = await files.png.arrayBuffer(); // get the png data

		const png = r(new Uint8Array(rawPng));
		return {
			type: "Texture2D",
			data: png.data,
			width: png.width,
			height: png.height
		};
	} // Compiled Effects


	if (extension === "cso") {
		const data = await files.cso.arrayBuffer();
		return {
			type: "Effect",
			data
		};
	} // TBin Map


	if (extension === "tbin") {
		const data = await files.tbin.arrayBuffer();
		return {
			type: "TBin",
			data
		};
	} // BmFont Xml


	if (extension === "xml") {
		const data = await files.xml.text();
		return {
			type: "BmFont",
			data
		};
	}
}
/**
 * file objects to json file to compress.
 * @param {Object} to compress files
 * @param {Object} config (compression:default, none, LZ4, LZX(currently unsupported)) (optional)
 */


async function resolveImports(files) {
	let configs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	const {
		compression = "default"
	} = configs;
	const jsonFile = files.json || files.yaml;
	if (!jsonFile) throw new XnbError("There is no JSON or YAML file to pack!"); //parse json/yaml data

	const rawText = await jsonFile.text();
	let jsonData = null;
	if (files.json) jsonData = JSON.parse(rawText);else jsonData = fromXnbNodeData(parse(rawText)); // apply configuration data

	let compressBits = resolveCompression(compression);
	if (compressBits !== null) jsonData.header.compressed = compressBits; // need content

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

/******************************************************************************/

/*																Unpack XNB																	*/

/*----------------------------------------------------------------------------*/

/**
 * Asynchronously reads the file into binary and then unpacks the json data.
 * XNB -> arrayBuffer -> XnbData
 * @param {File / Buffer} file
 * @return {XnbData} JSON data with headers
 */

async function unpackToXnbData(file) {
	// browser
	if (typeof window !== "undefined") {
		// ensure that the input file has the right extension
		const [, extension] = extractFileName(file.name);

		if (extension !== "xnb") {
			return new Error("Invalid XNB File!");
		} //read the file as a binary file


		const buffer = await file.arrayBuffer();
		return bufferToXnb(buffer);
	} // node.js


	return bufferToXnb(file.buffer);
}
/**
 * Asynchronously reads the file into binary and then return content file.
 * XNB -> arrayBuffer -> XnbData -> Content
 * @param {File / Buffer} file
 * @return {Object} the loaded contents
 */


function unpackToContent(file) {
	return unpackToXnbData(file).then(xnbDataToContent);
}
/**
 * Asynchronously reads the file into binary and then unpacks the contents and remake to Blobs array.
 * XNB -> arrayBuffer -> XnbData -> Files
 * @param {File / Buffer} file
 * @param {String} file name(for node.js)
 * @param {Object} config (yaml:export file as yaml, contentOnly:export content file only)
 * @return {Array<Blobs>} exported Files Blobs
 */


function unpackToFiles(file) {
	let name = null,
			configs = {};

	if ((arguments.length <= 1 ? 0 : arguments.length - 1) >= 2) {
		name = arguments.length <= 1 ? undefined : arguments[1];
		configs = arguments.length <= 2 ? undefined : arguments[2];
	} else if ((arguments.length <= 1 ? 0 : arguments.length - 1) === 1) {
		const arg = arguments.length <= 1 ? undefined : arguments[1];
		if (typeof arg === "string") name = arg;else if (typeof arg === "object") configs = arg;
	}

	if (typeof window !== "undefined" && name === null) name = file.name;
	let [fileName] = extractFileName(name);

	const exporter = xnbObject => exportFiles(xnbObject, configs, fileName);

	return unpackXnb(file).then(exporter);
}
/**
 * reads the buffer and then unpacks.
 * arrayBuffer -> XnbData
 * @param {ArrayBuffer} buffer
 * @return {XnbData} the loaded XNB json
 */


function bufferToXnb(buffer) {
	const xnb = new XnbConverter();
	return xnb.load(buffer);
}
/**
 * reads the buffer and then unpacks the contents.
 * arrayBuffer -> XnbData -> Content
 * @param {ArrayBuffer} buffer
 * @return {Object} the loaded XNB object(not include headers)
 */


function bufferToContents(buffer) {
	const xnb = new XnbConverter();
	const xnbData = xnb.load(buffer);
	return xnbDataToContent(xnbData);
}
/**
 * remove header from the loaded XNB Object
 * XnbData -> Content
 * @param {XnbData} the loaded XNB object include headers
 * @return {Array<Blobs>} exported Files Blobs
 */


function xnbDataToContent(loadedXnb) {
	const {
		content
	} = loadedXnb;
	return exportContent(content, true);
}
/******************************************************************************/

/*																 Pack XNB																	 */

/*----------------------------------------------------------------------------*/


function fileMapper(files) {
	let returnMap = {};

	for (let i = 0; i < files.length; i++) {
		const file = files[i]; // extract file name & extension

		let [fileName, extension] = extractFileName(file.name);
		if (extension === null) continue;
		if (returnMap[fileName] === undefined) returnMap[fileName] = {};
		const namedFileObj = returnMap[fileName];
		namedFileObj[extension] = file;
	}

	return returnMap;
}
/**
 * reads the json and then unpacks the contents.
 * @param {json} to pack json data
 * @return {ArrayBuffer} packed XNB Array Buffer
 */


function packJsonToBinary(json) {
	const xnb = new XnbConverter();
	const buffer = xnb.convert(json);
	return buffer;
}
/**
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
			//blob is avaliable
			if (Blob !== undefined) return {
				name: fileName,
				data: new Blob([buffer], {
					type: "application/octet-stream"
				})
			};
			return {
				name: fileName,
				data: buffer
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

export { XnbData, bufferToContents, bufferToXnb, pack, unpackToContent, unpackToFiles, unpackToXnbData, xnbDataToContent, exportFiles as xnbDataToFiles };
