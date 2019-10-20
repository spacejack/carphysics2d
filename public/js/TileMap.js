/*global GMath */

"use strict";

function TileMap(opts) {
  this.viewportWidth = opts.viewportWidth;
  this.viewportHeight = opts.viewportHeight;
  this.map = opts.map;
  this.mapW = opts.mapW;
  this.mapH = opts.mapH;
  this.tileW = opts.tileW;
  this.tileH = opts.tileH;
  [this.startX, this.startY] = opts.startPosition;
  this.endPositions = opts.endPositions;
  this.players = opts.players;
}

TileMap.prototype.render = function(ctx) {
  const currEnds = this.players.map(p => p.getEndPosition(this.endPositions));

  for (var y = 0; y < this.mapH; ++y) {
    for (var x = 0; x < this.mapW; ++x) {
      var xpos = x * this.tileW;
      var ypos = y * this.tileH;
      var tile = this.map[y][x];

      // End positions: 1 or more players have their end position here
      if (currEnds.some(([endX, endY]) => x == endX && y == endY)) {
        const numPlayersInEnd = currEnds
          .map(([endX, endY]) => (x == endX && y == endY ? 1 : 0))
          .reduce((a, b) => a + b, 0);
        if (numPlayersInEnd == 1) {
          ctx.fillStyle = this.players.find(
            p =>
              JSON.stringify(p.getEndPosition(this.endPositions)) ==
              JSON.stringify([x, y])
          ).color;
          ctx.fillRect(xpos, ypos, this.tileW, this.tileH);
          ctx.fillStyle = "#fff";
          ctx.fillText("END", xpos + this.tileW / 10, ypos + this.tileH / 5);
        } else if (numPlayersInEnd == 2) {
          ctx.fillStyle = this.players[0].color;
          ctx.fillRect(xpos, ypos, this.tileW / 2, this.tileH);
          ctx.fillStyle = this.players[1].color;
          ctx.fillRect(xpos + this.tileW / 2, ypos, this.tileW / 2, this.tileH);
        }
      }
      // Walls
      else if (tile == 0) {
        var img = new Image();
        // Top left
        if (x == 0 && y == 0) img.src = "img/wall-tl.png";
        // Bottom left
        else if (x == 0 && y == this.mapH - 1) img.src = "img/wall-bl.png";
        // Top right
        else if (x == this.mapW - 1 && y == 0) img.src = "img/wall-tr.png";
        // Bottom right
        else if (x == this.mapW - 1 && y == this.mapH - 1)
          img.src = "img/wall-br.png";
        // Top
        else if (y == 0) img.src = "img/wall-t.png";
        // Bottom
        else if (y == this.mapH - 1) img.src = "img/wall-b.png";
        // Left
        else if (x == 0) img.src = "img/wall-l.png";
        // Right
        else if (x == this.mapW - 1) img.src = "img/wall-r.png";
        // Normal wall
        else img.src = "img/tile.jpg";
        ctx.drawImage(img, xpos, ypos, this.tileW, this.tileH);
      } else {
        ctx.fillStyle = "#5aa457";
        ctx.fillRect(xpos, ypos, this.tileW, this.tileH);
      }
    }
  }
};

TileMap.prototype.resize = function(w, h) {
  this.viewportWidth = w;
  this.viewportHeight = h;
};
