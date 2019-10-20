var Player = function(opts) {
  this.id = opts.id;
  this.car = opts.car;
  this.color = opts.color;
  this.ghosts = opts.ghosts;
  this.ghostCounter = opts.ghostCounter;
  this.round = opts.round;
  this.inputs = opts.inputs;
};

Player.prototype.getEndPosition = function(endPositions) {
  return endPositions[Math.min(this.round, endPositions.length - 1)];
};

Player.prototype.reachedEnd = function() {
  this.ghostCounter = 0;
  const c = new Car({});
  c.route = [...this.car.route];
  c.followingRoute = true;
  this.car.route = [];
  this.ghosts.push(c);
  this.round++;
};
