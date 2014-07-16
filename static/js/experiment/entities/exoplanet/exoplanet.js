goog.provide('exp.entity.exoplanet.Exoplanet');
goog.require('exp.entity.Circle');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * A entity that is put into the experiment
 * @constructor
 * @param {object} params the parameters for this entity.
 * @param {string} id the unique instance id for this entity.
 */
exp.entity.exoplanet.Exoplanet = function(params, id) {

  var size = params['size'] || 300;

  var uniquePatterns = [];

  for (var i = 0; i < params['patterns'].length; i++) {
    uniquePatterns.push(exp.svgs.getSvg(params['patterns'][i]));
  }
  this.planetNames_ = params['patterns'];
  var newParams = {
    'patterns' : uniquePatterns,
    'detailFactor' : params['detail'],
    'patternsRepeat' : true,
    'useLighting' : true,
    'foldable': true,
    'foldSpeed': 2,
    'width' : size,
    'height' : size,
    'direction': 1,
    'position': params['position'],
    'tags': exp.Tags.EXOPLANET
  };

  goog.base(this, newParams, id);

  this.parentChapter_ = params['chapter'];
  this.voyager_ = params['voyager'];
  this.radius_ = size / 2;

  this.nameIdx = 0;
  this.bindInputEvent('tap', this.onTapPlanet);

};
goog.inherits(exp.entity.exoplanet.Exoplanet, exp.entity.Circle);

/**
 * When a planet it tapped.
 */
exp.entity.exoplanet.Exoplanet.prototype.onTapPlanet = function() {
  if (exp.background) {
    this.nameIdx++;

    var name = this.planetNames_[this.nameIdx % 3];
    if (name) {
      exp.log('exo-' + name.split('-')[1]);
    }

    this.parentChapter_.zoomOut();

    var idx = THREE.Math.randInt(1, 2);
    exp.soundManager.playSound('exoplanet/PageFlip_0' + idx,
      null,
      {'pitchVariance': 0.3});
    this.voyager_.setTarget(this.object_, this.radius_);
    this.createSlice(true, 1);
  }
};
