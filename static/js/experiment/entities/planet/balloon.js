goog.provide('exp.entity.planet.Balloon');

goog.require('exp.entity.Svg');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * Balloons.  They orbit the origin and are draggable.
 * @param {number} index The index for this balloon (to help avoid clumping).
 * @param {boolean} fromPartial Is this from the experiment or a page.
 * @param {number} elementWidth The container element width.
 * @param {number} track The track the balloon rides along.
 * @param {array} leaves Specific colors for balloon slices.
 * @constructor
 */
exp.entity.planet.Balloon = function(index, fromPartial,
                                     elementWidth, track, leaves) {
  goog.base(this, {
    'detailFactor': .4
  });

  this.rotationSpeed_ = THREE.Math.randFloat(1.7, 2);
  this.object_.rotation.y = THREE.Math.randFloat(0, -Math.PI * 2);

  this.wrapAngle_ = Math.PI * 1.5;

  this.isPartial_ = fromPartial;

  this.velocity_ = new THREE.Vector3();
  this.targetPosition_ = new THREE.Vector3();
  this.dragTargetPosition_ = new THREE.Vector3();

  this.targetPosition_.y = THREE.Math.randFloat(-50, 180);
  this.baseY_ = this.targetPosition_.y;
  this.bobOffset_ = Math.random() * Math.PI;
  this.bobFrequency_ = THREE.Math.randFloat(0.5, 1.0);
  this.bobHeight_ = THREE.Math.randFloat(8, 15);
  this.speed_ = Math.random() * 50 + 10;
  this.track = track;
  this.fullyOpaque_ = false;
  this.rotationOffset_ = Math.random() * .1;

  var startRadius = THREE.Math.randFloat(150, 180);

  var step = Math.PI / 6;
  this.targetAngle_ = (index * step) + THREE.Math.randFloat(0.4, 0.6);
  this.targetRadius_ = THREE.Math.randFloat(180, 250);

  if (!this.isPartial_) {
    this.object_.position.x = Math.cos(this.targetAngle_) * startRadius;
    this.object_.position.z = Math.sin(this.targetAngle_) * startRadius;

    var startScale = THREE.Math.randFloat(0.25, 0.25);
    this.object_.scale.set(startScale, startScale, startScale);
  } else {
    this.object_.scale.set(
      track / 5, track / 5, track / 5);
    this.object_.position.z = 5 + track * 20;
    var location = exp.manager.getWorldLocation(elementWidth, 0,
      this.object_.position.z);
    this.object_.position.x = location.x / exp.manager.ratio_ + 100;
    this.object_.position.y = Math.random() * 50;
  }

  this.dragging_ = false;

  this.leaves_ = [];

  var sides = THREE.Math.randInt(3, 6);
  var angleIncrement = (Math.PI * 2) / sides;

  if (this.isPartial_) {
    angleIncrement = (Math.PI * 2) / leaves.length;
    for (var i = 0; i < leaves.length; i++) {
      var svgName = 'planet-balloon-' + leaves[i] + '-half';
      this.leaves_.push(this.createLeaf_(svgName, angleIncrement * i));
    }
  } else {
    if (sides % 2 !== 0) {
      var svgName = this.getRandomSvg_();
      for (var i = 0; i < sides; i++) {
        this.leaves_.push(this.createLeaf_(svgName, angleIncrement * i));
      }
    } else {
      var idx1 = THREE.Math.randInt(1, 3);
      for (var i = 0; i < sides; i++) {
        var idx2 = (i % 2 === 0) ? 1 : 2;
        var svgName = 'planet-balloon-' + idx1 + '-' + idx2 + '-half';
        this.leaves_.push(this.createLeaf_(svgName, angleIncrement * i));
      }
    }
  }
};
goog.inherits(exp.entity.planet.Balloon, exp.entity.Core);

/**
 * Get the name of a random SVG asset for a balloon leaf.
 * @return {string} The name of an SVG resource.
 * @private
 */
exp.entity.planet.Balloon.prototype.getRandomSvg_ = function() {
  var idx1 = THREE.Math.randInt(1, 3);
  var idx2 = THREE.Math.randInt(1, 2);
  return 'planet-balloon-' + idx1 + '-' + idx2 + '-half';
};

/**
 * Create an individual half-balloon leaf to make them look more 3d.
 * @param {string} svgName The name of the SVG resource for this leaf.
 * @param {number} angle The angle of the new leaf.
 * @return {exp.entity.Svg} The newly created leaf entity.
 * @private
 */
exp.entity.planet.Balloon.prototype.createLeaf_ = function(svgName, angle) {
  var leaf = new exp.entity.Svg({
    'content': exp.svgs.getSvg(svgName),
    'detailFactor': this.isPartial_ ? 3 : 1.5,
    'width': 28,
    'height': 60,
    'useLighting': true,
    'tags': exp.Tags.PLANET
  });

  exp.manager.addEntity(leaf);
  this.object_.add(leaf.getObject());
  leaf.parent_ = this;

  leaf.bindInputEvent('dragstart', function(e) {
    this.parent_.dragging_ = true;
  });

  leaf.bindInputEvent('drag', function(e) {
    if (this.parent_.dragging_) {
      var worldPosition = exp.manager.getWorldLocation(
          e['gesture']['center']['pageX'],
          e['gesture']['center']['pageY'], this.parent_.object_.position.z);
      this.parent_.dragTargetPosition_.copy(worldPosition);
    }
  });

  leaf.bindInputEvent('dragend', function(e) {
    var newY = this.parent_.dragTargetPosition_.y;
    newY = THREE.Math.clamp(newY, -180, 180);
    this.parent_.baseY_ = newY;
    this.parent_.dragging_ = false;
  });

  var x = Math.cos(-angle) * 14;
  var z = Math.sin(-angle) * 14;

  leaf.getObject().position.z = z;
  leaf.getObject().position.x = x;
  leaf.getObject().rotation.y = angle;

  return leaf;
};

/**
 * Run this entity when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Balloon.prototype.inactiveTick = function(delta, now) {
  goog.base(this, 'inactiveTick', delta, now);

  if (this.targetAngle_ < this.wrapAngle_) {
    this.targetAngle_ += delta * 1.5;

    this.targetPosition_.x = Math.cos(this.targetAngle_) * this.targetRadius_;
    this.targetPosition_.z = Math.sin(this.targetAngle_) *
      this.targetRadius_ * 0.5;

    // Move towards the equator.
    if (Math.abs(this.targetPosition_.y) > 50) {
      this.targetPosition_.y *= 0.975;
    }

    this.updatePosition_(delta, this.targetPosition_, 100, 0.71);
  } else {
    exp.manager.removeEntity(this);
  }
};

/**
 * Remove leaves.
 */
exp.entity.planet.Balloon.prototype.disposeInternal = function() {
  for (var i = 0; i < this.leaves_.length; i++) {
    exp.manager.removeEntity(this.leaves_[i]);
  }
  this.leaves_.length = 0;
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Balloon.prototype.activeTick = function(delta, now) {
  goog.base(this, 'activeTick', delta, now);
  this.targetAngle_ += delta * 0.2;
  if (this.targetAngle_ > this.wrapAngle_) {
    this.targetAngle_ -= Math.PI * 2;
  }

  var bobAngle = (now * this.bobFrequency_) + this.bobOffset_;

  if (! this.isPartial_) {
    var scale = this.object_.scale.x;
    scale += (1 - scale) * 0.01;
    this.object_.scale.set(scale, scale, scale);

    this.targetPosition_.y = this.baseY_ + Math.sin(bobAngle) * this.bobHeight_;

    this.targetPosition_.x = Math.cos(this.targetAngle_) * this.targetRadius_;
    this.targetPosition_.z = Math.sin(this.targetAngle_) *
      this.targetRadius_ * 0.5;
  }

  if (this.dragging_) {
    this.updatePosition_(delta, this.dragTargetPosition_, 75, 0.95);
  } else {
    this.updatePosition_(delta, this.targetPosition_, 8, 0.9);
  }
};

/**
 * Update the position of the satalite.
 * @param {number} delta Delta between this and the previous frame.
 * @param {THREE.Vector3} targetPosition The position to move toward.
 * @param {number} speed Acceleration multiplier.
 * @param {number} damping Velocity damping factor.
 * @private
 */
exp.entity.planet.Balloon.prototype.updatePosition_ = function(delta,
  targetPosition, speed, damping) {

  var tmpVec = exp.vectorPool.allocate();

  tmpVec.copy(targetPosition);
  tmpVec.sub(this.object_.position);

  // limit max acceleration.
  if (tmpVec.length() > speed) {
    tmpVec.normalize();
    tmpVec.multiplyScalar(speed);
  }

  tmpVec.multiplyScalar(delta);

  this.velocity_.add(tmpVec);
  this.velocity_.multiplyScalar(damping);

  if (!this.isPartial_) {
    this.object_.position.add(this.velocity_);
  }

  exp.vectorPool.free(tmpVec);

  if (this.isPartial_) {
    this.object_.rotation.y += (delta * this.velocity_.length()) *
      (.5 + this.rotationOffset_);
  } else {
    this.object_.rotation.y += (delta * this.velocity_.length() * 0.5) +
      (delta * this.rotationSpeed_);
  }
};
