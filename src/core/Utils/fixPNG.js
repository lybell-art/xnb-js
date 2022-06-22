function injectRGBA(data, i, {r, g=r, b=r, a=255}={})
{
	data[4*i + 0] = r; // red
	data[4*i + 1] = g; // green
	data[4*i + 2] = b; // blue
	data[4*i + 3] = a; // alpha

	return [r,g,b,a];
}


function png16to8(data)
{
	const megascale = new Uint16Array(data);
	const downscale = new Uint8Array(megascale.length);
	for(let i=0; i<megascale.length; i++)
	{
		downscale[i] = megascale[i] >> 8;
	}
	return downscale;
}

function addChannels(data, originChannel)
{
	const size = data.length / originChannel;
	const rgbaData = new Uint8Array(size * 4);

	if(originChannel === 4) return data;

	if(originChannel === 1) // greyscale
	{
		for(let i=0; i<size; i++)
		{
			injectRGBA( rgbaData, i, {r:data[i]} );
		}
	}
	else if(originChannel === 2) // greyscale+alpha
	{
		for(let i=0; i<size; i++)
		{
			injectRGBA( rgbaData, i, {r:data[i*2], a:data[i*2+1]} );
		}
	}
	else if(originChannel === 3) // rgb
	{
		for(let i=0; i<size; i++)
		{
			injectRGBA( rgbaData, i, {r:data[i*3], g:data[i*3+1], b:data[i*3+2]} );
		}
	}

	return rgbaData;
}

function applyPalette(data, depth, palette)
{
	const oldData = new Uint8Array(data);
	const length = oldData.length * 8 / depth;
	const newData = new Uint8Array(length * 4);

	let bitPosition = 0;
	for(let i=0; i<length; i++)
	{
		const bytePosition = Math.floor(bitPosition / 8 );
		const bitOffset = 8 - (bitPosition % 8) - depth;

		let paletteIndex;

		// big endian
		if(depth === 16) paletteIndex = oldData[bytePosition] << 8 | oldData[bytePosition+1];
		else paletteIndex = oldData[bytePosition] >> bitOffset & (2**depth - 1);

		[newData[i*4], newData[i*4+1], newData[i*4+2], newData[i*4+3]] = palette[paletteIndex];

		bitPosition += depth;
	}

	return newData;
}

function fixPNG(pngdata)
{
	const { width, height, channels, depth } = pngdata;
	let {data} = pngdata;

	if(pngdata.palette) return applyPalette(data, depth, pngdata.palette);

	if(depth === 16) data = png16to8(data);
	if(channels < 4) data = addChannels(data, channels);
	return data;
}

export {fixPNG};