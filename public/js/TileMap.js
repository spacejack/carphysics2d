/*global GMath */

"use strict";

function TileMap(opts) {
  this.img = opts.tileImage;
  this.viewportWidth = opts.viewportWidth;
  this.viewportHeight = opts.viewportHeight;
  this.map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  this.tileW = 200;
  this.tileH = 200;
  this.mapW = this.map[0].length;
  this.mapH = this.map.length;
}

TileMap.prototype.render = function(ctx, xCam, yCam) {
  var iw = this.tileW;
  var ih = this.tileH;
  var xStart = xCam;
  if (xStart > 0) xStart -= iw;
  var yStart = yCam;
  if (yStart > 0) yStart -= ih;
  var xCount = Math.ceil(this.viewportWidth / iw) + 1;
  var yCount = Math.ceil(this.viewportHeight / ih) + 1;
  console.log(xCount, yCount);

  for (var y = 0; y < this.mapH; ++y) {
    for (var x = 0; x < this.mapW; ++x) {
      switch (this.map[y][x]) {
        case 0:
          ctx.fillStyle = "#685b48";
          break;
        default:
          ctx.fillStyle = "#5aa457";
      }
      var xpos = x * this.tileW;
      var ypos = y * this.tileH;
      // console.log(xpos, ypos);
      ctx.fillRect(xpos, ypos, this.tileW, this.tileH);
    }
  }

  // var ix, iy, x, y;
  // for (iy = 0; iy < yCount; ++iy) {
  //   for (ix = 0; ix < xCount; ++ix) {
  //     x = xStart + ix * iw;
  //     y = yStart + iy * ih;
  //     -- ctx.translate(x, y);
  //     if (ix % 2 == 0) ctx.fillStyle = "#5aa457";
  //     else ctx.fillStyle = "#685b48";
  //     ctx.fillRect(x, y, iw, ih);
  //     -- console.log(x, y);
  //     -- ctx.drawImage(this.img, x, y);
  //   }
  // }
};

TileMap.prototype.resize = function(w, h) {
  this.viewportWidth = w;
  this.viewportHeight = h;
};
