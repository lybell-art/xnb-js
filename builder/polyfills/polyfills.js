//#! polyfill excluder

function __repeatConcat(str, num)
{
	if(!!str && typeof str.repeat === "function") return str.repeat(num);
	if(typeof str === "string")
	{
		var result="";
		for(var i=0; i<num; i++)
		{
			result+=str;
		}
		return result;
	}
	if (str instanceof Array)
	{
		var result=[];
		for(var i=0; i<num; i++)
		{
			result.concat(str);
		}
		return result;
	}
	throw new Error("Invalid Data!");
}

function __includes(str, token)
{
	if(!!str && typeof str.includes === "function") return str.includes(token);
	return str.indexOf(token) !== -1;
}

function __startsWithString(str, token)
{
	if(!!str && typeof str.startsWith === "function") return str.startsWith(token);
	if(typeof str !== "string" || typeof token !== "string") throw new Error("Invalid Data!");
	var regexp = new RegExp("^"+token);
	return regexp.test(str);
}

function __endsWithString(str, token)
{
	if(typeof str.endsWith === "function") return str.endsWith(token);
	if(typeof str !== "string" || typeof token !== "string") throw new Error("Invalid Data!");
	var regexp = new RegExp(token+"$");
	return regexp.test(str);
}

function __arrayMaker(obj, func)
{
	if(!obj || typeof obj !== "object") throw new Error("Invalid Data!");
	var result=[];
	var length = obj.length;
	for(var i=0; i<length; i++)
	{
		result[i] = func(obj[i], i);
	}
	return result;
}

function __trunc(number)
{
	if(number < 0) return Math.ceil(number);
	return Math.floor(number);
}

export {__repeatConcat, __includes, __startsWithString, __endsWithString,  __arrayMaker, __trunc};