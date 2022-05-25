@xnb-js/stardew-valley
----------------
The xnb.js reader plugin for Stardew Valley. It was created to respond to the xnb file that stores custom data types added in Stardew Valley 1.4 and later.
### Installation
```bash
npm install @xnb-js/stardew-valley
```
### Usage
```js
import {setReaders, unpackToXnbData} from "@xnb-js/core";
import * as Readers from "@xnb-js/stardew-valley";

setReaders(Readers);

unpackToXnbData(file);
```
### Documentation

#### Data Reader added in Stardew Valley 1.4
- MovieSceneReader : A reader that can read and write **Movies.xnb**.
	- MovieDataReader 
- MovieCharacterReactionReader : A reader that can read and write **MoviesReactions.xnb**.
	- MovieReactionReader 
	- SpecialResponsesReader 
	- CharacterResponseReader 
- ConcessionItemDataReader : A reader that can read and write **Concessions.xnb**.
- ConcessionTasteReader : A reader that can read and write **ConcessionTastes.xnb**.
- FishPondDataReader : A reader that can read and write **FishPondData.xnb**.
	- FishPondRewardReader 
- TailorItemRecipeReader : A reader that can read and write **TailoringRecipes.xnb**.

#### Data Reader added in Stardew Valley 1.5
- HomeRenovationReader : A reader that can read and write **HomeRenovations.xnb**.
	- RenovationValueReader 
	- RectGroupReader 
	- RectReader 
- RandomBundleDataReader : A reader that can read and write **RandomBundles.xnb**.
	- BundleSetDataReader 
	- BundleDataReader 
- SpecialOrderDataReader : A reader that can read and write **SpecialOrders.xnb**.
	- RandomizedElementReader 
	- RandomizedElementItemReader 
	- SpecialOrderObjectiveDataReader 
	- SpecialOrderRewardDataReader 

#### Data Reader added in Stardew Valley 1.5.5
It is recommended to add data added in 1.5.5 using *contents patcher* instead of using this library.
- ModFarmTypeReader : A reader that can read and write **AdditionalFarms.xnb**.
- ModLanguageReader : A reader that can read and write **AdditionalLanguages.xnb**.
- ModWallpaperOrFlooringReader : A reader that can read and write **AdditionalWallpaperFlooring.xnb**.

### Special Thanks
The implementation of the data reader added in the Stardew Valley 1.4 was referenced in the [XnbCli revision](https://blog.naver.com/khs3400/221852415116) made by 진의. Thank you for this.