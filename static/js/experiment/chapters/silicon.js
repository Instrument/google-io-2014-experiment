goog.provide('exp.chapter.Silicon');

goog.require('exp.chapter.Core');
goog.require('exp.entity.silicon.Structure');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * The chapter that is all about Silicon.
 * @constructor
 */
exp.chapter.Silicon = function() {
  goog.base(this, 'silicon');

  this.tag = exp.Tags.SILICON;

  this.structure_ = null;
  this.isInteractive_ = false;

  this.aggitationLevel_ = 0;
  this.transitionLevel_ = 100;
  this.degradeAggitationRate_ = 0;

  this.ambientTrack_ = 'silicon/AmbientLoop_Scene03';
  this.ambientTrackGain_ = 0.8;
};
goog.inherits(exp.chapter.Silicon, exp.chapter.Core);

/**
 * Sets the active state.
 * @param {boolean} isActive Whether chapter is active or not.
 */
exp.chapter.Silicon.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);

  if (isActive) {
    exp.background.maskToPattern(
      '#ffffff', 'rgba(0,0,0,0.15)', 0.8, false, Linear['easeNone']);
    exp.manager.flipInfoButton(1);
    exp.ui.chapter.setChapter(2);
    this.isInteractive_ = true;

    exp.sequencer.add(
      'initSiliconStructure', 0.3, function() {
        this.structure_ = new exp.entity.silicon.Structure({
          'tags': exp.Tags.SILICON
        });

        this.addEntity(this.structure_, 'cloud');
      }, null, this, null
    );
  } else {
    this.isInteractive_ = false;
    this.structure_.transitionOut();
    this.structure_ = null;
  }
};

/**
 * Increase aggitation to chapter.
 * @param {boolean} isActive Whether chapter is active or not.
 */
exp.chapter.Silicon.prototype.increaseAggitation = function(isActive) {
  if (this.isInteractive_) {
    goog.base(this, 'increaseAggitation', isActive);
  }

  if (this.structure_) {
    if (!this.structure_.transitionReady()) {
      this.aggitationLevel_--;
    } else {
      exp.sequencer.cancel('siliconNextChapter');
      exp.manager.nextChapter();
    }
  } else {
    this.aggitationLevel_--;
  }
};

/**
 * Update viewport functionality.
 */
exp.chapter.Silicon.prototype.updateViewport = function() {
  if (this.structure_) {
    this.structure_.updateScale();
  }
};

/**
 * Tap event handler for Hammer.js.
 * @param {object} gesture The gesture object from Hammer.js.
 */
exp.chapter.Silicon.prototype.tap = function(gesture) {
  if (exp.manager.isIE) {
    if (this.structure_) {
      this.structure_.expandNextNode();
    }
  }
};

/**
 * Change chapter based on drag action.
 * @param {number} deltaX Change in x position since last drag.
 * @param {number} deltaY Change in y position since last drag.
 * @param {object} gesture Gesture event.
 */
exp.chapter.Silicon.prototype.onDrag = function(deltaX, deltaY, gesture) {
  if (this.isInteractive_) {
    if (this.structure_) {
      var ratio = window.innerWidth / window.innerHeight;
      this.structure_.rotationSpeedX_ -= (deltaY * 0.001);
      this.structure_.rotationSpeedY_ -= (-deltaX *
        (ratio > 0.8 ? 0.001 : 0.002));
    }
  }
};

/**
 * Drag end event handler for Hammer.js
 * @param {Object} gesture The gesture object from Hammer.js.
 */
exp.chapter.Silicon.prototype.onDragEnd = function(gesture) {
  goog.base(this, 'onDragEnd');

  if (Math.abs(this.structure_.rotationSpeedX_) > 0.10 ||
      Math.abs(this.structure_.rotationSpeedY_) > 0.10) {
    exp.soundManager.playSound('common/Whoosh_01', null, {
      offset: .4,
      gain: 2
    });

    this.structure_.expandNextNode();
  }
};
