import wildTreeItemData from "./wildTreeItemData.js";

export default {
	...wildTreeItemData,
	$PreviousItemId: ["String"],
	DaysUntilReady: "Int32",
	$DaysUntilReadyModifiers: ["StardewValley.GameData.QuantityModifier"],
	DaysUntilReadyModifierMode: "Int32"
};