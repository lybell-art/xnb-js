const UTF8_FIRST_BITES=[0xC0, 0xE0, 0xF0];
const UTF8_SECOND_BITES=0x80;
const UTF8_MASK=0b111111;

const UTF16_BITES=[0xD800, 0xDC00];
const UTF16_MASK=0b1111111111;

function UTF8Encode(code)
{
	//0x0000 ~ 0x007F
	if(code < 0x80) return [code];

	//0x0080 ~ 0x07FF
	if(code < 0x800) return [
		UTF8_FIRST_BITES[0] | (code >> 6),
		UTF8_SECOND_BITES | (code & UTF8_MASK)
	];

	//0x0800 ~ 0xFFFF
	if(code < 0x10000) return [
		UTF8_FIRST_BITES[1] | (code >> 12),
		UTF8_SECOND_BITES | ( (code >> 6) & UTF8_MASK ),
		UTF8_SECOND_BITES | (code & UTF8_MASK)
	];

	//0x10000 ~
	return [
		UTF8_FIRST_BITES[2] | (code >> 18),
		UTF8_SECOND_BITES | ( (code >> 12) & UTF8_MASK ),
		UTF8_SECOND_BITES | ( (code >> 6) & UTF8_MASK ),
		UTF8_SECOND_BITES | ( code & UTF8_MASK )
	];
}

function UTF16Encode(code)
{
	//0x0000 ~ 0xFFFF
	if(code < 0xFFFF) return [code];

	//0x10000 ~
	code -= 0x10000;
	return [
		UTF16_BITES[0] | ( (code >> 10) & UTF16_MASK ),
		UTF16_BITES[1] | ( code & UTF16_MASK )
	];
}

function UTF8Decode(codeSet)
{
	if(typeof codeSet === "number") codeSet=[codeSet];
	if(!(codeSet?.length) ) throw new Error("Invalid codeset!");

	const codeSetRange = codeSet.length;

	//0x0000 ~ 0x007F
	if(codeSetRange === 1) return codeSet[0];

	//0x0080 ~ 0x07FF
	if(codeSetRange === 2) return ((codeSet[0] ^ UTF8_FIRST_BITES[0]) << 6) + (codeSet[1] ^ UTF8_SECOND_BITES);

	//0x0800 ~ 0xFFFF
	if(codeSetRange === 3) {
		return ( ((codeSet[0] ^ UTF8_FIRST_BITES[1]) << 12) +
			((codeSet[1] ^ UTF8_SECOND_BITES) << 6) +
			(codeSet[2] ^ UTF8_SECOND_BITES) );
	}

	//0x10000 ~
	return ( ((codeSet[0] ^ UTF8_FIRST_BITES[2]) << 18) +
		((codeSet[1] ^ UTF8_SECOND_BITES) << 12) +
		((codeSet[2] ^ UTF8_SECOND_BITES) << 6) +
		(codeSet[3] ^ UTF8_SECOND_BITES) );
}

function UTF16Decode(codeSet)
{
	if(typeof codeSet === "number") codeSet=[codeSet];
	if(!(codeSet?.length) ) throw new Error("Invalid codeset!");

	const codeSetRange = codeSet.length;

	//0x0000 ~ 0xFFFF
	if(codeSetRange === 1) return codeSet[0];

	//0x10000 ~
	return ((codeSet[0] & UTF16_MASK) << 10) + (codeSet[1] & UTF16_MASK) + 0x10000;
}

function stringToUnicode(str)
{
	const utf16Map = Array.from({length:str.length}, (_,i)=>str.charCodeAt(i));
	const result=[];
	let index=0;
	while(index < str.length) {
		let code = utf16Map[index];
		if( (UTF16_BITES[0] & code) !== UTF16_BITES[0] ) {
			result.push( code );
			index++;
		}
		else {
			result.push( UTF16Decode(utf16Map.slice(index, index+2)) );
			index+=2;
		}
	}
	return result;
}

function UTF8ToUnicode(codes)
{
	const dataArray = (codes instanceof ArrayBuffer) ? new Uint8Array(codes) : codes;

	const result=[];
	let index=0;
	while(index < dataArray.length) {
		let headerCode = dataArray[index];
		if((headerCode & 0x80) === 0) {
			result.push(headerCode);
			index++;
		}
		else if(headerCode < UTF8_FIRST_BITES[1]) {
			result.push( UTF8Decode(dataArray.slice(index, index+2)) );
			index+=2;
		}
		else if(headerCode < UTF8_FIRST_BITES[2]) {
			result.push( UTF8Decode(dataArray.slice(index, index+3)) );
			index+=3;
		}
		else{
			result.push( UTF8Decode(dataArray.slice(index, index+4)) );
			index+=4;
		}
	}
	return result;
}

function UnicodeToUTF8(unicodeArr)
{
	const result = [];
	for(let code of unicodeArr) {
		result.push(...UTF8Encode(code));
	}
	return result;
}

function UnicodeToString(unicodeArr)
{
	const result = [];
	for(let code of unicodeArr) {
		result.push(...UTF16Encode(code));
	}
	return String.fromCharCode(...result);
}

function stringToUTF8(str)
{
	return UnicodeToUTF8( stringToUnicode(str) );
}

function UTF8ToString(utf8Array)
{
	return UnicodeToString( UTF8ToUnicode(utf8Array) );
}

function UTF8Length(str)
{
	const codes = stringToUnicode(codes);
	return codes.reduce((sum, unicode)=>{
		if(code < 0x80) return sum+1;
		if(code < 0x800) return sum+2;
		if(code < 0x10000) return sum+3;
		return sum+4;
	}, 0);
}

export {stringToUTF8, UTF8ToString, UTF8Length};