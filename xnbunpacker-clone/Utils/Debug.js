function Debug(str, ...args)
{
	if(Debug.__isVisible) console.log(str, ...args);
}

Debug.__isVisible=true;

Debug.setVisible=function(state) {
	Debug.__isVisible=state;
}

if(globalThis !== undefined) globalThis.Debug = Debug; // ES2020
else if(window !== undefined) window.Debug = Debug; // Browser
else if(global !== undefined) global.Debug = Debug; // Node.js

export default Debug;