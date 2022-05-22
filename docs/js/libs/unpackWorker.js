import {bufferToXnb} from "./src/xnbUnpacker.js";

onmessage = function(e) {
	console.log(e.data);
	let result = bufferToXnb(e.data);
	console.log(result);
	postMessage(result);
}