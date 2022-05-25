import {makePlugins, makeBanners} from "./builder-plugins.js";

function header(licenseMap)
{
	return {
		renderChunk(code){
			return `${makeBanners(true, licenseMap)}
${code}`;
		}
	};
}

function buildMaker(srcBase, srcName, dist, licenseMap)
{
	return [
	// for es2017+ module
	{
		input: `${srcBase}/${srcName}.js`,
		output: [{
			banner: makeBanners(false),
			file: `${dist}.module.js`,
			format: 'esm'
		},
		{
			banner: makeBanners(false),
			file: `${dist}.cjs`,
			name: "XNB",
			format: 'cjs'
		},
		{
			banner: makeBanners(false),
			file: `${dist}.js`,
			name: "XNB",
			format: 'umd'
		}],
		plugins: makePlugins(false, false)
	},
	{
		input: `${srcBase}/${srcName}.js`,
		output: {
			file: `${dist}.min.js`,
			name: "XNB",
			format: 'umd'
		},
		plugins: [...makePlugins(true, false), header(licenseMap)]
	},

	// for es5(legacy)
	{
		input: `${srcBase}/es5.js`,
		output: {
			banner: makeBanners(false),
			file: `${dist}.es5.js`,
			name: "XNB",
			format: 'umd',
			indent: '\t'
		},
		plugins: makePlugins(false, true)
	},
	{
		input: `${srcBase}/es5.js`,
		output: {
			file: `${dist}.es5.min.js`,
			name: "XNB",
			format: 'umd',
			indent: '\t'
		},
		plugins: [...makePlugins(true, true), header(licenseMap)]
	} ];
}

function buildTargetMaker(target=-1)
{
	const targetArray = [
		["src", "xnb", "dist/xnb", {LZ4:true, LZX:true, DXT:true}],
		["src/core", "Xnb", "src/core/dist/core", {LZ4:true, LZX:true}],
		["src/readers", "readers", "src/readers/dist/readers", {DXT:true}]
	]

	if(target >= 0 ) return buildMaker(...targetArray[target]);
	return targetArray.map((paths)=>buildMaker(...paths)).flat();
}

const builds = buildTargetMaker(process.env.BUILD_MODULE);

export default builds;