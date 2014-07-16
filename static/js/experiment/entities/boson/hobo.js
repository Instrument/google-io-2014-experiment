goog.provide('exp.entity.boson.Hobo');

goog.require('exp.entity.Svg');

/**
 * Create a triangle for the icosahedron.
 * @param {string} color The color upon filling.
 * @param {number} type Random shape.
 * @param {number} num Order created.
 * @constructor
 */
exp.entity.boson.Hobo = function(color, type, num) {
  this.shapes_ = [
    '<circle fill="' + color + '" cx="15" cy="15" r="15"/>',
    '<rect fill="' + color + '" width="30" height="30" />',
    '<polygon fill="' + color + '" points="0,15 15,0 30,15 15,30" />',
    '<polygon fill="' + color + '" points="22,2 7,2 0,15 8,28 22,28 30,15" />'
  ];
  var params = {
    'content': {
      'html': this.shapes_[type],
      'viewBox': '0 0 30 30'
    },
    'height': 14,
    'width': 14,
    'tags': exp.Tags.BOSON,
    'detailFactor': 3,
    'useLighting': false
  };
  goog.base(this, params);

  this.center_ = new THREE.Vector3(0, 0, 0);
  this.reset();
  this.collapseTween_ = null;
  this.num_ = num;

  this.currPlacement_ = -Math.random() * (Math.PI * 2);
  this.randSeed_ = -Math.random() * (Math.PI * 2);
  this.direction_ = Math.random() > .5 ? 1 : -1;
  this.radius_ = 140;
  this.collapsing_ = false;
  this.speed_ = 2;
};
goog.inherits(exp.entity.boson.Hobo, exp.entity.Svg);

/**
 * Kill tweens of hobo.
 */
exp.entity.boson.Hobo.prototype.reset = function() {
  if (this.speedTween_) {
    this.speedTween_['kill']();
    this.speedTween_ = null;
  }

  if (this.collapseTween_) {
    this.collapseTween_['kill']();
    this.collapseTween_ = null;
  }
};

/**
 * Check if hobo is collapsing.
 * @return {boolean} Collapse value.
 */
exp.entity.boson.Hobo.prototype.isCollapsing = function() {
  return this.collapsing_;
};

/**
 * Grow hobo from the center.
 */
exp.entity.boson.Hobo.prototype.startRadius = function() {
  if (this.startTween_) {
    this.startTween_['kill']();
    this.startTween_ = null;
  }

  var obj = this;
  var radiusParams = {'radius': 0};
  this.startTween_ = TweenMax.to(radiusParams, 1, {
    'radius': 140,
    'onUpdate': function() {
      obj.radius_ = radiusParams['radius'];
    },
    'onComplete': function() {
      this.startTween_ = null;
    },
    'onCompleteScope': this
  });
};

/**
 * Change orbit speed.
 * @param {number} newSpeed New speed for radius.
 */
exp.entity.boson.Hobo.prototype.changeSpeed = function(newSpeed) {
  if (this.speedTween_) {
    this.speedTween_['kill']();
    this.speedTween_ = null;
  }
  var obj = this;
  var speedParams = {'speed': this.speed_};
  this.speedTween_ = TweenMax.to(speedParams, .3, {
    'speed': newSpeed,
    'onUpdate': function() {
      obj.speed_ = speedParams['speed'];
    },
    'onComplete': function() {
      this.speedTween_ = null;
    },
    'onCompleteScope': this
  });
};

/**
 * Move hobo from the center to a triangle.
 * @param {number} offset Distance to travel to.
 * @param {exp.entity.Triangle} tri Triangle to move to.
 * @param {function} callback Callback for after movement.
 */
exp.entity.boson.Hobo.prototype.moveToTri = function(offset, tri, callback) {
  var obj = this;
  this.collapsing_ = true;
  var newPosition = tri.normal_.clone().multiplyScalar(offset);
  var moveParams = {
    'x': this.getObject().position.x,
    'y': this.getObject().position.y,
    'z': this.getObject().position.z
  };
  this.collapseTween_ = TweenMax.to(moveParams, .25, {
    'x': newPosition.x,
    'y': newPosition.y,
    'z': newPosition.z,
    'ease': Linear.easeNone,
    onUpdate: function() {
      obj.getObject().position.set(moveParams.x, moveParams.y, moveParams.z);
      obj.getObject().lookAt(obj.center_);
    },
    onComplete: function() {
      callback();
    }
  });
};

/**
 * Send hobo to the center.
 * @param {number} offset Distance to travel to.
 * @param {exp.entity.Triangle} tri Triangle to move to.
 * @param {function} callback Callback for after movement.
 */
exp.entity.boson.Hobo.prototype.collapse = function(offset, tri, callback) {
  var obj = this;
  this.collapsing_ = true;

  var pulseParams = {'radius': this.radius_};
  if (this.collapseTween_) {
    this.collapseTween_['kill']();
    this.collapseTween_ = null;
  }
  this.collapseTween_ = TweenMax.to(pulseParams, .7 + (this.num_ % 5) * .05, {
    'radius': 0,
    'ease': Back.easeIn,
    'onUpdate': function() {
      obj.radius_ = pulseParams['radius'];
    },
    'onComplete': function() {
      this.collapseTween_ = null;
      obj.moveToTri(offset, tri, callback);
    },
    'onCompleteScope': this
  });
};

/**
 * Active tick.
 * @param {number} delta Time between ticks, in fractional seconds.
 * @param {number} now The current run-time in fractional seconds.
 */
exp.entity.boson.Hobo.prototype.activeTick = function(delta, now) {
  if (this.radius_ && this.cssObject_['visible']) {
    this.currPlacement_ += delta * this.speed_;
    this.getObject().position.x =
      Math.sin(this.currPlacement_) * this.radius_ * this.direction_;
    this.getObject().position.y =
      Math.cos(this.currPlacement_) * this.radius_;
    this.getObject().position.z =
      Math.sin(this.currPlacement_ + this.randSeed_) * this.radius_;

    var tmpVector = exp.vectorPool.allocate();
    tmpVector.copy(exp.manager.camera_.position);
    this.getObject().parent.worldToLocal(tmpVector);
    this.getObject().lookAt(tmpVector);
    exp.vectorPool.free(tmpVector);
  }
};
