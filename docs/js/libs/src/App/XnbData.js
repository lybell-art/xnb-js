class XnbData {
	constructor(header, readers, content)
	{
		let {target, formatVersion, hidef, compressed} = header;
		this.header = {target, formatVersion, hidef, compressed};
		this.readers = readers;
		this.content = content;
	}
	get target()
	{
		switch(this.header?.target){
			case 'w': return "Microsoft Windows";
			case 'm': return "Windows Phone 7";
			case 'x': return "Xbox 360";
			case 'a': return "Android";
			case 'i': return "iOS";
			default: return "Unknown";
		}
			
	}
	get formatVersion()
	{
		switch (this.header?.formatVersion) {
			case 0x3: return "XNA Game Studio 3.0";
			case 0x4: return "XNA Game Studio 3.1";
			case 0x5: return "XNA Game Studio 4.0";
			default: return "Unknown";
		}
	}
	get hidef()
	{
		return !!(this.header?.hidef); 
	}
	get compressed()
	{
		return !!(this.header?.compressed);
	}
	
	get contentType()
	{
		let {export:raw} = this.content;
		if(raw !== undefined) return raw.type;
		return "JSON";
	}
	get rawContent()
	{
		let {export:raw} = this.content;
		if(raw !== undefined) return raw.data;
		return JSON.stringify(this.content, (key, value)=>{
			if(key === "export") return value.type;
			return value;
		}, 4);
	}
	stringify()
	{
		return JSON.stringify({
			header:this.header,
			readers:this.readers,
			content:this.content
		}, null, 4);
	}
	toString()
	{
		return this.stringify();
	}
}

function extensionToDatatype(extension)
{
	switch(extension)
	{
		case "json": return "JSON";
		case "yaml": return "yaml";
		case "png": return "Texture2D";
		case "cso": return "Effect";
		case 'tbin': return "TBin";
		case 'xml': return "BmFont";
	}
	return "Others";
}

class XnbContent {
	constructor(data, ext)
	{
		this.type = extensionToDatatype(ext);
		this.content = data;
	}
}

export {XnbData, XnbContent};