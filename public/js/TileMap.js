/*global GMath */

"use strict";

function TileMap( opts )
{
	this.img = opts.tileImage;
	this.viewportWidth = opts.viewportWidth;
	this.viewportHeight = opts.viewportHeight;
	this.map = [
		'r-------7    ' ,
		'|       |    ' ,
		'L----7  |    ' ,
		'     |  L---7' ,
		'     |      |' ,
		'  r--J      |' ,
		'  L---------J'
	];
}

TileMap.prototype.render = function( ctx, xCam, yCam )
{
	var iw = this.img.width;
	var ih = this.img.height;
	var xStart = GMath.pmod(xCam, iw);
	if( xStart > 0 )
		xStart -= iw;
	var yStart = GMath.pmod(yCam, ih);
	if( yStart > 0 )
		yStart -= ih;
	var xCount = Math.ceil(this.viewportWidth / iw) + 1;
	var yCount = Math.ceil(this.viewportHeight / ih) + 1;

	var ix, iy, x, y;
	for( iy = 0; iy < yCount; ++iy )
	{
		for( ix = 0; ix < xCount; ++ix )
		{
			x = xStart + ix * iw;
			y = yStart + iy * ih;
			ctx.drawImage(this.img, x, y);
		}
	}
};

TileMap.prototype.resize = function( w, h )
{
	this.viewportWidth = w;
	this.viewportHeight = h;
};
