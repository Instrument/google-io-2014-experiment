goog.provide('exp.entity.planet.Balloons');

goog.require('exp.entity.planet.Balloon');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');


/**
 * An entity that creates a cluster of majestic balloons.
 * @constructor
 */
exp.entity.planet.Balloons = function() {
  this.balloons_ = [];

  var params = {
    'tags': exp.Tags.PLANET
  };

  goog.base(this, params, 'balloons');

  this.object_.rotation.y = Math.PI;
};
goog.inherits(exp.entity.planet.Balloons, exp.entity.Core);

/**
 * Create a cluster of balloons.
 */
exp.entity.planet.Balloons.prototype.spawnBalloons = function() {
  this.setActive(true);
  for (var i = 0; i < 5; i++) {
    var balloon = new exp.entity.planet.Balloon(i);

    exp.manager.addEntity(balloon);
    this.object_.add(balloon.getObject());
    this.balloons_.push(balloon);
  }
  exp.soundManager.playSound('planet/Balloons');
};

/**
 * Set this entity to be active or inactive.
 * @param {boolean} isActive The active state to be set.
 * @override
 */
exp.entity.planet.Balloons.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);
  for (var i = 0; i < this.balloons_.length; i++) {
    this.balloons_[i].setActive(isActive);
  }
};

/**
 * Destroy balloons.
 */
exp.entity.planet.Balloons.prototype.killBalloons = function() {
  for (var i = 0; i < this.balloons_.length; i++) {
    exp.manager.removeEntity(this.balloons_[i]);
  }
  this.balloons_.length = 0;
};

/**
 * Dispose of resources.
 * @override
 */
exp.entity.planet.Balloons.prototype.disposeInternal = function() {
  this.killBalloons();
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Balloons.prototype.activeTick = function(delta, now) {
  this.object_.rotation.y *= 0.98;
};
