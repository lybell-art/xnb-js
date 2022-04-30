function quantise(alpha)
{
	const GRID = 15;
	let result = Math.floor( alpha * (GRID / 255) + 0.5 );
	if (result < 0) return 0;
	if (result > GRID) return GRID;
	return result;
}

function compressAlphaDxt3(rgba, mask, result, offset)
{
	// quantise and pack the alpha values pairwise
	// repeat by 1byte (= 4bit * 2)
	for( let i = 0; i < 8; i++ )
	{
		// quantise down to 4 bits
		let quant1 = quantise( rgba[8*i + 3] );
		let quant2 = quantise( rgba[8*i + 7] );
		
		// set alpha to zero where masked
		const bit1 = 1 << ( 2*i );
		const bit2 = 1 << ( 2*i + 1 );
		if( ( mask & bit1 ) == 0 ) quant1 = 0;
		if( ( mask & bit2 ) == 0 ) quant2 = 0;

		// pack into the byte
		result[offset + i] = quant1 | ( quant2 << 4 );
	}
}

function compressAlphaDxt5(rgba, mask, result, offset)
{
	let step5 = interpolateAlpha(rgba, mask, 5);
	let step7 = interpolateAlpha(rgba, mask, 7);
	
	// save the block with least error
	if( step5.error <= step7.error ) writeAlphaBlock5( step5, result, offset );
	else writeAlphaBlock7( step7, result, offset);
}


function interpolateAlpha(rgba, mask, steps)
{
	let {min, max} = setAlphaRange(rgba, mask, steps);

	let code = setAlphaCodeBook(min, max, steps);

	let indices = new Uint8Array(16);
	let error = fitCodes(rgba, mask, code, indices);

	return {min, max, indices, error};
}

function setAlphaRange(rgba, mask, steps)
{
	let min = 255;
	let max = 0;

	for( let i = 0; i < 16; i++ )
	{
		// check this pixel is valid
		let bit = 1 << i;
		if( ( mask & bit ) == 0 ) continue;

		// incorporate into the min/max
		let value = rgba[4*i + 3];

		if(steps === 5)
		{
			if(value !== 0 && value < min) min = value;
			if(value !== 255 && value > max) max = value;
		}
		else
		{
			if(value < min) min = value;
			if(value > max) max = value;
		}
	}

	// handle the case that no valid range was found
	if(min > max) min = max;

	// fix range
	if(max - min < steps) max = Math.min(min + steps, 255);
	if(max - min < steps) min = Math.max(max - steps, 0);

	return {min, max};
}

function setAlphaCodeBook(min, max, steps)
{
	// set up the alpha code book
	let codes = [min, max, ...Array.from({length:steps-1}, (_,i)=>{
		return Math.floor( ( (steps - (i+1) ) * min + (i+1) * max ) / steps );
	})];
	if(steps === 5)
	{
		codes[6] = 0;
		codes[7] = 255;
	}
	return codes;
}

function fitCodes(rgba, mask, codes, indices)
{
	// fit each alpha value to the codebook
	let err = 0;
	for( let i = 0; i < 16; ++i )
	{
		// check this pixel is valid
		let bit = 1 << i;
		if( ( mask & bit ) == 0 )
		{
			// use the first code
			indices[i] = 0;
			continue;
		}
		
		// find the least error and corresponding index
		let value = rgba[4*i + 3];
		let least = Infinity;
		let index = 0;
		for( let j = 0; j < 8; ++j )
		{
			// get the squared error from this code
			let dist = value - codes[j];
			dist *= dist;
			
			// compare with the best so far
			if( dist < least )
			{
				least = dist;
				index = j;
			}
		}
		
		// save this index and accumulate the error
		indices[i] = index;
		err += least;
	}
	
	// return the total error
	return err;
}

function writeAlphaBlock5({min:alpha0, max:alpha1, indices}, result, offset)
{
	// check the relative values of the endpoints
	if( alpha0 > alpha1 )
	{
		//swap the indices;
		const swapped = indices.map((index)=>{
			if(index === 0) return 1;
			if(index === 1) return 0;
			if(index <= 5) return 7-index;
			return index;
		});
		writeAlphaBlock(alpha1, alpha0, swapped, result, offset);
	}
	else writeAlphaBlock(alpha0, alpha1, indices, result, offset);
}

function writeAlphaBlock7({min:alpha0, max:alpha1, indices}, result, offset)
{
	// check the relative values of the endpoints
	if( alpha0 > alpha1 )
	{
		//swap the indices;
		const swapped = indices.map((index)=>{
			if(index === 0) return 1;
			if(index === 1) return 0;
			return 9-index;
		});
		writeAlphaBlock(alpha1, alpha0, swapped, result, offset);
	}
	else writeAlphaBlock(alpha0, alpha1, indices, result, offset);
}

function writeAlphaBlock(alpha0, alpha1, indices, result, offset)
{
	// write the first two bytes
	result[offset] = alpha0;
	result[offset + 1] = alpha1;

	// pack the indices with 3 bits each
	let indicesPointer = 0;
	let resultPointer = offset + 2;

	for( let i = 0; i < 2; i++ )
	{
		// pack 8 3-bit values
		let value = 0;
		for( let j = 0; j < 8; ++j )
		{
			let index = indices[indicesPointer];
			value |= ( index << 3*j );
			indicesPointer++;
		}
			
		// store in 3 bytes
		for( let j = 0; j < 3; ++j )
		{
			let byte = ( value >> 8*j ) & 0xff;
			result[resultPointer] = byte;
			resultPointer++;
		}
	}
}


export {compressAlphaDxt3, compressAlphaDxt5, setAlphaCodeBook};