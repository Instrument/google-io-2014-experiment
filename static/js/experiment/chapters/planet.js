goog.provide('exp.chapter.Planet');

goog.require('exp.chapter.Core');
goog.require('exp.entity.planet.Balloons');
goog.require('exp.entity.planet.Cities');
goog.require('exp.entity.planet.Clouds');
goog.require('exp.entity.planet.Earth');
goog.require('exp.entity.planet.Internet');
goog.require('exp.entity.planet.Satellites');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');


/**
 * The Earth chapter.
 * @constructor
 */
exp.chapter.Planet = function() {
  goog.base(this, 'planet');

  this.cityDefs_ = [
    {
      'x': 0.89,
      'y': 0.76,
      'size': 0.4
    },
    {
      'x': 0.79,
      'y': 0.5,
      'size': 0.8
    },
    {
      'x': 0.44,
      'y': 0.46,
      'size': 1
    },
    {
      'x': 0.4,
      'y': 0.87,
      'size': 0.65
    },
    {
      'x': 0.14,
      'y': 0.49,
      'size': 0.5
    },
    {
      'x': 0.13,
      'y': 0.33,
      'size': 0.45
    }
  ];

  this.tag = exp.Tags.PLANET;

  this.aggitationLevel_ = 0;
  this.transitionLevel_ = 5;
  this.degradeAggitationRate_ = 10;

  this.zoomStartTime_ = 0;
  this.zoomDuration = 4;

  this.currentStage_ = 'start';

  this.foldInProgress_ = true;

  this.ambientTrack_ = 'planet/AmbientLoop_Scene05';
};
goog.inherits(exp.chapter.Planet, exp.chapter.Core);

/**
 * Sets the active state.
 * @param {boolean} isActive the new state.
 * @override
 */
exp.chapter.Planet.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);

  var obj = this;
  if (isActive) {
    exp.background.maskToPattern('#b3e5fc', 'rgba(0,0,0,0.15)', 0.7, false,
      Linear['easeNone']);
    exp.manager.flipInfoButton(3);
    exp.ui.chapter.setChapter(4);

    this.clouds_ = new exp.entity.planet.Clouds(this);
    this.balloons_ = new exp.entity.planet.Balloons(this);
    this.internet_ = new exp.entity.planet.Internet(this.cityDefs_);
    this.planet_ = new exp.entity.planet.Earth(this);
    this.cities_ = new exp.entity.planet.Cities();
    this.satellites_ = new exp.entity.planet.Satellites({
      'tags': exp.Tags.PLANET
    });

    this.clouds_.setActive(false);
    this.balloons_.setActive(false);
    this.internet_.setActive(false);
    this.planet_.setActive(false);
    this.satellites_.setActive(false);

    this.currentStage_ = 'start';

    this.addEntity(this.balloons_, 'balloons');
    this.planet_.getObject().add(this.balloons_.getObject());

    this.addEntity(this.planet_);

    exp.sequencer.add(
      'initNextView', 0.1,
      this.planet_.nextView,
      {'speed': 0.3},
      this.planet_, null
    );

    this.planet_.getObject().scale.set(1, 1, 1);
    this.planet_.getObject().position.z = 1000;

    var planetParams = {scale: 2.5, z: 0};

    TweenLite.to(planetParams, 1.5, {
      scale: 1,
      z: 0,
      onUpdate: function() {
        obj.planet_.getObject().position.z = planetParams.z;
        obj.planet_.getObject().scale.set(planetParams.scale,
          planetParams.scale, 1);
      }
    });

    exp.sequencer.add(
      'initClouds', 0.3, function() {
        this.addEntity(this.clouds_, 'clouds');
        this.clouds_.setActive(true);
        this.planet_.getObject().add(this.clouds_.getObject());
      }, {}, this, null
    );
  } else {
    this.zoomStartTime_ = exp.manager.now();
  }
};

/**
 * Event handler for Hammer.js pinchOut event.
 * @param {Object} event The event object from Hammer.js.
 * @override
 */
exp.chapter.Planet.prototype.pinchOut = function(event) {
  var scale = event.gesture.scale;

  this.clouds_.onPinch(event['gesture']['scale']);
};

/**
 * Event handler for Hammer.js pinchIn event.
 * @param {Object} event The event object from Hammer.js.
 * @override
 */
exp.chapter.Planet.prototype.pinchIn = function(event) {
  var scale = event.gesture.scale;

  this.clouds_.onPinch(event['gesture']['scale']);
};

/**
 * Event handler for the end of a Hammer.js pinch gesture.
 * @override
 */
exp.chapter.Planet.prototype.pinchEnd = function() {
  this.clouds_.onRelease();
};

/**
 * Called when each Earth page flip is complete.
 */
exp.chapter.Planet.prototype.onPageTurn = function() {

  switch (this.currentStage_) {
    case 'start':
        exp.log('planet1');

        this.clouds_.spawnClouds();

        this.currentStage_ = 'clouds';
      break;
    case 'clouds':
        exp.log('planet2');

        this.balloons_.spawnBalloons();

        this.currentStage_ = 'balloons';
      break;
    case 'balloons':
      this.addEntity(this.cities_);
      this.planet_.getObject().add(this.cities_.getObject());
      this.cities_.spawnCities(this.cityDefs_);

      this.currentStage_ = 'cities';
      break;
    case 'cities':
        exp.log('planet3');

        this.addEntity(this.internet_);
        this.internet_.setActive(true);

        this.currentStage_ = 'internet';
      break;
    case 'internet':
        this.cities_.setActive(false);
        exp.log('planet4');
        this.balloons_.setActive(false);

        this.internet_.setActive(false);
        this.satellites_.setActive(true);
        this.addEntity(this.satellites_);
        this.planet_.getObject().add(this.satellites_.getObject());
        this.internet_.getObject().z = 30;

        this.currentStage_ = 'satellite';
      break;
    case 'satellite':
        this.clouds_.setActive(false);
        this.satellites_.setActive(false);

        this.currentStage_ = 'finished';

        exp.manager.nextChapter();
      break;
  }

  this.foldInProgress_ = false;
};

/**
 * Tap event handler for Hammer.js.
 * @param {object} gesture The gesture object from Hammer.js.
 */
exp.chapter.Planet.prototype.tap = function(gesture) {
  if (exp.manager.isIE) {
    if (this.planet_) {
      this.planet_.nextView();
    }
  }
};

/**
 * Inactive tick.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.chapter.Planet.prototype.inactiveTick = function(delta, now) {
  goog.base(this, 'inactiveTick', delta, now);

  if (this.currentStage_ === 'finished') {
    if (this.planet_ && now - this.zoomStartTime_ < this.zoomDuration) {
      var scale = 1 - (now - this.zoomStartTime_) / this.zoomDuration;
      this.planet_.getObject().scale.set(scale, scale, scale);
      this.planet_.getObject().position.z -= 1300 * delta;
    } else {
      this.removeEntity(this.planet_);
      this.currentStage_ = 'inactive';
    }
  }
};

