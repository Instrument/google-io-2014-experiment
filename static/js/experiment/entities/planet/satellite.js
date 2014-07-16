goog.provide('exp.entity.planet.Satellite');

goog.require('exp.entity.Circle');
goog.require('exp.entity.planet.Signal');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * @constructor
 * @param {object} params the parameters for this entity.
 * @param {string} id the unique instance id for this entity.
 */
exp.entity.planet.Satellite = function(params, id) {
  goog.base(this, params, id);

  this.signals_ = [];

  this.module_ = new exp.entity.Svg({
    'content': exp.svgs.getSvg('planet-satellite'),
    'useLighting': true,
    'detailFactor': 1.5,
    'position': [0, 0, 0],
    'width': 40,
    'height': 20,
    'tags': exp.Tags.PLANET
  });

  exp.manager.addEntity(this.module_);
  this.object_.add(this.module_.getObject());

  for (var i = 0; i < 3; i++) {
    var signal = new exp.entity.planet.Signal({
      'offset': i / 3
    });

    exp.manager.addEntity(signal);
    this.object_.add(signal.getObject());
    this.signals_.push(signal);
  }

  var tmpVec = exp.vectorPool.allocate();
  tmpVec.set(0, 0, 0);
  this.object_.lookAt(tmpVec);
  exp.vectorPool.free(tmpVec);
};
goog.inherits(exp.entity.planet.Satellite, exp.entity.Core);

/**
 * Dispose of this entity.
 * @override
 */
exp.entity.planet.Satellite.prototype.disposeInternal = function() {
  exp.manager.removeEntity(this.module_);
};

/**
 * Set this entity to be active or inactive.
 * @param {boolean} isActive The active state to be set.
 * @override
 */
exp.entity.planet.Satellite.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);

  if (isActive) {
    exp.soundManager.playSound('planet/Satellite', null, {'gain': .5});
  }

  for (var i = 0; i < 3; i++) {
    this.signals_[i].setActive(isActive);
  }
};

/**
 * Run this entity when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Satellite.prototype.inactiveTick = function(delta, now) {
  goog.base(this, 'inactiveTick', delta, now);
  this.updatePosition_(delta);
  if (this.module_.getObject().scale.x > 0.01) {
    this.module_.getObject().scale.multiplyScalar(0.94);
  } else {
    exp.manager.removeEntity(this);
  }
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Satellite.prototype.activeTick = function(delta, now) {
  goog.base(this, 'activeTick', delta, now);
  this.updatePosition_(delta);
};

/**
 * Update the position of the satellite.
 * @param {number} delta The amount of time since the previous update.
 * @private
 */
exp.entity.planet.Satellite.prototype.updatePosition_ = function(delta) {
  this.module_.getObject().rotation.x -= delta * 2.27;
};
