import {XnbData} from "./libs/xnb.js";

const bufferToXnb = (function(){
	const worker = new Worker("./js/libs/unpackWorker.js", {type:"module"});

	return function bufferToXnb(buffer)
	{
		return new Promise( (resolve, reject)=>{
			worker.postMessage(buffer);
			worker.onmessage = (e)=>{
				const {header, readers, content} = e.data;
				resolve( new XnbData(header, readers, content) );
			};
			worker.onerror = (e)=>reject(e);
		});
	}
})();


export {bufferToXnb};