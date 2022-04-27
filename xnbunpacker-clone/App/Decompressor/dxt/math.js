import {dominentPrincipalVector} from "./eigs.js";

class Vec3
{
	constructor(x=0, y=x, z=x)
	{
		this._values = [x, y, z];
	}
	get x()
	{
		return this._values[0];
	}
	get y()
	{
		return this._values[1];
	}
	get z()
	{
		return this._values[2];
	}
	set x(value)
	{
		this._values[0]=value;
	}
	set y(value)
	{
		this._values[1]=value;
	}
	set z(value)
	{
		this._values[2]=value;
	}
	get length()
	{
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	}
	get lengthSq()
	{
		return this.x*this.x + this.y*this.y + this.z*this.z;
	}
	get normalized()
	{
		if(this.length === 0) return null;
		return Vec3.multScalar(this, 1/this.length);
	}
	get colorInt()
	{
		const floatToInt = (value)=>{
			const result = parseInt( (value * 255) + 0.5 );
			return Math.max(Math.min(result, 255), 0);
		}
		return this._values.map(floatToInt);
	}
	clone()
	{
		return new Vec3(this.x, this.y, this.z);
	}
	set(x, y=x, z=x)
	{
		this._values[0]=x;
		this._values[1]=y;
		this._values[2]=z;

		return this;
	}
	toVec4(w=1)
	{
		return new Vec4(this.x, this.y, this.z, w);
	}
	addVector(v)
	{
		this._values[0] += v.x;
		this._values[1] += v.y;
		this._values[2] += v.z;

		return this;
	}
	addScaledVector(v, scalar)
	{
		this._values[0] += v.x * scalar;
		this._values[1] += v.y * scalar;
		this._values[2] += v.z * scalar;

		return this;
	}
	mult(scalar)
	{
		this._values[0] *= scalar;
		this._values[1] *= scalar;
		this._values[2] *= scalar;

		return this;
	}
	multVector(vec)
	{
		this._values[0] *= vec.x;
		this._values[1] *= vec.y;
		this._values[2] *= vec.z;

		return this;
	}
	clamp(min, max)
	{
		const clamper = (v)=>(min > v) ? min : ( (max < v) ? max : v );
		this._values[0] = clamper(this._values[0]);
		this._values[1] = clamper(this._values[1]);
		this._values[2] = clamper(this._values[2]);

		return this;
	}
	normalize()
	{
		this._values[0] /= this.length;
		this._values[1] /= this.length;
		this._values[2] /= this.length;

		return this;
	}
	toString()
	{
		return `Vec3( ${this._values.join(", ")} )`;
	}
	static add(a, b)
	{
		return new Vec3(a.x+b.x, a.y+b.y, a.z+b.z);
	}
	static sub(a, b)
	{
		return new Vec3(a.x-b.x, a.y-b.y, a.z-b.z);
	}
	static dot(a, b)
	{
		return (a.x*b.x)+(a.y*b.y)+(a.z*b.z);
	}
	static multScalar(a, scalar)
	{
		return new Vec3(a.x*scalar, a.y*scalar, a.z*scalar);
	}
	static multVector(a, b)
	{
		return new Vec3(a.x*b.x, a.y*b.y, a.z*b.z);
	}
	static interpolate(a, b, p)
	{
		let a_=Vec3.multScalar(a, 1-p);
		let b_=Vec3.multScalar(b, p);
		return Vec3.add(a_, b_);
	}
}


class Vec4
{
	constructor(x=0, y=x, z=x, w=x)
	{
		this._values = [x, y, z, w];
	}
	get x()
	{
		return this._values[0];
	}
	get y()
	{
		return this._values[1];
	}
	get z()
	{
		return this._values[2];
	}
	get w()
	{
		return this._values[3];
	}
	set x(value)
	{
		this._values[0]=value;
	}
	set y(value)
	{
		this._values[1]=value;
	}
	set z(value)
	{
		this._values[2]=value;
	}
	set w(value)
	{
		this._values[3]=value;
	}
	get length()
	{
		return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
	}
	get lengthSq()
	{
		return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;
	}
	get normalized()
	{
		if(this.length === 0) return null;
		return Vec4.multScalar(this, 1/this.length);
	}
	get xyz()
	{
		return new Vec3(this.x, this.y, this.z);
	}
	clone()
	{
		return new Vec4(this.x, this.y, this.z, this.w);
	}
	set(x, y=x, z=x, w=x)
	{
		this._values[0]=x;
		this._values[1]=y;
		this._values[2]=z;
		this._values[3]=w;

		return this;
	}
	toVec3()
	{
		return this.xyz;
	}
	addVector(v)
	{
		this._values[0] += v.x;
		this._values[1] += v.y;
		this._values[2] += v.z;
		this._values[3] += v.w;

		return this;
	}
	addScaledVector(v, scalar)
	{
		this._values[0] += v.x * scalar;
		this._values[1] += v.y * scalar;
		this._values[2] += v.z * scalar;
		this._values[3] += v.w * scalar;

		return this;
	}
	mult(scalar)
	{
		this._values[0] *= scalar;
		this._values[1] *= scalar;
		this._values[2] *= scalar;
		this._values[3] *= scalar;

		return this;
	}
	multVector(vec)
	{
		this._values[0] *= vec.x;
		this._values[1] *= vec.y;
		this._values[2] *= vec.z;
		this._values[3] *= vec.w;

		return this;
	}
	clamp(min, max)
	{
		const clamper = (v)=>(min > v) ? min : ( (max < v) ? max : v );
		this._values[0] = clamper(this._values[0]);
		this._values[1] = clamper(this._values[1]);
		this._values[2] = clamper(this._values[2]);
		this._values[3] = clamper(this._values[3]);

		return this;
	}
	normalize()
	{
		this._values[0] /= this.length;
		this._values[1] /= this.length;
		this._values[2] /= this.length;
		this._values[3] /= this.length;

		return this;
	}
	toString()
	{
		return `Vec4( ${this._values.join(", ")} )`;
	}
	static add(a, b)
	{
		return new Vec4(a.x+b.x, a.y+b.y, a.z+b.z, a.w+b.w);
	}
	static sub(a, b)
	{
		return new Vec4(a.x-b.x, a.y-b.y, a.z-b.z, a.w-b.w);
	}
	static dot(a, b)
	{
		return (a.x*b.x)+(a.y*b.y)+(a.z*b.z)+(a.w*b.w);
	}
	static multScalar(a, scalar)
	{
		return new Vec4(a.x*scalar, a.y*scalar, a.z*scalar, a.w*scalar);
	}
	static multVector(a, b)
	{
		return new Vec4(a.x*b.x, a.y*b.y, a.z*b.z, a.w*b.w);
	}
	static interpolate(a, b, p)
	{
		let a_=Vec4.multScalar(a, 1-p);
		let b_=Vec4.multScalar(b, p);
		return Vec4.add(a_, b_);
	}
	// returns a*b + c
	static multiplyAdd(a, b, c)
	{
		return new Vec4(
			a.x*b.x+c.x, 
			a.y*b.y+c.y,
			a.z*b.z+c.z,
			a.w*b.w+c.w);
	}
	// returns c - a*b
	static negativeMultiplySubtract(a, b, c)
	{
		return new Vec4(
			c.x-a.x*b.x, 
			c.y-a.y*b.y,
			c.z-a.z*b.z,
			c.w-a.w*b.w);
	}
	static reciprocal(v)
	{
		return new Vec4(1/v.x, 1/v.y, 1/v.z, 1/v.w)
	}
	static truncate(v)
	{
		return new Vec4(
			Math.trunc(v.x),
			Math.trunc(v.y),
			Math.trunc(v.z),
			Math.trunc(v.w)
		);
	}
	static compareAnyLessThan(left, right)
	{
		return (left.x < right.x
			|| left.y < right.y
			|| left.z < right.z
			|| left.w < right.w);
	}
}




function computeWeightedCovariance(values, weights)
{
	//compute the mean vector
	let total = 0;
	let mean = values.reduce((sum, value, i)=>{
		total += weights[i];
		sum.addScaledVector(value, weights[i]);
		return sum;
	}, new Vec3(0));
	mean.mult(1/total);
	
	//compute the covariance matrix
	//sigma( (x-m)*(x-m)^T )

	// [0(xx) 1(xy) 2(xz)]
	// [1(xy) 3(yy) 4(yz)]
	// [2(xz) 4(yz) 5(zz)]
	let covariance = values.reduce((sum, value, i)=>{
		let weight = weights[i];
		let v = Vec3.sub(value, mean);
		sum[0][0] += v.x * v.x * weight; sum[0][1] += v.x * v.x * weight; sum[0][2] += v.x * v.z * weight;
		sum[1][1] += v.y * v.y * weight; sum[1][2] += v.y * v.z * weight; sum[2][2] += v.z * v.z * weight;

		return sum;
	}, [[0,0,0],
		[0,0,0],
		[0,0,0]]);

	//post-processing
	covariance[1][0] = covariance[0][1];
	covariance[2][0] = covariance[0][2];
	covariance[2][1] = covariance[1][2];
	// there is no need to divide by total since the eigenvector of the scalar multiplied matrix
	// is the same as the eigenvector of the original matrix.

	return covariance;
}

function computePCA(values, weights)
{
	const covariance = computeWeightedCovariance(values, weights);
	return new Vec3(...dominentPrincipalVector(covariance) );
}

export {Vec3, Vec4, computePCA};