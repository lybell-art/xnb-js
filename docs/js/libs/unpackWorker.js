import {bufferToXnb} from "./xnb.js";

onmessage = function(e) {
	let result = bufferToXnb(e.data);
	console.log(result);
	postMessage(result);
}