/*global $e, Car, InputState, TileMap */

"use strict";

/**
 *  Game class
 */
var Game = function(opts) {
  //  Acquire a drawing context from the canvas
  this.canvas = opts.canvas;
  this.ctx = this.canvas.getContext("2d");
  this.canvasWidth = this.canvas.clientWidth;
  this.canvasHeight = this.canvas.clientHeight;
  // Set up the map area and compute tile parameters
  this.mapW = 16;
  this.mapH = 10;
  this.tileW = Math.ceil(this.canvasWidth / this.mapW);
  this.tileH = Math.ceil(this.canvasHeight / this.mapH);
  // Initialize a game
  this.numRounds = opts.numRounds;
  this.numPlayers = opts.numPlayers;
  this.gameIsOver = false;
  this.setUpGame();
};

Game.DRAW_SCALE = 25.0; // 1m = 25px
Game.MIN_STARTEND_DELTA = 5.0;
Game.PLAYER_COLORS = ["rgb(228,93,51)", "rgb(102,172,91)", "rgb(244,163,58)"];
Game.PLAYER_CAR_SPRITES = ["dorange", "green", "orange"].map(
  c => `img/car-${c}.png`
);

Game.prototype.getNextEndPosition = function([compareX, compareY]) {
  const ends = this.getRoadPositions(this.map).filter(
    ([x, y]) =>
      Math.sqrt(Math.pow(compareX - x, 2) + Math.pow(compareY - y, 2)) >
      Game.MIN_STARTEND_DELTA
  );
  return new Random().draw(ends);
};

Game.prototype.getRoadPositions = function() {
  return this.map
    .map((row, rid) => row.map((col, cid) => (col == 1 ? [cid, rid] : null)))
    .flat()
    .filter(x => x !== null)
    .sort(() => Math.random() - 0.5);
};

Game.prototype.setUpGame = function() {
  // Generate map
  const mapComplexity = Math.ceil(Math.max(this.mapW, this.mapH) * 2.0);
  this.map = createMap(this.mapH, this.mapW, mapComplexity);
  // Generate the start position and all end positions, one for each turn
  this.roadPositions = this.getRoadPositions();
  this.startPosition = this.roadPositions.pop();
  this.endPositions = [this.getNextEndPosition(this.startPosition)];
  for (var i = 1; i < this.numRounds; i++) {
    this.endPositions.push(this.getNextEndPosition(this.endPositions[i - 1]));
  }

  // Initialize players
  this.players = [];
  const [startX, startY] = this.startPosition;
  for (let i = 0; i < this.numPlayers; i++) {
    const p = new Player({
      id: i,
      car: new Car({ imgSrc: Game.PLAYER_CAR_SPRITES[i] }),
      color: Game.PLAYER_COLORS[i],
      ghosts: [],
      ghostCounter: 0,
      round: 0,
      inputs: new InputState(),
    });
    p.car.position.x =
      (-this.canvasWidth / 2 + startX * this.tileW + this.tileW / 2) /
      Game.DRAW_SCALE;
    p.car.position.y =
      (-this.canvasHeight / 2 +
        (this.mapH - startY) * this.tileH -
        (this.tileH / (this.numPlayers + 1)) * (i + 1)) /
      Game.DRAW_SCALE;
    this.players.push(p);
  }

  // Set up the TileMap and other necessary props
  this.tileMap = new TileMap({
    map: this.map,
    viewportWidth: this.canvasWidth,
    viewportHeight: this.canvasHeight,
    mapW: this.mapW,
    mapH: this.mapH,
    tileW: this.tileW,
    tileH: this.tileH,
    startPosition: this.startPosition,
    endPositions: this.endPositions,
    players: this.players,
  });
};

Game.prototype.gameOver = function(loser = undefined) {
  this.gameIsOver = true;
  $('#gameOverModal').show();
  let text;
  if (loser) {
    text = "YOU LOSE, " + getName(loser.id) + "!";
  }
  else {
    const winner = this.players.filter(p => p.round == this.numRounds)[0];
    text = "YOU WIN, " + getName(winner.id) + "!";
  }
  GAME_OVER_TEXT = text;
  $('.game-over-text').text(text);
  this.ctx.save();
  this.ctx.restore();
};
var getName = function(id) {
  return id === 0 ? PLAYER_0_NAME : PLAYER_1_NAME;
}
/**  Update game logic by delta T (millisecs) */
Game.prototype.update = function(dt) {
  if (this.gameIsOver) return;

  for (var p of this.players) {
    p.car.setInputs(p.inputs);
    p.car.update(dt);
  }
};

/**  Render the scene */
Game.prototype.render = function() {
  if (this.gameIsOver) return;

  this.ctx.save();
  const s = Game.DRAW_SCALE;

  // Render ground (covers screen so no need to clear)
  this.tileMap.render(this.ctx);

  // Set axis at centre of screen and y axis up.
  this.ctx.translate(this.canvasWidth / 2.0, this.canvasHeight / 2.0);
  this.ctx.scale(s, -s);

  const allGhosts = this.players
    .map(p =>
      p.ghosts.map(
        ghostCar =>
          ghostCar.route[Math.min(p.ghostCounter, ghostCar.route.length - 1)]
      )
    )
    .flat();

  // Render all players and their ghosts
  for (var p of this.players) {
    // Player has finished all round
    if (p.round == this.numRounds) {
      return this.gameOver();
    }

    p.car.render(this.ctx);

    // Initialize variables for collision detection
    var carX = p.car.position.x * s;
    var carY = p.car.position.y * s;

    // Render ghost cars
    for (let ghostCar of p.ghosts) {
      var [x, y, heading] = ghostCar.route[
        Math.min(p.ghostCounter, ghostCar.route.length - 1)
      ];
      ghostCar.position.x = x;
      ghostCar.position.y = y;
      ghostCar.heading = heading;
      ghostCar.render(this.ctx);
    }

    // Collision detection for ghost cars
    for (let ghostCoords of allGhosts) {
      var [x, y, heading] = ghostCoords;
      var distFromCar = Math.sqrt(
        Math.pow(Math.abs(x - p.car.position.x), 2) +
          Math.pow(Math.abs(y - p.car.position.y), 2)
      );
      if (distFromCar < 1.5) {
        return this.gameOver(p);
      }
    }

    // Detect collision with walls
    var tileX = Math.floor(this.mapW / 2 + carX / this.tileW);
    var tileY = this.mapH - Math.floor(this.mapH / 2 + carY / this.tileH) - 1;
    if (tileX >= this.mapW) tileX = this.mapW - 1;
    else if (tileX < 0) tileX = 0;
    if (tileY >= this.mapH) tileY = this.mapH - 1;
    else if (tileY < 0) tileY = 0;
    var tile = this.map[tileY][tileX];

    if (tile == 0) {
      var diffX_left = tileX * this.tileW - this.canvasWidth / 2 - carX;
      var diffX_right = (tileX + 1) * this.tileW - this.canvasWidth / 2 - carX;
      var diffX = Math.min(Math.abs(diffX_left), Math.abs(diffX_right));
      var diffY_bottom = this.canvasHeight / 2 - tileY * this.tileH - carY;
      var diffY_top = this.canvasHeight / 2 - (tileY + 1) * this.tileH - carY;
      var diffY = Math.min(Math.abs(diffY_bottom), Math.abs(diffY_top));
      p.car.velocity.y = -0.3 * p.car.velocity.y;
      p.car.velocity.x = -0.3 * p.car.velocity.x;
      if (diffX < diffY) {
        // Hit on x axis
        if (Math.abs(diffX_left) < Math.abs(diffX_right)) {
          p.car.position.x += -0.1;
        } else {
          p.car.position.x += 0.1;
        }
      } else {
        // Hit on y axis
        if (Math.abs(diffY_bottom) < Math.abs(diffY_top)) {
          p.car.position.y += 0.1;
        } else {
          p.car.position.y += -0.1;
        }
      }
    }

    // End
    const [endX, endY] = p.getEndPosition(this.endPositions);
    if (tileX == endX && tileY == endY) {
      p.reachedEnd();
    }

    // Increase the ghost car counter
    p.ghostCounter++;
  }

  this.ctx.restore();
};

Game.prototype.resize = function() {
  this.canvasWidth = this.canvas.clientWidth;
  this.canvasHeight = this.canvas.clientHeight;
  // Notify TileMap that resize happened
  this.tileMap.resize(this.canvasWidth, this.canvasHeight);
};

Game.prototype.setInputKeyState = function(k, s) {
  
  var p1 = this.players[0].inputs;
  if (k === 37)
    // arrow left
    p1.left = s;
  else if (k === 39)
    // arrow right
    p1.right = s;
  else if (k === 38)
    // arrow up
    p1.throttle = s;
  else if (k === 40)
    // arrow down
    p1.brake = s;
  else if (k === 32 && s == 1.0) {
    // space
    var audio = new Audio('../public/honks/honk' + Math.floor(Math.random() * 6 + 1) + '.m4a');
    audio.volume = 1;
    audio.play();
  }

  if (this.numPlayers == 2) {
    var p2 = this.players[1].inputs;
    if (k === 65)
      // A
      p2.left = s;
    else if (k === 68)
      // D
      p2.right = s;
    else if (k === 87)
      // W
      p2.throttle = s;
    else if (k === 83)
      // S
      p2.brake = s;
  }
};

Game.prototype.onKeyDown = function(k) {
  this.setInputKeyState(k.keyCode, 1.0);
  
};

Game.prototype.onKeyUp = function(k) {
  this.setInputKeyState(k.keyCode, 0.0);
};

var GAME_OVER_TEXT;