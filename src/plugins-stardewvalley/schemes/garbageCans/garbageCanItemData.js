import genericSpawnItemData from "../genericSpawnItemData.js";

export default {
	...genericSpawnItemData,
	$Condition: "String",
	IgnoreBaseChance: "Boolean",
	IsMegaSuccess: "Boolean",
	IsDoubleMegaSuccess: "Boolean",
	AddToInventoryDirectly: "Boolean",
	CreateMultipleDebris: "Boolean"
}