/* -----------------------------------------------------------------------------
	Copyright (c) 2006 Simon Brown                          si@sjbrown.co.uk
	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the 
	"Software"), to	deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to 
	permit persons to whom the Software is furnished to do so, subject to 
	the following conditions:
	The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	
   -------------------------------------------------------------------------- */

import {kDxt1, kDxt3, kDxt5,
	kColourIterativeClusterFit, kColourClusterFit, kColourRangeFit,
	kColourMetricPerceptual, kColourMetricUniform, kWeightColourByAlpha
} from "./constant.js";
import {Vec3, Vec4, computePCA} from "./math.js";
import {lookup_5_3, lookup_6_3, lookup_5_4, lookup_6_4} from "./lookup.js";
import {writeColourBlock3, writeColourBlock4} from "./colorBlock.js";

class ColorSet
{
	constructor(rgba, mask, flags)
	{
		/**
		 * this colorset's flags
		 * @public
		 * @type {Number}
		 */
		this.flags = flags;
		/**
		 * the number of colors
		 * @private
		 * @type {Number}
		 */
		this._count = 0;
		/**
		 * the number of colors
		 * @private
		 * @type {boolean}
		 */
		this._transparent = false;

		/**
		 * the indices of color
		 * @private
		 * @type {Array(Number)}
		 */
		this._remap = [];
		/**
		 * Weighted by how many colors there are
		 * @private
		 * @type {Array(Number)}
		 */
		this._weights = [];
		/**
		 * the color data
		 * @private
		 * @type {Array(Vec3)}
		 */
		this._points = [];

		const isDxt1 = ( (this.flags & kDxt1) != 0);
		const weightByAlpha = ( (this.flags & kWeightColourByAlpha ) != 0);

		// create the minimal set
		for( let i = 0; i < 16; i++ )
		{
			// check this pixel is enabled
			const bit = 1 << i;
			if( ( mask & bit ) == 0 )
			{
				this._remap[i] = -1;
				continue;
			}
		
			// check for transparent pixels when using dxt1
			if( isDxt1 && rgba[4*i + 3] < 128 )
			{
				this._remap[i] = -1;
				this._transparent = true;
				continue;
			}

			// loop over previous points for a match
			for( let j = 0;; j++ )
			{
				// allocate a new point
				if( j == i )
				{
					// normalise coordinates to [0,1]
					const r = rgba[4*i] / 255.0;
					const g = rgba[4*i + 1] / 255.0;
					const b = rgba[4*i + 2] / 255.0;
					
					// ensure there is always non-zero weight even for zero alpha
					const a = ( rgba[4*i + 3] + 1 ) / 256.0;

					// add the point
					this._points[this._count] = new Vec3( r, g, b );
					this._weights[this._count] = ( weightByAlpha ? a : 1.0 );
					this._remap[i] = this._count;
					
					// advance
					this._count++;
					break;
				}
			
				// check for a match
				const oldbit = 1 << j;
				const match = ( ( mask & oldbit ) != 0 )
					&& ( rgba[4*i] == rgba[4*j] )
					&& ( rgba[4*i + 1] == rgba[4*j + 1] )
					&& ( rgba[4*i + 2] == rgba[4*j + 2] )
					&& ( rgba[4*j + 3] >= 128 || !isDxt1 );
				if( match )
				{
					// get the index of the match
					const index = this._remap[j];
					
					// ensure there is always non-zero weight even for zero alpha
					const w = ( rgba[4*i + 3] + 1 ) / 256.0;

					// map to this point and increase the weight
					this._weights[index] += ( weightByAlpha ? w : 1.0 );
					this._remap[i] = index;
					break;
				}
			}
		}

		// square root the weights
		for( let i = 0; i < this._count; ++i )
			this._weights[i] = Math.sqrt( this._weights[i] );
	}

	get transparent()
	{
		return this._transparent;
	}
	get count()
	{
		return this._count;
	}
	get points()
	{
		return Object.freeze(this._points.slice());
	}
	get weights()
	{
		return Object.freeze(this._weights.slice());
	}

	/**
	 * @param {int} index no
	 * @param {Uint8Array} Colormap index to store the result
	 */
	remapIndicesSingle(singleIndex, target)
	{
		const result = this._remap.map((index)=>index===-1 ? 3 : singleIndex);
		target.forEach((_,i)=>target[i]=result[i]);
	}
	/**
	 * @example
	 * 	this.remap=[0,1,2,3, 2,2,3,4, 3,4,6,6, 7,5,5,0]
	 *  indexMap = [0,0,1,1,2,2,3,3]
	 *  target(result) => [0,0,1,1, 1,1,1,2, 1,1,3,3, 3,2,2,0]
	 * @param {Uint8Array} map of index numbers to fill
	 * @param {Uint8Array} Colormap index to store the result
	 */
	remapIndices(indexMap, target)
	{
		const result = this._remap.map((index)=>index===-1 ? 3 : indexMap[index]);
		target.forEach((_,i)=>target[i]=result[i]);
	}
}

class ColorFit
{
	constructor(colorSet)
	{
		this.colors = colorSet;
		this.flags = colorSet.flags;
	}
	compress(result, offset)
	{
		const isDxt1 = ( (this.flags & kDxt1) != 0);
		if(isDxt1) {
			this.compress3(result, offset);
			if (!this.colors.transparent) this.compress4(result, offset);
		}
		else this.compress4(result, offset);
	}
	compress3(result, offset){}
	compress4(result, offset){}
}

class SingleColourFit extends ColorFit
{
	constructor(colorSet)
	{
		super(colorSet);

		// grab the single colour
		const singleColor = colorSet.points[0];
		this.color = singleColor.colorInt;

		// private property
		this.start = new Vec3(0);
		this.end = new Vec3(0);
		this.index = 0;

		this.error = Infinity;
		this.bestError = Infinity;
	}
	compressBase(lookups, saveFunc)
	{
		this.computeEndPoints(lookups);

		if(this.error < this.bestError)
		{
			const indices = new Uint8Array(16);
			this.colors.remapIndicesSingle(this.index, indices);
			saveFunc(this.start, this.end, indices);

			this.bestError = this.error;
		}
	}
	compress3(result, offset)
	{
		const lookups = [lookup_5_3, lookup_6_3, lookup_5_3];
		const saveFunc = (start, end, indices) => writeColourBlock3(start, end, indices, result, offset);

		this.compressBase(lookups, saveFunc);
	}
	compress4(result, offset)
	{
		const lookups = [lookup_5_4, lookup_6_4, lookup_5_4];
		const saveFunc = (start, end, indices) => writeColourBlock4(start, end, indices, result, offset);

		this.compressBase(lookups, saveFunc);
	}
	computeEndPoints(lookups)
	{
		// check each index combination (endpoint or intermediate)
		this.error = Infinity;
		for( let index = 0; index < 2; index++ )
		{
			// check the error for this codebook index
			const sources = []; //source : [channel][start/end/error]
			let error = 0;
			for( let channel = 0; channel < 3; channel++ )
			{
				// grab the lookup table and index for this channel
				const lookup = lookups[channel]; //lookup : [rgb-raw index][startpoint/midpoint]
				const target = this.color[channel];
				
				// store a pointer to the source for this channel
				sources[channel] = lookup[target][index];
				
				// accumulate the error
				const diff = sources[channel][2];
				error += diff*diff;			
			}
			
			// keep it if the error is lower
			if( error < this.error )
			{
				this.start = new Vec3(
					sources[0][0]/31.0, 
					sources[1][0]/63.0, 
					sources[2][0]/31.0
				);
				this.end = new Vec3(
					sources[0][1]/31.0, 
					sources[1][1]/63.0, 
					sources[2][1]/31.0
				);
				this.index = 2*index ; // 0:startpoint, 2:midpoint
				this.error = error;
			}
		}
	}
}

class RangeFit extends ColorFit
{
	constructor(colorSet)
	{
		super(colorSet);

		this.metric = new Vec3(1);
		if( (this.flags & kColourMetricPerceptual) !== 0)
		{
			this.metric.set(0.2126, 0.7152, 0.0722);
		}
		
		// private property
		this.start = new Vec3(0);
		this.end = new Vec3(0);

		this.bestError = Infinity;

		//compute start&end points
		this.computePoints();
	}
	compressBase(codes, saveFunc)
	{
		const {points:values} = this.colors;

		let error = 0;

		// Map the closest code of each color
		const closest = values.map((color)=>{
			let minDist = Infinity;

			// find the closest code
			const packedIndex = codes.reduce((idx, code, j)=>{
				const dist = Vec3.sub(color, code).multVector(this.metric).lengthSq;

				if(dist >= minDist) return idx;
				minDist = dist;
				return j;
			}, 0);

			// accumulate the error
			error += minDist;

			// save the index
			return packedIndex;
		});

		// save this scheme if it wins
		if( error < this.bestError )
		{
			// remap the indices
			let indices = new Uint8Array(16);
			this.colors.remapIndices( closest, indices );
			
			// save the block
			saveFunc( this.start, this.end, indices );
			
			// save the error
			this.bestError = error;
		}
	}
	compress3(result, offset)
	{
		const codes=[
			this.start.clone(), 
			this.end.clone(), 
			Vec3.interpolate(this.start, this.end, 0.5)
		];

		const saveFunc = (start, end, indices) => writeColourBlock3(start, end, indices, result, offset);

		this.compressBase(codes, saveFunc);
	}
	compress4(result, offset)
	{
		const codes=[
			this.start.clone(), 
			this.end.clone(), 
			Vec3.interpolate(this.start, this.end, 1/3),
			Vec3.interpolate(this.start, this.end, 2/3),
		];

		const saveFunc = (start, end, indices) => writeColourBlock4(start, end, indices, result, offset);

		this.compressBase(codes, saveFunc);
	}
	computePoints()
	{
		const {count, points:values, weights} = this.colors;
		if(count <= 0) return;

		//dimension regression
		const principle = computePCA(values, weights);

		let start, end, min, max;

		start=end=values[0];
		min=max=Vec3.dot(start, principle);

		//compute the range
		for(let i=1; i<count; i++)
		{
			let value = Vec3.dot(values[i], principle);
			if(value < min)
			{
				start = values[i];
				min = value;
			}
			else if(value > max)
			{
				end = values[i];
				max = value;
			}
		}

		// clamp the output to [0, 1]
		start.clamp(0,1);
		end.clamp(0,1);

		// clamp to the grid and save
		this.start.x = Math.trunc( start.x * 31 + 0.5 ) / 31;
		this.start.y = Math.trunc( start.y * 63 + 0.5 ) / 63;
		this.start.z = Math.trunc( start.z * 31 + 0.5 ) / 31;
		this.end.x = Math.trunc( end.x * 31 + 0.5 ) / 31;
		this.end.y = Math.trunc( end.y * 63 + 0.5 ) / 63;
		this.end.z = Math.trunc( end.z * 31 + 0.5 ) / 31;
	}
}


class ClusterFit extends ColorFit
{
	constructor(colorSet)
	{
		// set the iteration count
		const kMaxIterations = 8;
		this.iterationCount = (colorSet.flags & kColourIterativeClusterFit) ? kMaxIterations : 1;

		// initialise the best error
		this.bestError = new Vec4( Infinity );

		// initialise the metric
		this.metric = new Vec4(1);
		if( (this.flags & kColourMetricPerceptual) !== 0)
		{
			this.metric.set(0.2126, 0.7152, 0.0722, 0);
		}

		// dimension regression
		const {points:values, weights} = this.colors;
		this.principle = computePCA(values, weights);

		// private property
		this.order = new Uint8Array(16 * kMaxIterations);
		this.pointsWeights=[]; //Array(Vec4)[16]
		this.xSum_wSum = new Vec4(0); //Vec4
	}

	constructOrdering(axis, iteration)
	{
		const currentOrder = this.makeOrder(axis);
		this.copyOrderToThisOrder(currentOrder, iteration)

		const uniqueOrder = this.checkOrderUnique(currentOrder, iteration);
		if(!uniqueOrder) return false;

		this.copyOrderWeight(currentOrder);
		return true;
	}
	makeOrder(axis)
	{
		const {count, points:values} = this.colors;

		// map dot products and stable sort
		// result : [1st index of color, 2nd index of color, ...]
		const dotProducts=values.map((color, i)=>Vec3.dot(color, axis));
		return Array.from({length:count},(_,i)=>i)
			.sort((a,b)=>{
				if(dotProducts[a]-dotProducts[b] != 0) return dotProducts[a]-dotProducts[b];
				return a-b;
			});
	}
	copyOrderToThisOrder(order, iteration)
	{
		//copy currentOrder array to this.order
		const orderOffset = iteration * 16;
		order.forEach((ord, i)=>{
			this.order[orderOffset + i] = ord;
		});
	}
	checkOrderUnique(order, iteration)
	{
		// check this ordering is unique
		const {count} = this.colors;

		for(let it =0; it<iteration; it++) 
		{
			let prevOffset = it * 16;
			let same = true;
			for(let i=0; i < count; i++) {
				if(order[i] !== this.order[prevOffset + i])
				{
					same = false;
					break;
				}
			}
			if(same) return false;
		}
		return true;
	}
	copyOrderWeight(order)
	{
		// copy the ordering and weight all the points
		const {count, points:unweighted, weights} = this.colors;
		for(let i=0; i<count; i++)
		{
			const j = order[i];
			const p = unweighted[j].toVec4(1);
			const w = new Vec4( weights[j] );
			const x = Vec4.multVector(p, w);
			this.pointsWeights[i] = x;
			this.xSum_wSum.addVector(x);
		}
	}
}


export {ColorSet, SingleColourFit, RangeFit};