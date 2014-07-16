goog.provide('exp.entity.planet.Signal');

goog.require('exp.entity.Circle');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * Entity that represents signals being emitted from satellites.
 * @constructor
 * @param {object} params the parameters for this entity.
 * @param {string} id the unique instance id for this entity.
 */
exp.entity.planet.Signal = function(params, id) {
  goog.base(this, {
    'color': '#2de4ff',
    'radius': 40,
    'applyLighting': false,
    'tags': exp.Tags.PLANET
  }, id);

  this.element_.style.opacity = 0.5;

  this.phase_ = params['offset'];
};
goog.inherits(exp.entity.planet.Signal, exp.entity.Circle);

/**
 * Run this entity when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Signal.prototype.inactiveTick = function(delta, now) {
  goog.base(this, 'inactiveTick', delta, now);
  this.updatePosition_(delta);
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Signal.prototype.activeTick = function(delta, now) {
  goog.base(this, 'activeTick', delta, now);
  this.updatePosition_(delta);
};

/**
 * Update the position of the satellite.
 * @param {number} delta The amount of time since the previous update.
 * @private
 */
exp.entity.planet.Signal.prototype.updatePosition_ = function(delta) {

  this.phase_ += delta;

  if (this.phase_ >= 1.0) {
    this.reset_();
  }

  var scale = 0.8 * this.phase_ + 0.2;

  this.object_.scale.set(scale, scale, scale);
  this.object_.position.z = 40 * this.phase_ + 2;
};

/**
 * Reset the signal so it starts back at the emitter (creates a looped effect).
 * @private
 */
exp.entity.planet.Signal.prototype.reset_ = function() {
  if (this.isActive_) {
    this.phase_ -= 1;
  } else {
    exp.manager.removeEntity(this);
  }
};
