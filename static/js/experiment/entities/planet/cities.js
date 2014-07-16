goog.provide('exp.entity.planet.Cities');

goog.require('exp.entity.Svg');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * Cities around the world.
 * @constructor
 */
exp.entity.planet.Cities = function() {

  this.cities_ = [];
  this.cityScale_ = 1;

  var params = {
    'tags': exp.Tags.PLANET
  };

  goog.base(this, params, 'cities');
};
goog.inherits(exp.entity.planet.Cities, exp.entity.Core);

/**
 * Trigger the cities to spawn in a staggered sequence.
 * @param {array} cities The array of city coordinates and sizes.
 */
exp.entity.planet.Cities.prototype.spawnCities = function(cities) {
  for (var i = 0; i < cities.length; i++) {
    var params = cities[i];
    params['index'] = i;
    exp.sequencer.add('city' + i, i / 8 + 0.5, this.spawnCity_,
      cities[i], this, 'cities');
  }
};

/**
 * Set this entity to be active or inactive.
 * @param {boolean} isActive The active state to be set.
 * @override
 */
exp.entity.planet.Cities.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);
  if (!isActive) {
    exp.sequencer.cancelAllTagged('cities');
    TweenLite.to(this, 0.5, {cityScale_: 0});
  } else {
    exp.soundManager.playSound('planet/BigRumble_01');
  }
};

/**
 * Dispose of this entity.
 */
exp.entity.planet.Cities.prototype.disposeInternal = function() {
  exp.sequencer.cancelAllTagged('cities');
  for (var i = 0; i < this.cities_.length; i++) {
    exp.manager.removeEntity(this.cities_[i]);
  }
};

/**
 * Spawn an individual city entity.
 * @param {object} params The configuration for the new city.
 * @private
 */
exp.entity.planet.Cities.prototype.spawnCity_ = function(params) {

  var spacing = 280;
  var size = 30;

  var city = new exp.entity.Circle({
    'patterns': [
      exp.svgs.getSvg('planet-city')
    ],
    'detailFactor': 1.8,
    'foldable': true,
    'useLighting': true,
    'width': params['size'] * size,
    'height': params['size'] * size,
    'direction': -1,
    'unfoldOpen': true,
    'unfoldOpenSpeed': .3,
    'unfoldAngle': 90,
    'tags': exp.Tags.PLANET,
    'position': [
      (params['x'] - 0.5) * spacing,
      (1 - params['y'] - 0.5) * spacing,
      10
    ]
  }, 'city' + params['index']);

  exp.manager.addEntity(city);
  city.getObject().rotation.z = Math.random() * Math.PI * 2;

  this.cities_.push(city);

  exp.soundManager.playSound('planet/CityDot_Single',
    null,
    {'pitchVariance': 0.4});
};

/**
 * Run this entity when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Cities.prototype.inactiveTick = function(delta, now) {
  if (this.cityScale_ <= 0) {
    exp.manager.removeEntity(this);
  } else {
    for (var i = 0; i < this.cities_.length; i++) {
      this.cities_[i].getObject().scale.set(
        this.cityScale_,
        this.cityScale_,
        this.cityScale_);
    }
  }
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Cities.prototype.activeTick = function(delta, now) {
  if (exp.soundManager.supportsAudioAnalysis) {
    var scale = exp.soundManager.smoothedVolume * 1.5 + 0.35;
    for (var i = 0; i < this.cities_.length; i++) {
      this.cities_[i].getObject().scale.set(scale, scale, scale);
    }
  }

  if ((this.cities_.length !== 0) && (Math.random() > 0.95)) {
    var idx = THREE.Math.randInt(0, this.cities_.length - 1);
    this.cities_[idx].createSlice(true, 1);
  }
};
