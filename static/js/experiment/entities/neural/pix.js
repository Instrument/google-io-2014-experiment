goog.provide('exp.entity.neural.Pix');

/**
 * The entity that is a Silicon atom.
 * @constructor
 * @param {object} params All parameters for initialization.
 * @param {array} colors An array of hex colors.
 * @param {object} side Side of pix.
 * @param {number} startPerc Start percentage.
 * @param {boolean} fromPartial If pix is entity of partial.
 */
exp.entity.neural.Pix = function(params, colors, side, startPerc, fromPartial) {
  var obj = this;
  obj.fallSpeed_ = params['fallSpeed'];
  obj.fromPartial_ = fromPartial;
  obj.colors_ = colors;
  obj.scene_ = null;
  obj.blinkRemove_ = false;

  obj.side_ = side;
  obj.orbitPerc_ = startPerc;
  obj.spin_ = 2 - Math.random() * 5;
  obj.rotateSpeed_ = .1 + Math.random() * .15;
  obj.torusRotateSpeed_ = .25;
  obj.torusRadius_ = 10;
  obj.torusCenterBase_ = 185;
  obj.torusCenterOffset_ = 0;
  obj.torusScaleFactor_ = .5;
  obj.torusScaleBase_ = 2.5;
  obj.selectedScale_ = 6;
  obj.stopMoving_ = false;
  obj.queueStopMoving_ = false;

  params = {
    'foldable': true,
    'patterns': [
      exp.svgs.getSvg('neural-data')
    ],
    'useLighting': false,
    'width': 20,
    'height': 30,
    'direction': -1,
    'unfoldOpen': true,
    'unfoldOpenSpeed': .2,
    'unfoldAngle': 90,
    'tags': exp.Tags.NEURAL,
    'detailFactor': exp.manager.isMobile() ? 3 : 10,
    'position': params['position'],
    'shadows': exp.manager.isMobile() ? null : 45,
    'shadowDistance': obj.fromPartial_ ? 10 : 3
  };
  goog.base(this, params);

  this.isFoldable();
  this.getObject().scale.set(1.5, 1.5, 1.5);

  obj.initTime_ = exp.manager.now();

  var leftPolygon = this.leftSlice_.getElement()
    .getElementsByTagName('polygon')[1];
  var rightPolygon = this.rightSlice_.getElement()
    .getElementsByTagName('polygon')[1];

  leftPolygon.setAttribute('fill', obj.colors_[0]);
  rightPolygon.setAttribute(
    'fill', obj.fromPartial_ ? obj.colors_[1] : obj.colors_[0]);

  if (!obj.fromPartial_) {
    this.addTapGesture();
  }

  var ratio = window.innerWidth / window.innerHeight;
  this.updateParams(ratio);
};
goog.inherits(exp.entity.neural.Pix, exp.entity.Core);

/**
 * Get colors.
 * @return {array} this.colors_ An array of colors.
 */
exp.entity.neural.Pix.prototype.getColors = function() {
  return this.colors_;
};

/**
 * Update params based on ratio.
 * @param {number} ratio The screen ratio.
 */
exp.entity.neural.Pix.prototype.updateParams = function(ratio) {
  var scaleFactor = 0;
  if (ratio < 1) {
    scaleFactor = (1 - ratio) * 1.4;
  }
  this.torusScaleBase_ = 2.5 + (scaleFactor * 5);
  this.torusScaleFactor_ = .5 + (scaleFactor * 1.5);
  this.torusCenterBase_ = 170 + (scaleFactor * 40);
  this.selectedScale_ = 6 + (scaleFactor * 15);
};



/**
 * Get the fall speed.
 * @return {number} this.fallSpeed_ The fall speed.
 */
exp.entity.neural.Pix.prototype.getFallSpeed = function() {
  return this.fallSpeed_;
};

/**
 * Active tick.
 * @param {number} delta Delta between orbits.
 */
exp.entity.neural.Pix.prototype.activeTick = function(delta) {
  goog.base(this, 'activeTick');

  if (!this.fromPartial_) {
    if (exp.soundManager.supportsAudioAnalysis) {
      this.torusCenterOffset_ += (exp.soundManager.smoothedVolume * 100 -
        this.torusCenterOffset_) * 0.2;
      this.orbitPerc_ += delta * (exp.soundManager.averageVolume * 10);
    } else {
      this.torusCenterOffset_ = 0;
      this.orbitPerc_ += delta;
    }

    this.getObject().rotation.z += delta * this.spin_;

    var u = this.orbitPerc_ * 4 * this.torusRotateSpeed_;
    var v = this.orbitPerc_ * this.rotateSpeed_;
    if (this.side_) {
      v = -v;
    }
    var torusCenter = this.torusCenterOffset_ + this.torusCenterBase_;
    if (!this.stopMoving_) {
      this.getObject().position.x = (torusCenter +
        (this.torusRadius_ * Math.cos(u))) * Math.cos(v);
      this.getObject().position.y = (torusCenter +
        (this.torusRadius_ * Math.cos(u))) * Math.sin(v);
      this.getObject().position.z = this.torusRadius_ +
        this.torusRadius_ * Math.sin(u);
      var scale = Math.sin(u) * this.torusScaleFactor_ + this.torusScaleBase_;
      this.getObject().scale.set(scale, scale, scale);
    }
  }
};

/**
 * Run when a blink is closed.
 */
exp.entity.neural.Pix.prototype.blinkClosed = function() {
  goog.base(this, 'blinkClosed');

  if (this.blinkRemove_) {
    this.blinkClose_ = true;
    this.blinkOpen_ = true;
    this.killSlices();
    exp.manager.removeEntity(this);
  }
  if (this.queueStopMoving_) {
    this.queueStopMoving_ = false;
    this.stopMoving_ = false;
    this.addTapGesture();
  }
  if (this.fromPartial_) {
    this.getObject().position.x = this.origX + 15 - Math.random() * 30;
    this.getObject().position.y = this.origY + 15 - Math.random() * 30;
    this.getObject().rotation.z = 1 - Math.random() * 2;
  }
};

/**
 * Bind a new tap gesture.
 */
exp.entity.neural.Pix.prototype.addTapGesture = function() {
  this.queueStopMoving_ = false;
  this.stopMoving_ = false;
  this.bindInputEvent('touch', this.onTouch);

  this.bindInputEvent('drag', function(e) {
    if (this.scene_.numPixProcessed_ === 3) {
      return;
    }
    var worldPosition = exp.manager.getWorldLocation(
      e['gesture']['center']['pageX'],
      e['gesture']['center']['pageY'],
      this.getObject().position.z
    );
    this.getObject().position.x = worldPosition['x'];
    this.getObject().position.y = worldPosition['y'];
    this.getObject().position.z = worldPosition['z'];
  });

  this.bindInputEvent('release', this.onRelease);
};

/**
 * On item release.
 */
exp.entity.neural.Pix.prototype.onRelease = function() {
  if (this.scene_.numPixProcessed_ === 3) {
    return;
  }
  this.stopMoving_ = true;
  this.scene_.processPix(this);
  this.removeTapGesture();
};

/**
 * On item touch.
 */
exp.entity.neural.Pix.prototype.onTouch = function() {
  if (this.scene_.numPixProcessed_ === 3) {
    return;
  }
  exp.soundManager.playSound('neural/Data_Appear_01');
  var obj = this;
  this.stopMoving_ = true;
  var scale = {'num': this.getObject().scale.x};
  TweenLite.to(scale, .2, {'num': this.selectedScale_,
    onUpdate: function() {
      obj.getObject().scale.set(scale['num'], scale['num'], scale['num']);
    }
  });
};

/**
 * Unbind a tap gesture.
 */
exp.entity.neural.Pix.prototype.removeTapGesture = function() {
  this.unbindInputEvent('touch');
  this.unbindInputEvent('drag');
  this.unbindInputEvent('release');
};
