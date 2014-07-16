goog.provide('exp.entity.planet.Clouds');

goog.require('exp.entity.Svg');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * Little fluffy clouds.
 * @constructor
 */
exp.entity.planet.Clouds = function() {
  this.clouds_ = [];

  var params = {
    'tags': exp.Tags.PLANET
  };

  this.scale_ = 1.00;
  this.targetScale_ = 1.00;
  this.scaleDelta_ = 0;

  this.orbitDragSpeed_ = 0;
  this.orbitSpeed_ = 0.35;
  this.delay_ = 0;

  this.maxClouds_ = 6;

  this.cloudAngles_ = [];
  this.clouds_ = [];
  this.cloudSpawnAngle_ = 0;

  goog.base(this, params, 'clouds');
};
goog.inherits(exp.entity.planet.Clouds, exp.entity.Core);

/**
 * Start creating clouds.
 */
exp.entity.planet.Clouds.prototype.spawnClouds = function() {
  this.delay_ = 0.1;
  exp.soundManager.playSound('planet/Clouds');
};

/**
 * Callback to receive pinch events from the parent chapter.
 * @param {number} scale The scale of the pinch.
 * @override
 */
exp.entity.planet.Clouds.prototype.onPinch = function(scale) {
  this.targetScale_ = scale;
};

/**
 * Callback for the end of a pinch event from the parent chapter.
 * @override
 */
exp.entity.planet.Clouds.prototype.onRelease = function() {
  this.targetScale_ = 1;
};

/**
 * Spawn an individual cloud.
 * @private
 */
exp.entity.planet.Clouds.prototype.spawn_ = function() {

  var scale = THREE.Math.randFloat(0.75, 1.25);

  var radius = THREE.Math.randFloat(190, 210);

  var latitude = THREE.Math.randFloat(-Math.PI / 5, 0);
  var y = Math.sin(latitude) * radius;

  var cloud = new exp.entity.Svg({
    'content': exp.svgs.getSvg('planet-cloud'),
    'detailFactor': 1.5,
    'width': 75 * scale,
    'height': 75 * scale,
    'applyLighting': false,
    'position': [0, y, 0],
    'tags': exp.Tags.PLANET
  });

  exp.manager.addEntity(cloud);

  this.object_.add(cloud.getObject());
  this.clouds_.push({
    'angle' : -Math.PI / 2,
    'radius' : Math.cos(latitude) * radius,
    'entity': cloud
  });
  cloud['parent'] = this;
  this.cloudSpawnAngle_ -= Math.PI / 5;

  cloud.bindInputEvent('drag', function(evt) {
    var velocity = evt['gesture']['velocityX'];
    if (evt['gesture']['interimDirection'] === 'right') {
      velocity *= -1;
    }
    this['parent'].onDragClouds_(velocity);
  });

  this.setActive(true);
};

/**
 * Destroy the clouds.
 */
exp.entity.planet.Clouds.prototype.killClouds = function() {
  for (var i = 0; i < this.clouds_.length; i++) {
    exp.manager.removeEntity(this.clouds_[i]['entity']);
  }

  this.clouds_ = [];
};

/**
 * Called when any cloud is dragged.
 * @param {number} delta The drag amount.
 * @private
 */
exp.entity.planet.Clouds.prototype.onDragClouds_ = function(delta) {
  this.orbitDragSpeed_ += delta;
  this.orbitDragSpeed_ = THREE.Math.clamp(this.orbitDragSpeed_, -5, 5);
};

/**
 * Dispose of entities.
 */
exp.entity.planet.Clouds.prototype.disposeInternal = function() {
  this.killClouds();
};

/**
 * Update the clouds.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @private
 */
exp.entity.planet.Clouds.prototype.updateClouds_ = function(delta, now) {
  this.scaleDelta_ += (this.targetScale_ - this.scale_) * 0.01;
  this.scaleDelta_ *= 0.93;

  this.scale_ += this.scaleDelta_;

  if (this.clouds_.length > 0) {

    // do billboarding.
    var tmpVector = exp.vectorPool.allocate();
    tmpVector.copy(exp.manager.camera_.position);
    this.object_.worldToLocal(tmpVector);

    var x, z, cloud;
    for (var i = 0; i < this.clouds_.length; i++) {

      cloud = this.clouds_[i];
      cloud['angle'] += (delta * (this.orbitSpeed_ + this.orbitDragSpeed_));

      x = Math.cos(cloud['angle']) * cloud['radius'];
      z = Math.sin(cloud['angle']) * cloud['radius'] * 0.5;

      cloud['entity'].getObject().position.x = x;
      cloud['entity'].getObject().position.z = z;

      cloud['entity'].getObject().scale.set(
        this.scale_,
        this.scale_,
        this.scale_
      );

      cloud['entity'].getObject().lookAt(tmpVector);
    }

    exp.vectorPool.free(tmpVector);
  }
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Clouds.prototype.activeTick = function(delta, now) {
  if (this.delay_ > 0) {
    this.delay_ -= delta;
    if (this.delay_ <= 0) {
      if (this.clouds_.length < this.maxClouds_) {
        this.spawn_();
        this.delay_ = THREE.Math.randFloat(1.25, 2.5);
      }
    }
  }

  this.updateClouds_(delta, now);
  this.orbitDragSpeed_ *= 0.92;
  if (this.object_.rotation.y < -Math.PI * 2) {
    this.object_.rotation.y += Math.PI * 2;
  }
};

/**
 * Run this entity when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Clouds.prototype.inactiveTick = function(delta, now) {
  this.targetScale_ = 0.0;
  this.updateClouds_(delta, now);
  if (this.scale_ - this.targetScale_ < 0.01) {
    this.killClouds();
  }
};
