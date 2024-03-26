export default {
	"HasInput": "Boolean",
	"HasOutput": "Boolean",
	"$InteractMethod": "String",
	"$OutputRules": [
		"StardewValley.GameData.Machines.MachineOutputRule"
	],
	"$AdditionalConsumedItems": [
		"StardewValley.GameData.Machines.MachineItemAdditionalConsumedItems"
	],
	"$PreventTimePass": [
		"Int32"
	],
	"$ReadyTimeModifiers": [
		"StardewValley.GameData.QuantityModifier"
	],
	"ReadyTimeModifierMode": "Int32",
	"$InvalidItemMessage": "String",
	"$InvalidItemMessageCondition": "String",
	"$InvalidCountMessage": "String",
	"$LoadEffects": [
		"StardewValley.GameData.Machines.MachineEffects"
	],
	"$WorkingEffects": [
		"StardewValley.GameData.Machines.MachineEffects"
	],
	"WorkingEffectChance": "Single",
	"AllowLoadWhenFull": "Boolean",
	"WobbleWhileWorking": "Boolean",
	"$LightWhileWorking": "StardewValley.GameData.Machines.MachineLight",
	"ShowNextIndexWhileWorking": "Boolean",
	"ShowNextIndexWhenReady": "Boolean",
	"AllowFairyDust": "Boolean",
	"IsIncubator": "Boolean",
	"$ClearContentsOvernightCondition": "String",
	"$StatsToIncrementWhenLoaded": [
		"StardewValley.GameData.StatIncrement"
	],
	"$StatsToIncrementWhenHarvested": [
		"StardewValley.GameData.StatIncrement"
	],
	"$ExperienceGainOnHarvest": "String",
	"$CustomFields": {"String": "String"}
};