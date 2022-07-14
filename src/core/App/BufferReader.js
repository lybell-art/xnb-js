import {UTF8ToString} from "../Utils/UTF8ToString.js";

const LITTLE_ENDIAN = true;
const BIG_ENDIAN = false;

class BufferReader {

	/**
	 * Creates instance of Reader class.
	 * @constructor
	 * @param {ArrayBuffer} target buffer to trace
	 */
	constructor(buffer, endianus = LITTLE_ENDIAN) {
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
	seek(index, origin = this._offset) {
		const offset = this._offset;
		this._offset = Math.max(origin + Number.parseInt(index), 0);
		if (this._offset < 0 || this._offset > this.buffer.length)
			throw new RangeError(`Buffer seek out of bounds! ${this._offset} ${this.buffer.length}`);
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
		if (offset < 0) offset = 16 - offset;
		// set the offset and clamp to 16-bit frame
		this._bitOffset = offset % 16;
		// get byte seek for bit ranges that wrap past 16-bit frames
		const byteSeek = ((offset - (Math.abs(offset) % 16)) / 16) * 2;
		// seek ahead for overflow on 16-bit frames
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
	
	copyFrom(buffer, targetIndex = 0, sourceIndex = 0, length = buffer.byteLength) {
		const sourceView = new Uint8Array(buffer);
		const isOverflow = this.buffer.byteLength < length + targetIndex;

		let targetBuffer = this.buffer;
		let targetView = this._dataView;
		
		// we need to resize the buffer to fit the contents
		if (isOverflow) {
			// create a temporary buffer of the new size
			targetBuffer = new ArrayBuffer(this.buffer.byteLength + (length + targetIndex - this.buffer.byteLength));
			targetView = new DataView(targetBuffer);
			// copy our buffer into the temp buffer
			for(let i=0; i<this.buffer.byteLength; i++) {
				targetView.setUint8(i, this._dataView.getUint8(i) );
			}
		}

		// copy the buffer into our buffer
		for(let i=sourceIndex, j=targetIndex; i<length; i++, j++) {
			targetView.setUint8(j, sourceView[i] );
		}

		// assign our buffer to the temporary buffer
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
		const buffer = this.buffer.slice(this._offset, this._offset + count);
		// advance seek offset
		this.seek(count);
		// return the read buffer
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
	readString(count = -1) {
		const chars = [];
		const startOffset = this._offset;
		if (count === -1) {
			while (this.peekByte(1) != 0x0)
				chars.push(this.readByte());
		}
		else {
			for(let i=0; i<count; i++) {
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
		const buffer = this.read(count);
		// rewind the buffer
		this.seek(-count);
		// return the buffer
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
	peekString(count = 0) {
		const chars = [];
		const startOffset = this._offset;
		if (count === 0) {
			while (this.peekByte(1) != 0x0)
				chars.push(this.readByte());
		}
		else {
			for(let i=0; i<count; i++) {
				chars.push(this.readByte());
			}
		}
		// restore the byte position
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
		let value;

		// loop over bits
		do {
			value = this.readByte();
			result |= (value & 0x7F) << bitsRead;
			bitsRead += 7;
		}
		while (value & 0x80);

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
		let read = 0;

		// read bits in 16-bit chunks
		while (bitsLeft > 0) {
			// peek in a 16-bit value
			const peek = this._dataView.getUint16(this._offset, true);

			// clamp bits into the 16-bit frame we have left only read in as much as we have left
			const bitsInFrame = Math.min(Math.max(bitsLeft, 0), 16 - this.bitPosition);
			// set the offset based on current position in and bit count
			const offset = 16 - this.bitPosition - bitsInFrame;

			// create mask and shift the mask up to the offset <<
			// and then shift the return back down into mask space >>
			const value = (peek & (2 ** bitsInFrame - 1 << offset)) >> offset;

			// remove the bits we read from what we have left
			bitsLeft -= bitsInFrame;
			// add the bits read to the bit position
			this.bitPosition += bitsInFrame;

			// assign read with the value shifted over for reading in loops
			read |= value << bitsLeft;
		}

		// return the read bits
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
		let bitPosition = this.bitPosition;
		// get the current byte position to store
		let bytePosition = this.bytePosition;

		// read the bits like normal
		const read = this.readLZXBits(bits);

		// just rewind the bit position, this will also rewind bytes where needed
		this.bitPosition = bitPosition;
		// restore the byte position
		this.bytePosition = bytePosition;

		// return the peeked value
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
	readLZXInt16(seek = true) {
		// read in the next two bytes worth of data
		const lsB = this.readByte();
		const msB = this.readByte();

		// rewind the seek head
		if (!seek)
			this.seek(-2);

		// set the value
		return (lsB << 8) | msB;
	}

	/**
	 * Aligns to 16-bit offset.
	 * @public
	 * @method align
	 */
	align() {
		if (this.bitPosition > 0)
			this.bitPosition += 16 - this.bitPosition;
	}
}

// export the BufferReader class
export default BufferReader;
