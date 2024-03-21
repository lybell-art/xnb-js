// generic
import genericSpawnItemData from "./schemes/genericSpawnItemData.js";
import genericSpawnItemDataWithCondition from "./schemes/genericSpawnItemDataWithCondition.js";

// other game data: 1.6
import incomingPhoneCallData from "./schemes/incomingPhoneCallData.js";
import jukeboxTrackData from "./schemes/jukeboxTrackData.js";
import mannequinData from "./schemes/mannequinData.js";
import monsterSlayerQuestData from "./schemes/monsterSlayerQuestData.js";
import passiveFestivalData from "./schemes/passiveFestivalData.js";
import triggerActionData from "./schemes/triggerActionData.js";
import trinketData from "./schemes/trinketData.js";

// part of other data : 1.6
import plantableRule from "./schemes/plantableRule.js";
import quantityModiier from "./schemes/quantityModifier.js";
import statIncrement from "./schemes/statIncrement.js";
import temporaryAnimatedSpriteDefinition from "./schemes/temporaryAnimatedSpriteDefinition.js";

// bigcraftable data:1.6
import bigCraftableData from "./schemes/bigCraftableData.js";

// buff data:1.6
import buffData from "./schemes/buffs/buffData.js";	
import buffAttributesData from "./schemes/buffs/buffAttributesData.js";

// buildings data:1.6
import buildingData from "./schemes/buildings/buildingData.js";
import buildingActionTile from "./schemes/buildings/buildingActionTile.js";
import buildingChest from "./schemes/buildings/buildingChest.js";
import buildingDrawLayer from "./schemes/buildings/buildingDrawLayer.js";
import buildingItemConversion from "./schemes/buildings/buildingItemConversion.js";
import buildingMaterial from "./schemes/buildings/buildingMaterial.js";
import buildingPlacementTile from "./schemes/buildings/buildingPlacementTile.js";
import buildingSkin from "./schemes/buildings/buildingSkin.js";
import buildingTileProperty from "./schemes/buildings/buildingTileProperty.js";
import indoorItemAdd from "./schemes/buildings/indoorItemAdd.js";
import indoorItemMove from "./schemes/buildings/indoorItemMove.js";

// garbage can data:1.6
import garbageCanData from "./schemes/garbageCans/garbageCanData.js";
import garbageCanEntryData from "./schemes/garbageCans/garbageCanEntryData.js";
import garbageCanItemData from "./schemes/garbageCans/garbageCanItemData.js";

// fence data:1.6
import fenceData from "./schemes/fenceData.js";

// wedding data:1.6
import weddingData from "./schemes/weddings/weddingData.js";
import weddingAttendeeData from "./schemes/weddings/weddingAttendeeData.js";

const schemes = {
	"StardewValley.GameData.GenericSpawnItemData": genericSpawnItemData,
	"StardewValley.GameData.GenericSpawnItemDataWithCondition": genericSpawnItemDataWithCondition,

	"StardewValley.GameData.IncomingPhoneCallData": incomingPhoneCallData,
	"StardewValley.GameData.JukeboxTrackData": jukeboxTrackData,
	"StardewValley.GameData.MannequinData": mannequinData,
	"StardewValley.GameData.MonsterSlayerQuestData": monsterSlayerQuestData,
	"StardewValley.GameData.PassiveFestivalData": passiveFestivalData,
	"StardewValley.GameData.TriggerActionData": triggerActionData,
	"StardewValley.GameData.TrinketData": trinketData,

	"StardewValley.GameData.PlantableRule": plantableRule,
	"StardewValley.GameData.QuantityModifier": quantityModiier,
	"StardewValley.GameData.StatIncrement": statIncrement,
	"StardewValley.GameData.TemporaryAnimatedSpriteDefinition": temporaryAnimatedSpriteDefinition,

	"StardewValley.GameData.BigCraftables.BigCraftableData": bigCraftableData,

	"StardewValley.GameData.Buffs.BuffData": buffData,
	"StardewValley.GameData.Buffs.BuffAttributesData": buffAttributesData,

	"StardewValley.GameData.Buildings.BuildingData": buildingData,
	"StardewValley.GameData.Buildings.BuildingActionTile": buildingActionTile,
	"StardewValley.GameData.Buildings.BuildingChest": buildingChest,
	"StardewValley.GameData.Buildings.BuildingDrawLayer": buildingDrawLayer,
	"StardewValley.GameData.Buildings.BuildingItemConversion": buildingItemConversion,
	"StardewValley.GameData.Buildings.BuildingMaterial": buildingMaterial,
	"StardewValley.GameData.Buildings.BuildingPlacementTile": buildingPlacementTile,
	"StardewValley.GameData.Buildings.BuildingSkin": buildingSkin,
	"StardewValley.GameData.Buildings.BuildingTileProperty": buildingTileProperty,
	"StardewValley.GameData.Buildings.IndoorItemAdd": indoorItemAdd,
	"StardewValley.GameData.Buildings.IndoorItemMove": indoorItemMove,

	"StardewValley.GameData.GarbageCans.GarbageCanData": garbageCanData,
	"StardewValley.GameData.GarbageCans.GarbageCanEntryData": garbageCanEntryData,
	"StardewValley.GameData.GarbageCans.GarbageCanItemData": garbageCanItemData,

	"StardewValley.GameData.Fences.FenceData": fenceData,

	"StardewValley.GameData.Weddings.WeddingData": weddingData,
	"StardewValley.GameData.Weddings.WeddingAttendeeData": weddingAttendeeData
};

export default schemes;