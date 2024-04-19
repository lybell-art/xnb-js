import {makePlugins, makeBanners} from "./builder-plugins.js";

function header()
{
	return {
		renderChunk(code){
			return `/** 
 * @xnb/stardewvalley 1.3.3
 * made by Lybell( https://github.com/lybell-art/ )
 * special thanks to Concernedape(Stardew Valley Producer), 진의(Unoffical XnbCli updater)
 * 
 * xnb.js is licensed under the LGPL 3.0 License.
 * 
*/
${code}`;
		}
	};
}

function replaceDependency()
{
	return {
		transform(code) {
			code = code.replace('from "../../readers/readers.js"; //@xnb-js/readers', 'from "@xnb-js/readers";');
			return {
				code: code,
				map: null
			};
		}
	}
}

function rejoinDependency()
{
	return {
		renderChunk(code) {
			code = code.replace('@xnb-js/readers', '../../readers/xnb-readers.module.js');
			return code;
		}
	}
}


function buildMaker(srcBase, srcName, distNode, distWeb)
{
	return [
	// for es2017+ module
	{
		input: `${srcBase}/${srcName}.js`,
		output: [{
			file: `${distNode}.module.js`,
			format: 'esm'
		},
		{
			file: `${distNode}.cjs`,
			name: "XNB",
			format: 'cjs'
		},
		{
			file: `${distNode}.js`,
			name: "XNB",
			format: 'umd',
			globals: {
				"@xnb-js/readers": 'XNB'
			}
		}],
		external: ['@xnb-js/readers'],
		plugins: [
			replaceDependency(),
			...makePlugins(false, false), 
			header()
		],
		treeshake: false
	},
	{
		input: `${srcBase}/${srcName}.js`,
		output: {
			file: `${distNode}.min.js`,
			name: "XNB",
			format: 'umd',
			globals: {
				"@xnb-js/readers": 'XNB'
			}
		},
		external: ['@xnb-js/readers'],
		plugins: [
			replaceDependency(),
			...makePlugins(true, false), 
			header()
		],
		treeshake: false
	},

	// dist web
	{
		input: `${srcBase}/${srcName}.js`,
		output: [{
			file: `${distWeb}.module.js`,
			format: 'esm'
		}],
		external: ['@xnb-js/readers'],
		plugins: [
			replaceDependency(),
			...makePlugins(false, false), 
			rejoinDependency(),
			header()
		],
		treeshake: false
	},
	{
		input: `${srcBase}/${srcName}.js`,
		output: {
			file: `${distWeb}.min.js`,
			name: "XNB",
			format: 'umd',
			globals: {
				"@xnb-js/readers": 'XNB'
			}
		},
		external: ['@xnb-js/readers'],
		plugins: [
			replaceDependency(),
			...makePlugins(true, false), 
			header()
		],
		treeshake: false
	},
	{
		input: `${srcBase}/${srcName}.js`,
		output: {
			file: `${distWeb}.es5.min.js`,
			name: "XNB",
			format: 'umd',
			globals: {
				"@xnb-js/readers": 'XNB'
			}
		},
		external: ['@xnb-js/readers'],
		plugins: [
			replaceDependency(),
			...makePlugins(true, true),
			header()
		],
		treeshake: false
	},

	];
}

function buildTargetMaker(target=-1)
{
	const targetArray = [
		["src/plugins-stardewvalley", 
		"index", 
		"src/plugins-stardewvalley/dist/index", 
		"dist/plugins/stardewvalley/index"]
	]

	if(target >= 0 ) return buildMaker(...targetArray[target]);
	return targetArray.map((paths)=>buildMaker(...paths)).flat();
}

const builds = buildTargetMaker(process.env.BUILD_MODULE);

export default builds;