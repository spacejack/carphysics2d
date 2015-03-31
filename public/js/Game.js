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

	//  Scrolling background
	this.tileMap = new TileMap({
		tileImage: opts.tileImage,
		viewportWidth: this.canvasWidth,
		viewportHeight: this.canvasHeight
	});

	//  Holds keystates
	this.inputs = new InputState();

	//  Displays useful car physics data
	this.stats = new Stats();

	//  Instance of our car
	this.car = new Car({stats:this.stats});

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
	this.tileMap.render(this.ctx, -this.car.position.x * s, this.car.position.y * s);

	//  Render the car.
	//  Set axis at centre of screen and y axis up.
	this.ctx.translate( this.canvasWidth / 2.0, this.canvasHeight / 2.0 );
	this.ctx.scale(s, -s);
	this.ctx.translate( -this.car.position.x, -this.car.position.y );
	this.car.render(this.ctx);

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
