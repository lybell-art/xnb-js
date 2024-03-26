/** 
 * @xnb/stardewvalley 1.1.0
 * made by Lybell( https://github.com/lybell-art/ )
 * special thanks to Concernedape(Stardew Valley Producer), 진의(Unoffical XnbCli updater)
 * 
 * xnb.js is licensed under the LGPL 3.0 License.
 * 
*/
import { BaseReader, BooleanReader, Int32Reader, NullableReader, StringReader, ListReader, SingleReader, DictionaryReader, RectangleReader } from '../readers/xnb-readers.module.js';

class MovieSceneReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieScene':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["MovieScene", null, "Nullable<String>", 'String', "Nullable<String>", 'String', null, "Nullable<String>", 'String', "Nullable<String>", 'String', null, "Nullable<String>", 'String', 'String'];
	}

	static type() {
		return "Reflective<MovieScene>";
	}

	read(buffer, resolver) {
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();
		const nullableStringReader = new NullableReader(new StringReader());
		let Image = int32Reader.read(buffer, null);
		let Music = nullableStringReader.read(buffer, resolver);
		let Sound = nullableStringReader.read(buffer, resolver);
		let MessageDelay = int32Reader.read(buffer, null);
		let Script = nullableStringReader.read(buffer, resolver);
		let Text = nullableStringReader.read(buffer, resolver);
		let Shake = booleanReader.read(buffer);
		let ResponsePoint = nullableStringReader.read(buffer, resolver);
		let ID = resolver.read(buffer);
		return {
			Image,
			Music,
			Sound,
			MessageDelay,
			Script,
			Text,
			Shake,
			ResponsePoint,
			ID
		};
	}

	write(buffer, content, resolver) {
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();
		const nullableStringReader = new NullableReader(new StringReader());
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		int32Reader.write(buffer, content.Image, null);
		nullableStringReader.write(buffer, content.Music, resolver);
		nullableStringReader.write(buffer, content.Sound, resolver);
		int32Reader.write(buffer, content.MessageDelay, null);
		nullableStringReader.write(buffer, content.Script, resolver);
		nullableStringReader.write(buffer, content.Text, resolver);
		booleanReader.write(buffer, content.Shake, null);
		nullableStringReader.write(buffer, content.ResponsePoint, resolver);
		stringReader.write(buffer, content.ID, resolver);
	}

	isValueType() {
		return false;
	}

}

class MovieDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["MovieData", "Nullable<String>", 'String', null, 'String', 'String', "Nullable<List<String>>", 'List<String>', 'String', "List<MovieScene>", ...MovieSceneReader.parseTypeList()];
	}

	static type() {
		return "Reflective<MovieData>";
	}

	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		let ID = nullableStringReader.read(buffer, resolver);
		let SheetIndex = int32Reader.read(buffer);
		let Title = resolver.read(buffer);
		let Description = resolver.read(buffer);
		let Tags = nullableStringListReader.read(buffer, resolver);
		let Scenes = resolver.read(buffer);
		return {
			ID,
			SheetIndex,
			Title,
			Description,
			Tags,
			Scenes
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const movieSceneListReader = new ListReader(new MovieSceneReader());
		this.writeIndex(buffer, resolver);
		nullableStringReader.write(buffer, content.ID, resolver);
		int32Reader.write(buffer, content.SheetIndex, null);
		stringReader.write(buffer, content.Title, resolver);
		stringReader.write(buffer, content.Description, resolver);
		nullableStringListReader.write(buffer, content.Tags, resolver);
		movieSceneListReader.write(buffer, content.Scenes, resolver);
	}

	isValueType() {
		return false;
	}

}

class CharacterResponseReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.CharacterResponse':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["CharacterResponse", "Nullable<String>:1", "String", "Nullable<String>:1", "String", "Nullable<String>:1", "String"];
	}

	static type() {
		return "Reflective<CharacterResponse>";
	}

	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const ResponsePoint = nullableStringReader.read(buffer, resolver);
		const Script = nullableStringReader.read(buffer, resolver) || "";
		const Text = nullableStringReader.read(buffer, resolver) || "";
		return {
			ResponsePoint,
			Script,
			Text
		};
	}

	write(buffer, content, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		this.writeIndex(buffer, resolver);
		nullableStringReader.write(buffer, content.ResponsePoint, resolver);
		nullableStringReader.write(buffer, content.Script, resolver);
		nullableStringReader.write(buffer, content.Text, resolver);
	}

	isValueType() {
		return false;
	}

}

class SpecialResponsesReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.SpecialResponses':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["SpecialResponses", "Nullable<CharacterResponse>:7", ...CharacterResponseReader.parseTypeList(), "Nullable<CharacterResponse>:7", ...CharacterResponseReader.parseTypeList(), "Nullable<CharacterResponse>:7", ...CharacterResponseReader.parseTypeList()];
	}

	static type() {
		return "Reflective<SpecialResponses>";
	}

	read(buffer, resolver) {
		const nullableCharacterResponseReader = new NullableReader(new CharacterResponseReader());
		const BeforeMovie = nullableCharacterResponseReader.read(buffer, resolver);
		const DuringMovie = nullableCharacterResponseReader.read(buffer, resolver);
		const AfterMovie = nullableCharacterResponseReader.read(buffer, resolver);
		return {
			BeforeMovie,
			DuringMovie,
			AfterMovie
		};
	}

	write(buffer, content, resolver) {
		const nullableCharacterResponseReader = new NullableReader(new CharacterResponseReader());
		this.writeIndex(buffer, resolver);
		nullableCharacterResponseReader.write(buffer, content.BeforeMovie, resolver);
		nullableCharacterResponseReader.write(buffer, content.DuringMovie, resolver);
		nullableCharacterResponseReader.write(buffer, content.AfterMovie, resolver);
	}

	isValueType() {
		return false;
	}

}

class MovieReactionReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieReaction':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["MovieReaction", "String", "Nullable<String>:1", "String", "Nullable<List<String>>:2", "List<String>", "String", "Nullable<SpecialResponses>:25", ...SpecialResponsesReader.parseTypeList(), "String"];
	}

	static type() {
		return "Reflective<MovieReaction>";
	}

	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const nullableSpecialResponsesReader = new NullableReader(new SpecialResponsesReader());
		const Tag = resolver.read(buffer);
		const Response = nullableStringReader.read(buffer, resolver) || "like";
		const Whitelist = nullableStringListReader.read(buffer, resolver) || [];
		const SpecialResponses = nullableSpecialResponsesReader.read(buffer, resolver);
		const ID = resolver.read(buffer);
		return {
			Tag,
			Response,
			Whitelist,
			SpecialResponses,
			ID
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const nullableSpecialResponsesReader = new NullableReader(new SpecialResponsesReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Tag, resolver);
		nullableStringReader.write(buffer, content.Response, resolver);
		nullableStringListReader.write(buffer, content.Whitelist, resolver);
		nullableSpecialResponsesReader.write(buffer, content.SpecialResponses, resolver);
		stringReader.write(buffer, content.ID, resolver);
	}

	isValueType() {
		return false;
	}

}

class MovieCharacterReactionReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.MovieCharacterReaction':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["MovieCharacterReaction", "String", "Nullable<List<MovieReaction>>:34", "List<MovieReaction>", ...MovieReactionReader.parseTypeList()];
	}

	static type() {
		return "Reflective<MovieCharacterReaction>";
	}

	read(buffer, resolver) {
		const nullableReactionListReader = new NullableReader(new ListReader(new MovieReactionReader()));
		const NPCName = resolver.read(buffer);
		const Reactions = nullableReactionListReader.read(buffer, resolver);
		return {
			NPCName,
			Reactions
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableReactionListReader = new NullableReader(new ListReader(new MovieReactionReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.NPCName, resolver);
		nullableReactionListReader.write(buffer, content.Reactions, resolver);
	}

	isValueType() {
		return false;
	}

}

class ConcessionItemDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.ConcessionItemData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["ConcessionItemData", null, 'String', 'String', 'String', null, 'Nullable<List<String>>:2', "List<String>", 'String'];
	}

	static type() {
		return "Reflective<ConcessionItemData>";
	}

	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		let ID = int32Reader.read(buffer);
		let Name = resolver.read(buffer);
		let DisplayName = resolver.read(buffer);
		let Description = resolver.read(buffer);
		let Price = int32Reader.read(buffer);
		let ItemTags = nullableStringListReader.read(buffer, resolver);
		return {
			ID,
			Name,
			DisplayName,
			Description,
			Price,
			ItemTags
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		this.writeIndex(buffer, resolver);
		int32Reader.write(buffer, content.ID, null);
		stringReader.write(buffer, content.Name, resolver);
		stringReader.write(buffer, content.DisplayName, resolver);
		stringReader.write(buffer, content.Description, resolver);
		int32Reader.write(buffer, content.Price, null);
		nullableStringListReader.write(buffer, content.ItemTags, resolver);
	}

	isValueType() {
		return false;
	}

}

class ConcessionTasteReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Movies.ConcessionTaste':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["ConcessionTaste", 'String', 'Nullable<List<String>>:2', "List<String>", 'String', 'Nullable<List<String>>:2', "List<String>", 'String', 'Nullable<List<String>>:2', "List<String>", 'String'];
	}

	static type() {
		return "Reflective<ConcessionTaste>";
	}

	read(buffer, resolver) {
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		let Name = resolver.read(buffer);
		let LovedTags = nullableStringListReader.read(buffer, resolver);
		let LikedTags = nullableStringListReader.read(buffer, resolver);
		let DislikedTags = nullableStringListReader.read(buffer, resolver);
		return {
			Name,
			LovedTags,
			LikedTags,
			DislikedTags
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Name, resolver);
		nullableStringListReader.write(buffer, content.LovedTags, resolver);
		nullableStringListReader.write(buffer, content.LikedTags, resolver);
		nullableStringListReader.write(buffer, content.DislikedTags, resolver);
	}

	isValueType() {
		return false;
	}

}

class FishPondRewardReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.FishPond.FishPondReward':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["FishPondReward", null, null, null, null, null];
	}

	static type() {
		return "Reflective<FishPondReward>";
	}

	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const RequiredPopulation = int32Reader.read(buffer);
		const Chance = Math.round(floatReader.read(buffer) * 100000) / 100000;
		const ItemId = int32Reader.read(buffer);
		const MinQuantity = int32Reader.read(buffer);
		const MaxQuantity = int32Reader.read(buffer);
		return {
			RequiredPopulation,
			Chance,
			ItemId,
			MinQuantity,
			MaxQuantity
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		this.writeIndex(buffer, resolver);
		int32Reader.write(buffer, content.RequiredPopulation, null);
		floatReader.write(buffer, content.Chance, null);
		int32Reader.write(buffer, content.ItemId, null);
		int32Reader.write(buffer, content.MinQuantity, null);
		int32Reader.write(buffer, content.MaxQuantity, null);
	}

	isValueType() {
		return false;
	}

}

class FishPondDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.FishPond.FishPondData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["FishPondData", "List<String>", "String", null, "List<FishPondReward>", ...FishPondRewardReader.parseTypeList(), "Nullable<Dictionary<Int32,List<String>>>:4", "Dictionary<Int32,List<String>>", "Int32", "List<String>", "String"];
	}

	static type() {
		return "Reflective<FishPondData>";
	}

	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const stringListDictReader = new NullableReader(new DictionaryReader(new Int32Reader(), new ListReader(new StringReader())));
		const RequiredTags = resolver.read(buffer);
		const SpawnTime = int32Reader.read(buffer);
		const ProducedItems = resolver.read(buffer);
		const PopulationGates = stringListDictReader.read(buffer, resolver);
		return {
			RequiredTags,
			SpawnTime,
			ProducedItems,
			PopulationGates
		};
	}

	write(buffer, content, resolver) {
		const stringListReader = new ListReader(new StringReader());
		const int32Reader = new Int32Reader();
		const fishPondRewardListReader = new ListReader(new FishPondRewardReader());
		const stringListDictReader = new NullableReader(new DictionaryReader(new Int32Reader(), new ListReader(new StringReader())));
		this.writeIndex(buffer, resolver);
		stringListReader.write(buffer, content.RequiredTags, resolver);
		int32Reader.write(buffer, content.SpawnTime, null);
		fishPondRewardListReader.write(buffer, content.ProducedItems, resolver);
		stringListDictReader.write(buffer, content.PopulationGates, resolver);
	}

	isValueType() {
		return false;
	}

}

class TailorItemRecipeReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.Crafting.TailorItemRecipe':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["TailorItemRecipe", "Nullable<List<String>>:2", "List<String>", "String", "Nullable<List<String>>:2", "List<String>", "String", null, null, "Nullable<List<String>>:2", "List<String>", "String", "Nullable<String>", "String"];
	}

	static type() {
		return "Reflective<TailorItemRecipe>";
	}

	read(buffer, resolver) {
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();
		const FirstItemTags = nullableStringListReader.read(buffer, resolver);
		const SecondItemTags = nullableStringListReader.read(buffer, resolver);
		const SpendingRightItem = booleanReader.read(buffer);
		const CraftedItemID = int32Reader.read(buffer);
		const CraftedItemIDs = nullableStringListReader.read(buffer, resolver);
		const CraftedItemColor = nullableStringReader.read(buffer, resolver);
		return {
			FirstItemTags,
			SecondItemTags,
			SpendingRightItem,
			CraftedItemID,
			CraftedItemIDs,
			CraftedItemColor
		};
	}

	write(buffer, content, resolver) {
		const nullableStringListReader = new NullableReader(new ListReader(new StringReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const booleanReader = new BooleanReader();
		const int32Reader = new Int32Reader();
		this.writeIndex(buffer, resolver);
		nullableStringListReader.write(buffer, content.FirstItemTags, resolver);
		nullableStringListReader.write(buffer, content.SecondItemTags, resolver);
		booleanReader.write(buffer, content.SpendingRightItem, null);
		int32Reader.write(buffer, content.CraftedItemID, null);
		nullableStringListReader.write(buffer, content.CraftedItemIDs, resolver);
		nullableStringReader.write(buffer, content.CraftedItemColor, resolver);
	}

	isValueType() {
		return false;
	}

}

class RenovationValueReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.RenovationValue':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["RenovationValue", "String", "String", "String"];
	}

	static type() {
		return "Reflective<RenovationValue>";
	}

	read(buffer, resolver) {
		const Type = resolver.read(buffer);
		const Key = resolver.read(buffer);
		const Value = resolver.read(buffer);
		return {
			Type,
			Key,
			Value
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Type, resolver);
		stringReader.write(buffer, content.Key, resolver);
		stringReader.write(buffer, content.Value, resolver);
	}

	isValueType() {
		return false;
	}

}

class RectReader extends RectangleReader {
	static isTypeOf(type) {
		if (super.isTypeOf(type)) return true;

		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.Rect':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["Rect"];
	}

	static type() {
		return "Reflective<Rect>";
	}

	read(buffer) {
		const {
			x,
			y,
			width,
			height
		} = super.read(buffer);
		return {
			X: x,
			Y: y,
			Width: width,
			Height: height
		};
	}

	write(buffer, content, resolver) {
		const {
			X: x,
			Y: y,
			Width: width,
			Height: height
		} = content;
		super.write(buffer, {
			x,
			y,
			width,
			height
		}, resolver);
	}

	isValueType() {
		return false;
	}

}

class RectGroupReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.RectGroup':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["RectGroup", "List<Rect>", "Rect"];
	}

	static type() {
		return "Reflective<RectGroup>";
	}

	read(buffer, resolver) {
		const Rects = resolver.read(buffer);
		return {
			Rects
		};
	}

	write(buffer, content, resolver) {
		const rectListReader = new ListReader(new RectReader());
		this.writeIndex(buffer, resolver);
		rectListReader.write(buffer, content.Rects, resolver);
	}

	isValueType() {
		return false;
	}

}

class HomeRenovationReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.HomeRenovations.HomeRenovation':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["HomeRenovation", "String", "String", null, "List<RenovationValue>", ...RenovationValueReader.parseTypeList(), "List<RenovationValue>", ...RenovationValueReader.parseTypeList(), "Nullable<List<RectGroup>>:4", "List<RectGroup>", ...RectGroupReader.parseTypeList(), "Nullable<String>", "String"];
	}

	static type() {
		return "Reflective<HomeRenovation>";
	}

	read(buffer, resolver) {
		const booleanReader = new BooleanReader();
		const nullableRectGroupListReader = new NullableReader(new ListReader(new RectGroupReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		const TextStrings = resolver.read(buffer);
		const AnimationType = resolver.read(buffer);
		const CheckForObstructions = booleanReader.read(buffer);
		const Requirements = resolver.read(buffer);
		const RenovateActions = resolver.read(buffer);
		const RectGroups = nullableRectGroupListReader.read(buffer, resolver);
		const SpecialRect = nullableStringReader.read(buffer, resolver);
		return {
			TextStrings,
			AnimationType,
			CheckForObstructions,
			Requirements,
			RenovateActions,
			RectGroups,
			SpecialRect
		};
	}

	write(buffer, content, resolver) {
		const booleanReader = new BooleanReader();
		const stringReader = new StringReader();
		const renovationValueListReader = new ListReader(new RenovationValueReader());
		const nullableRectGroupListReader = new NullableReader(new ListReader(new RectGroupReader()));
		const nullableStringReader = new NullableReader(new StringReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.TextStrings, resolver);
		stringReader.write(buffer, content.AnimationType, resolver);
		booleanReader.write(buffer, content.CheckForObstructions, null);
		renovationValueListReader.write(buffer, content.Requirements, resolver);
		renovationValueListReader.write(buffer, content.RenovateActions, resolver);
		nullableRectGroupListReader.write(buffer, content.RectGroups, resolver);
		nullableStringReader.write(buffer, content.SpecialRect, resolver);
	}

	isValueType() {
		return false;
	}

}

class BundleDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.BundleData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["BundleData", "String", null, "String", "String", "String", null, null, "String"];
	}

	static type() {
		return "Reflective<BundleData>";
	}

	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		let Name = resolver.read(buffer);
		let Index = int32Reader.read(buffer);
		let Sprite = resolver.read(buffer);
		let Color = resolver.read(buffer);
		let Items = resolver.read(buffer);
		let Pick = int32Reader.read(buffer);
		let RequiredItems = int32Reader.read(buffer);
		let Reward = resolver.read(buffer);
		return {
			Name,
			Index,
			Sprite,
			Color,
			Items,
			Pick,
			RequiredItems,
			Reward
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Name, resolver);
		int32Reader.write(buffer, content.Index, null);
		stringReader.write(buffer, content.Sprite, resolver);
		stringReader.write(buffer, content.Color, resolver);
		stringReader.write(buffer, content.Items, resolver);
		int32Reader.write(buffer, content.Pick, null);
		int32Reader.write(buffer, content.RequiredItems, null);
		stringReader.write(buffer, content.Reward, resolver);
	}

	isValueType() {
		return false;
	}

}

class BundleSetDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.BundleSetData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["BundleSetData", "List<BundleData>", ...BundleDataReader.parseTypeList()];
	}

	static type() {
		return "Reflective<BundleSetData>";
	}

	read(buffer, resolver) {
		let Bundles = resolver.read(buffer);
		return {
			Bundles
		};
	}

	write(buffer, content, resolver) {
		const bundleListReader = new ListReader(new BundleDataReader());
		this.writeIndex(buffer, resolver);
		bundleListReader.write(buffer, content.Bundles, resolver);
	}

	isValueType() {
		return false;
	}

}

class RandomBundleDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.RandomBundleData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["RandomBundleData", "String", "String", "Nullable<List<BundleSetData>>:13", "List<BundleSetData>", ...BundleSetDataReader.parseTypeList(), "Nullable<List<BundleData>>:11", "List<BundleData>", ...BundleDataReader.parseTypeList()];
	}

	static type() {
		return "Reflective<RandomBundleData>";
	}

	read(buffer, resolver) {
		const nullableBundleSetListReader = new NullableReader(new ListReader(new BundleSetDataReader()));
		const nullableBundleListReader = new NullableReader(new ListReader(new BundleDataReader()));
		let AreaName = resolver.read(buffer);
		let Keys = resolver.read(buffer);
		let BundleSets = nullableBundleSetListReader.read(buffer, resolver);
		let Bundles = nullableBundleListReader.read(buffer, resolver);
		return {
			AreaName,
			Keys,
			BundleSets,
			Bundles
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableBundleSetListReader = new NullableReader(new ListReader(new BundleSetDataReader()));
		const nullableBundleListReader = new NullableReader(new ListReader(new BundleDataReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.AreaName, resolver);
		stringReader.write(buffer, content.Keys, resolver);
		nullableBundleSetListReader.write(buffer, content.BundleSets, resolver);
		nullableBundleListReader.write(buffer, content.Bundles, resolver);
	}

	isValueType() {
		return false;
	}

}

class RandomizedElementItemReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.RandomizedElementItem':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["RandomizedElementItem", "Nullable<String>", "String", "String"];
	}

	static type() {
		return "Reflective<RandomizedElementItem>";
	}

	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const RequiredTags = nullableStringReader.read(buffer, resolver) || "";
		const Value = resolver.read(buffer);
		return {
			RequiredTags,
			Value
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		this.writeIndex(buffer, resolver);
		nullableStringReader.write(buffer, content.RequiredTags, resolver);
		stringReader.write(buffer, content.Value, resolver);
	}

	isValueType() {
		return false;
	}

}

class RandomizedElementReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.RandomizedElement':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["RandomizedElement", "String", "List<RandomizedElementItem>", ...RandomizedElementItemReader.parseTypeList()];
	}

	static type() {
		return "Reflective<RandomizedElement>";
	}

	read(buffer, resolver) {
		const Name = resolver.read(buffer);
		const Values = resolver.read(buffer);
		return {
			Name,
			Values
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const itemListReader = new ListReader(new RandomizedElementItemReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Name, resolver);
		itemListReader.write(buffer, content.Values, resolver);
	}

	isValueType() {
		return false;
	}

}

class SpecialOrderObjectiveDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrderObjectiveData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["SpecialOrderObjectiveData", "String", "String", "String", "Dictionary<String,String>", "String", "String"];
	}

	static type() {
		return "Reflective<SpecialOrderObjectiveData>";
	}

	read(buffer, resolver) {
		const Type = resolver.read(buffer);
		const Text = resolver.read(buffer);
		const RequiredCount = resolver.read(buffer);
		const Data = resolver.read(buffer);
		return {
			Type,
			Text,
			RequiredCount,
			Data
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const stringDictReader = new DictionaryReader(new StringReader(), new StringReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Type, resolver);
		stringReader.write(buffer, content.Text, resolver);
		stringReader.write(buffer, content.RequiredCount, resolver);
		stringDictReader.write(buffer, content.Data, resolver);
	}

	isValueType() {
		return false;
	}

}

class SpecialOrderRewardDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrderRewardData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["SpecialOrderRewardData", "String", "Dictionary<String,String>", "String", "String"];
	}

	static type() {
		return "Reflective<SpecialOrderRewardData>";
	}

	read(buffer, resolver) {
		const Type = resolver.read(buffer);
		const Data = resolver.read(buffer);
		return {
			Type,
			Data
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const stringDictReader = new DictionaryReader(new StringReader(), new StringReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Type, resolver);
		stringDictReader.write(buffer, content.Data, resolver);
	}

	isValueType() {
		return false;
	}

}

class SpecialOrderDataReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.SpecialOrderData':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["SpecialOrderData", "String", "String", "String", "Nullable<String>", "String", "Nullable<String>", "String", "Nullable<String>", "String", "Nullable<String>", "String", "String", "Nullable<String>", "String", "Nullable<String>", "String", "Nullable<List<RandomizedElement>>:8", "List<RandomizedElement>", ...RandomizedElementReader.parseTypeList(), "List<SpecialOrderObjectiveData>", ...SpecialOrderObjectiveDataReader.parseTypeList(), "List<SpecialOrderRewardData>", ...SpecialOrderRewardDataReader.parseTypeList()];
	}

	static type() {
		return "Reflective<SpecialOrderData>";
	}

	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableRandomizedElemListReader = new NullableReader(new ListReader(new RandomizedElementReader()));
		const Name = resolver.read(buffer);
		const Requester = resolver.read(buffer);
		const Duration = resolver.read(buffer);
		const Repeatable = nullableStringReader.read(buffer, resolver) || "False";
		const RequiredTags = nullableStringReader.read(buffer, resolver) || "";
		const OrderType = nullableStringReader.read(buffer, resolver) || "";
		const SpecialRule = nullableStringReader.read(buffer, resolver) || "";
		const Text = resolver.read(buffer);
		const ItemToRemoveOnEnd = nullableStringReader.read(buffer, resolver);
		const MailToRemoveOnEnd = nullableStringReader.read(buffer, resolver);
		const RandomizedElements = nullableRandomizedElemListReader.read(buffer, resolver);
		const Objectives = resolver.read(buffer);
		const Rewards = resolver.read(buffer);
		return {
			Name,
			Requester,
			Duration,
			Repeatable,
			RequiredTags,
			OrderType,
			SpecialRule,
			Text,
			ItemToRemoveOnEnd,
			MailToRemoveOnEnd,
			RandomizedElements,
			Objectives,
			Rewards
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableRandomizedElemListReader = new NullableReader(new ListReader(new RandomizedElementReader()));
		const objectiveListReader = new ListReader(new SpecialOrderObjectiveDataReader());
		const rewardListReader = new ListReader(new SpecialOrderRewardDataReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.Name, resolver);
		stringReader.write(buffer, content.Requester, resolver);
		stringReader.write(buffer, content.Duration, resolver);
		nullableStringReader.write(buffer, content.Repeatable, resolver);
		nullableStringReader.write(buffer, content.RequiredTags, resolver);
		nullableStringReader.write(buffer, content.OrderType, resolver);
		nullableStringReader.write(buffer, content.SpecialRule, resolver);
		stringReader.write(buffer, content.Text, resolver);
		nullableStringReader.write(buffer, content.ItemToRemoveOnEnd, resolver);
		nullableStringReader.write(buffer, content.MailToRemoveOnEnd, resolver);
		nullableRandomizedElemListReader.write(buffer, content.RandomizedElements, resolver);
		objectiveListReader.write(buffer, content.Objectives, resolver);
		rewardListReader.write(buffer, content.Rewards, resolver);
	}

	isValueType() {
		return false;
	}

}

class ModFarmTypeReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModFarmType':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["ModFarmType", "String", "String", "String", "Nullable<String>:1", "String", "Nullable<String>:1", "String", "Nullable<Dictionary<String,String>>:4", "Dictionary<String,String>", "String", "String"];
	}

	static type() {
		return "Reflective<ModFarmType>";
	}

	read(buffer, resolver) {
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader()));
		const ID = resolver.read(buffer);
		const TooltipStringPath = resolver.read(buffer);
		const MapName = resolver.read(buffer);
		const IconTexture = nullableStringReader.read(buffer, resolver);
		const WorldMapTexture = nullableStringReader.read(buffer, resolver);
		const ModData = nullableStringDictReader.read(buffer, resolver);
		return {
			ID,
			TooltipStringPath,
			MapName,
			IconTexture,
			WorldMapTexture,
			ModData
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const nullableStringDictReader = new NullableReader(new DictionaryReader(new StringReader()));
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.TooltipStringPath, resolver);
		stringReader.write(buffer, content.MapName, resolver);
		nullableStringReader.write(buffer, content.IconTexture, resolver);
		nullableStringReader.write(buffer, content.WorldMapTexture, resolver);
		nullableStringDictReader.write(buffer, content.ModData, resolver);
	}

	isValueType() {
		return false;
	}

}

class ModLanguageReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModLanguage':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["ModLanguage", "String", "String", "String", null, "Nullable<String>:1", "String", null, null, null, null, "Nullable<String>:1", "String", "String", "String", "String", "String"];
	}

	static type() {
		return "Reflective<ModLanguage>";
	}

	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader(new StringReader());
		const ID = resolver.read(buffer);
		const LanguageCode = resolver.read(buffer);
		const ButtonTexture = resolver.read(buffer);
		const UseLatinFont = booleanReader.read(buffer);
		const FontFile = nullableStringReader.read(buffer, resolver);
		const FontPixelZoom = floatReader.read(buffer);
		const FontApplyYOffset = booleanReader.read(buffer);
		const SmallFontLineSpacing = int32Reader.read(buffer);
		const UseGenderedCharacterTranslations = booleanReader.read(buffer);
		const NumberComma = nullableStringReader.read(buffer, resolver);
		const TimeFormat = resolver.read(buffer);
		const ClockTimeFormat = resolver.read(buffer);
		const ClockDateFormat = resolver.read(buffer);
		return {
			ID,
			LanguageCode,
			ButtonTexture,
			UseLatinFont,
			FontFile,
			FontPixelZoom,
			FontApplyYOffset,
			SmallFontLineSpacing,
			UseGenderedCharacterTranslations,
			NumberComma,
			TimeFormat,
			ClockTimeFormat,
			ClockDateFormat
		};
	}

	write(buffer, content, resolver) {
		const stringReader = new StringReader();
		const int32Reader = new Int32Reader();
		const floatReader = new SingleReader();
		const booleanReader = new BooleanReader();
		const nullableStringReader = new NullableReader(new StringReader());
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.LanguageCode, resolver);
		stringReader.write(buffer, content.ButtonTexture, resolver);
		booleanReader.write(buffer, content.UseLatinFont, null);
		nullableStringReader.write(buffer, content.FontFile, resolver);
		floatReader.write(buffer, content.FontPixelZoom, null);
		booleanReader.write(buffer, content.FontApplyYOffset, null);
		int32Reader.write(buffer, content.SmallFontLineSpacing, null);
		booleanReader.write(buffer, content.UseGenderedCharacterTranslations, null);
		nullableStringReader.write(buffer, content.NumberComma, resolver);
		stringReader.write(buffer, content.TimeFormat, resolver);
		stringReader.write(buffer, content.ClockTimeFormat, resolver);
		stringReader.write(buffer, content.ClockDateFormat, resolver);
	}

	isValueType() {
		return false;
	}

}

class ModWallpaperOrFlooringReader extends BaseReader {
	static isTypeOf(type) {
		switch (type) {
			case 'StardewValley.GameData.ModWallpaperOrFlooring':
				return true;

			default:
				return false;
		}
	}

	static parseTypeList() {
		return ["ModWallpaperOrFlooring", "String", "String", null, null];
	}

	static type() {
		return "Reflective<ModWallpaperOrFlooring>";
	}

	read(buffer, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const ID = resolver.read(buffer);
		const Texture = resolver.read(buffer);
		const IsFlooring = booleanReader.read(buffer);
		const Count = int32Reader.read(buffer);
		return {
			ID,
			Texture,
			IsFlooring,
			Count
		};
	}

	write(buffer, content, resolver) {
		const int32Reader = new Int32Reader();
		const booleanReader = new BooleanReader();
		const stringReader = new StringReader();
		this.writeIndex(buffer, resolver);
		stringReader.write(buffer, content.ID, resolver);
		stringReader.write(buffer, content.Texture, resolver);
		booleanReader.write(buffer, content.IsFlooring, null);
		int32Reader.write(buffer, content.Count, null);
	}

	isValueType() {
		return false;
	}

}

export { BundleDataReader, BundleSetDataReader, CharacterResponseReader, ConcessionItemDataReader, ConcessionTasteReader, FishPondDataReader, FishPondRewardReader, HomeRenovationReader, ModFarmTypeReader, ModLanguageReader, ModWallpaperOrFlooringReader, MovieCharacterReactionReader, MovieDataReader, MovieReactionReader, MovieSceneReader, RandomBundleDataReader, RandomizedElementItemReader, RandomizedElementReader, RectGroupReader, RectReader, RenovationValueReader, SpecialOrderDataReader, SpecialOrderObjectiveDataReader, SpecialOrderRewardDataReader, SpecialResponsesReader, TailorItemRecipeReader };
