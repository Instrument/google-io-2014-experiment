goog.provide('exp.chapter.Exoplanet');

goog.require('exp.ImprovedNoise');
goog.require('exp.Tags');
goog.require('exp.chapter.Core');
goog.require('exp.entity.exoplanet.Exoplanet');
goog.require('exp.entity.exoplanet.Voyager');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * Exoplanet chapter.
 * @constructor
 */
exp.chapter.Exoplanet = function() {
  goog.base(this, 'exoplanet');

  this.tag = exp.Tags.EXOPLANET;

  this.degradeAggitationRate_ = 0;
  this.aggitationLevel_ = 0;
  this.transitionLevel_ = 5;

  this.speed_ = 1;

  this.voyager_ = null;

  this.planetContainer_ = new THREE.Object3D();
  exp.manager.scene_.add(this.planetContainer_);

  this.planets_ = [];

  this.introComplete_ = false;
  this.containerStartZ_ = 3000;
  this.containerEndZ_ = -200;

  this.minZ_ = -1300;
  this.maxZ_ = -400;

  this.zoomMaxSpeed_ = 200;
  this.zoomSpeed_ = 0;
  this.zoomAcceleration_ = 20;

  this.zoomStartTime_ = 0;
  this.zoomDuration_ = 2;
  this.zooming_ = false;

  this.pinching_ = false;
  this.pinchStart_ = 0;

  this.darkColor_ = 25; // THE DARKNESS OF SPACE!

  this.bg = exp.background.useCanvas ? this.generateStarfield() : '#000000';

  if (exp.log) {
    this.planetContainer_.position.z = this.containerStartZ_;
    this.ambientTrack_ = 'exoplanet/AmbientLoop_Scene06';
  } else {
    this.planetContainer_.position.z = this.containerEndZ_;
  }
};
goog.inherits(exp.chapter.Exoplanet, exp.chapter.Core);

/**
 * Set the active/inactive state for this chapter.
 * @param {boolean} isActive the new state.
 * @override
 */
exp.chapter.Exoplanet.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);

  if (isActive) {
    this.containerEndZ_ = -200;
    this.introComplete_ = false;

    if (exp.mouseTracker) {
      exp.mouseTracker.multiplierX = 20;
      exp.mouseTracker.multiplierY = 20;
    }

    this.voyager_ = new exp.entity.exoplanet.Voyager();
    this.voyager_.setActive(true);

    var planetDefs = [
      {
        'position': [0.8, 0.1, -1.5],
        'detail': 1,
        'patterns': [
          'exoplanet-argon',
          'exoplanet-emanthaler',
          'exoplanet-lacoste'
        ]
      },
      {
        'position': [0.25, -0.5, -0.5],
        'detail': 1,
        'patterns': [
          'exoplanet-neon',
          'exoplanet-xenon',
          'exoplanet-bleu'
        ]
      },
      {
        'position': [-0.4, -0.5, 0],
        'detail': 1,
        'patterns': [
          'exoplanet-hoth',
          'exoplanet-measels',
          'exoplanet-polo'
        ]
      },
      {
        'position': [-0.25, 0.4, 0.5],
        'detail': 1,
        'patterns': [
          'exoplanet-cheddarwurst',
          'exoplanet-izod',
          'exoplanet-mumps'
        ]
      },
      {
        'position': [0.25, -0.2, 1.75],
        'detail': 2,
        'patterns': [
          'exoplanet-meangreenie',
          'exoplanet-daytripper',
          'exoplanet-purplehaze',
          'exoplanet-dunebuggy',
          'exoplanet-ziggystardust'
        ]
      }
    ];

    if (!exp.log) {
      planetDefs = [
        {
          'position': [.5, .1, 0],
          'detail': 1,
          'patterns': [
            'exoplanet-argon'
          ],
          'size': 100
        },
        {
          'position': [0, .2, 0],
          'detail': 1,
          'patterns': [
            'exoplanet-neon'
          ],
          'size': 125
        },
        {
          'position': [0.3, -0.2, 0],
          'detail': 1,
          'patterns': [
            'exoplanet-hoth'
          ],
          'size': 200
        }
      ];
    }

    var positionScale = 600;

    for (var i = 0; i < planetDefs.length; i++) {

      planetDefs[i]['position'][0] *= positionScale;
      planetDefs[i]['position'][1] *= positionScale;
      planetDefs[i]['position'][2] *= positionScale;

      var obj = new exp.entity.exoplanet.Exoplanet({
        'patterns' : planetDefs[i]['patterns'],
        'voyager' : this.voyager_,
        'position': planetDefs[i]['position'],
        'detail' : planetDefs[i]['detail'],
        'chapter' : this,
        'size': planetDefs[i]['size']
      }, 'exoplanet' + i);

      this.addEntity(obj);
      this.planetContainer_.add(obj.getObject());

      this.planets_.push(obj);
    }

    if (exp.log) {
      this.planetContainer_.position.z = this.containerStartZ_;
      var exo = this;
      TweenLite.to(this.planetContainer_.position, 8,
        {
          onComplete: function() {
            exo.introComplete_ = true;
          },
          delay: 1,
          z: this.containerEndZ_
        }
      );
      this.planetContainer_.position.set(0, 0, this.containerStartZ_);
    }

    this.addEntity(this.voyager_);

    var target = THREE.Math.randInt(0, 1);
    this.voyager_.setTarget(this.planets_[target].getObject(),
                            this.planets_[target].radius_);

    if (exp.log) {
      exp.log('exo1');
      setTimeout(function() {
        exp.log('exo2');
      }, 4000);

      exp.manager.flipInfoButton(4);
      exp.ui.chapter.setChapter(5);
      exp.background.maskToPattern(
        this.bg,
       'rgba(255,255,255,0.25)',
        1.5,
        true
      );
    }
  } else {

    // Set to inactive.
    this.zoomStartTime_ = exp.manager.now();
    this.zooming_ = true;
    this.voyager_.setActive(false);
  }
};

/**
 * Create a starfield pattern.
 * @return {Image}
 */
exp.chapter.Exoplanet.prototype.generateStarfield = function() {
  var rand = exp.ImprovedNoise();

  var starCanvas = document.createElement('canvas');
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;

  var starContext = starCanvas.getContext('2d');
  var imageData = starContext.getImageData(0, 0,
                                           starCanvas.width, starCanvas.height);
  var data = imageData.data;
  var freqX = 250 * (starCanvas.width / starCanvas.height);
  var freqY = 250;

  for (var i = 0; i < starCanvas.width * starCanvas.height; i++) {
    var x = i % starCanvas.width;
    var y = Math.floor(i / starCanvas.height);
    var offset = i * 4;
    var posX = x / starCanvas.width;
    var posY = y / starCanvas.height;

    var val = Math.pow((1 + rand.noise(posX * freqX, posY * freqY, 0)) / 2, 9);

    data[offset] = 255;
    data[offset + 1] = 255;
    data[offset + 2] = 255;
    data[offset + 3] = val * 255;
  }

  starContext.putImageData(imageData, 0, 0, 0, 0,
                           starCanvas.width, starCanvas.height);

  var compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = starCanvas.width;
  compositeCanvas.height = starCanvas.height;

  var compositeContext = compositeCanvas.getContext('2d');
  compositeContext.fillStyle = '#000';
  compositeContext.fillRect(0, 0,
                            compositeCanvas.width, compositeCanvas.height);
  compositeContext.drawImage(starCanvas, 0, 0);

  return compositeContext.createPattern(compositeCanvas, 'repeat');
};

/**
 * Event handler for pinch-in gesture.
 * @param {Object} event The event object from Hammer.js.
 * @override
 */
exp.chapter.Exoplanet.prototype.pinchIn = function(event) {
  if (!this.pinching_) {
    this.pinching_ = true;
    this.pinchStart_ = this.containerEndZ_;
  }

  this.containerEndZ_ = this.pinchStart_ -
    (1 - event['gesture']['scale']) * 100;

  this.containerEndZ_ = THREE.Math.clamp(this.containerEndZ_,
    this.minZ_, this.maxZ_);
};

/**
 * Override the default behavior, planets are used to
 * @override
 */
exp.chapter.Exoplanet.prototype.increaseAggitation = function() {
  // Only increase aggitation if the user has zoomed all the way out.
  if (this.containerEndZ_ <= this.minZ_) {
    goog.base(this, 'increaseAggitation');
  }
};

/**
 * Event handler for the end of a pinch gesture.
 * @override
 */
exp.chapter.Exoplanet.prototype.pinchEnd = function() {
  this.pinching_ = false;
};

/**
 * Scoot the vew back a little.  Called when planets are clicked.
 */
exp.chapter.Exoplanet.prototype.zoomOut = function() {
  this.containerEndZ_ = THREE.Math.clamp(this.containerEndZ_ - 75,
    this.minZ_, this.maxZ_);


};

/**
 * Run this chapter when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
 exp.chapter.Exoplanet.prototype.inactiveTick = function(delta, now) {
  goog.base(this, 'inactiveTick', delta, now);
  if (this.zooming_) {

    if (this.voyager_) {
      this.voyager_.getObject().position.z += 400 * delta;
      this.voyager_.getObject().scale.y *= 0.975;
      this.voyager_.getObject().scale.x *= 0.975;

      this.voyager_.getObject().position.x *= 0.985;
      this.voyager_.getObject().position.y *= 0.985;
    }

    for (var i = 0; i < this.planets_.length; i++) {
      this.planets_[i].getObject().position.x *= 0.95;
      this.planets_[i].getObject().position.y *= 0.95;
      this.planets_[i].getObject().position.z -= 300 * delta;
      this.planets_[i].getObject().scale.y *= 0.985;
      this.planets_[i].getObject().scale.x *= 0.985;
    }

    if (now - this.zoomStartTime_ > this.zoomDuration_) {
      this.zooming_ = false;
      this.voyager_.dispose();
      this.removeEntity(this.voyager_);
      for (var i = 0; i < this.planets_.length; i++) {
        this.removeEntity(this.planets_[i]);
        this.planetContainer_.remove(this.planets_[i].getObject());
      }
    }
  }
};

/**
 * Update viewport functionality
 */
exp.chapter.Exoplanet.prototype.updateViewport = function() {
  if (exp.manager.params_['partial']) {
    var size = goog.style.getSize(exp.manager.params_.element);
    exp.manager.camera_.position.z =
      500 - (400 - ((size.width - 400) / 800 * 400));
  }
};

/**
 * Tap event handler for Hammer.js.
 * @param {object} gesture The gesture object from Hammer.js.
 */
exp.chapter.Exoplanet.prototype.tap = function(gesture) {
  if (exp.manager.isIE) {
    if (this.planets_) {
      var idx = Math.floor(Math.random() * this.planets_.length);
      this.planets_[idx].onTapPlanet();
    }
  }
};

/**
 * When we reach the max.
 */
exp.chapter.Exoplanet.prototype.onMaxAggitation = function() {
  exp.log('exo3');

  exp.mouseTracker.stopTracking();
  exp.mouseTracker.multiplierX = 40;
  exp.mouseTracker.multiplierY = 40;

  exp.manager.nextChapter(2500);

  exp.background.maskToPattern('#ffffff', 'rgba(0,0,0,0.15)', 2.0, false);
};

/**
 * Run this chapter when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.chapter.Exoplanet.prototype.activeTick = function(delta, now) {
  goog.base(this, 'activeTick', delta, now);
  this.zoomSpeed_ += (this.containerEndZ_ -
      this.planetContainer_.position.z) * 0.002;

  this.zoomSpeed_ *= 0.8;

  if (this.introComplete_) {
    this.planetContainer_.position.z += this.zoomSpeed_;
  }
};
