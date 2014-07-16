goog.provide('exp.VectorPool');

goog.require('exp.Pool');

/**
 * A Vector3 specific pool.
 * @constructor
 */
exp.VectorPool = function() {
  goog.base(this, function() {
    return new THREE.Vector3();
  }, function(v, args) {
    if (args.length) {
      v.copy.apply(v, args);
    }
  });
};
goog.inherits(exp.VectorPool, exp.Pool);
