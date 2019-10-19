/*global $e, Car, InputState, ConfigPanel, Stats, TileMap */

"use strict";

/**
 *  Game class
 */
var Game = function( opts )
{
	// canvas element that the game draws to
	this.canvas = opts.canvas;

	//  Acquire a drawing context from the canvas
	this.ctx = this.canvas.getContext('2d');
	this.canvasWidth = this.canvas.clientWidth;
  this.canvasHeight = this.canvas.clientHeight;
  this.map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  this.mapW = this.map[0].length;
  this.mapH = this.map.length;
  this.tileW = Math.ceil(this.canvasWidth / this.mapW);
  this.tileH = Math.ceil(this.canvasHeight / this.mapH);

	//  Scrolling background
	this.tileMap = new TileMap({
    map: this.map,
		tileImage: opts.tileImage,
		viewportWidth: this.canvasWidth,
    viewportHeight: this.canvasHeight,
    mapW: this.mapW,
    mapH: this.mapH,
    tileW: this.tileW,
    tileH: this.tileH,
	});

	//  Holds keystates
	this.inputs = new InputState();

	//  Displays useful car physics data
	this.stats = new Stats();

	//  Instance of our car
	this.car = new Car({
    stats:this.stats,
    // this.map[1][1]
    x: (-this.canvasWidth/2 + this.tileW + (this.tileW)/2) / Game.DRAW_SCALE, 
    y: (-this.canvasHeight/2 + (this.mapH - 2)*this.tileH + (this.tileH)/2) / Game.DRAW_SCALE,
  });

	//  Configuration panel for the car
	this.configPanel = new ConfigPanel(this.car);
};

Game.DRAW_SCALE = 25.0;  // 1m = 25px


/**  Update game logic by delta T (millisecs) */
Game.prototype.update = function( dt )
{
	this.car.setInputs(this.inputs);
	this.car.update(dt);
};

/**  Render the scene */
Game.prototype.render = function()
{
	//  Clear the canvas
	//this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

	this.ctx.save();

	var s = Game.DRAW_SCALE;

	//  Render ground (covers screen so no need to clear)
	this.tileMap.render(this.ctx);

	//  Render the car.
	//  Set axis at centre of screen and y axis up.
	this.ctx.translate( this.canvasWidth / 2.0, this.canvasHeight / 2.0 );
  this.ctx.scale(s, -s);
  this.car.render(this.ctx);

  // Compute the tile the car is currently on
  var carX = this.car.position.x * s;
  var carY = this.car.position.y * s;
  var tileX = Math.floor(this.mapW / 2 + carX / this.tileW);
  var tileY = Math.floor(this.mapH / 2 + carY / this.tileH);
  if (tileX >= this.mapW) tileX = this.mapW - 1;
  else if (tileX < 0) tileX = 0;
  if (tileY >= this.mapH) tileY = this.mapH - 1;
  else if (tileY < 0) tileY = 0;
  var tile = this.map[tileY][tileX];
  
  if (tile == 0) console.log('COLLISION');

	this.ctx.restore();

	//  Stats rendered to DOM
	this.stats.render();
};

Game.prototype.resize = function()
{
	this.canvasWidth = this.canvas.clientWidth;
	this.canvasHeight = this.canvas.clientHeight;
	// Notify TileMap that resize happened
	this.tileMap.resize(this.canvasWidth, this.canvasHeight);
};

Game.prototype.setInputKeyState = function( k, s )
{
	var i = this.inputs;
	if( k === 37 )       // arrow left
		i.left = s;
	else if( k === 39 )  // arrow right
		i.right = s;
	else if( k === 38 )  // arrow up
		i.throttle = s;
	else if( k === 40 )  // arrow down
		i.brake = s;
	else if( k === 32 )  // space
		i.ebrake = s;
};

Game.prototype.onKeyDown = function(k)
{
	this.setInputKeyState( k.keyCode, 1.0 );
};

Game.prototype.onKeyUp = function(k)
{
	this.setInputKeyState( k.keyCode, 0.0 );
};
