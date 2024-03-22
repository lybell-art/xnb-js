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

// characters data:1.6
import characterData from "./schemes/characters/characterData.js";
import characterAppearanceData from "./schemes/characters/characterAppearanceData.js";
import characterHomeData from "./schemes/characters/characterHomeData.js";
import characterShadowData from "./schemes/characters/characterShadowData.js";
import characterSpousePatioData from "./schemes/characters/characterSpousePatioData.js";
import characterSpouseRoomData from "./schemes/characters/characterSpouseRoomData.js";

// crop data:1.6
import cropData from "./schemes/cropData.js";

// farm animal data:1.6
import farmAnimalData from "./schemes/farmAnimals/farmAnimalData.js";
import alternatePurchaseAnimals from "./schemes/farmAnimals/alternatePurchaseAnimals.js";
import farmAnimalProduce from "./schemes/farmAnimals/farmAnimalProduce.js";
import farmAnimalShadowData from "./schemes/farmAnimals/farmAnimalShadowData.js";
import farmAnimalSkin from "./schemes/farmAnimals/farmAnimalSkin.js";

// fence data:1.6
import fenceData from "./schemes/fenceData.js";
// floors and paths data:1.6
import floorPathData from "./schemes/floorPathData.js";

// fruit tree data:1.6
import fruitTreeData from "./schemes/fruitTrees/fruitTreeData.js";
import fruitTreeFruitData from "./schemes/fruitTrees/fruitTreeFruitData.js"

// garbage can data:1.6
import garbageCanData from "./schemes/garbageCans/garbageCanData.js";
import garbageCanEntryData from "./schemes/garbageCans/garbageCanEntryData.js";
import garbageCanItemData from "./schemes/garbageCans/garbageCanItemData.js";

// giant crops data:1.6
import giantCropData from "./schemes/giantCrops/giantCropData.js";
import giantCropHarvestItemData from "./schemes/giantCrops/giantCropHarvestItemData.js";

// location context data:1.6
import locationContextData from "./schemes/locationContexts/locationContextData.js";
import passOutMailData from "./schemes/locationContexts/passOutMailData.js";
import reviveLocation from "./schemes/locationContexts/reviveLocation.js";
import weatherCondition from "./schemes/locationContexts/weatherCondition.js";

// location data:1.6
import locationData from "./schemes/locations/locationData.js";
import artifactSpotDropData from "./schemes/locations/artifactSpotDropData.js";
import createLocationData from "./schemes/locations/createLocationData.js";
import fishAreaData from "./schemes/locations/fishAreaData.js";
import locationMusicData from "./schemes/locations/locationMusicData.js";
import spawnFishData from "./schemes/locations/spawnFishData.js";
import spawnForageData from "./schemes/locations/spawnForageData.js";

// machine data:1.6
import machineData from "./schemes/machines/machineData.js";
import machineEffects from "./schemes/machines/machineEffects.js";
import machineItemAdditionalConsumedItems from "./schemes/machines/machineItemAdditionalConsumedItems.js";
import machineItemOutput from "./schemes/machines/machineItemOutput.js";
import machineLight from "./schemes/machines/machineLight.js";
import machineOutputRule from "./schemes/machines/machineOutputRule.js";
import machineOutputTriggerRule from "./schemes/machines/machineOutputTriggerRule.js";
import machineSoundData from "./schemes/machines/machineSoundData.js";

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

	"StardewValley.GameData.Characters.CharacterData": characterData,
	"StardewValley.GameData.Characters.CharacterAppearanceData": characterAppearanceData,
	"StardewValley.GameData.Characters.CharacterHomeData": characterHomeData,
	"StardewValley.GameData.Characters.CharacterShadowData": characterShadowData,
	"StardewValley.GameData.Characters.CharacterSpousePatioData": characterSpousePatioData,
	"StardewValley.GameData.Characters.CharacterSpouseRoomData": characterSpouseRoomData,

	"StardewValley.GameData.Crops.CropData": cropData,

	"StardewValley.GameData.FarmAnimals.FarmAnimalData": farmAnimalData,
	"StardewValley.GameData.FarmAnimals.AlternatePurchaseAnimals": alternatePurchaseAnimals,
	"StardewValley.GameData.FarmAnimals.FarmAnimalProduce": farmAnimalProduce,
	"StardewValley.GameData.FarmAnimals.FarmAnimalShadowData": farmAnimalShadowData,
	"StardewValley.GameData.FarmAnimals.FarmAnimalSkin": farmAnimalSkin,

	"StardewValley.GameData.Fences.FenceData": fenceData,
	"StardewValley.GameData.FloorsAndPaths.FloorPathData": floorPathData,

	"StardewValley.GameData.FruitTrees.FruitTreeData": fruitTreeData,
	"StardewValley.GameData.FruitTrees.FruitTreeFruitData": fruitTreeFruitData,

	"StardewValley.GameData.GarbageCans.GarbageCanData": garbageCanData,
	"StardewValley.GameData.GarbageCans.GarbageCanEntryData": garbageCanEntryData,
	"StardewValley.GameData.GarbageCans.GarbageCanItemData": garbageCanItemData,

	"StardewValley.GameData.GiantCrops.GiantCropData": giantCropData,
	"StardewValley.GameData.GiantCrops.GiantCropHarvestItemData": giantCropHarvestItemData,

	"StardewValley.GameData.LocationContexts.LocationContextData": locationContextData,
	"StardewValley.GameData.LocationContexts.PassOutMailData": passOutMailData,
	"StardewValley.GameData.LocationContexts.ReviveLocation": reviveLocation,
	"StardewValley.GameData.LocationContexts.WeatherCondition": weatherCondition,

	"StardewValley.GameData.Locations.LocationData": locationData,
	"StardewValley.GameData.Locations.ArtifactSpotDropData": artifactSpotDropData,
	"StardewValley.GameData.Locations.CreateLocationData": createLocationData,
	"StardewValley.GameData.Locations.FishAreaData": fishAreaData,
	"StardewValley.GameData.Locations.LocationMusicData": locationMusicData,
	"StardewValley.GameData.Locations.SpawnFishData": spawnFishData,
	"StardewValley.GameData.Locations.SpawnForageData": spawnForageData,

	"StardewValley.GameData.Machines.MachineData": machineData,
	"StardewValley.GameData.Machines.MachineEffects": machineEffects,
	"StardewValley.GameData.Machines.MachineItemAdditionalConsumedItems": machineItemAdditionalConsumedItems,
	"StardewValley.GameData.Machines.MachineItemOutput": machineItemOutput,
	"StardewValley.GameData.Machines.MachineLight": machineLight,
	"StardewValley.GameData.Machines.MachineOutputRule": machineOutputRule,
	"StardewValley.GameData.Machines.MachineOutputTriggerRule": machineOutputTriggerRule,
	"StardewValley.GameData.Machines.MachineSoundData": machineSoundData,


	"StardewValley.GameData.Weddings.WeddingData": weddingData,
	"StardewValley.GameData.Weddings.WeddingAttendeeData": weddingAttendeeData
};

export default schemes;