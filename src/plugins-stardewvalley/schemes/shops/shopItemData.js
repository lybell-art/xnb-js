import genericSpawnItemDataWithCondition from "../genericSpawnItemDataWithCondition.js";

export default {
  ...genericSpawnItemDataWithCondition,
  "$TradeItemId": "String",
  "TradeItemAmount": "Int32",
  "Price": "Int32",
  "$ApplyProfitMargins": "Boolean",
  "AvailableStock": "Int32",
  "AvailableStockLimit": "Int32",
  "AvoidRepeat": "Boolean",
  "UseObjectDataPrice": "Boolean",
  "IgnoreShopPriceModifiers": "Boolean",
  "$PriceModifiers": [
    "StardewValley.GameData.QuantityModifier"
  ],
  "PriceModifierMode": "Int32",
  "$AvailableStockModifiers": [
    "StardewValley.GameData.QuantityModifier"
  ],
  "AvailableStockModifierMode": "Int32",
  "$ActionsOnPurchase": ["String"],
  "$CustomFields": {"String": "String"}
};