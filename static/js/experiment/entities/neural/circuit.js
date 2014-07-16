goog.provide('exp.entity.neural.Circuit');

goog.require('exp.entity.Slice');

/**
 * The entity that is a Silicon atom.
 * @constructor
 */
exp.entity.neural.Circuit = function() {
  var circ = '<circle fill="#000000" ' +
    'fill-opacity=".1" class="svg-shadow" cx="140" cy="140" r="140" ' +
    'transform="translate(2, 2)"/>' +
    '<circle fill="#eeeeee" ' +
    'fill-opacity="1" cx="140" cy="140" r="140"/>';

  var params = {
    'foldable': true,
    'patterns': [
      {
        'html': circ,
        'viewBox': '-10 -10 300 300'
      },
      exp.svgs.getSvg('neural-Neural-CircuitBoard')
    ],
    'useLighting': true,
    'patternsRepeat': true,
    'width': 300,
    'height': 300,
    'direction': -1,
    'detailFactor': 2,
    'tags': exp.Tags.NEURAL
  };

  goog.base(this, params);

  var obj = this;

  obj.getObject().position.z = -2;

  obj.isFoldable();

};
goog.inherits(exp.entity.neural.Circuit, exp.entity.Core);
