/*global GMath */

"use strict";

function TileMap(opts) {
  this.img = opts.tileImage;
  this.viewportWidth = opts.viewportWidth;
  this.viewportHeight = opts.viewportHeight;
  this.map = opts.map;
  this.mapW = opts.mapW;
  this.mapH = opts.mapH;
  this.tileW = opts.tileW;
  this.tileH = opts.tileH;
  [this.startX, this.startY] = opts.startPosition;
}

TileMap.prototype.render = function(ctx) {
  for (var y = 0; y < this.mapH; ++y) {
    for (var x = 0; x < this.mapW; ++x) {
      var xpos = x * this.tileW;
      var ypos = y * this.tileH;
      switch (this.map[y][x]) {
        case 0:
          ctx.fillStyle = "#685b48";
          break;
        case 3:
          ctx.fillStyle = "#222";
          break;
        default:
          ctx.fillStyle = "#5aa457";
      }
      ctx.fillRect(xpos, ypos, this.tileW, this.tileH);
      // Add the start and end texts
      if (x == this.startX && y == this.startY) {
        ctx.fillStyle = '#ddd';
        ctx.fillRect(xpos, ypos, this.tileW, this.tileH);
        ctx.fillStyle = "#000000";
        ctx.fillText("START", xpos + this.tileW / 10, ypos + this.tileH / 5);
      }
      else if (x == this.endX && y == this.endY) {
        ctx.fillStyle = '#222';
        ctx.fillRect(xpos, ypos, this.tileW, this.tileH);
        ctx.fillStyle = "#fff";
        ctx.fillText("END", xpos + this.tileW / 10, ypos + this.tileH / 5);
      }
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
