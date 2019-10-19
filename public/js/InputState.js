"use strict";

/**
 *  Input state values
 *  Range from 0.0-1.0
 */
var InputState = function() {
  this.left = 0;
  this.right = 0;
  this.throttle = 0;
  this.brake = 0;
  this.ebrake = 0;
};

/**  Copy values from i to this */
InputState.prototype.copy = function(i) {
  for (var k in this) if (this.hasOwnProperty(k)) this[k] = i[k];
  return this;
};

/**  Set all to v (0.0-1.0) */
InputState.prototype.set = function(v) {
  for (var k in this) if (this.hasOwnProperty(k)) this[k] = v;
};
