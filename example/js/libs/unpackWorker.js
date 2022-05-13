import {bufferToXnb} from "./xnb.module.js";

onmessage = function(e) {
	console.log(e.data);
	let result = bufferToXnb(e.data);
	console.log(result);
	postMessage(result);
}