class Vec3
{
	constructor(x=0, y, z)
	{
		this._values = [];
		if(y === undefined && z === undefined) this._values = [x,x,x];
		else this._values = [x, y, z];
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
	normalize()
	{
		this._values[0] /= this.length;
		this._values[1] /= this.length;
		this._values[2] /= this.length;
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
	static proj(y, x)
	{
		return Vec3.multScalar(y, Vec3.dot(x,y) / Vec3.dot(y,y));
	}
}


export {Vec3, clamp};