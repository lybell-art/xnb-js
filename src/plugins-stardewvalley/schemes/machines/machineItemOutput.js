import genericSpawnItemDataWithCondition from "../genericSpawnItemDataWithCondition.js";

export default {
  ...genericSpawnItemDataWithCondition,
  "$OutputMethod": "String",
  "CopyColor": "Boolean",
  "CopyPrice": "Boolean",
  "CopyQuality": "Boolean",
  "$PreserveType": "String",
  "$PreserveId": "String",
  "IncrementMachineParentSheetIndex": "Int32",
  "$PriceModifiers": [
    "StardewValley.GameData.QuantityModifier"
  ],
  "PriceModifierMode": "Int32",
  "$CustomData": {"String": "String"}
};