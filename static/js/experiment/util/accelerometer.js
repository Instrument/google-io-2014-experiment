goog.provide('exp.Accelerometer');

/**
 * A class to manager accelerometer input.
 * @constructor
 */
exp.Accelerometer = function() {
  this.lastSampleX_ = 0;
  this.lastSampleY_ = 0;

  this.currentX_ = 0;
  this.currentY_ = 0;

  this.velocityX_ = 0;
  this.velocityY_ = 0;

  this.spring_ = 5;
  this.damping_ = 0.004;

  this.enabled = false;
};

/**
 * Initialize this component.
 */
exp.Accelerometer.prototype.init = function() {
  if (Modernizr['touch']) {
    window.ondevicemotion = goog.bind(function(event) {
      this.lastSampleX_ = event.accelerationIncludingGravity.x;
      this.lastSampleY_ = event.accelerationIncludingGravity.y;
      this.enabled = true;
    }, this);
  }
};

/**
 * Update the accelerometer values.
 * @param {number} delta The amount of time since the last update.
 */
exp.Accelerometer.prototype.update = function(delta) {
  this.currentX_ += (this.lastSampleX_ - this.currentX_) * this.spring_ * delta;
  this.currentY_ += (this.lastSampleY_ - this.currentY_) * this.spring_ * delta;
};

/**
 * Get the current X axis value of the accelerometer.
 * @return {number} Acceleration in the X axis (in G's)
 */
exp.Accelerometer.prototype.getX = function() {
  return this.currentX_;
};

/**
 * Get the current Y axis value of the accelerometer.
 * @return {number} Acceleration in the Y axis (in G's)
 */
exp.Accelerometer.prototype.getY = function() {
  return this.currentY_;
};

/**
 * Set a vector to match the current X and Y axis values.
 * @param {THREE.Vector2, THREE.Vector3} vec A vector to be set.
 */
exp.Accelerometer.prototype.getVector = function(vec) {
  vec.x = this.currentX_;
  vec.y = this.currentY_;
};
