goog.provide('exp.entity.Slice');

goog.require('exp.entity.Core');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * A slice for folding an entity.
 * @constructor
 * @param {object} params All the params from the base entity.
 * @param {boolean} isRight Determines the side of the clip mask
 */
exp.entity.Slice = function(params, isRight) {
  goog.base(this, params);

  // Slices should always be at the origin.
  this.object_.position.set(0, 0, 0);

  var obj = this;

  obj.params_.detailFactor = ('undefined' !== typeof params['detailFactor']) ?
    params['detailFactor'] : 1;


  if (params.hasOwnProperty('currPattern')) {
    obj.object_.position.z = 1;
  }

  obj.params_['radius'] = ('undefined' !== typeof params['radius']) ?
    params['radius'] : 50;

  var radius = obj.params_['radius'];
  var width = (obj.params_['width'] || radius * 2);
  var height = (obj.params_['height'] || radius * 2);

  var svgSrc = '';
  var viewBox = exp.entity.Core.makeViewBox(0, 0, width, height);

  if (obj.params_.color) {
    svgSrc = exp.entity.Core.makeCircle(radius, obj.params_['color']);
  } else if (obj.params_['patterns'] || obj.params_['startPattern']) {
    var pattCheck = params['currPattern'] && params['currPattern'] >= 0;
    var pattIdx = pattCheck ? params['currPattern'] : 0;
    var patt = obj.params_['startPattern'] ||
               obj.params_['patterns'][pattIdx];
    if (patt['color']) {
      svgSrc = exp.entity.Core.makeCircle(radius, patt['color']);
    } else if (patt['html']) {
      svgSrc = exp.svgs.makeUniqueIds(patt['html']);
      viewBox = patt['viewBox'];
    }
  }

  width *= obj.params_['detailFactor'];
  height *= obj.params_['detailFactor'];

  if (obj.params_['foldable']) {
    var slice = obj.createFoldable(width, height, svgSrc, isRight);
    obj.object_.add(slice);
  } else {
    obj.element_ = exp.entity.Core.createSVG(width, height, viewBox, svgSrc);
    obj.cssObject_ = new THREE.CSS3DObject(obj.element_);

    var detailScale = 1 / obj.params_['detailFactor'];

    obj.cssObject_.scale.set(detailScale, detailScale, detailScale);
    this.object_.add(obj.cssObject_);
  }
};
goog.inherits(exp.entity.Slice, exp.entity.Core);

/**
 * Call when slice has started moving.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.Slice.prototype.sliceStart = function(data) {
  if (this.params_['patterns']) {
    var pattern = this.params_['patterns'][data.pattern];
    this.redrawPattern(this.leftObject_.getElement(), pattern, true);
  }
};

/**
 * Call when slice has closed halfway.
 * @param {object} data Pattern and object information for slice.
 * @param {boolean} reverse If the pattern should be reversed.
 */
exp.entity.Slice.prototype.sliceHalfway = function(data, reverse) {
  if (this.params_['patterns']) {
    var pattern = this.params_['patterns'][data.pattern];
    this.redrawPattern(
      data.slice.getElement(), pattern, reverse || false, true);
  } else {
    this.redrawPattern(data.slice.getElement(), {}, false, true);
  }
};

/**
 * Call when a slice is being reclosed (via dragging) and has passed
 * the half-way point.
 * @param {object} data Pattern and object data for this slice.
 * @param {boolean} reverse If the pattern should be reversed.
 */
exp.entity.Slice.prototype.sliceHalfwayReclose = function(data, reverse) {
  if (this.params_['patterns']) {
    var pattern = this.params_['patterns'][data.patternOld];
    this.redrawPattern(data.slice.getElement(), pattern,
      reverse ? false : true, true);
  }
};

/**
 * Call when slice has closed.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.Slice.prototype.sliceClosed = function(data) {
  if (this.params_['patterns']) {
    var pattern = this.params_['patterns'][data.pattern];
    this.redrawPattern(this.rightObject_.getElement(), pattern, false);
  }
};

/**
 * Determine behavior when fold is closed.
 */
exp.entity.Slice.prototype.completeFolding = function() {
  this.increaseCurrPattern();
};

/**
 * Tick activity when entity is inactive.
 * @param {number} delta Time in seconds since last tick.
 * @param {number} now Time in seconds since epoch.
 */
exp.entity.Slice.prototype.inactiveTick = function(delta, now) {

};

/**
 * Tick activity when entity is active.
 * @param {number} delta Time in seconds since last tick.
 * @param {number} now Time in seconds since epoch.
 */
exp.entity.Slice.prototype.activeTick = function(delta, now) {
  goog.base(this, 'activeTick', delta, now);

  this.lastActiveTick_ = now;
};
