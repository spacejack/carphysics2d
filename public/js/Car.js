/*global $e, GMath, Vec2, InputState */

"use strict";

/**
 *  Car class

	This is a HTML/Javascript adaptation of Marco Monster's 2D car physics demo.
	Physics Paper here:
	http://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
	Windows demo written in C here:
	http://www.gamedev.net/topic/394292-demosource-of-marco-monsters-car-physics-tutorial/
	Additional ideas from here:
	https://github.com/Siorki/js13kgames/tree/master/2013%20-%20staccato

	Adapted by Mike Linkovich
	http://www.spacejack.ca/projects/carphysics2d/
	https://github.com/spacejack/carphysics2d

	License: MIT
	http://opensource.org/licenses/MIT
 */
var Car = function(opts) {
  opts = opts || {};

  //  Car state variables
  this.heading = opts.heading || 0.0; // angle car is pointed at (radians)
  this.position = new Vec2(opts.x, opts.y); // metres in world coords
  this.velocity = new Vec2(); // m/s in world coords
  this.velocity_c = new Vec2(); // m/s in local car coords (x is forward y is sideways)
  this.accel = new Vec2(); // acceleration in world coords
  this.accel_c = new Vec2(); // accleration in local car coords
  this.absVel = 0.0; // absolute velocity m/s
  this.yawRate = 0.0; // angular velocity in radians
  this.steer = 0.0; // amount of steering input (-1.0..1.0)
  this.steerAngle = 0.0; // actual front wheel steer angle (-maxSteer..maxSteer)

  //  State of inputs
  this.inputs = new InputState();

  //  Use input smoothing (on by default)
  this.smoothSteer =
    opts.smoothSteer === undefined ? false : !!opts.smoothSteer;
  //  Use safe steering (angle limited by speed)
  this.safeSteer = opts.safeSteer === undefined ? true : !!opts.safeSteer;

  //  Stats object we can use to ouptut info
  this.stats = opts.stats;

  //  Other static values to be computed from config
  this.inertia = 0.0; // will be = mass
  this.wheelBase = 0.0; // set from axle to CG lengths
  this.axleWeightRatioFront = 0.0; // % car weight on the front axle
  this.axleWeightRatioRear = 0.0; // % car weight on the rear axle

  //  Setup car configuration
  this.config = new Car.Config(opts.config);
  this.goingForward = true;
  this.setConfig();

  // Setup route tracking
  this.route = [];
  this.followingRoute = false;
};

/**
 *  Car setup params and magic constants.
 */
Car.Config = function(opts) {
  opts = opts || {};
  //  Defaults approximate a lightweight sports-sedan.
  this.gravity = opts.gravity || 9.81; // m/s^2
  this.mass = opts.mass || 900.0; // kg
  this.inertiaScale = opts.inertiaScale || 1.0; // Multiply by mass for inertia
  this.halfWidth = opts.halfWidth || 0.4; // Centre to side of chassis (metres)
  this.cgToFront = opts.cgToFront || 1.0; // Centre of gravity to front of chassis (metres)
  this.cgToRear = opts.cgToRear || 1.0; // Centre of gravity to rear of chassis
  this.cgToFrontAxle = opts.cgToFrontAxle || 0.625; // Centre gravity to front axle
  this.cgToRearAxle = opts.cgToRearAxle || 0.625; // Centre gravity to rear axle
  this.cgHeight = opts.cgHeight || 0.275; // Centre gravity height
  this.wheelRadius = opts.wheelRadius || 0.3; // Includes tire (also represents height of axle)
  this.wheelWidth = opts.wheelWidth || 0.2; // Used for render only
  this.tireGrip = opts.tireGrip || 2.0; // How much grip tires have
  this.lockGrip =
    typeof opts.lockGrip === "number"
      ? GMath.clamp(opts.lockGrip, 0.01, 1.0)
      : 0.7; // % of grip available when wheel is locked
  this.engineForce = opts.engineForce || 3000.0;
  this.weightTransfer =
    typeof opts.weightTransfer === "number" ? opts.weightTransfer : 0.2; // How much weight is transferred during acceleration/braking
  this.maxSteer = opts.maxSteer || 0.6; // Maximum steering angle in radians
  this.cornerStiffnessFront = opts.cornerStiffnessFront || 5.0;
  this.cornerStiffnessRear = opts.cornerStiffnessRear || 5.2;
  this.airResist = typeof opts.airResist === "number" ? opts.airResist : 2.5; // air resistance (* vel)
  this.rollResist = typeof opts.rollResist === "number" ? opts.rollResist : 8.0; // rolling resistance force (* vel)
};

Car.Config.prototype.copy = function(c) {
  for (var k in this)
    if (this.hasOwnProperty(k) && c.hasOwnProperty(k)) this[k] = c[k];
  return this;
};

/**
 *  App sets inputs via this function
 */
Car.prototype.setInputs = function(inputs) {
  this.inputs.copy(inputs);
};

Car.prototype.setConfig = function(config) {
  if (config) this.config.copy(config);
  // Re-calculate these
  this.inertia = this.config.mass * this.config.inertiaScale;
  this.wheelBase = this.config.cgToFrontAxle + this.config.cgToRearAxle;
  this.axleWeightRatioFront = this.config.cgToRearAxle / this.wheelBase; // % car weight on the front axle
  this.axleWeightRatioRear = this.config.cgToFrontAxle / this.wheelBase; // % car weight on the rear axle
};

/**
 *  @param dt Floating-point Delta Time in seconds
 */
Car.prototype.doPhysics = function(dt) {
  // Shorthand
  var cfg = this.config;

  // Pre-calc heading vector
  var sn = Math.sin(this.heading);
  var cs = Math.cos(this.heading);

  // Get velocity in local car coordinates
  this.velocity_c.x = cs * this.velocity.x + sn * this.velocity.y;
  this.velocity_c.y = cs * this.velocity.y - sn * this.velocity.x;

  // Weight on axles based on centre of gravity and weight shift due to forward/reverse acceleration
  var axleWeightFront =
    cfg.mass *
    (this.axleWeightRatioFront * cfg.gravity -
      (cfg.weightTransfer * this.accel_c.x * cfg.cgHeight) / this.wheelBase);
  var axleWeightRear =
    cfg.mass *
    (this.axleWeightRatioRear * cfg.gravity +
      (cfg.weightTransfer * this.accel_c.x * cfg.cgHeight) / this.wheelBase);

  // Resulting velocity of the wheels as result of the yaw rate of the car body.
  // v = yawrate * r where r is distance from axle to CG and yawRate (angular velocity) in rad/s.
  var yawSpeedFront = cfg.cgToFrontAxle * this.yawRate;
  var yawSpeedRear = -cfg.cgToRearAxle * this.yawRate;

  // Calculate slip angles for front and rear wheels (a.k.a. alpha)
  var slipAngleFront =
    Math.atan2(this.velocity_c.y + yawSpeedFront, Math.abs(this.velocity_c.x)) -
    GMath.sign(this.velocity_c.x) * this.steerAngle;
  var slipAngleRear = Math.atan2(
    this.velocity_c.y + yawSpeedRear,
    Math.abs(this.velocity_c.x)
  );

  var tireGripFront = cfg.tireGrip;
  var tireGripRear =
    cfg.tireGrip * (1.0 - this.inputs.ebrake * (1.0 - cfg.lockGrip)); // reduce rear grip when ebrake is on

  var frictionForceFront_cy =
    GMath.clamp(
      -cfg.cornerStiffnessFront * slipAngleFront,
      -tireGripFront,
      tireGripFront
    ) * axleWeightFront;
  var frictionForceRear_cy =
    GMath.clamp(
      -cfg.cornerStiffnessRear * slipAngleRear,
      -tireGripRear,
      tireGripRear
    ) * axleWeightRear;

  //  Get amount of brake/throttle from our inputs
  var throttle = (this.inputs.throttle - this.inputs.brake) * cfg.engineForce;

  // console.log(this.velocity.len());

  //  Resulting force in local car coordinates.
  //  This is implemented as a RWD car only.
  var tractionForce_cx = throttle;
  var tractionForce_cy = 0;

  var dragForce_cx =
    -cfg.rollResist * this.velocity_c.x -
    cfg.airResist * this.velocity_c.x * Math.abs(this.velocity_c.x);
  var dragForce_cy =
    -cfg.rollResist * this.velocity_c.y -
    cfg.airResist * this.velocity_c.y * Math.abs(this.velocity_c.y);

  // total force in car coordinates
  var totalForce_cx = dragForce_cx + tractionForce_cx;
  var totalForce_cy =
    dragForce_cy +
    tractionForce_cy +
    Math.cos(this.steerAngle) * frictionForceFront_cy +
    frictionForceRear_cy;

  // acceleration along car axes
  this.accel_c.x = totalForce_cx / cfg.mass; // forward/reverse accel
  this.accel_c.y = totalForce_cy / cfg.mass; // sideways accel

  // acceleration in world coordinates
  this.accel.x = cs * this.accel_c.x - sn * this.accel_c.y;
  this.accel.y = sn * this.accel_c.x + cs * this.accel_c.y;

  // update velocity
  this.velocity.x += this.accel.x * dt;
  this.velocity.y += this.accel.y * dt;

  this.absVel = this.velocity.len();

  // calculate rotational forces
  var angularTorque =
    (frictionForceFront_cy + tractionForce_cy) * cfg.cgToFrontAxle -
    frictionForceRear_cy * cfg.cgToRearAxle;

  //  Sim gets unstable at very slow speeds, so just stop the car
  if (Math.abs(this.absVel) < 0.5 && !throttle) {
    this.velocity.x = this.velocity.y = this.absVel = 0;
    angularTorque = this.yawRate = 0;
  }

  var angularAccel = angularTorque / this.inertia;

  this.yawRate += angularAccel * dt;
  this.heading += this.yawRate * dt;

  //  finally we can update position
  this.position.x += this.velocity.x * dt;
  this.position.y += this.velocity.y * dt;

  //  Display some data
  this.stats.clear(); // clear this every tick otherwise it'll fill up fast
  this.stats.add("speed", (this.velocity_c.x * 3600) / 1000); // km/h
  this.stats.add("accleration", this.accel_c.x);
  this.stats.add("yawRate", this.yawRate);
  this.stats.add("weightFront", axleWeightFront);
  this.stats.add("weightRear", axleWeightRear);
  this.stats.add("slipAngleFront", slipAngleFront);
  this.stats.add("slipAngleRear", slipAngleRear);
  this.stats.add("frictionFront", frictionForceFront_cy);
  this.stats.add("frictionRear", frictionForceRear_cy);
};

/**
 *  Smooth Steering
 *  Apply maximum steering angle change velocity.
 */
Car.prototype.applySmoothSteer = function(steerInput, dt) {
  var steer = 0;

  if (Math.abs(steerInput) > 0.001) {
    //  Move toward steering input
    steer = GMath.clamp(this.steer + steerInput * dt * 2.0, -1.0, 1.0); // -inp.right, inp.left);
  } else {
    //  No steer input - move toward centre (0)
    if (this.steer > 0) {
      steer = Math.max(this.steer - dt * 1.0, 0);
    } else if (this.steer < 0) {
      steer = Math.min(this.steer + dt * 1.0, 0);
    }
  }

  return steer;
};

/**
 *  Safe Steering
 *  Limit the steering angle by the speed of the car.
 *  Prevents oversteer at expense of more understeer.
 */
Car.prototype.applySafeSteer = function(steerInput) {
  var avel = Math.min(this.absVel, 250.0); // m/s
  var steer = steerInput * (1.0 - avel / 280.0);
  return steer;
};

/**
 *  @param dtms Delta Time in milliseconds
 */
Car.prototype.update = function(dtms) {
  var dt = dtms / 1000.0; // delta T in seconds

  this.throttle = this.inputs.throttle;
  this.brake = this.inputs.brake;

  var steerInput = this.inputs.left - this.inputs.right;

  //  Perform filtering on steering...
  if (this.smoothSteer) this.steer = this.applySmoothSteer(steerInput, dt);
  else this.steer = steerInput;

  if (this.safeSteer) this.steer = this.applySafeSteer(this.steer);

  //  Now set the actual steering angle
  this.steerAngle = this.steer * this.config.maxSteer;

  //
  //  Now that the inputs have been filtered and we have our throttle,
  //  brake and steering values, perform the car physics update...
  //
  this.doPhysics(dt);
};

/**
 *  @param ctx 2D rendering context (from canvas)
 */
Car.prototype.render = function(ctx) {
  var cfg = this.config; // shorthand reference

  // Store current position and heading to route
  if (!this.followingRoute)
    this.route.push([this.position.x, this.position.y, this.heading]);

  ctx.save();

  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(this.heading);

  // Draw car body
  ctx.beginPath();
  ctx.rect(
    -cfg.cgToRear,
    -cfg.halfWidth,
    cfg.cgToFront + cfg.cgToRear,
    cfg.halfWidth * 2.0
  );
  if (this.followingRoute) ctx.fillStyle = "#777";
  else ctx.fillStyle = "#1166BB";
  ctx.fill();
  ctx.lineWidth = 0.05; // use thin lines because everything is scaled up 25x
  ctx.strokeStyle = "#222222";
  ctx.stroke();
  ctx.closePath();

  // Draw rear wheel
  ctx.translate(-cfg.cgToRearAxle, 0);
  ctx.beginPath();
  ctx.rect(
    -cfg.wheelRadius,
    -cfg.wheelWidth / 2.0,
    cfg.wheelRadius * 2,
    cfg.wheelWidth
  );
  ctx.fillStyle = "#444444";
  ctx.fill();
  ctx.lineWidth = 0.05;
  ctx.strokeStyle = "111111";
  ctx.stroke();
  ctx.closePath();

  // Draw front wheel
  ctx.translate(cfg.cgToRearAxle + cfg.cgToFrontAxle, 0);
  ctx.rotate(this.steerAngle);
  ctx.beginPath();
  ctx.rect(
    -cfg.wheelRadius,
    -cfg.wheelWidth / 2.0,
    cfg.wheelRadius * 2,
    cfg.wheelWidth
  );
  ctx.fillStyle = "#444444";
  ctx.fill();
  ctx.lineWidth = 0.05;
  ctx.strokeStyle = "111111";
  ctx.stroke();
  ctx.closePath();

  ctx.restore();
};
