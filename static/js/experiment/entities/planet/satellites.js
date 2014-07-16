goog.provide('exp.entity.planet.Satellites');

goog.require('exp.entity.Circle');
goog.require('exp.entity.planet.Satellite');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * @param {object} params the parameters for this entity.
 * @param {string} id the unique instance id for this entity.
 * @constructor
 */
exp.entity.planet.Satellites = function(params, id) {
  goog.base(this, params, id);

  this.container_ = new THREE.Object3D();
  this.satellites_ = [];

  this.orbitSpeed_ = 0.25;

  this.object_.add(this.container_);
};
goog.inherits(exp.entity.planet.Satellites, exp.entity.Core);

/**
 * Add a satellite to the group of satellites.
 * @param {object} params The configuration for the new satellite.
 */
exp.entity.planet.Satellites.prototype.addSatellite = function(params) {

  var satellite = new exp.entity.planet.Satellite(params, 'sat');

  exp.manager.addEntity(satellite);
  this.container_.add(satellite.getObject());
  this.satellites_.push(satellite);
};

/**
 * Clean up and dispose of this entity.
 * @override
 */
exp.entity.planet.Satellites.prototype.disposeInternal = function() {
  for (var i = 0; i < this.satellites_.length; i++) {
    this.satellites_[i].setActive(false);
  }
};

/**
 * Run this entity when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Satellites.prototype.inactiveTick = function(delta, now) {
  goog.base(this, 'inactiveTick', delta, now);
};

/**
 * Set this entity to be active or inactive.
 * @param {boolean} isActive The active state to be set.
 * @override
 */
exp.entity.planet.Satellites.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);

  if (isActive) {
    this.addSatellite({
      position: [0, 0, 200]
    });

    this.addSatellite({
      position: [173, 0, -100]
    });

    this.addSatellite({
      position: [-173, 0, -100]
    });
  }

  for (var i = 0; i < this.satellites_.length; i++) {
    this.satellites_[i].setActive(isActive);
  }
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Satellites.prototype.activeTick = function(delta, now) {
  goog.base(this, 'activeTick', delta, now);

  // Tumble the satellites around.
  this.container_.rotation.y -= delta * this.orbitSpeed_;
  this.container_.rotation.x -= delta * this.orbitSpeed_ * 3;
};
