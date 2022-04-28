/* -----------------------------------------------------------------------------
	Copyright (c) 2006 Simon Brown                          si@sjbrown.co.uk
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

import {kDxt1, kDxt3, kDxt5,
	kColourIterativeClusterFit, kColourClusterFit, kColourRangeFit,
	kColourMetricPerceptual, kColourMetricUniform, kWeightColourByAlpha
} from "./dxt/constant.js";
import {ColorSet, SingleColourFit, RangeFit, C8lusterFit} from "./dxt/colorFits.js";
import {compressAlphaDxt3, compressAlphaDxt5} from "./dxt/alphaCompressor.js";
//import {decompressColor, decompressAlphaDxt3, decompressAlphaDxt5} from "./dxt/decompressor.js";

//internal constant(deconstructing)
const DXT1_COMPRESSED_BYTES = 8;
const DXT5_COMPRESSED_BYTES = 16;
const COLORS = 4;
const DECOMPRESSED_BLOCK_SIZE = 16;


//---------------------------------------------------------------------------//


/**
 * image-block repeat function
 * @param {function(int, int)} callback function to perform per iteration
 * 	@param {int} x-coord
 *  @param {int} y-coord
 */
function blockRepeat(width, height, func)
{
	for(let y=0;y<height;y+=4) {
		for(let x=0;x<width;x+=4) {
			func(x,y);
		}
	}
}

/**
 * 4x4 block repeat function
 * @param {function(int, int)} callback function to perform per iteration
 * 	@param {int} x-coord
 *  @param {int} y-coord
 */
function rectRepeat(func)
{
	for(let y=0;y<4;y++) {
		for(let x=0;x<4;x++) {
			func(x,y);
		}
	}
}

function FixFlags( flags )
{
	// grab the flag bits
	let method = flags & ( kDxt1 | kDxt3 | kDxt5 );
	let fit = flags & ( kColourIterativeClusterFit | kColourClusterFit | kColourRangeFit );
	let metric = flags & ( kColourMetricPerceptual | kColourMetricUniform );
	const extra = flags & kWeightColourByAlpha;
	
	// set defaults
	if( method != kDxt3 && method != kDxt5 )
		method = kDxt1;
	if( fit != kColourRangeFit && fit != kColourIterativeClusterFit )
		fit = kColourClusterFit;
	if( metric != kColourMetricUniform )
		metric = kColourMetricPerceptual;
		
	// done
	return method | fit | metric | extra;
}

function GetStorageRequirements( width, height, flags )
{
	// fix any bad flags
	flags = FixFlags( flags );
	
	// compute the storage requirements
	const blockcount = Math.floor( ( width + 3 )/4 ) * Math.floor( ( height + 3 )/4 );
	// if it uses dxt1 compression, blocksize is 8, else it is 16
	const blocksize = ( ( flags & kDxt1 ) !== 0 ) ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	return blockcount*blocksize;
}


//---------------------------------------------------------------------------//

/**
 * @param {Uint8Array} image data
 * @param {object} result data's position data
 */
function extractColorBlock(img, {x=0, y=0, width=0, height=0}={})
{
	const block = new Uint8Array(DECOMPRESSED_BLOCK_SIZE * COLORS);
	let mask = 0;
	let blockColorOffset = 0;

	rectRepeat(function(px, py) {
		let sx = x + px;
		let sy = y + py;
		//if (sx, sy) is in range, copy the rgba value
		if(sx < width && sy < height) {
			// copy the rgba value
			let sourceColorOffset = COLORS * (width * sy + sx);
			for(let i=0;i<COLORS;i++) {
				block[blockColorOffset++] = img[sourceColorOffset++];
			}
			// enable this pixel
			mask |= (1 <<  ( 4*py + px ));
		}
		else blockColorOffset+=COLORS;
	});

	return {block, mask};
}

/**
 * @param {Uint8Array} Buffer in which the decompressed result will be stored
 * @param {Uint8Array} decompressed block
 * @param {object} result data's position data
 */
function copyBuffer(result, block, {x=0, y=0, width=0, height=0}={})
{
	let blockColorOffset = 0;
	rectRepeat(function(px, py) {
		let sx = x + px;
		let sy = y + py;
		//if (sx, sy) is in range, copy the color
		if(sx < width && sy < height) {
			let resultColorOffset = COLORS * (width * sy + sx);
			for(let i=0;i<COLORS;i++) {
				result[resultColorOffset + i] = block[blockColorOffset++];
			}
		}
		else blockColorOffset+=COLORS;
	});
}


//---------------------------------------------------------------------------//


function getCompressor(colorSet)
{
	// check the compression type and compress colour
	if(colorSet.count === 1) return new SingleColourFit(colorSet); // always do a single colour fit
	if(( colorSet.flags & kColourRangeFit ) != 0 || colorSet.count == 0) return new RangeFit(colorSet); // do a range fit
	return new ClusterFit(colorSet); // default to a cluster fit (could be iterative or not)
}

/**
 * @param {Uint8Array} Buffer in which the uncompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 * @param {int} flags
 */
function CompressMasked(rgba, mask, result, offset, flags)
{
	// fix any bad flags
	flags = FixFlags( flags );

	// if data using dxt3/dxt5 compression, data structure is [alpha][color] - idk
	let colorOffset = ( ( flags & (kDxt3 | kDxt5) ) !== 0 ) ? 8 : 0;

	// create the minimal point set
	const colors= new ColorSet(rgba, mask, flags);
	const compressor = getCompressor(colors);

	compressor.compress( result, offset+colorOffset );
	
	// compress alpha separately if necessary
	if( ( flags & kDxt3 ) !== 0 ) compressAlphaDxt3( rgba, mask, result, offset );
	else if( ( flags & kDxt5 ) !== 0 ) compressAlphaDxt5( rgba, mask, result, offset );
}


/**
 * @param {Uint8Array} Buffer in which the uncompressed result will be stored
 * @param {Uint8Array} compressed data
 * @param {int} compressed data's offset
 * @param {int} flags
 */
function decompressBlock(result, block, offset, flags)
{
	// fix any bad flags
	flags = FixFlags( flags );

	// if data using dxt3/dxt5 compression, data structure is [alpha][color] - idk
	let colorOffset = ( ( flags & (kDxt3 | kDxt5) ) !== 0 ) ? 8 : 0;

	// decompress color
	decompressColor(result, block, offset + colorOffset, (flags & kDxt1) !== 0 );

	// decompress alpha
	if ( (flags & kDxt3) !== 0) decompressAlphaDxt3( result, block, offset );
	else if( (flags & kDxt5) !== 0) decompressAlphaDxt3( result, block, offset );
}


//---------------------------------------------------------------------------//


/**
 * @param {Uint8Array} image data
 * @param {int} width
 * @param {int} height
 * @param {Uint8Array} Buffer in which the compressed result will be stored
 * @param {int} flags
 * @return {Uint8Array}
 */
function compressImage(source, width, height, result, flags)
{
	// fix any bad flags
	flags = FixFlags(flags);

	// initialise the block input
	const bytesPerBlock = ( ( flags & kDxt1) !== 0 ) ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	let targetBlockPointer = 0;

	// loop over blocks
	blockRepeat(width, height, function(x,y) {
		// build the 4x4 block of pixels
		const {block:sourceRGBA, mask} = extractColorBlock(source, {x, y, width, height});

		// compress it into the output
		CompressMasked( sourceRGBA, mask, result, targetBlockPointer, flags );

		// advance
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
function decompressImage(result, width, height, source, flags)
{
	// fix any bad flags
	flags = FixFlags(flags);

	// initialise the block input
	const bytesPerBlock = ( ( flags & kDxt1) !== 0 ) ? DXT1_COMPRESSED_BYTES : DXT5_COMPRESSED_BYTES;
	let sourceBlockPointer = 0;

	// loop over blocks
	for(let y=0; y<height; y+=4 ) {
		for(let x=0; x<width; x+=4 ) {
			//decompress the block
			const targetRGBA = new Uint8Array(DECOMPRESSED_BLOCK_SIZE * COLORS);
			decompressBlock(targetRGBA, source, sourceBlockPointer, flags);

			//copy the block to result buffer
			copyBuffer(result, targetRGBA, {x, y, width, height});

			// advance
			sourceBlockPointer += bytesPerBlock;
		}
	}
}


//---------------------------------------------------------------------------//


const flags = {DXT1:kDxt1, 
	DXT3:kDxt3,
	DXT5:kDxt5,
    ColourIterativeClusterFit:kColourIterativeClusterFit,
    ColourClusterFit:kColourClusterFit, 
    ColourRangeFit:kColourRangeFit,
    ColourMetricPerceptual:kColourMetricPerceptual, 
    ColourMetricUniform:kColourMetricUniform, 
    WeightColourByAlpha:kWeightColourByAlpha
};

/**
 * @param {Uint8Array / ArrayBuffer} inputData to compress
 * @param {int} width
 * @param {int} height
 * @param {int} flags
 * @return {Uint8Array}
 */
function compress(inputData, width, height, flags) {
	let source = (inputData instanceof ArrayBuffer) ? new Uint8Array(inputData) : inputData;
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
	let source = (inputData instanceof ArrayBuffer) ? new Uint8Array(inputData) : inputData;
	const targetSize = width * height * 4;
	const result = new Uint8Array(targetSize);
	DecompressImage(result, width, height, source, flags);
	return result;
}

export {compress, decompress, flags};