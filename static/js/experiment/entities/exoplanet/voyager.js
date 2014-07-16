goog.provide('exp.entity.exoplanet.Voyager');

goog.require('exp.entity.Svg');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * A grand voyage.
 * @constructor
 */
exp.entity.exoplanet.Voyager = function() {
  goog.base(this, {
    'content': exp.svgs.getSvg('planet-voyager'),
    'detailFactor': 1.5,
    'position': [0, 0, -300],
    'width': 344,
    'height': 108
  }, 'voyager');

  this.element_['style']['pointerEvents'] = 'none';

  this.orbitTarget_ = null;
  this.orbitDistance_ = 80;
  this.orbitSpeed_ = -Math.PI * 0.35;
  this.extraRotation_ = 0;

  // Start with a high velocity to 'launch' out from behind earth.
  this.velocity_ = new THREE.Vector3(-800, 700, -4000);
  this.acceleration_ = new THREE.Vector3();

  this.orbitTargetPoint_ = new THREE.Vector3(0, 0, 1);
  this.orbitAxis_ = new THREE.Vector3(0, 1, 0);

  this.audioPeakCallback_ = goog.bind(function() {
    this.extraRotation_ = Math.random() > 0.5 ? 1 : -1;
  }, this);
  exp.soundManager.setPeakDetectionCallback(this.audioPeakCallback_);

  this.sonarSound_ = null;
};
goog.inherits(exp.entity.exoplanet.Voyager, exp.entity.Svg);

/**
 * Run this entity when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.exoplanet.Voyager.prototype.inactiveTick = function(delta, now) {
  goog.base(this, 'inactiveTick', delta, now);
  this.updatePosition_(delta);
};

/**
 * Set this entity to be active or inactive.
 * @param {boolean} isActive The active state to be set.
 * @override
 */
exp.entity.exoplanet.Voyager.prototype.setActive = function(isActive) {
  if (isActive) {
    this.sonarSound_ = exp.soundManager.playSound(
      'exoplanet/VoyagerSonar',
      null,
      {'loop': true}
    );
  } else {
    if (this.sonarSound_) {
      exp.soundManager.cancelSound(this.sonarSound_);
    }
  }
  goog.base(this, 'setActive', isActive);
};

/**
 * Set a new target for the voyager to orbit.
 * @param {THREE.Object3D} object An object to orbit.
 * @param {number} distance The orbit radius around the target.
 */
exp.entity.exoplanet.Voyager.prototype.setTarget = function(object, distance) {

  if (this.orbitTarget_ !== object) {
    this.orbitDistance_ = distance + 35;
    this.orbitTarget_ = object;

    var targetPos = exp.vectorPool.allocate();
    targetPos.set(0, 0, 0);
    this.orbitTarget_.localToWorld(targetPos);

    this.orbitTargetPoint_.set(0, 0, 1);
    this.orbitAxis_.set(0, 1, 0);

    exp.vectorPool.free(targetPos);
  }
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.exoplanet.Voyager.prototype.activeTick = function(delta, now) {
  goog.base(this, 'activeTick', delta, now);
  this.updatePosition_(delta);
};

/**
 * Update the position of the satalite.
 * @param {number} delta The delta interval since the last update.
 * @private
 */
exp.entity.exoplanet.Voyager.prototype.updatePosition_ = function(delta) {

  this.object_.position.x += this.velocity_.x * delta;
  this.object_.position.y += this.velocity_.y * delta;
  this.object_.position.z += this.velocity_.z * delta;

  if (this.orbitTarget_) {

    // Turn.
    var radius = this.orbitDistance_;
    var orbitSpeed = this.orbitSpeed_;

    // mad beats.
    if (exp.soundManager.supportsAudioAnalysis) {
      radius += exp.soundManager.smoothedVolume * 50;
      this.object_.rotation.z += (this.extraRotation_ * 0.075);
      this.extraRotation_ *= 0.97;
    }

    this.orbitTargetPoint_.applyAxisAngle(this.orbitAxis_, orbitSpeed * delta);

    var targetPos = exp.vectorPool.allocate();
    targetPos.copy(this.orbitTargetPoint_);
    targetPos.multiplyScalar(radius);

    var tmp = exp.vectorPool.allocate();
    tmp.set(0, 0, 0);
    this.orbitTarget_.localToWorld(tmp);

    targetPos.add(tmp);

    // aim at the new target
    this.acceleration_.copy(targetPos);
    this.acceleration_.sub(this.object_.position);

    // cap the speed.
    if (this.acceleration_.length() > 20) {
      this.acceleration_.setLength(20);
    }

    this.object_.rotation.z += 0.2 * delta * (this.acceleration_.length() / 20);


    this.velocity_.add(this.acceleration_);
    this.velocity_.multiplyScalar(0.94);

    exp.vectorPool.free(tmp);
    exp.vectorPool.free(targetPos);
  }

  if (this.sonarSound_) {
    var dist = exp.manager.camera_.position.distanceTo(this.object_.position);

    // modulate volume over the approximate distance ranges for the scene.
    var d = dist - 800;
    d /= 1200;
    d = Math.max(0, Math.min(1, d));

    if ('undefined' !== typeof this.sonarSound_.gain) {
      this.sonarSound_.gain.value = 0.1 + (1 - d) * 0.75;
    }
  }
};
