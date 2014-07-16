goog.provide('exp.entity.Svg');
goog.require('exp.entity.Core');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * A entity that is put into the experiment
 * @param {object} params The configuration for the SVG.
 * @constructor
 */
exp.entity.Svg = function(params) {
  goog.base(this, params);

  var obj = this;

  obj.params_.detailFactor = ('undefined' !== typeof params['detailFactor']) ?
    params['detailFactor'] : 1;

  obj.element_ = exp.entity.Core.createSVG(
    obj.params_['width'] * obj.params_['detailFactor'],
    obj.params_['height'] * obj.params_['detailFactor'],
    obj.params_['content']['viewBox'],
    obj.params_['content']['html']
  );

  obj.cssObject_ = new THREE.CSS3DObject(obj.getElement());
  var scale = 1 / obj.params_.detailFactor;
  obj.cssObject_.scale.set(scale, scale, scale);
  obj.getObject().add(obj.cssObject_);
};
goog.inherits(exp.entity.Svg, exp.entity.Core);
