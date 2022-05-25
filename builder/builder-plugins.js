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

function makePlugins(production=false, es5=false)
{
	const shouldPrintComment = (val)=>{
		const regexp = new RegExp(`^\\* @(api|license)(?!\\S)`);
		return production ? false : regexp.test(val);
	}

	const commonPlugins = [
		removeDebug(),
		polyfill( { version: (es5 ? "es5" : "es2017") } ),
		babel({
			babelHelpers:'bundled',
			babelrc: false,
			exclude:'node_modules/**',
			...(es5 ? es5babelrc : babelrc),
			shouldPrintComment
		}),
		babelCleanup()
	];

	const es5Plugins = [
		nodeResolve(),
		commonjs()
	];
	const prodPlugins = [
		terser()
	];

	return [
		...(es5 ? es5Plugins : []),
		...commonPlugins,
		...(production ? prodPlugins : [])
	]
}

function makeBanners(production=false, includes={})
{
const licensesDict={
LZ4: ` * LZ4 decoder license : ICS
 * Original code : https://github.com/Benzinga/lz4js/`,
LZX: ` * LZX decoder license : LGPL 2.1
 * -----------------------------------------------------------------------------
 * This file is heavily based on MonoGame's implementation of their LzxDecoder attributed to Ali Scissons
 * which is derived from libmspack by Stuart Cole.
 *
 * (C) 2003-2004 Stuart Caie.
 * (C) 2011 Ali Scissons.
 * (C) 2017 James Stine.
 *
 * The LZX method was created by Johnathan Forbes and Tomi Poutanen, adapted by Microsoft Corporation.
 * 
 * GNU LESSER GENERAL PUBLIC LICENSE version 2.1
 * LzxDecoder is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License (LGPL) version 2.1 
 *
 * MICROSOFT PUBLIC LICENSE
 * This source code a derivative on LzxDecoder and is subject to the terms of the Microsoft Public License (Ms-PL). 
 *	
 * Redistribution and use in source and binary forms, with or without modification, 
 * is permitted provided that redistributions of the source code retain the above 
 * copyright notices and this file header. 
 *	
 * Additional copyright notices should be appended to the list above. 
 * 
 * For details, see <http://www.opensource.org/licenses/ms-pl.html>.
 *
 *
 * I made the mistake of not including this license years ago. Big thanks to everyone involved and license has now been
 * acknowleded properly as it should have been back in 2017.
 *
 * Resources:
 *
 * cabextract/libmspack - http://http://www.cabextract.org.uk/
 * MonoGame LzxDecoder.cs - https://github.com/MonoGame/MonoGame/blob/master/MonoGame.Framework/Content/LzxDecoder.cs
 * -----------------------------------------------------------------------------`,
DXT: ` * Libsquish license : MIT
 * -----------------------------------------------------------------------------
 *		Copyright (c) 2006 Simon Brown               si@sjbrown.co.uk
 *		Permission is hereby granted, free of charge, to any person obtaining
 *		a copy of this software and associated documentation files (the 
 *		"Software"), to	deal in the Software without restriction, including
 *		without limitation the rights to use, copy, modify, merge, publish,
 *		distribute, sublicense, and/or sell copies of the Software, and to 
 *		permit persons to whom the Software is furnished to do so, subject to 
 *		the following conditions:
 *		The above copyright notice and this permission notice shall be included
 *		in all copies or substantial portions of the Software.
 *		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 *		OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
 *		MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *		IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
 *		CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
 *		TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 *		SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *		
 *	--------------------------------------------------------------------------`
}
let licensesComments = [];
for(let key of Object.keys(licensesDict))
{
	if(includes[key] === true) licensesComments.push(licensesDict[key]);
}
return `/** 
 * xnb.js 1.1.0
 * made by Lybell( https://github.com/lybell-art/ )
 * This library is based on the XnbCli made by Leonblade.
 * 
 * xnb.js is licensed under the LGPL 3.0 License.
 * ${production ? "\n"+licensesComments.join("\n *\n") : ""}
*/
`;
}

export { makePlugins, makeBanners };