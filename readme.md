# XNB Unpacker

xnb unpacker는 [xnbcil](https://github.com/LeonBlade/xnbcli)을 브라우저에서 사용 가능하게 변환한 라이브러리입니다.
이 라이브러리는 ES6 모듈에 최적화되어 작성되었으며, 실행 환경과 상관없이 구동되는 것을 목표로 하였습니다.
이 라이브러리는 현재 Stardew Valley에 대한 모든 LZX 압축 해제를 지원하며, 안드로이드 및 ios용 LZ4 압축을 지원합니다. 

## Get Started

기본적으로 ES6 모듈에 최적화되어 있으므로, dist/xnbUnpacker.module.js 파일을 본인 프로젝트에 추가하고 다음과 같이 불러오시면 됩니다.

```javascript
    import * as XnbUnpacker from "./xnbUnpacker.module.js"
```

ES6 모듈을 지원하지 않는 브라우저의 경우, 다음과 같이 모듈을 불러올 수 있습니다.

```html
    ...
    <script src="./xnbUnpacker.min.js" ></script>
    <script>
	    //Your code Here
    </script>
```

## API Documentation

### unpackData( file : <span style="color:gray">File/Buffer</span> ) : Promise

xnb 파일을 비동기적으로 언팩한 뒤 결과값을 반환합니다.
Promise의 결과는 {type: String, data: ArrayBuffer} 혹은 Json 데이터의 값을 가집니다.

```javascript
unpackData(file).then(unpackedXnb=>{
	if(unpackedXnb.type !== undefined) {
		const data=unpackedXnb.data; //ArrayBuffer
		/* 여기에 당신의 코드*/
	}
	else{
		const data=unpackedXnb;
		/*여기에 당신의 코드*/
	}
);
```

### unpackToFiles( file : File/Buffer , configs : Object ) : Promise

xnb 파일을 비동기적으로 언팩한 뒤 언팩한 결과 파일의 리스트를 반환합니다.
Promise의 결과는 Blobs Array(지원되는 경우), 또는 {data:ArrayBuffer, extention: String}의 값을 가집니다.

```javascript
unpackToFiles(file).then(resultFiles=>{
	for(let unpackedFile of resultFiles) {
		/*여기에 당신의 코드*/
	}
);
```

### convertXnbData( buffer : ArrayBuffer ) : Object

xnb 파일의 데이터를 가진 ArrayBuffer를 읽어 결과값을 반환합니다.
unpackData의 결과와 동일합니다.

```javascript
const fileReader = new FileReader();
fileReader.readAsArrayBuffer(file);
fileReader.onload = function({target}){
	result = convertXnbData(target.result);
	/*여기에 당신의 코드*/
};
```

## License

This project is licensed under the LGPE 3.0 License - see the LICENSE file for details

## Used Libraries / References

All libraries here have been converted to es6 modules and used.

LZ4.js (https://github.com/Benzinga/lz4js/) 
libsquish (https://sourceforge.net/projects/libsquish/) - MIT License
XNBNode (https://github.com/draivin/XNBNode)
png.js (https://github.com/lukeapage/pngjs) - MIT License
