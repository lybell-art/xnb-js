import {bufferToXnb} from "./xnb.js";

onmessage = function(e) {
	try {
		let result = bufferToXnb(e.data.buffer);
		postMessage({result, uuid:e.data.uuid});
	}
	catch(err) {
		err.message += `<uuid:${e.data.uuid}>`
		throw err;
	}
	
}