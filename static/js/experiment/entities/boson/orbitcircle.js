goog.provide('exp.entity.boson.OrbitCircle');

goog.require('exp.entity.Circle');
goog.require('exp.entity.Core');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * A entity that is put into the experiment
 * @param {object} params object.
 * @param {scene} scene object.
 * @constructor
 */
exp.entity.boson.OrbitCircle = function(params, scene) {
  goog.base(this, params);

  this.tag = exp.Tags.BOSON;
  this.scale_ = 1;
  this.rotationSpeed_ = 0.045;
  this.object_ = new THREE.Object3D();
  this.direction = -1;
  this.circle = null;
  this.particle = null;

  this.scene_ = scene;

  this.maxOrbitSpeed = .06;

  this.colorIndexInc = params['colorIndexInc'];

  var spread = 150;
  var colors = [
    ['#00933B', '#4688f0'],
    ['#db4437', '#f4b450'],
    ['#db4437', '#4285f4'],
    ['#f4b450', '#4285f4'],
    ['#f4b450', '#0f9d58']
  ];

  var col = Math.random() * 0x000000;

  this.particle = new exp.entity.Circle({
    'color': colors[params['colorIndexInc']][params['colorId']],
    'radius': 40,
    'useLighting': false,
    'position': [0, 0, 0],
    'tags': exp.Tags.BOSON
  });

  exp.manager.addEntity(this.particle);
   this.object_.add(this.particle.getObject());
   this.circle = this.particle;

};
goog.inherits(exp.entity.boson.OrbitCircle, exp.entity.Core);

/**
 * A entity that is put into the experiment
 * @param {number} xpos number.
 * @param {number} direction number.
 * @param {number} roty number.
 * @param {number} rotx number.
 * @constructor
 */
exp.entity.boson.OrbitCircle.prototype.setDirection = function(xpos, direction,
  roty, rotx) {

  this.direction = direction;
  var posx = xpos;

  TweenLite.to(this.circle.getObject().position, 1, { x: posx, delay: 0 });

  TweenLite.to(this.object_.rotation, 2, { x: rotx,
  delay: 0 });

  if (this.colorIndexInc > 0) {
    this.collideCircles(1.4);
  }
};

/**
 * create boson cloud
 */
exp.entity.boson.OrbitCircle.prototype.boomBoom = function() {
  if (this.direction == -1) {
    this.scene_.createMainItems();
  }
};

/**
 * circles collide to create boson clould on user input.
 * @param {number} delays number.
 */
exp.entity.boson.OrbitCircle.prototype.collideCircles = function(delays) {
  TweenLite.to(this.circle.getObject().position, 2, { x: 0, delay: delays,
    ease: Expo.easeIn, onComplete: this.boomBoom, onCompleteScope: this});

  TweenLite.to(this.circle.getObject().scale, 2, { x: 0, y: 0, z: 0,
    delay: delays, ease: Expo.easeIn });
};

/**
 * Sets the active state.
 * @param {boolean} isActive Determines if creating or finishing the Boson.
 */
exp.entity.boson.OrbitCircle.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', this, isActive);
  if (!isActive) {

    this.object_.remove(this.particle.getObject());
    exp.manager.removeEntity(this.particle);
    exp.manager.removeEntity(this);

  }
};

/**
 * Active tick.
 * @param {number} delta Time between ticks, in fractional seconds.
 * @param {number} now The current run-time in fractional seconds.
 */
exp.entity.boson.OrbitCircle.prototype.activeTick = function(delta, now) {

  this.object_.rotation.y += this.rotationSpeed_;
  var tmpVector = exp.vectorPool.allocate();
  tmpVector.copy(exp.manager.camera_.position);
  this.object_.worldToLocal(tmpVector);

  this.circle.getObject().lookAt(tmpVector);
  exp.vectorPool.free(tmpVector);
};
