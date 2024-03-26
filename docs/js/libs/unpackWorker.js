import {bufferToXnb, toggleLegacy} from "./xnb.js";


onmessage = function(e) {
	if(e.data.type === "toggleLegacy") {
		toggleLegacy(e.data.isLegacy);
		return;
	}

	try {
		let result = bufferToXnb(e.data.buffer);
		postMessage({result, uuid:e.data.uuid});
	}
	catch(err) {
		err.message += `<uuid:${e.data.uuid}>`
		throw err;
	}
	
}