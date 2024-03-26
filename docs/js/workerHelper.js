import {XnbData} from "./libs/xnb.js";

const bufferToXnb = (function(){
	const worker = new Worker("./js/libs/unpackWorker.js", {type:"module"});

	return function bufferToXnb(buffer)
	{
		return new Promise( (resolve, reject)=>{
			const uuid = makeUUID();
			worker.postMessage({buffer, uuid});
			const onMessage = (e)=>{
				if(uuid !== e.data.uuid) return;
				const {header, readers, content} = e.data.result;
				resolve(new XnbData(header, readers, content));
				worker.removeEventListener("message", onMessage);
				worker.removeEventListener("error", onError);
			};
			const onError = (e)=>{
				const errorUUID = extractUUID(e.message);
				if(uuid !== errorUUID) return;
				reject(e);
				worker.removeEventListener("message", onMessage);
				worker.removeEventListener("error", onError);
			};

			worker.addEventListener( "message", onMessage );
			worker.addEventListener( "error", onError );
		});
	}
})();


function randInt(range)
{
	return Math.floor(Math.random()*range);
}

function makeUUID()
{
	const rawStr = Array.from({length:32}, ()=>randInt(16).toString(16) ).join('');
	const checksum = (randInt(4)+8).toString(16);

	return `${rawStr.slice(0,8)}-${rawStr.slice(8,12)}-4${rawStr.slice(13,16)}-${checksum}${rawStr.slice(17,20)}-${rawStr.slice(20)}`;
}

function extractUUID(errorMessage)
{
	const res = /\<uuid:([0-9a-f-]+)\>$/.exec(errorMessage);
	if(res === null) return null;
	return res[1];
}



export {bufferToXnb};