goog.provide('exp.entity.header.Hobo');

goog.require('exp.entity.Circle');
goog.require('exp.entity.Svg');

/**
 * Create a triangle for the icosahedron.
 * @param {string} color The color upon filling.
 * @param {number} type Random shape.
 * @param {number} num Order created.
 * @param {boolean} isPartial If hobo is a member of a partial.
 * @param {number} size Size of particle.
 * @param {array} patterns Patterns for particle.
 * @constructor
 */
exp.entity.header.Hobo = function(color, type, num, isPartial, size, patterns) {
  this.shapes_ = [
    '<circle fill="' + color + '" cx="15" cy="15" r="15"/>',
    '<rect fill="' + color + '" width="30" height="30" />',
    '<polygon fill="' + color + '" points="0,15 15,0 30,15 15,30" />',
    '<polygon fill="' + color + '" transform="rotate(90 15 15)" ' +
      'points="22,2 7,2 0,15 8,28 22,28 30,15" />'
  ];

  var params = {
    'foldable': true,
    'patterns': patterns || [{
      'html': this.shapes_[type],
      'viewBox': '0 0 30 30'
    }],
    'patternsRepeat': true,
    'height': size || 14,
    'width': size || 14,
    'detailFactor': 3,
    'useLighting': true
  };
  goog.base(this, params);
};
goog.inherits(exp.entity.header.Hobo, exp.entity.Circle);
