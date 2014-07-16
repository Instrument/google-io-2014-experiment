goog.provide('exp.entity.neural.Eyeball');
goog.require('exp.entity.Slice');

/**
 * The entity that is a Silicon atom.
 * @constructor
 * @param {object} params All parameters for initialization.
 */
exp.entity.neural.Eyeball = function(params) {
  params = {
    'foldable': true,
    'patterns': [
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-pingpong'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-energyDrink'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-GameController'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-UFO'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-DOGE'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-Boombox'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-MonaLisa'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-R-HEX-v2'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-Banana-v2'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-rubix'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-donut'),
      exp.svgs.getSvg('neural-eyeball'),
      exp.svgs.getSvg('neural-cat')
    ],
    'useLighting': true,
    'patternsRepeat': true,
    'width': 100,
    'height': 100,
    'direction': -1,
    'unfoldOpen': true,
    'unfoldOpenSpeed': .4,
    'unfoldAngle': 90,
    'detailFactor': 4,
    'tags': exp.Tags.NEURAL
  };
  goog.base(this, params);

  var obj = this;
  obj.blinkHold_ = false;

  obj.getObject().position.z = -1;
  this.isFoldable();

  this.failedColors_ = null;

};
goog.inherits(exp.entity.neural.Eyeball, exp.entity.Core);

/**
 * Call when slice has started moving.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.neural.Eyeball.prototype.sliceStart = function(data) {
  goog.base(this, 'sliceStart', data);
  this.updateColorChoices(this.rightSlice_);
};

/**
 * Call when slice has reached halfway point.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.neural.Eyeball.prototype.sliceHalfway = function(data) {
  goog.base(this, 'sliceHalfway', data);
  this.updateColorChoices(data.slice);
};

/**
 * Call when slice has stoped moving.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.neural.Eyeball.prototype.sliceClosed = function(data) {
  goog.base(this, 'sliceClosed', data);
  this.updateColorChoices(this.leftSlice_);
};

/**
 * Create a slice and add it to this entity.
 * @param {boolean=false} animate If the slice should animate.
 * @param {number=1} speed The animation speed.
 * @param {number=0} angle The slice angle.
 */
exp.entity.neural.Eyeball.prototype.createSlice = function(animate,
                                                           speed,
                                                           angle) {
  goog.base(this, 'createSlice', animate, speed, angle);
  for (var i = 0; i < this.slices_.length; i++) {
    this.updateColorChoices(this.slices_[i].slice);
  }
};

/**
 * Color the sides of the failed Rubix Cube.
 * @param {exp.entity.Slice} slice The slice to color.
 */
exp.entity.neural.Eyeball.prototype.updateColorChoices = function(slice) {
  for (var i = 1; i < 4; i++) {
    var colorChoices = goog.dom.getElementsByClass(
      'color-choice-' + i, slice.getElement());
    if (colorChoices) {
      for (var j = 0; j < colorChoices.length; j++) {
        colorChoices[j].setAttribute('fill', this.failedColors_[i - 1]);
      }
    }
  }
};
