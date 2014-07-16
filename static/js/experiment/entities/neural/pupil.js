goog.provide('exp.entity.neural.Pupil');

goog.require('exp.entity.Slice');

/**
 * The entity that is a Silicon atom.
 * @constructor
 * @param {object} params All parameters for initialization.
 */
exp.entity.neural.Pupil = function(params) {
  params = {
    'foldable': true,
    'patterns': [
      exp.svgs.getSvg('neural-pupil')
    ],
    'useLighting': true,
    'patternsRepeat': true,
    'width': 40,
    'height': 40,
    'direction': -1,
    'unfoldOpen': true,
    'unfoldOpenSpeed': .4,
    'unfoldAngle': 90,
    'detailFactor': 2,
    'tags': exp.Tags.NEURAL
  };
  goog.base(this, params);

  var obj = this;
  this.isFoldable();

  obj.isReady_ = false;
};
goog.inherits(exp.entity.neural.Pupil, exp.entity.Core);

/**
 * Get the blink hold status.
 * @return {boolean} this.blinkHold_ If blink should be held.
 */
exp.entity.neural.Pupil.prototype.blinkHold = function() {
  return this.blinkHold_;
};

/**
 * Get the entity status
 * @return {boolean} this.isReady_ If entity is ready.
 */
exp.entity.neural.Pupil.prototype.isReady = function() {
  return this.isReady_;
};

/**
 * Set the blink hold status.
 * @param {boolean} hold If blink should be held.
 */
exp.entity.neural.Pupil.prototype.setBlinkHold = function(hold) {
  this.blinkHold_ = hold;
};

/**
 * Run when a blink is closed.
 */
exp.entity.neural.Pupil.prototype.blinkClosed = function() {
  goog.base(this, 'blinkClosed');

  if (this.blinkHold_) {
    this.blinkClose_ = false;
    this.blinkOpen_ = false;
    this.leftSlice_.getElement().style.opacity = 0;
    this.rightSlice_.getElement().style.opacity = 0;
  }
};

/**
 * Run when an unfold completes.
 */
exp.entity.neural.Pupil.prototype.unfoldComplete = function() {
  goog.base(this, 'unfoldComplete');

  this.isReady_ = true;
};

/**
 * Run when a blink updates.
 */
exp.entity.neural.Pupil.prototype.blinkUpdate = function() {
  goog.base(this, 'blinkUpdate');

  if (this.blinkHold_ && this.blinkOpen_) {
    this.blinkClose_ = false;
    this.blinkOpen_ = false;
    this.blink(.3);
  }
};

/**
 * Remove a closed blink.
 */
exp.entity.neural.Pupil.prototype.removeBlinkClosed = function() {
  this.unblink();
  this.blinkHold_ = false;
  this.leftSlice_.getElement().style.opacity = 1;
  this.rightSlice_.getElement().style.opacity = 1;
};
