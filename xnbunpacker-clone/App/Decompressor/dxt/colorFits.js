/* -----------------------------------------------------------------------------
	Copyright (c) 2006 Simon Brown                          si@sjbrown.co.uk
	Copyright (c) 2007 Ignacio Castano                   icastano@nvidia.com
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

		// clamp to the grid and save
		this.start = start.clampGrid().clone();
		this.end = end.clampGrid().clone();
	}
}


class ClusterFit extends ColorFit
{
	constructor(colorSet)
	{
		super(colorSet);

		// set the iteration count
		const kMaxIterations = 8;
		this.iterationCount = (colorSet.flags & kColourIterativeClusterFit) ? kMaxIterations : 1;

		// initialise the best error
		this.bestError = Infinity;

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

	/*
	 * main Logics
	 */
	constructOrdering(axis, iteration)
	{
		const currentOrder = this.makeOrder(axis);
		this.copyOrderToThisOrder(currentOrder, iteration)

		const uniqueOrder = this.checkOrderUnique(currentOrder, iteration);
		if(!uniqueOrder) return false;

		this.copyOrderWeight(currentOrder);

		return true;
	}
	compress3(result, offset)
	{
		const aabbx = ([part0, , part1, part2])=>{
			const const1_2 = new Vec4(1/2, 1/2, 1/2, 1/4);

			const alphax_sum = Vec4.multiplyAdd( part1, const1_2, part0 );
			const alpha2_sum = alphax_sum.splatW;

			const betax_sum = Vec4.multiplyAdd( part1, const1_2, part2 );
			const beta2_sum = betax_sum.splatW;

			const alphabeta_sum = Vec4.multVector(part1, const1_2).splatW;

			return {
				ax:alphax_sum,
				aa:alpha2_sum,
				bx:betax_sum,
				bb:beta2_sum,
				ab:alphabeta_sum
			}
		};
		const saveFunc = (start, end, indices)=>writeColourBlock3(start, end, indices, result, offset);
		this.compressBase(aabbx, saveFunc, 2);
	}
	compress4(result, offset)
	{
		const aabbx = ([part0, part1, part2, part3])=>{
			const const1_3 = new Vec4(1/3, 1/3, 1/3, 1/9);
			const const2_3 = new Vec4(2/3, 2/3, 2/3, 4/9);
			const const2_9 = new Vec4(2/9);

			const alphax_sum = Vec4.multiplyAdd( part2, const1_3, Vec4.multiplyAdd( part1, const2_3, part0 ) );
			const alpha2_sum = alphax_sum.splatW;
			
			const betax_sum = Vec4.multiplyAdd( part1, const1_3, Vec4.multiplyAdd( part2, const2_3, part3 ) );
			const beta2_sum = betax_sum.splatW;
			
			const alphabeta_sum = Vec4.multVector(const2_9, Vec4.add(part1, part2)).splatW;

			return {
				ax:alphax_sum,
				aa:alpha2_sum,
				bx:betax_sum,
				bb:beta2_sum,
				ab:alphabeta_sum
			}
		};
		const saveFunc = (start, end, indices)=>writeColourBlock4(start, end, indices, result, offset);
		this.compressBase(aabbx, saveFunc, 3);
	}
	compressBase(aabbFunc, saveFunc, repeater=2)
	{
		// prepare an ordering using the principle axis
		this.constructOrdering(this.principle, 0);

		// check all possible clusters and iterate on the total order
		let best = {
			start : new Vec4(0),
			end : new Vec4(0),
			error : this.bestError,
			iteration : 0,
			bestI : 0,
			bestJ : 0,
		};
		if(repeater === 3) best.bestK = 0;

		// inner least squares terms function
		const leastSquares = (parts, internalIndices)=>{
			const aabbx = aabbFunc(parts);

			const internalBest = this.computeOptimalPoints(aabbx);

			if(internalBest.error < best.error)
			{
				// keep the solution if it wins
				best = {...internalBest, ...internalIndices};
				return true;
			}
			return false;
		};
		
		// loop over iterations (we avoid the case that all points in first or last cluster)
		for( let iterationIndex = 0;; )
		{
			this.clusterIterate(iterationIndex, leastSquares, repeater);

			// stop if we didn't improve in this iteration
			if( best.iteration != iterationIndex ) break;
				
			// advance if possible
			iterationIndex++;
			if( iterationIndex == this.iterationCount ) break;
				
			// stop if a new iteration is an ordering that has already been tried
			const newAxis = Vec4.sub( best.end, best.start ).xyz;
			if( !this.constructOrdering( newAxis, iterationIndex ) ) break;
		}

		// save the block if win
		if(best.error < this.bestError) this.saveBlock(best, saveFunc);
	}

	/*
	 * for constructOrdering function
	 */
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
		this.xSum_wSum.set(0);
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

	/*
	 * for compress function
	 */
	computeOptimalPoints(vectorPoint)
	{
		// constant vectors
		const {ax, bx, aa, bb, ab} = vectorPoint;

		// compute the least-squares optimal points
		const factor = Vec4.negativeMultiplySubtract( ab, ab, Vec4.multVector(aa,bb) ).reciprocal();
		let a = Vec4.negativeMultiplySubtract( bx, ab, Vec4.multVector(ax,bb) ).multVector(factor);
		let b = Vec4.negativeMultiplySubtract( ax, ab, Vec4.multVector(bx,aa) ).multVector(factor);

		// clamp to the grid
		a.clampGrid();
		b.clampGrid();
		
		let error = this.computeError({a, b, ...vectorPoint});
		
		return {start:a, end:b, error};
	}
	computeError({a, b, ax, bx, aa, bb, ab})
	{
		const two = new Vec4(2);

		// compute the error (we skip the constant xxsum)
		const e1 = Vec4.multiplyAdd( Vec4.multVector(a, a), aa, Vec4.multVector(b,b).multVector(bb) );
		const e2 = Vec4.negativeMultiplySubtract( a, ax, Vec4.multVector(a,b).multVector(ab) );
		const e3 = Vec4.negativeMultiplySubtract( b, bx, e2 );
		const e4 = Vec4.multiplyAdd( two, e3, e1 );

		// apply the metric to the error term
		const e5 = Vec4.multVector(e4, this.metric);
		return e5.x + e5.y + e5.z;
	}
	saveBlock(best, writeFunc)
	{
		const {count} = this.colors;
		const {
			start, end, iteration, error,
			bestI, bestJ, bestK=-1
		}=best;
		const orderOffset = iteration * 16;

		// remap the indices
		const unordered = new Uint8Array(16);
		const mapper = (m)=>{
			if(m < bestI) return 0;
			if(m < bestJ) return 2;
			if(m < bestK) return 3;
			return 1;
		}
		for(let i=0; i<count; i++)
		{
			unordered[ this.order[orderOffset + i] ] = mapper(i);
		}

		const bestIndices = new Uint8Array(16);
		this.colors.remapIndices(unordered, bestIndices);

		// save the block
		writeFunc(start.xyz, end.xyz, bestIndices);

		// save the error
		this.bestError = error;
	}

	clusterIterate(index, func, iterCount = 2)
	{
		const {count} = this.colors;
		const indexMapper = (i, j, k)=>{
			const mapper = {
				bestI:i,
				bestJ:( iterCount === 2 ? k : j ),
				iteration : index
			};
			if(iterCount === 3) mapper.bestK = k;
			return mapper;
		};

		// first cluster [0,i) is at the start
		let part0 = new Vec4( 0.0 );
		for( let i = 0; i < count; i++ )
		{
			// second cluster [i,j) is half along
			let part1 = new Vec4( 0.0 );
			for( let j = i;; )
			{
				// third cluster [j,k) is two thirds along
				let preLastPart = ( j == 0 ) ? this.pointsWeights[0].clone() : new Vec4(0.0);
				const kmin = ( j == 0 ) ? 1 : j;
				for( let k = kmin;; )
				{
					// last cluster [k,count) is at the end
					const restPart = Vec4.sub(this.xSum_wSum, preLastPart).subVector(part1).subVector(part0);

					func([part0, part1, preLastPart, restPart], indexMapper(i, j, k));

					// advance
					if( k == count ) break;
					preLastPart.addVector(this.pointsWeights[k]);
					k++;
				}

				// if iterCount === 2(=using Compress3), j iteration is not used
				if(iterCount === 2) break;
				
				// advance
				if(j === count) break;
				part1.addVector(this.pointsWeights[j]);
				j++;
			}
			// advance
			part0.addVector(this.pointsWeights[i]);
		}
	}
}


export {ColorSet, SingleColourFit, RangeFit, ClusterFit};