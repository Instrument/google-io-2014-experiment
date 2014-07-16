goog.provide('exp.entity.silicon.Connection');
goog.require('exp.entity.Core');

/**
 * The entity that draws a line between silicon atoms.
 * @constructor
 * @param {object} params All parameters for initialization.
 */
exp.entity.silicon.Connection = function(params) {
  goog.base(this, params);

  var obj = this;

  obj.element1 = goog.dom.createElement('div');
  obj.section1 = new THREE.CSS3DObject(obj.element1);
  obj.section1.rotation.y = Math.PI / 2;
  obj.element1.style.background = params['color'];
  obj.element1.style.width = (100) + 'px';
  obj.element1.style.height = params['size'] + 'px';
  obj.element1.innerHTML = '&nbsp;';
  obj.getObject().add(obj.section1);

  var pos1 = params['positions'][0];
  var pos2 = params['positions'][1];
  var dist = Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) +
           Math.pow(pos1[1] - pos2[1], 2) +
           Math.pow(pos1[2] - pos2[2], 2));

  var xOffset = 0;
  var yOffset = 0;
  var zOffset = 0;

  if (params['offset']) {
    xOffset = params['offset'][0] * -8;
    yOffset = params['offset'][1] * -8;
    zOffset = params['offset'][2] * -8;
  }

  obj.getObject().position.set(
    (pos1[0] + pos2[0]) / 2 + xOffset,
    (pos1[1] + pos2[1]) / 2 + yOffset,
    (pos1[2] + pos2[2]) / 2 + zOffset);
  obj.getObject().scale.z = (dist - params['radius']) / 100;
  obj.getObject().lookAt(new THREE.Vector3(pos1[0], pos1[1], pos1[2]));

  TweenLite.fromTo(obj.element1, .5, {opacity: 0}, {opacity: 1, delay: .4});

};
goog.inherits(exp.entity.silicon.Connection, exp.entity.Core);

/**
 * Remove the two cross sections that make up the entity.
 */
exp.entity.silicon.Connection.prototype.removeEntities = function() {
  exp.dom.removeNode(this.element1);
};
