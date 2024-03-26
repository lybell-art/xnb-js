import "./preview/previewText.js";
import "./preview/previewComponent.js";
import {addEventlistener_unpack} from "./unpack.js";
import {addEventlistener_pack} from "./pack.js";
import {addEventlistener_drag} from "./handleDrag.js";
import {addEventlistener_toggleLegacy} from "./toggleLegacy.js";

addEventlistener_unpack();
addEventlistener_pack();
addEventlistener_drag();
addEventlistener_toggleLegacy();