import { toggleLegacy } from "./libs/xnb.js";
import { toggleLegacy as toggleLegacyWorker } from "./workerHelper.js";

function checkMobile()
{
	const isMobile = () => /iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson|LG|SAMSUNG|Samsung/i;
	return navigator.userAgent.match(isMobile()) !== null;
}


export function addEventlistener_toggleLegacy()
{
	// add checkbox event handler
	const legacyChecker = document.getElementById("check_legacy");

	legacyChecker.addEventListener("change", function(){
		toggleLegacy(this.checked);
		toggleLegacyWorker(this.checked);
	});

	if(checkMobile()) legacyChecker.checked = true;
}