// fence data:1.6
import fenceData from "./schemes/fenceData.js";

// wedding data:1.6
import weddingData from "./schemes/weddings/weddingData.js";
import weddingAttendeeData from "./schemes/weddings/weddingAttendeeData.js";

const schemes = {
	"StardewValley.GameData.Fences.FenceData": fenceData,
	"StardewValley.GameData.Weddings.WeddingData": weddingData,
	"StardewValley.GameData.Weddings.WeddingAttendeeData": weddingAttendeeData
};

export default schemes;