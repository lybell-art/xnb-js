@xnb-js/core
----------------
The core of xnb.js.
### Installation
```bash
npm install @xnb-js/core
```
### Usage
```js
import {setReaders, unpackToXnbData} from "@xnb-js/core";
import * as Readers from "@xnb-js/readers";

setReaders(Readers);

unpackToXnbData(file);
```