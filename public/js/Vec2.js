"use strict";

/**  Simple 2D Vector class */
var Vec2 = function( x, y )
{
	this.x = x || 0.0;
	this.y = y || 0.0;
};

//  Static methods
Vec2.len = function( x, y )
{
	return Math.sqrt(x * x + y * y);
};

Vec2.angle = function( x, y )
{
	return Math.atan2(y, x);
};

//  Instance methods
Vec2.prototype.set = function( x, y )
{
	this.x = x; this.y = y;
};

Vec2.prototype.copy = function( v )
{
	this.x = v.x; this.y = v.y;
	return this;
};

Vec2.prototype.len = function()
{
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vec2.prototype.dot = function( v )
{
	return this.x * v.x + this.y * v.y;
};

Vec2.prototype.det = function( v )
{
	return this.x * v.y - this.y * v.x;
};

Vec2.prototype.rotate = function( r )
{
	var x = this.x,
		y = this.y,
		c = Math.cos(r),
		s = Math.sin(r);
	this.x = x * c - y * s;
	this.y = x * s + y * c;
};

Vec2.prototype.angle = function()
{
	return Math.atan2(this.y, this.x);
};

Vec2.prototype.setLen = function( l )
{
	var s = this.len();
	if( s > 0.0 )
	{
		s = l / s;
		this.x *= s;
		this.y *= s;
	}
	else
	{
		this.x = l;
		this.y = 0.0;
	}
};

Vec2.prototype.normalize = function()
{
	this.setLen(1.0);
};
