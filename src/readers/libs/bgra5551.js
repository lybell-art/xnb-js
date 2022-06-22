function extractBits(bitData, amount, offset)
{
	return ( bitData >> offset ) & (2**amount - 1);
}


function colorToBgra5551( red, green, blue, alpha )
{
	// get the components in the correct range
	const r = Math.round(red/255*31);
	const g = Math.round(green/255*31);
	const b = Math.round(blue/255*31);
	const a = Math.round(alpha/255);
	
	// pack into a single value
	return (a << 15) | (r << 10) | (g << 5) | b;
}

function bgra5551ToColor( bgra5551 )
{
	const r = extractBits(bgra5551, 5, 10);
	const g = extractBits(bgra5551, 5, 5);
	const b = extractBits(bgra5551, 5, 0);
	const a = (bgra5551 >> 15) & 1;

	const scaleUp = value => (value<<3) | (value>>2);
	const [red, green, blue] = [r,g,b].map(scaleUp);

	return [red, green, blue, a*255];
}


// convert 32-bit rgba to 16-bit rgba(5/5/5/1).
function convertTo5551( colorBuffer )
{
	const colorArray = new Uint8Array( colorBuffer );
	const length = colorArray.length / 4;

	const convertedArray = new Uint8Array( length * 2 );
	for(let i=0; i<length; i++)
	{
		const red = colorArray[i*4];
		const green = colorArray[i*4+1];
		const blue = colorArray[i*4+2];
		const alpha = colorArray[i*4+3];

		// little endian
		const bgra5551 = colorToBgra5551(red, green, blue, alpha);
		convertedArray[i*2] = bgra5551 & 0xff;
		convertedArray[i*2+1] = bgra5551 >> 8;
	}
	return convertedArray;
}

// convert 16-bit rgba(5/5/5/1) to 32-bit rgba.
function convertFrom5551( colorBuffer )
{
	const colorArray = new Uint8Array( colorBuffer );
	const length = colorArray.length / 2;

	const convertedArray = new Uint8Array( length * 4 );
	for(let i=0; i<length; i++)
	{
		const colors = bgra5551ToColor(colorArray[i*2] | (colorArray[i*2+1]<<8) ); // little endian
		[convertedArray[i*4], convertedArray[i*4+1], convertedArray[i*4+2], convertedArray[i*4+3]] = colors;
	}
	return convertedArray;
}

export {convertTo5551, convertFrom5551};