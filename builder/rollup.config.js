import babel from '@rollup/plugin-babel';
import polyfill from './polyfills/makePolyfill.js';
import babelrc from './.babelrc.json';
import es5babelrc from './.babelrc.es5.json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {terser} from "rollup-plugin-terser";

function removeDebug() {
	return {
		resolveId(importee) {
			return importee.includes("Debug.js") ? "__empty__" : null;
		},
		load(id) {
			return (id === "__empty__") ? "export default {};" : null;
		},
		transform(code, filename) {
			code = code.replace(/\/\/ read the target platform\s+switch[\s\S]+found\.`\);\s+break;\s+}/mg, "");
			code = code.replace(/\/\/ read the XNB format version\s+switch[\s\S]+unknown\.`\);\s+break;\s+}/mg, "");
			code = code.replace(/Debug\(.+[\)];\n{0,1}/g, "");
			code = code.replace("import Debug from .*\n$", "");
			return {
				code: code,
				map: null
			};
		}
	}
}

function babelCleanup() {
	const doubleSpaces = / {2}/g;
	return {
		transform( code ) {
			code = code.replace( doubleSpaces, '\t' );
			return {
				code: code,
				map: null
			};
		}
	};
}

function buildMaker(srcBase, srcName, dist)
{
	return [
	// for es2017+ module
	{
		input: `${srcBase}/${srcName}.js`,
		output: [{
			file: `${dist}.module.js`,
			format: 'esm'
		},
		{
			file: `${dist}.cjs`,
			name: "XNB",
			format: 'cjs'
		},
		{
			file: `${dist}.js`,
			name: "XNB",
			format: 'umd'
		}],
		plugins: [
			removeDebug(),
			polyfill({version:"es2017"}),
			babel({
				babelHelpers:'bundled',
				babelrc: false,
				...babelrc,
				shouldPrintComment:(val)=>/^\* @(api|license)(?!\S)/.test(val)
			}),
			babelCleanup()
		]
	},
	{
		input: `${srcBase}/${srcName}.js`,
		output: {
			file: `${dist}.min.js`,
			name: "XNB",
			format: 'umd'
		},
		plugins: [
			removeDebug(),
			polyfill({version:"es2017"}),
			babel({
				babelHelpers:'bundled',
				babelrc: false,
				...babelrc
			}),
			babelCleanup(),
			terser()
		]
	},

	// for es5(legacy)
	{
		input: `${srcBase}/es5.js`,
		output: {
			file: `${dist}.es5.js`,
			name: "XNB",
			format: 'umd',
			indent: '\t'
		},
		plugins: [
			nodeResolve(),
			commonjs(),
			removeDebug(),
			polyfill(),
			babel({
				babelHelpers:'bundled',
				babelrc: false,
				exclude:'node_modules/**',
				...es5babelrc,
				shouldPrintComment:(val)=>val.startsWith("* @api")
			}),
			babelCleanup()
		]
	},
	{
		input: `${srcBase}/es5.js`,
		output: {
			file: `${dist}.es5.min.js`,
			name: "XNB",
			format: 'umd',
			indent: '\t'
		},
		plugins: [
			nodeResolve(),
			commonjs(),
			removeDebug(),
			polyfill(),
			babel({
				babelHelpers:'bundled',
				babelrc: false,
				exclude:'node_modules/**',
				...es5babelrc
			}),
			babelCleanup(),
			terser()
		]
	} ];
}

function buildTargetMaker(target=-1)
{
	const targetArray = [
		["src", "xnb", "dist/xnb"],
		["src/core", "Xnb", "src/core/dist/core"],
		["src/readers", "readers", "src/readers/dist/readers"],
//		["src/plugins-stardewvalley/", "readers", "src/plugins-stardewvalley/dist"]
	]

	if(target >= 0 ) return buildMaker(...targetArray[target]);
	return targetArray.map((paths)=>buildMaker(...paths)).flat();
}

const builds = buildTargetMaker(process.env.BUILD_MODULE);

export default builds;