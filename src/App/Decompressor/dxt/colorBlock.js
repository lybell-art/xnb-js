import {Vec3} from "./math.js";

function floatToInt(value, limit)
{
	// use ANSI round-to-zero behaviour to get round-to-nearest
	const integer = parseInt( value + 0.5 );

	// clamp to the limit
	if(integer < 0) return 0;
	if(integer > limit) return integer;
	return integer;
}

function floatTo565( color )
{
	// get the components in the correct range
	const r = floatToInt( 31.0*color.x, 31 );
	const g = floatToInt( 63.0*color.y, 63 );
	const b = floatToInt( 31.0*color.z, 31 );
	
	// pack into a single value
	return ( r << 11 ) | ( g << 5 ) | b;
}

/**
 * @param {int} packed 16bit first color
 * @param {int} packed 16bit second color
 * @param {Array(int)} each pixel block's index data
 * @param {Uint8Array} the array to save result
 * @param {int} the array's offset
 */
function writeColourBlock( firstColor, secondColor, indices, result, blockOffset )
{
	// write the endpoints as little endian
	result[blockOffset + 0] = firstColor & 0xff ;
	result[blockOffset + 1] = firstColor >> 8 ;
	result[blockOffset + 2] = secondColor & 0xff ;
	result[blockOffset + 3] = secondColor >> 8 ;
	
	// write the indices as big endian like [33221100]
	for( let y = 0; y < 4; y++ )
	{
		result[blockOffset + 4 + y] = ( indices[4*y + 0] | 
			( indices[4*y + 1] << 2 ) | 
			( indices[4*y + 2] << 4 ) | 
			( indices[4*y + 3] << 6 ) );
	}
}


/**
 * @param {Vec3} first color
 * @param {Vec3} second color
 * @param {Array(int)} each pixel block's index data
 * @param {Uint8Array} the array to save result
 * @param {int} the array's offset
 */
function writeColourBlock3( start, end, indices, result, blockOffset )
{
	// get the packed values
	let firstColor = floatTo565( start );
	let secondColor = floatTo565( end );

	// remap the indices
	let remapped;
	if( firstColor <= secondColor )
	{
		// use the indices directly
		remapped = indices.slice();
	}
	else
	{
		// swap a and b
		[firstColor, secondColor] = [secondColor, firstColor];
		remapped = indices.map((index) => (index===0) ? 1 : ( (index===1) ? 0 : index) );
	}
	
	// write the block
	writeColourBlock( firstColor, secondColor, remapped, result, blockOffset );
}

function writeColourBlock4( start, end, indices, result, blockOffset )
{
	// get the packed values
	let firstColor = floatTo565( start );
	let secondColor = floatTo565( end );

	// remap the indices
	let remapped;
	if( firstColor < secondColor )
	{
		// swap a and b
		[firstColor, secondColor] = [secondColor, firstColor];
		remapped = indices.map((index) => (index^0x1) & 0x3);
	}
	else if( firstColor == secondColor )
	{
		// use index 0
		remapped = new Array(16).fill(0);
	}
	else
	{
		// use the indices directly
		remapped = indices.slice();
	}
	
	// write the block
	writeColourBlock( firstColor, secondColor, remapped, result, blockOffset );
}

export {writeColourBlock3, writeColourBlock4};