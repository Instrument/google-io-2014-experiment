goog.provide('exp.entity.neural.Eyesocket');

goog.require('exp.entity.Slice');

/**
 * The entity that is a Silicon atom.
 * @constructor
 * @param {object} params All parameters for initialization.
 */
exp.entity.neural.Eyesocket = function(params) {
  params = {
    'foldable': true,
    'patterns': [
      exp.svgs.getSvg('neural-eyesocket')
    ],
    'useLighting': true,
    'patternsRepeat': true,
    'width': 140,
    'height': 162,
    'direction': -1,
    'unfoldOpen': true,
    'unfoldOpenSpeed': .4,
    'detailFactor': 2,
    'tags': exp.Tags.NEURAL
  };

  goog.base(this, params);

  var obj = this;

  obj.getObject().position.z = -2;
  obj.getObject().position.x = 2;

  this.isFoldable();

};
goog.inherits(exp.entity.neural.Eyesocket, exp.entity.Core);
