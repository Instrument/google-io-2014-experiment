goog.provide('exp.entity.boson.Hobocloud');

goog.require('exp.entity.boson.Hobo');

/**
 * A cloud of Hobo particles.
 * @constructor
 */
exp.entity.boson.Hobocloud = function() {
  goog.base(this, {});
  var obj = this;

  this.hobos_ = [];

  this.colors_ = [
    '#6ad085',
    '#3ebfcb',
    '#3ebfcb',
    '#6ad085',
    '#80d967',
    '#ade94c',
    '#80d967',
    '#53c7a7',
    '#3ebfcb',
    '#ffffff',
    '#2ab7f0',
    '#3ebfcb',
    '#53c7a7',
    '#6ad085',
    '#80d967',
    '#ade94c',
    '#80d967',
    '#2ab7f0',
    '#3ebfcb',
    '#80d967',
    '#80d967',
    '#80d967'
  ];

  for (var i = 0; i < this.colors_.length; i++) {
    var hobo = new exp.entity.boson.Hobo(
      this.colors_[i % this.colors_.length], i % 4, i);
    exp.manager.addEntity(hobo);
    this.getObject().add(hobo.getObject());
    this.hobos_.push(hobo);
  }

  this.collapsedIndex_ = this.hobos_.length;
  this.getObject().scale.set(0, 0, 0);
  var scaleParams = {'scale': 0};
  TweenMax.to(scaleParams, .8, {'scale': 1, 'onUpdate': function() {
      obj.getObject().scale.set(
        scaleParams['scale'],
        scaleParams['scale'],
        scaleParams['scale']
      );
    }
  });

  this.noiseLoop_ = null;
};
goog.inherits(exp.entity.boson.Hobocloud, exp.entity.Core);

/**
 * Center cloud.
 */
exp.entity.boson.Hobocloud.prototype.reset = function() {
  this.getObject().scale.set(1, 1, 1);
  this.getObject().position.z = 0;
};

/**
 * Show all hobos.
 */
exp.entity.boson.Hobocloud.prototype.showChildren = function() {
  this.collapsedIndex_ = 0;

  for (var i = 0; i < this.hobos_.length - 2; i++) {
    this.hobos_[i].startRadius();
    this.hobos_[i].collapsing_ = false;
    this.hobos_[i].radius_ = 140;
    this.hobos_[i].speed_ = 2;
    this.hobos_[i].isActive_ = true;
    this.hobos_[i].cssObject_['visible'] = true;
  }

  this.startNoiseLoop();
};

/**
 * Start the hobo cloud whirling noise
 */
exp.entity.boson.Hobocloud.prototype.startNoiseLoop = function() {
  if (window.innerWidth >= 768) {
    this.noiseLoop_ = exp.soundManager.playSound(
      'boson/SpinningParticleNoiseLoop', null, {'loop': true, 'gain': .8});
  }
};

/**
 * Stop the hobo cloud whirling noise
 */
exp.entity.boson.Hobocloud.prototype.stopNoiseLoop = function() {
  if (window.innerWidth >= 768) {
    exp.soundManager.cancelSound(this.noiseLoop_);
  }
};

/**
 * Hide all hobos.
 */
exp.entity.boson.Hobocloud.prototype.hideChildren = function() {
  for (var i = 0; i < this.hobos_.length; i++) {
    this.hobos_[i].cssObject_['visible'] = false;
  }
  this.stopNoiseLoop();
};

/**
 * Choose hobos to collapse to the center.
 * @param {array} filledTris Triangles to send hobos to.
 */
exp.entity.boson.Hobocloud.prototype.collapse = function(filledTris) {
  var startingIndex = this.collapsedIndex_;
  var endCount = Math.min(startingIndex + 4, this.hobos_.length - 1);

  var fillCount = 0;
  for (var i = startingIndex; i <= endCount; i++) {
    this.hobos_[i].collapse(filledTris[fillCount][0],
      filledTris[fillCount][1],
      goog.bind(this.hasMovedToTri, this, this.hobos_[i],
        filledTris[fillCount][1]));
    fillCount++;
  }

  this.collapsedIndex_ = i;

  for (var j = 0; j < this.hobos_.length; j++) {
    if (!this.hobos_[j].isCollapsing()) {
      this.hobos_[j].changeSpeed(.1);
    }
  }
  this.stopNoiseLoop();
  exp.sequencer.add('bosonResetSpeed', 1.6, this.resetSpeed, null, this, null);
};

/**
 * Speed up the particles to normal.
 */
exp.entity.boson.Hobocloud.prototype.resetSpeed = function() {
  var visibleCount = 0;
  for (var i = 0; i < this.hobos_.length; i++) {
    if (!this.hobos_[i].isCollapsing()) {
      this.hobos_[i].changeSpeed(2);
    }
    if (this.hobos_[i].cssObject_['visible']) {
      visibleCount++;
    }
  }
  if (visibleCount) {
    this.startNoiseLoop();
  }
};

/**
 * Hobo has been moved to triangle.
 * @param {exp.entity.boson.Hobo} hobo The hobo that was moved.
 * @param {exp.entity.Triangle} tri Triangle moved to.
 */
exp.entity.boson.Hobocloud.prototype.hasMovedToTri = function(hobo, tri) {
  tri.geo_.fillIn();
  this.removeHobo(hobo);
};

/**
 * Kill a hobo, of course.
 * @param {exp.entity.boson.Hobo} hobo The hobo to turn off visibility for.
 */
exp.entity.boson.Hobocloud.prototype.removeHobo = function(hobo) {
  hobo.cssObject_['visible'] = false;
  hobo.reset();
};
