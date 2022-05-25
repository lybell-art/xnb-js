/** 
 * @xnb/stardewvalley 1.1.0
 * made by Lybell( https://github.com/lybell-art/ )
 * special thanks to Concernedape(Stardew Valley Producer), 진의(Unoffical XnbCli updater)
 * 
 * xnb.js is licensed under the LGPL 3.0 License.
 * 
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@xnb-js/readers')) :
	typeof define === 'function' && define.amd ? define(['exports', '@xnb-js/readers'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.XNB = {}, global.XNB));
})(this, (function (exports, readers) { 'use strict';

	class MovieSceneReader extends readers.BaseReader {
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
			const booleanReader = new readers.BooleanReader();
			const int32Reader = new readers.Int32Reader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
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
			const booleanReader = new readers.BooleanReader();
			const int32Reader = new readers.Int32Reader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const stringReader = new readers.StringReader();
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

	class MovieDataReader extends readers.BaseReader {
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
			const int32Reader = new readers.Int32Reader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
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
			const int32Reader = new readers.Int32Reader();
			const stringReader = new readers.StringReader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
			const movieSceneListReader = new readers.ListReader(new MovieSceneReader());
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

	class CharacterResponseReader extends readers.BaseReader {
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
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
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
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			this.writeIndex(buffer, resolver);
			nullableStringReader.write(buffer, content.ResponsePoint, resolver);
			nullableStringReader.write(buffer, content.Script, resolver);
			nullableStringReader.write(buffer, content.Text, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class SpecialResponsesReader extends readers.BaseReader {
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
			const nullableCharacterResponseReader = new readers.NullableReader(new CharacterResponseReader());
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
			const nullableCharacterResponseReader = new readers.NullableReader(new CharacterResponseReader());
			this.writeIndex(buffer, resolver);
			nullableCharacterResponseReader.write(buffer, content.BeforeMovie, resolver);
			nullableCharacterResponseReader.write(buffer, content.DuringMovie, resolver);
			nullableCharacterResponseReader.write(buffer, content.AfterMovie, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class MovieReactionReader extends readers.BaseReader {
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
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
			const nullableSpecialResponsesReader = new readers.NullableReader(new SpecialResponsesReader());
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
			const stringReader = new readers.StringReader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
			const nullableSpecialResponsesReader = new readers.NullableReader(new SpecialResponsesReader());
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

	class MovieCharacterReactionReader extends readers.BaseReader {
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
			const nullableReactionListReader = new readers.NullableReader(new readers.ListReader(new MovieReactionReader()));
			const NPCName = resolver.read(buffer);
			const Reactions = nullableReactionListReader.read(buffer, resolver);
			return {
				NPCName,
				Reactions
			};
		}

		write(buffer, content, resolver) {
			const stringReader = new readers.StringReader();
			const nullableReactionListReader = new readers.NullableReader(new readers.ListReader(new MovieReactionReader()));
			this.writeIndex(buffer, resolver);
			stringReader.write(buffer, content.NPCName, resolver);
			nullableReactionListReader.write(buffer, content.Reactions, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class ConcessionItemDataReader extends readers.BaseReader {
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
			const int32Reader = new readers.Int32Reader();
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
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
			const int32Reader = new readers.Int32Reader();
			const stringReader = new readers.StringReader();
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
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

	class ConcessionTasteReader extends readers.BaseReader {
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
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
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
			const stringReader = new readers.StringReader();
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
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

	class FishPondRewardReader extends readers.BaseReader {
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
			const int32Reader = new readers.Int32Reader();
			const floatReader = new readers.SingleReader();
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
			const int32Reader = new readers.Int32Reader();
			const floatReader = new readers.SingleReader();
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

	class FishPondDataReader extends readers.BaseReader {
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
			const int32Reader = new readers.Int32Reader();
			const stringListDictReader = new readers.NullableReader(new readers.DictionaryReader(new readers.Int32Reader(), new readers.ListReader(new readers.StringReader())));
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
			const stringListReader = new readers.ListReader(new readers.StringReader());
			const int32Reader = new readers.Int32Reader();
			const fishPondRewardListReader = new readers.ListReader(new FishPondRewardReader());
			const stringListDictReader = new readers.NullableReader(new readers.DictionaryReader(new readers.Int32Reader(), new readers.ListReader(new readers.StringReader())));
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

	class TailorItemRecipeReader extends readers.BaseReader {
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
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const booleanReader = new readers.BooleanReader();
			const int32Reader = new readers.Int32Reader();
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
			const nullableStringListReader = new readers.NullableReader(new readers.ListReader(new readers.StringReader()));
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const booleanReader = new readers.BooleanReader();
			const int32Reader = new readers.Int32Reader();
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

	class RenovationValueReader extends readers.BaseReader {
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
			const stringReader = new readers.StringReader();
			this.writeIndex(buffer, resolver);
			stringReader.write(buffer, content.Type, resolver);
			stringReader.write(buffer, content.Key, resolver);
			stringReader.write(buffer, content.Value, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class RectReader extends readers.RectangleReader {
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

	class RectGroupReader extends readers.BaseReader {
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
			const rectListReader = new readers.ListReader(new RectReader());
			this.writeIndex(buffer, resolver);
			rectListReader.write(buffer, content.Rects, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class HomeRenovationReader extends readers.BaseReader {
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
			const booleanReader = new readers.BooleanReader();
			const nullableRectGroupListReader = new readers.NullableReader(new readers.ListReader(new RectGroupReader()));
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
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
			const booleanReader = new readers.BooleanReader();
			const stringReader = new readers.StringReader();
			const renovationValueListReader = new readers.ListReader(new RenovationValueReader());
			const nullableRectGroupListReader = new readers.NullableReader(new readers.ListReader(new RectGroupReader()));
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
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

	class BundleDataReader extends readers.BaseReader {
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
			const int32Reader = new readers.Int32Reader();
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
			const int32Reader = new readers.Int32Reader();
			const stringReader = new readers.StringReader();
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

	class BundleSetDataReader extends readers.BaseReader {
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
			const bundleListReader = new readers.ListReader(new BundleDataReader());
			this.writeIndex(buffer, resolver);
			bundleListReader.write(buffer, content.Bundles, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class RandomBundleDataReader extends readers.BaseReader {
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
			const nullableBundleSetListReader = new readers.NullableReader(new readers.ListReader(new BundleSetDataReader()));
			const nullableBundleListReader = new readers.NullableReader(new readers.ListReader(new BundleDataReader()));
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
			const stringReader = new readers.StringReader();
			const nullableBundleSetListReader = new readers.NullableReader(new readers.ListReader(new BundleSetDataReader()));
			const nullableBundleListReader = new readers.NullableReader(new readers.ListReader(new BundleDataReader()));
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

	class RandomizedElementItemReader extends readers.BaseReader {
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
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const RequiredTags = nullableStringReader.read(buffer, resolver) || "";
			const Value = resolver.read(buffer);
			return {
				RequiredTags,
				Value
			};
		}

		write(buffer, content, resolver) {
			const stringReader = new readers.StringReader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			this.writeIndex(buffer, resolver);
			nullableStringReader.write(buffer, content.RequiredTags, resolver);
			stringReader.write(buffer, content.Value, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class RandomizedElementReader extends readers.BaseReader {
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
			const stringReader = new readers.StringReader();
			const itemListReader = new readers.ListReader(new RandomizedElementItemReader());
			this.writeIndex(buffer, resolver);
			stringReader.write(buffer, content.Name, resolver);
			itemListReader.write(buffer, content.Values, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class SpecialOrderObjectiveDataReader extends readers.BaseReader {
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
			const stringReader = new readers.StringReader();
			const stringDictReader = new readers.DictionaryReader(new readers.StringReader(), new readers.StringReader());
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

	class SpecialOrderRewardDataReader extends readers.BaseReader {
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
			const stringReader = new readers.StringReader();
			const stringDictReader = new readers.DictionaryReader(new readers.StringReader(), new readers.StringReader());
			this.writeIndex(buffer, resolver);
			stringReader.write(buffer, content.Type, resolver);
			stringDictReader.write(buffer, content.Data, resolver);
		}

		isValueType() {
			return false;
		}

	}

	class SpecialOrderDataReader extends readers.BaseReader {
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
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const nullableRandomizedElemListReader = new readers.NullableReader(new readers.ListReader(new RandomizedElementReader()));
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
			const stringReader = new readers.StringReader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const nullableRandomizedElemListReader = new readers.NullableReader(new readers.ListReader(new RandomizedElementReader()));
			const objectiveListReader = new readers.ListReader(new SpecialOrderObjectiveDataReader());
			const rewardListReader = new readers.ListReader(new SpecialOrderRewardDataReader());
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

	class ModFarmTypeReader extends readers.BaseReader {
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
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const nullableStringDictReader = new readers.NullableReader(new readers.DictionaryReader(new readers.StringReader()));
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
			const stringReader = new readers.StringReader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
			const nullableStringDictReader = new readers.NullableReader(new readers.DictionaryReader(new readers.StringReader()));
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

	class ModLanguageReader extends readers.BaseReader {
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
			const int32Reader = new readers.Int32Reader();
			const floatReader = new readers.SingleReader();
			const booleanReader = new readers.BooleanReader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
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
			const stringReader = new readers.StringReader();
			const int32Reader = new readers.Int32Reader();
			const floatReader = new readers.SingleReader();
			const booleanReader = new readers.BooleanReader();
			const nullableStringReader = new readers.NullableReader(new readers.StringReader());
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

	class ModWallpaperOrFlooringReader extends readers.BaseReader {
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
			const int32Reader = new readers.Int32Reader();
			const booleanReader = new readers.BooleanReader();
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
			const int32Reader = new readers.Int32Reader();
			const booleanReader = new readers.BooleanReader();
			const stringReader = new readers.StringReader();
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

	exports.BundleDataReader = BundleDataReader;
	exports.BundleSetDataReader = BundleSetDataReader;
	exports.CharacterResponseReader = CharacterResponseReader;
	exports.ConcessionItemDataReader = ConcessionItemDataReader;
	exports.ConcessionTasteReader = ConcessionTasteReader;
	exports.FishPondDataReader = FishPondDataReader;
	exports.FishPondRewardReader = FishPondRewardReader;
	exports.HomeRenovationReader = HomeRenovationReader;
	exports.ModFarmTypeReader = ModFarmTypeReader;
	exports.ModLanguageReader = ModLanguageReader;
	exports.ModWallpaperOrFlooringReader = ModWallpaperOrFlooringReader;
	exports.MovieCharacterReactionReader = MovieCharacterReactionReader;
	exports.MovieDataReader = MovieDataReader;
	exports.MovieReactionReader = MovieReactionReader;
	exports.MovieSceneReader = MovieSceneReader;
	exports.RandomBundleDataReader = RandomBundleDataReader;
	exports.RandomizedElementItemReader = RandomizedElementItemReader;
	exports.RandomizedElementReader = RandomizedElementReader;
	exports.RectGroupReader = RectGroupReader;
	exports.RectReader = RectReader;
	exports.RenovationValueReader = RenovationValueReader;
	exports.SpecialOrderDataReader = SpecialOrderDataReader;
	exports.SpecialOrderObjectiveDataReader = SpecialOrderObjectiveDataReader;
	exports.SpecialOrderRewardDataReader = SpecialOrderRewardDataReader;
	exports.SpecialResponsesReader = SpecialResponsesReader;
	exports.TailorItemRecipeReader = TailorItemRecipeReader;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
