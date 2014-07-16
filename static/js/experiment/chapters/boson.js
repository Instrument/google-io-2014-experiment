goog.provide('exp.chapter.Boson');

goog.require('exp.chapter.Core');
goog.require('exp.entity.boson.Hobocloud');
goog.require('exp.entity.boson.Icosahedron');
goog.require('exp.entity.boson.OrbitCircle');
goog.require('exp.entity.boson.OrbitObject');
goog.require('goog.array');


/**
 * A chapter that is put into the experiment.
 * @constructor
 */
exp.chapter.Boson = function() {
  goog.base(this, 'boson');

  this.firstRun = true;
  this.tag = exp.Tags.BOSON;

  this.bosonCloud_ = null;
  this.ico_ = null;
  this.hoboCloud_ = null;
  this.isInteractive_ = false;

  this.cloudLoop = null;

  this.rotationSpeedY_ = 0.03;
  this.rotationSpeedX_ = 0.0;

  this.circleOne_ = null;

  this.circleTwo_ = null;

  this.aggitationLevel_ = 0;
  this.transitionLevel_ = 5;
  this.degradeAggitation_ = 0;

  this.myOrbitObject_ = null;

  this.preloader = null;
  this.preloaderUpScale = 1;
  this.preloaderFlipInc = 0;
  this.colorIndexInc = 0;

  this.clickInc = 0;
  this.clickIncLimit = 4;

  this.isMobile = false;
  this.loaded_ = false;

  this.logArr = ['boson1', 'boson2', 'boson3', 'boson4', 'boson5'];

  this.ambientTrack_ = 'boson/AmbientLoop_Scene02';
  this.ambientTrackDelay_ = true;
  this.ambientSoundLoop_ = null;

  this.hoboCloud_ = new exp.entity.boson.Hobocloud();
  this.hoboCloud_.hideChildren();

  this.ico_ = new exp.entity.boson.Icosahedron();
  this.ico_.hideChildren();
};
goog.inherits(exp.chapter.Boson, exp.chapter.Core);

/**

 /* Sets the active state.
 * @param {boolean} isActive Determines if creating or finishing the Boson.
 */
exp.chapter.Boson.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);

  if (isActive) {
    this.rotationSpeedY_ = 0.03;
    this.rotationSpeedX_ = 0.0;
    this.addEntity(this.hoboCloud_);
    this.addEntity(this.ico_);

    if (window.innerWidth > 700) {
      this.isMobile = false;
    }

    this.isInteractive_ = false;

    if (this.firstRun) {
      this.createPreloader();
    } else {
      this.createCirclesIntro();

    }
  } else {
    this.firstRun = false;

    this.clickInc = 0;

    var obj = this;
    var outParams = {'scale': this.ico_.getObject().scale.x, 'z': 0};

    TweenMax.to(outParams, .4, {
      'scale': 0,
      'z': -100,
      'onUpdate': function() {
        obj.ico_.getObject().scale.set(
          outParams['scale'], outParams['scale'], outParams['scale']);
        obj.ico_.getObject().position.z = outParams['z'];

        obj.hoboCloud_.getObject().scale.set(
          outParams['scale'], outParams['scale'], outParams['scale']);
        obj.hoboCloud_.getObject().position.z = outParams['z'];
      },
      'onComplete': function() {
        obj.ico_.hideChildren();
        obj.hoboCloud_.hideChildren();
      }
    });

    exp.soundManager.cancelSound(this.cloudLoop);
  }
};


/**
 * Run when transition completes.
 */
exp.chapter.Boson.prototype.onTransitionComplete = function() {
  this.isInteractive_ = false;
  if (this.colorIndexInc < 4) {
    this.colorIndexInc = this.colorIndexInc + 1;
  } else {
    this.colorIndexInc = 0;
  }
};

/**
 * Increase aggitation.
 */
exp.chapter.Boson.prototype.increaseAggitation = function() {
  if (this.isInteractive_) {
    this.increaseAggitationIncrement();
  }else {
    this.circlesInputCheck();
  }
};


/**
 * Increase aggitation increment
 * @param {boolean} force Force aggitation increase.
 */
exp.chapter.Boson.prototype.increaseAggitationIncrement = function(force) {

  if (this.logArr[this.clickInc] != undefined) {
    exp.log(this.logArr[this.clickInc]);
  }
  if (this.isInteractive_ || force) {
    if (this.clickInc >= this.clickIncLimit) {
      exp.sequencer.cancel('bosonNextChapter');
      exp.manager.nextChapter();
    } else {
      this.clickInc++;
      this.fillIco();

      if (this.clickInc >= this.clickIncLimit) {
        exp.sequencer.add('bosonNextChapter', 5,
          exp.manager.nextChapter, null, exp.manager, null);
      }
    }
  }
};

/**
 * Set triangles to be filled on icosahedron
 */
exp.chapter.Boson.prototype.fillIco = function() {
  if (this.ico_) {
    var filledTris = this.ico_.expandIco(true);
    if (filledTris) {
      this.hoboCloud_.collapse(filledTris);
      this.isInteractive_ = false;
      this.delayInteractive();
      exp.sequencer.add('bosonCollapse', 1.4, function() {
        this.ico_.expanded_ = false;
        exp.soundManager.playSound(
          'boson/20Sided_Closing', null, {'offset': .4, 'gain': 2});
      }, null, this, null);
    } else {
      this.isInteractive_ = true;
    }
  }
};

/**
 * Turn on interactions after fill action.
 */
exp.chapter.Boson.prototype.delayInteractive = function() {
  exp.sequencer.add('bosonResetInteractive', 1.4, function() {
    this.isInteractive_ = true;
  }, null, this, exp.Tags.BOSON);


};

/**
 * Drag function
 * @param {number} deltaX
 * @param {number} deltaY
 * @param {number} gesture
 */
exp.chapter.Boson.prototype.onDrag = function(deltaX, deltaY, gesture) {
  if (this.isInteractive_) {
    if (this.ico_.isInteracting() === false || this.ico_.expanded_ === false) {
      this.ico_.expandIco(false);
      this.ico_.isInteracting(true);
    }

    var ratio = window.innerWidth / window.innerHeight;
    this.rotationSpeedX_ -= (deltaY * 0.001);
    this.rotationSpeedY_ -= (-deltaX * (ratio > .8 ? 0.001 : .002));
  }else {
    this.circlesInputCheck();
  }
};

/**
 * Run when a drag ends.
 */
exp.chapter.Boson.prototype.onDragEnd = function() {
  goog.base(this, 'onDragEnd');

  if (this.isInteractive_) {
    if (Math.abs(this.rotationSpeedX_) > .20 ||
      Math.abs(this.rotationSpeedY_) > .20) {
      if (this.clickInc < this.clickIncLimit) {
        this.increaseAggitationIncrement(true);
      }
    } else {
      this.ico_.isInteracting(false);
      this.ico_.compressIco();
    }
  }else {
    this.circlesInputCheck();
  }
};

/**
 * exp.manager notifies the pinchEnd has started.
 * @param {event} event gesture event data.
 * @public
 */
exp.chapter.Boson.prototype.pinchEnd = function(event) {
  if (this.isInteractive_) {
    this.ico_.compressIco();
  }else {
    this.circlesInputCheck();
  }
};

/**
 * exp.manager notifies the pinchOut has started.
 * @param {event} event gesture event data.
 * @public
 */
exp.chapter.Boson.prototype.pinchOut = function(event) {
  if (this.isInteractive_) {
    this.ico_.expandIco(false);
  }else {
    this.circlesInputCheck();
  }
};

/**
 * exp.manager notifies the pinchIn has started.
 * @param {event} event gesture event data.
 * @public
 */
exp.chapter.Boson.prototype.pinchIn = function(event) {
  if (!this.isInteractive_) {
    this.circlesInputCheck();
  }
};

/**
 * check for user input to make circles collide to start stuffs
 */
exp.chapter.Boson.prototype.circlesInputCheck = function() {
  if (this.myOrbitObject_) {
    if (this.myOrbitObject_.isOpen === true) {
      this.myOrbitObject_.collideCircles();
      exp.ui.toggle.toggle('close', true);

      var radElem = goog.dom.getElement('radius');
      TweenLite.to(radElem, 0.6, {
        'scale': 0,
        'ease': Expo['easeOut'],
        'onComplete': function() {
          goog.style.setStyle(radElem, 'display', 'none');
        }
      });

      var startElem = goog.dom.getElement('desktopstart');
      TweenLite.to(startElem, 0.6, {
        'scale': 0,
        'ease': Expo['easeOut'],
        'onComplete': function() {
          goog.style.setStyle(startElem, 'display', 'none');
        }
      });

      if (window.innerWidth >= 768) {
        var elem = goog.dom.getElement('continue');
        goog.dom.classes.add(elem, 'in-experience');
      }

      if (exp.util.messenger) {
        exp.util.messenger.sendMessage({ 'action': 'hideH1' });
      }

      exp.ui.chapter.setChapter(this.firstRun ? 0 : 1);
      if (this.firstRun && (window.innerWidth >= 768)) {
        exp.ui.toggle.toggle('open', true, 3.5);
        setTimeout(function() {
          exp.ui.toggle.toggle('close', true);
        }, 8500);
      }

      setTimeout(function() {
        exp.ui.chapter.setChapter(1);
      }, 1000);
    }
  }
};

/**
 /* Create all main items.
 */
exp.chapter.Boson.prototype.createMainItems = function() {
  exp.background.maskToPattern('#4fc3f7', 'rgba(255,255,255,0.25)',
    0.4, true, Linear['easeNone']);
  exp.manager.flipInfoButton(0);

  goog.dom.classes.remove(document.body, 'firstrun');
  this.killIntro();
  this.delayInteractive();

  exp.sequencer.add('bosonCreateIco', .6, function() {
    this.ico_.reset();
    this.ico_.showChildren();
    this.ico_.increaseScale();
  }, null, this, null);

  this.hoboCloud_.reset();
  this.hoboCloud_.showChildren();

  this.startAmbientTrack();
};

/**
 * Killsintro bits myOrbitObject function.
 */
exp.chapter.Boson.prototype.killIntro = function() {
  this.removeEntity(this.myOrbitObject_);
  this.myOrbitObject_.setActive(false);
};

/**
 * creates the intro circles
*/
exp.chapter.Boson.prototype.createCirclesIntro = function() {
  this.myOrbitObject_ = new exp.entity.boson.OrbitObject({
          'tags': exp.chapter.BOSON,
          'colorIndexInc': this.colorIndexInc
  }, this);

  this.addEntity(this.myOrbitObject_, exp.manager.entityId++);
  this.removeEntity(this.preloader);

  var self = this;

  if (this.firstRun) {
    TweenLite.to(goog.dom.getElement('radius'), 1, {
      'scale': 1,
      'ease': Expo['easeOut']
    });

    TweenLite.to(goog.dom.getElement('desktopstart'), 1, {
      'scale': 1,
      'ease': Expo['easeOut'],
      'delay': 0.6
    });

    goog.dom.classes.add(document.body, 'info-open');
    exp.ui.toggle.toggle('open', true, 0.6);

    var starts = goog.dom.getElementsByClass('js-start-experiment');
    goog.array.forEach(starts, function(elem) {
      new Hammer(elem)['on']('tap', function(e) {
        e.stopPropagation();
        self.circlesInputCheck();
      });
    });
  } else {
    setTimeout(function() {
      self.circlesInputCheck();
    }, 2000);
  }
};

/**
 * Creates the preloader.
 */
exp.chapter.Boson.prototype.createPreloader = function() {
  var curColorsArr = ['#00933B', '#4688f0', '#da453d' , '#f6c338'];
  this.preloader = new exp.entity.Circle({
    'patterns': [
      {'color': curColorsArr[0]},
      {'color': curColorsArr[1]},
      {'color': curColorsArr[2]},
      {'color': curColorsArr[3]}
    ],
    'radius': exp.manager.isMobile() ? 100 : 40,
    'foldable': true,
    'foldSpeed': 4,
    'useLighting': true,
    'patternsRepeat': true,
    'direction': 1,
    'tags': exp.Tags.BOSON
  });

  if (this.isMobile == true) {
    this.preloaderUpScale = 1;
  } else {
    this.preloaderUpScale = 0.3;
  }

  this.preloader.getObject().scale.set(0, 0, 0);

  this.addEntity(this.preloader, exp.manager.entityId++);

  TweenLite.to(this.preloader.getObject().scale, 0.9 , {
    'x': this.preloaderUpScale,
    'y': this.preloaderUpScale,
    'z': this.preloaderUpScale,
    'onComplete': this.initSoundLoad,
    'onCompleteScope': this
  });
};

/**
 * init section sound loading.
 * @public
 */
exp.chapter.Boson.prototype.initSoundLoad = function() {
  exp.ui.chapter.getSizes();

  exp.soundManager.preloadSound('boson/20Sided_Closing');
  exp.soundManager.preloadSound('boson/20Sided_Opening');
  exp.soundManager.preloadSound('boson/PolyFillTone_01');
  exp.soundManager.preloadSound('boson/PolyFillTone_02');
  exp.soundManager.preloadSound('boson/PolyFillTone_03');
  exp.soundManager.preloadSound('boson/PolyFillTone_04');
  exp.soundManager.preloadSound('boson/PolyFillTone_05');
  exp.soundManager.preloadSound('boson/PolyFillTone_06');
  exp.soundManager.preloadSound('boson/PolyFillTone_07');
  exp.soundManager.preloadSound('boson/PolyFillTone_08');

  exp.soundManager.preloadSound('silicon/Bubble_01');
  exp.soundManager.preloadSound('silicon/Bubble_02');
  exp.soundManager.preloadSound('silicon/Note_01');
  exp.soundManager.preloadSound('silicon/Note_02');
  exp.soundManager.preloadSound('silicon/Note_03');
  exp.soundManager.preloadSound('silicon/Note_04');
  exp.soundManager.preloadSound('silicon/Note_05');
  exp.soundManager.preloadSound('silicon/Note_06');
  exp.soundManager.preloadSound('silicon/Note_07');
  exp.soundManager.preloadSound('silicon/Note_08');
  exp.soundManager.preloadSound('silicon/Note_09');
  exp.soundManager.preloadSound('silicon/Paper_01');
  exp.soundManager.preloadSound('silicon/Paper_02');
  exp.soundManager.preloadSound('silicon/Paper_03');
  exp.soundManager.preloadSound('silicon/Paper_04');
  exp.soundManager.preloadSound('silicon/Paper_05');
  exp.soundManager.preloadSound('silicon/Paper_06');
  exp.soundManager.preloadSound('silicon/PaperBubble_01');

  exp.soundManager.preloadSound('neural/Data_Appear_01');
  exp.soundManager.preloadSound('neural/Data_Appear_02');
  exp.soundManager.preloadSound('neural/Eye_Move');
  exp.soundManager.preloadSound('neural/Eye_Move_Cute');
  exp.soundManager.preloadSound('neural/Picture_Appear');
  exp.soundManager.preloadSound('neural/Loading_1');
  exp.soundManager.preloadSound('neural/Loading_2');
  exp.soundManager.preloadSound('neural/Information_Load');

  exp.soundManager.preloadSound('planet/PageFlip_01');
  exp.soundManager.preloadSound('planet/PageFlip_02');
  exp.soundManager.preloadSound('planet/Satellite');
  exp.soundManager.preloadSound('planet/Balloons');
  exp.soundManager.preloadSound('planet/CityDot_Single');
  exp.soundManager.preloadSound('planet/CityLines');
  exp.soundManager.preloadSound('planet/Clouds');
  exp.soundManager.preloadSound('exoplanet/PageFlip_01');
  exp.soundManager.preloadSound('exoplanet/PageFlip_02');
  exp.soundManager.preloadSound('exoplanet/VoyagerSonar');

  exp.soundManager.preloadSound('common/BigRumble');
  exp.soundManager.preloadSound('common/Whoosh_01');

  if (window.innerWidth >= 768) {
    exp.soundManager.preloadSound('boson/SpinningParticleNoiseLoop');
    exp.soundManager.preloadSound('boson/AmbientLoop_Scene02');
    exp.soundManager.preloadSound('silicon/AmbientLoop_Scene03');
    exp.soundManager.preloadSound('neural/AmbientLoop_Scene04');
    exp.soundManager.preloadSound('planet/AmbientLoop_Scene05');
    exp.soundManager.preloadSound('exoplanet/AmbientLoop_Scene06');
  }

  var self = this;
  exp.soundManager.loadSounds(function() {
    if (self.loaded_) {
      return;
    }

    self.loaded_ = true;

    exp.ui.chapter.setChapter(0);
  });

  this.delayflipObject(this.preloader);

};

/**
 * delayed flip of an object.
 * @param {object} myFlipEntity object.
 * @public
 */
exp.chapter.Boson.prototype.delayflipObject = function(myFlipEntity) {
  var inc = 6.28318531 / 4;
  myFlipEntity.getObject().rotation.z =
  myFlipEntity.getObject().rotation.z + inc;
   myFlipEntity.createSlice(true, .6);
  if (this.loaded_ && this.preloaderFlipInc > 4) {
    this.createCirclesIntro();
  }else {
    TweenLite.delayedCall(.6 , this.delayflipObject, [myFlipEntity] , this);
    this.preloaderFlipInc = this.preloaderFlipInc + 1;
  }


};

/**
 * Rotate cloud and icosahedron.
 */
exp.chapter.Boson.prototype.rotate = function() {
  this.ico_.getObject().rotation.x += this.rotationSpeedX_;

  if (this.ico_.getObject().rotation.x > Math.PI / 8) {
    this.ico_.getObject().rotation.x = Math.PI / 8;
  } else if (this.ico_.getObject().rotation.x < -Math.PI / 8) {
    this.ico_.getObject().rotation.x = -Math.PI / 8;
  }
  this.ico_.getObject().rotation.y -= this.rotationSpeedY_;

  this.hoboCloud_.getObject().rotation.set(
    this.ico_.getObject().rotation.x,
    this.ico_.getObject().rotation.y,
    this.ico_.getObject().rotation.z
  );

  if (this.rotationSpeedX_ > .003 || this.rotationSpeedX_ < -.003) {
    this.rotationSpeedX_ *= 0.93;
  }
  if (this.rotationSpeedY_ > .003 || this.rotationSpeedY_ < -.003) {
    this.rotationSpeedY_ *= 0.93;
  }
};

/**
 * Active tick.
 * @param {number} delta Time between ticks, in fractional seconds.
 * @param {number} now The current run-time in fractional seconds.
 */
exp.chapter.Boson.prototype.activeTick = function(delta, now) {
  goog.base(this, 'activeTick', delta, now);
  if (!this.ico_.childrenHidden) {
    this.rotate();
  }
};
