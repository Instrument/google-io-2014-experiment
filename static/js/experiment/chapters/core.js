goog.provide('exp.chapter.Core');

goog.require('exp.Svgs');
goog.require('exp.Tags');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * A chapter that is put into the experiment
 * @param {string} name The name of this chapter.
 * @constructor
 */
exp.chapter.Core = function(name) {
  var obj = this;

  obj.name_ = name;
  obj.isActive_ = false;

  obj.lastAggitation_ = 0;

  obj.aggitationLevel_ = 0;
  obj.trackingAggitation_ = false;
  obj.transitionLevel_ = 5;
  obj.degradeAggitationRate_ = 1;
  obj.ambientSoundLoop_ = null;
};

/**
 * Initialize the chapter.
 * @param {exp.Manager} manager A reference to the manager.
 * @param {function} callback A callback to invoke when the chapter is ready.
 */
exp.chapter.Core.prototype.prepare = function(manager, callback) {
  var obj = this;

  obj.manager_ = manager;

  obj.ready(callback);
};

/**
 * Set the active/inactive state.
 * @param {boolean} isActive The new active state.
 * @param {boolean} isMobile If chapter is mobile.
 */
exp.chapter.Core.prototype.setActive = function(isActive, isMobile) {
  this.isActive_ = isActive;
  if (isActive) {
    this.aggitationLevel_ = 0;
    this.trackingAggitation_ = true;
    if (exp.manager) {
      isMobile = exp.manager.isMobile();
    }
    if (this.ambientTrack_ && !isMobile &&
      !this.ambientTrackDelay_) {
        if (exp.soundManager) {
          this.startAmbientTrack();
          exp.soundManager.playSound('common/BigRumble', null, {'gain': .7});
        }
    }
  } else {
    // chapter is being set to inactive, stop ambient audio.
    if (this.ambientSoundLoop_) {
      if (exp.soundManager) {
        exp.soundManager.cancelSound(this.ambientSoundLoop_);
      }
      this.ambientSoundLoop_ = null;
    }
  }
};

/**
 * Play background track for chapter.
 */
exp.chapter.Core.prototype.startAmbientTrack = function() {
  this.ambientSoundLoop_ = exp.soundManager.playSound(this.ambientTrack_,
    null,
    {'loop': true, 'gain': this.ambientTrackGain_ || 1});
};

/**
 * Drag event handler for Hammer.js
 * @param {number} deltaX The amount of movement in the X axis.
 * @param {number} deltaY The amount of movement in the Y axis.
 * @param {Object} gesture The gesture object from Hammer.js.
 */
exp.chapter.Core.prototype.onDrag = function(deltaX, deltaY, gesture) {
  // no-op
};

/**
 * Drag end event handler for Hammer.js
 */
exp.chapter.Core.prototype.onDragEnd = function() {
  // no-op
};

/**
 * Tap event handler for Hammer.js.
 * @param {object} gesture The Hammer.js gesture object.
 */
exp.chapter.Core.prototype.tap = function(gesture) {
  // no-op
};

/**
 * Event handler for Hammer.js pinchIn event.
 * @param {Object} event The event object from Hammer.js.
 */
exp.chapter.Core.prototype.pinchIn = function(event) {
  // no-op
};

/**
 * Event handler for Hammer.js pinchOut event.
 * @param {Object} event The event object from Hammer.js.
 */
exp.chapter.Core.prototype.pinchOut = function(event) {
  // no-op
};

/**
 * Event handler for Hammer.js release event.
 * @param {Object} event The event object from Hammer.js.
 */
exp.chapter.Core.prototype.pinchEnd = function(event) {
  // no-op
};

/**
 * Get the aggitation level for the chapter.
 * @param {number} isActive True if the chapter is active.
 * @return {number} Floating point number indicating the aggitation level.
 */
exp.chapter.Core.prototype.getAggitation = function(isActive) {
  return this.aggitationLevel_;
};

/**
 * Get the threshold aggitation value to trigger a transision.
 * @return {number} Threshold value.
 */
exp.chapter.Core.prototype.getAggitationTransition = function() {
  return this.transitionLevel_;
};

/**
 * Increase the current aggitation level.
 */
exp.chapter.Core.prototype.increaseAggitation = function() {
  if (!this.trackingAggitation_) { return; }

  this.aggitationLevel_++;
  if (this.aggitationLevel_ >= this.transitionLevel_) {
    this.onMaxAggitation();
    this.trackingAggitation_ = false;
  }
};

/**
 * When we reach the max.
 */
exp.chapter.Core.prototype.onMaxAggitation = function() {
  exp.manager.nextChapter();
};

/**
 * Decrease the current aggitation level.
 */
exp.chapter.Core.prototype.decreaseAggitation = function() {
  if (--this.aggitationLevel_ < 0) {
    this.aggitationLevel_ = 0;
  }
};

/**
 * Set the callback to invoke when this chapter is ready.
 * @param {function} callback The callback to invoke.
 */
exp.chapter.Core.prototype.ready = function(callback) {
  // no-op
};

/**
 * Hook to get notified when the viewport size changes.
 */
exp.chapter.Core.prototype.updateViewport = function() {
  // no-op
};

/**
 * Inactive tick.
 * @param {number} delta Time between ticks, in fractional seconds.
 * @param {number} now The current run-time in fractional seconds.
 */
exp.chapter.Core.prototype.inactiveTick = function(delta, now) {
  // no-op
};

/**
 * Active tick.
 * @param {number} delta Time between ticks, in fractional seconds.
 * @param {number} now The current run-time in fractional seconds.
 */
exp.chapter.Core.prototype.activeTick = function(delta, now) {
  if (this.degradeAggitationRate_ !== 0) {
    this.aggitationLevel_ -= this.degradeAggitationRate_ * delta;
    this.aggitationLevel_ = THREE.Math.clamp(this.aggitationLevel_,
                              0, this.transitionLevel_ + 1);
  }
};

/**
 * Add an entity to the scene.
 * @param {exp.entity.Core} entity The entity to be added.
 */
exp.chapter.Core.prototype.addEntity = function(entity) {
  this.manager_.addEntity(entity);
};

/**
 * Remove an entity from the scene.
 * @param {exp.entity.Core} entity The entity to remove.
 */
exp.chapter.Core.prototype.removeEntity = function(entity) {
  this.manager_.removeEntity(entity);
};

/**
 * Run this chapter when it is active.
 * @param {number} delta Time between ticks, in fractional seconds.
 * @param {number} now The current run-time in fractional seconds.
 */
exp.chapter.Core.prototype.tick = function(delta, now) {
  if (this.isActive_) {
    this.activeTick(delta, now);
  } else {
    this.inactiveTick(delta, now);
  }
};
