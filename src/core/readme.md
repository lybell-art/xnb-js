@xnb/core
----------------
The core of xnb.js.
### Installation
```bash
npm install @xnb/core
```
### Usage
```js
import {setReaders, unpackToXnbData} from "@xnb/core";
import * as Readers from "@xnb/readers";

setReaders(Readers);

unpackToXnbData(file);
```