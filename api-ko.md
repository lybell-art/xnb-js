xnb.js api
=============
xnb.js의 사용법 및 프로그래밍 인터페이스를 다룹니다.
## Unpacking
### unpackToXnbData( file : File/Buffer )
- ``file`` (File / Buffer) : 언팩할 xnb 파일
- Returns : Promise - 언팩한 XnbData를 반환합니다.

xnb 파일을 비동기적으로 읽은 뒤 헤더, 리더가 포함된 XnbData를 반환합니다.
### unpackToContent( file : File/Buffer )
- ``file`` (File / Buffer) : 언팩할 xnb 파일
- Returns : Promise - 언팩한 XnbContent를 반환합니다.

xnb 파일을 비동기적으로 읽은 뒤 콘텐츠 데이터만 들어 있는 XnbContent를 반환합니다.
### unpackToFiles( file : File/Buffer, config : Object )
- ``file`` (File / Buffer) : 언팩할 xnb 파일
- ``config`` (Object) : 컨피그 설정
	- ``yaml`` (Boolean) : 헤더 json 파일을 yaml 형식으로 변환합니다. XnbExtract와 호환됩니다. 
	- ``contentOnly`` (Boolean) : 헤더 데이터를 제외한 컨텐츠 파일만 반환합니다.
	- ``fileName`` (String) : 반환할 파일의 이름입니다.
- Returns : Promise - 언팩한 결과 파일 데이터가 있는 Blob 배열을 반환합니다.

xnb 파일을 비동기적으로 읽은 뒤 Blob 배열을 반환합니다. 텍스트 데이터는 json 형식으로 반환됩니다.
config 매개변수에서 ``yaml``과 ``contentOnly``가 전부 ``true``이면 ``contentOnly``를 우선합니다.
배열의 각 원소는 `{data, extension}`으로 구성된 Object입니다. data는 언팩된 파일의 실제 데이터로, Blob 오브젝트(브라우저 환경) 혹은 Uint8Array(node.js 환경)이며, extension은 언팩된 파일의 확장자입니다.
### bufferToXnb( buffer : ArrayBuffer )
- ``buffer`` (ArrayBuffer) : xnb 파일의 바이너리 데이터
- Retrns : XnbData

xnb 파일의 버퍼를 받아 헤더, 리더가 포함된 XnbData를 반환합니다.
### bufferToContents( buffer : ArrayBuffer )
- ``buffer`` (ArrayBuffer) : xnb 파일의 바이너리 데이터
- Retrns : XnbContent

xnb 파일의 버퍼를 받아 콘텐츠 데이터만 들어 있는 XnbContent를 반환합니다.
### xnbDataToContent( loadedXnb : XnbData )
- ``loadedXnb`` (XnbData) : 헤더가 포함된 json 오브젝트
- Returns : XnbContent

XnbData를 XnbContent로 변환합니다.
### xnbDataToFiles( xnbObject : XnbData, config : Object )
- ``file`` (File / Buffer) : 언팩할 xnb 파일
- ``config`` (Object) : 컨피그 설정
	- ``yaml`` (Boolean) : 헤더 json 파일을 yaml 형식으로 변환합니다. XnbExtract와 호환됩니다. 
	- ``contentOnly`` (Boolean) : 헤더 데이터를 제외한 컨텐츠 파일만 반환합니다.
	- ``fileName`` (String) : 반환할 파일의 이름입니다.
- Returns : Array - 언팩한 결과 파일 데이터가 있는 Blob 배열을 반환합니다.

XnbData를 Blob 배열로 반환합니다. 형식은 unpackToFiles과 동일합니다.

## Packing

### pack( files : Flielist/Array, configs : Object )
- ``files`` (Filelist/Array) : xnb로 묶을 파일의 전체 리스트. json 파일 혹은 yaml 파일이 포함되어 있어야 합니다.
- ``configs`` (Object) : 컨피그 설정
	- ``debug`` (Boolean) : `true`로 설정할 시, 모든 파일의 성공 및 실패 결과가 반환됩니다.
	
패킹할 파일들이 들어 있는 리스트를 받아, 각각의 파일들을 xnb 파일로 변환합니다. 헤더의 정보가 들어 있는 json 파일 혹은 yaml 파일(XnbExtract와 호환됨)이 포함되어 있어야 합니다.
Pack 함수는 브라우저 환경에서는 `<input type="file">` 엘리먼트의 `files`를 바로 넣을 수 있으나, node.js 환경에서는 `FileList` 객체가 없으므로, 각 원소가 `{name, data}` 오브젝트인 배열을 매개변수로 넣어야 합니다. `name`은 파일의 이름을, `data`는 파일의 실제 바이너리 버퍼를 의미합니다.
node.js 환경에서 pack 함수를 사용하기 위해서는 다음의 예제를 참조하십시오.
```js
const files = await readdir(input);
const fileList = [];

// make fileList
for (let name of files)
{
	const readPath = path.resolve(input, name);
	const data = await readFile(readPath);
	fileList.push({name, data});
}

// pack to xnb data
const result = await pack(fileList);
console.log(result);
```

## Data Structure
### XnbData
XnbData 객체는 Xnb 파일에서 추출된 헤더와 리더 정보, 컨텐츠가 포함된 오브젝트입니다. worker를 이용해서 데이터를 언팩할 때 결과값 json 데이터를 XnbData로 변환할 수 있습니다.
#### XnbData( header : Object, readers : Array, contents : Object )
- `header` (Object) : xnb의 헤더
	- `target` (String) : xnb의 타겟. 'w', 'm', 'x', 'a', 'i' 중 하나여야 합니다.
	- `formatVersion` (Number) : xnb의 포맷 버전. 3,4,5 중 하나여야 합니다.
	- `hidef` (Boolean) : xnb가 구동될 XNA의 그래픽 프로필입니다. true면 HiDef를, false면 Reach를 의미합니다.
	- `compressed` (Boolean/Number) : xnb의 압축 여부를 의미합니다. 128(LZX 압축) 또는 64(LZ4 압축)으로 명시할 수 있습니다.
- `readers` (Array) : xnb의 리더 데이터
- `contents` (Object) : xnb의 실제 컨텐츠 데이터

새로운 XnbData 객체를 생성합니다.
#### XnbData.prototype.target
xnb의 타겟 플랫폼을 반환합니다.
#### XnbData.prototype.formatVersion
xnb의 포맷 버전을 반환합니다.
#### XnbData.prototype.hidef
xnb의 hiDef 모드 여부를 반환합니다.
#### XnbData.prototype.compressed
xnb의 압축 여부를 반환합니다.
#### XnbData.prototype.contentType
xnb의 컨텐츠 타입을 반환합니다. 컨텐츠 타입은 다음의 5개 중 하나가 될 수 있습니다.
| 컨텐츠 타입 | 설명 |
|--|--|
| Texture2D | 텍스처 데이터입니다. 게임의 스프라이트 등이 포함됩니다. |
| TBin | 맵 파일입니다. |
| Effect | 이펙트 데이터입니다. |
| BMFont | 폰트 데이터입니다. |
| JSON | 오브젝트 데이터입니다. 게임의 아이템 목록, 대사 등 데이터가 포함됩니다. |
#### XnbData.prototype.rawContent
xnb의 실제 컨텐츠를 반환합니다. XnbData.prototype.content에 export가 포함되어 있으면(Texture2D, TBin, Effect, BMFont) 해당 컨텐츠의 바이너리를 반환하고, 그 외에는 json 데이터를 반환합니다. 
Texture2D 타입의 컨텐츠는 png 형식으로 압축되지 않은 색상 데이터가 반환됩니다.
#### XnbData.prototype.stringify()
오브젝트를 json 문자열로 변환합니다.

### XnbContent
XnbContent 객체는 Xnb 파일에서 추출된 컨텐츠만 포함된 오브젝트입니다. 
#### XnbContent.prototype.type
xnb의 컨텐츠 타입을 반환합니다.
#### XnbContent.prototype.content
xnb의 실제 컨텐츠 데이터를 Blob/Uint8Array 형식으로 반환합니다. 
Texture2D 타입의 컨텐츠는 png 형식으로 압축된 데이터가 반환됩니다. 브라우저 환경에서 Blob URL을 사용하여 이미지를 보여줄 때 쓸 수 있습니다.