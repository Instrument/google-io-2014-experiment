goog.provide('exp.MouseTracker');

goog.require('goog.events');

/**
 * A class to manager accelerometer input.
 * @constructor
 */
exp.MouseTracker = function() {
  this.lastSampleX_ = 0;
  this.lastSampleY_ = 0;

  this.currentX_ = 0;
  this.currentY_ = 0;

  this.velocityX_ = 0;
  this.velocityY_ = 0;

  this.spring_ = 5;
  this.damping_ = 0.004;

  this.enabled = false;
  this.isTracking = false;
  this.flipY = true;

  this.multiplierX = 40;
  this.multiplierY = 40;
};

/**
 * Initialize this component.
 */
exp.MouseTracker.prototype.init = function() {
  goog.events.listen(document, 'mousemove', goog.bind(function(event) {
    if (this.isTracking) {
      var x = event.clientX - (window.innerWidth / 2);
      var y = event.clientY - (window.innerHeight / 2);
      this.lastSampleX_ = x / (window.innerWidth / 2);
      this.lastSampleY_ =
        (this.flipY ? -1 : -1) * (y / (window.innerHeight / 2));
    }
    this.enabled = true;
  }, this));
};

/**
 * Start tracking
 */
exp.MouseTracker.prototype.startTracking = function() {
  this.isTracking = true;
};

/**
 * Stop tracking
 */
exp.MouseTracker.prototype.stopTracking = function() {
  this.isTracking = false;
  this.lastSampleX_ = 0;
  this.lastSampleY_ = 0;
};

/**
 * Update the accelerometer values.
 * @param {number} delta The amount of time since the last update.
 */
exp.MouseTracker.prototype.update = function(delta) {
  this.currentX_ += (this.lastSampleX_ - this.currentX_) * this.spring_ * delta;
  this.currentY_ += (this.lastSampleY_ - this.currentY_) * this.spring_ * delta;
};

/**
 * Get the current X axis value of the accelerometer.
 * @return {number} Acceleration in the X axis (in G's)
 */
exp.MouseTracker.prototype.getX = function() {
  return this.currentX_;
};

/**
 * Get the current Y axis value of the accelerometer.
 * @return {number} Acceleration in the Y axis (in G's)
 */
exp.MouseTracker.prototype.getY = function() {
  return this.currentY_;
};

/**
 * Set a vector to match the current X and Y axis values.
 * @param {THREE.Vector2, THREE.Vector3} vec A vector to be set.
 */
exp.MouseTracker.prototype.getVector = function(vec) {
  vec.x = this.currentX_;
  vec.y = this.currentY_;
};
