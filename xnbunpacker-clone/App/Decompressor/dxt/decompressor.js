import {setAlphaCodeBook} from "./alphaCompressor.js";

function unpack565(color16bit)
{
	// get the components in the stored range
	const red = (color16bit >> 11) & 0x1f;
	const green = (color16bit >> 5) & 0x3f;
	const blue = color16bit & 0x1f;

	// scale up to 8 bits
	return [
		( red << 3 ) | ( red >> 2 ),
		( green << 2 ) | ( green >> 4 ),
		( blue << 3 ) | ( blue >> 2 ),
		255
	];
}

function interpolateColorArray(a, b, amount)
{
	const result = a.map((aColor, i)=>Math.floor( aColor * (1-amount) + b[i] * amount) );
	result[3] = 255;
	return result;
}

function unpackColorCodes(block, offset, isDxt1)
{
	const color1 = block[offset] | (block[offset+1] << 8);
	const color2 = block[offset+2] | (block[offset+3] << 8);

	const unpackedColor1 = unpack565(color1);
	const unpackedColor2 = unpack565(color2);

	return [
		unpackedColor1,
		unpackedColor2,
		( isDxt1 && color1 <= color2 ) ? 
			interpolateColorArray(unpackedColor1, unpackedColor2, 1/2) :
			interpolateColorArray(unpackedColor1, unpackedColor2, 1/3),
		( isDxt1 && color1 <= color2 ) ? [0, 0, 0, 0] :
			interpolateColorArray(unpackedColor1, unpackedColor2, 2/3)
	];
}

function unpackIndices(block, blockOffset)
{
	// unpack the indices
	let offset = blockOffset + 4;
	let result = new Uint8Array(16);
	for(let i=0;i < 4; i++)
	{
		let packedIndices = block[offset + i];
		result[i*4 + 0] = packedIndices & 0x3;
		result[i*4 + 1] = (packedIndices>>2) & 0x3;
		result[i*4 + 2] = (packedIndices>>4) & 0x3;
		result[i*4 + 3] = (packedIndices>>6) & 0x3;
	}
	return result;
}


/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 * @param {boolean} is using DXT1
 */

function decompressColor(rgba, block, offset, isDxt1)
{
	const colorCode = unpackColorCodes(block, offset, isDxt1);
	const indices = unpackIndices(block, offset);

	// store out the colours
	for( let i = 0; i < 16; i++ )
	{
		for( let j = 0; j < 4; j++ ) {
			rgba[4*i + j] = colorCode[ indices[i]][j];
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
function decompressAlphaDxt3(rgba, block, offset)
{
	// unpack the alpha values pairwise
	for( let i = 0; i < 8; ++i )
	{
		// quantise down to 4 bits
		let quant = block[offset + i];
		
		// unpack the values
		let lo = quant & 0x0f;
		let hi = quant & 0xf0;

		// convert back up to bytes
		rgba[8*i + 3] = lo | ( lo << 4 );
		rgba[8*i + 7] = hi | ( hi >> 4 );
	}
}

/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 */
function decompressAlphaDxt5(rgba, block, offset)
{
	// get the two alpha values
	let alpha0 = block[offset + 0];
	let alpha1 = block[offset + 1];
	
	// compare the values to build the codebook
	let codes = setAlphaCodeBook(alpha0, alpha1, (alpha0 <= alpha1) ? 5 : 7);
	
	// decode the indices
	let indices = new Uint8Array(16);
	let indicePointer = 0;
	let bytePointer = 2;

	for( let i = 0; i < 2; i++ )
	{
		// grab 3 bytes
		let value = 0;
		for( let j = 0; j < 3; j++ )
		{
			let byte = block[offset + bytePointer];
			value |= ( byte << 8*j );
			bytePointer++;
		}
		
		// unpack 8 3-bit values from it
		for( let j = 0; j < 8; j++ )
		{
			let index = ( value >> 3*j ) & 0x7;
			indices[indicePointer] = index;
			indicePointer++;
		}
	}
	
	// write out the indexed codebook values
	for( let i = 0; i < 16; ++i ) {
		rgba[4*i + 3] = codes[indices[i]];
	}
}

export {decompressColor, decompressAlphaDxt3, decompressAlphaDxt5};