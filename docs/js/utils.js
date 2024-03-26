export function extractFileName(fullname)
{
	let matcher = fullname.match(/(.*)\.([^\s.]+)$/);
	if(matcher === null) return [fullname,null];
	return [ matcher[1], matcher[2] ];
}