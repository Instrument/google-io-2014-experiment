goog.provide('exp.entity.boson.OrbitObject');

goog.require('exp.entity.Circle');
goog.require('exp.entity.Core');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * A entity that is put into the experiment
 * @param {object} params object.
 * @param {scene} scene object.
 * @constructor
 */
exp.entity.boson.OrbitObject = function(params, scene) {

  goog.base(this, params);
  this.tag = exp.Tags.BOSON;
  this.scale_ = 1;
  this.rotationSpeed_ = 0.06;
  this.scene_ = scene;
  this.preloaderUpScale = 1;

  this.object_ = new THREE.Object3D();


  this.circleOne_ = new exp.entity.boson.OrbitCircle({
            'tags': exp.Tags.BOSON,
            'colorId': 0,
            'colorIndexInc': params['colorIndexInc']
    }, scene);

    this.circleTwo_ = new exp.entity.boson.OrbitCircle({
            'tags': exp.Tags.BOSON,
            'colorId': 1,
            'colorIndexInc': params['colorIndexInc']
    }, scene);

  var offsetX = 150;

  if (window.innerWidth > 700) {
    this.preloaderUpScale = .3;
    offsetX = offsetX + offsetX;
  }

  this.circleOne_.setDirection(offsetX * -1, -1 , 0, .5);
  this.circleTwo_.setDirection(offsetX, 1, 2, -.1);

  exp.manager.addEntity(this.circleTwo_);
  exp.manager.addEntity(this.circleOne_);

  this.object_.add(this.circleOne_.getObject());
  this.object_.add(this.circleTwo_.getObject());

  this.object_.rotation.y = -4;

  this.isOpen = true;

  this.object_.scale.z = this.object_.scale.x =
    this.object_.scale.y = this.preloaderUpScale;
};
goog.inherits(exp.entity.boson.OrbitObject, exp.entity.Core);


/**
 * Circles collide to create boson clould on user input.
 */
exp.entity.boson.OrbitObject.prototype.collideCircles = function() {
  this.isOpen = false;
  this.circleOne_.collideCircles(0);
  this.circleTwo_.collideCircles(0);
  exp.sequencer.add('playCollideRumble', 1.5, function() {
    exp.soundManager.playSound('common/BigRumble');
  }, null, this, null);
};

/**
 * Sets the active state.
 * @param {boolean} isActive Determines if creating or finishing the Boson.
 */
exp.entity.boson.OrbitObject.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', this, isActive);

  if (!isActive) {

    this.circleOne_.setActive(false);
    this.circleTwo_.setActive(false);

    this.object_.remove(this.circleOne_.getObject());
    this.object_.remove(this.circleTwo_.getObject());
    this.isOpen = false;
  }
};
