import {stringToUTF8} from "../utils/UTF8ToString.js";
const PENDING = true;

class BufferWriter {

	constructor(size = 2048) {
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
	}

	//Reconnect the DataView to the current ArrayBuffer
	reconnectDataView() {
		this._dataView = new DataView(this._buffer);
	}

	// trim the buffer to the byte position
	trim(pending = false) {
		this._buffer = this.buffer.slice(0,this.bytePosition);
		if(!pending) this.reconnectDataView();
	}

	/**
	 * Allocates number of bytes into the buffer and assigns more space if needed
	 * @param {Number} bytes Number of bytes to allocate into the buffer
	 */
	alloc(bytes) {
		if (this._buffer.byteLength <= this.bytePosition + bytes) {
			const tBuffer = new ArrayBuffer(this._buffer.byteLength + bytes);
			const tDataView = new DataView(tBuffer);

			for(let i=0; i<this.buffer.byteLength; i++) {
				tDataView.setUint8(i, this._dataView.getUint8(i) );
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

		for(let i=this.bytePosition; i<newPosition; i++) {
			this._dataView.setUint8( i, targetBufferView[i-this.bytePosition] );
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

		for(let i=this.bytePosition; i<newPosition; i++) {
			this._dataView.setUint8( i, targetBufferView[i-this.bytePosition] );
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
		}
		while (number);
	}

}

// export the BufferWriter class
export default BufferWriter;
