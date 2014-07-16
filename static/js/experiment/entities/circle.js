goog.provide('exp.entity.Circle');
goog.require('exp.entity.Core');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * An entity that draws a basic circle.
 * @constructor
 * @param {object} params All the params from the base entity.
 */
exp.entity.Circle = function(params) {
  goog.base(this, params);

  var obj = this;

  obj.params_['detailFactor'] = ('undefined' !==
    typeof params['detailFactor']) ? params['detailFactor'] : 1;

  obj.params_['radius'] = ('undefined' !== typeof params['radius']) ?
      params['radius'] : 50;

  if (params['foldable']) {
    obj.params_['width'] = ('undefined' !== typeof params['width']) ?
        params['width'] : obj.params_['radius'] * 2;
    obj.params_['height'] = ('undefined' !== typeof params['height']) ?
        params['height'] : obj.params_['radius'] * 2;

    obj.isFoldable();
  } else {

    var viewBoxSize = obj.params_['radius'] * 2;
    var svgSize = viewBoxSize * obj.params_['detailFactor'];

    var svgContent = exp.entity.Core.makeCircle(
      obj.params_['radius'], obj.params_['color']);
    var viewBox = exp.entity.Core.makeViewBox(0, 0, viewBoxSize, viewBoxSize);

    obj.element_ = exp.entity.Core.createSVG(svgSize, svgSize,
      viewBox, svgContent);

    obj.cssObject_ = new THREE.CSS3DObject(obj.getElement());
    var detailOffset = 1 / obj.params_['detailFactor'];

    obj.cssObject_.scale.set(detailOffset, detailOffset, detailOffset);
    obj.getObject().add(obj.cssObject_);
  }
};
goog.inherits(exp.entity.Circle, exp.entity.Core);

/**
 * Clean up after ourselves.
 * @override
 */
exp.entity.Circle.prototype.disposeInternal = function() {
  if (this.params_['foldable']) {
    this.killSlices();
  }
  goog.base(this, 'disposeInternal');
};
