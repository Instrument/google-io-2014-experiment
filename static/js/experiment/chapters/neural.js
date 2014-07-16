goog.provide('exp.chapter.Neural');

goog.require('exp.entity.neural.Circuit');
goog.require('exp.entity.neural.Eyeball');
goog.require('exp.entity.neural.Eyesocket');
goog.require('exp.entity.neural.Pix');
goog.require('exp.entity.neural.Processor');
goog.require('exp.entity.neural.Pupil');
goog.require('goog.array');
goog.require('goog.events');

/**
 * A chapter that is put into the experiment
 * @constructor
 */
exp.chapter.Neural = function() {
  goog.base(this, 'neural');

  this.tag = exp.Tags.NEURAL;

  this.aggitationLevel_ = 0;
  this.transitionLevel_ = 500;

  this.ambientTrack_ = 'neural/AmbientLoop_Scene04';
  this.ambientTrackGain_ = .8;
};
goog.inherits(exp.chapter.Neural, exp.chapter.Core);

/**
 * Set the active state.
 * @param {boolean} isActive the new state.
 * @override
 */
exp.chapter.Neural.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);
  var obj = this;

  obj.PROCESSING_INTERVAL = 1;
  obj.BLINK_INTERVAL = 2.1;
  obj.BLINK_SPEED = .18;

  obj.INIT_SCALE = 5;
  obj.Y_OFFSET = 0;
  if (isActive) {
    setTimeout(function() {
      exp.background.maskToPattern(
        '#ededed', 'rgba(0,0,0,0.15)', 0.7, false, Linear['easeNone']);
    }, 700);
    exp.mouseTracker.startTracking();
    exp.manager.flipInfoButton(2);
    exp.ui.chapter.setChapter(3);

    this.lastMouseX_ = null;
    this.lastMouseY_ = null;
    this.lastInput_ = null;
    this.isInteractive_ = null;
    this.pupilCheck_ = false;
    this.hasMoved_ = false;

    this.widthScale = null;
    obj.scale_ = 1;
    obj.lastMouseMovement_ = 0;
    obj.mouseMovementTracking_ = false;

    this.pix_ = [];

    this.circuit_ = null;
    this.eyesocket_ = null;
    this.pupil_ = null;
    this.eyeball_ = null;
    this.processors_ = [];
    this.processorFlips_ = [];
    this.chosenImageColors_ = [];
    this.shownImages_ = [];
    this.defaultImages_ = [10, 1, 9];
    this.followImages_ = [];
    this.missedImages_ = 0;

    this.imagesProcessed_ = 0;
    this.numPixProcessed_ = 0;
    this.followPix_ = null;

    this.colors_ = [
      '#ed5932', // 0
      '#fcd745', // 1
      '#f1f2f2', // 2 - grey
      '#f7a735', // 3
      '#333333', // 4 - grey
      '#e8407b', // 5 - red
      '#37b7f4', // 6 - blue
      '#3dfffe', // 7 - ufo blue
      '#bcbec0', // 8 - grey
      '#1d97a6', // 9 - green
      '#fff8c7', // 10
      '#3be8b7', // 11 - rhex green
      '#f6eb6c'  // 12
    ];

    this.images_ = {
      'pong': [[0, 1], [2, 8]],
      'can': [[5, 6], [2, 4, 8]],
      'nes': [[5], [2, 4, 8]],
      'ufo': [[7], [2, 4, 8]],
      'doge': [[3, 1, 7], []],
      'boom': [[2, 4, 8], []],
      'mona': [[9, 1, 10], []],
      'rhex': [[11, 4, 8], []],
      'banana': [[12, 1, 10], []]
    };

    this.resetProcessors(true);

    var imageCount = 0;
    for (var key in this.images_) {
      if (goog.array.indexOf(this.defaultImages_, imageCount) === -1) {
        this.followImages_.push(imageCount);
      }
      imageCount++;
    }
    goog.array.shuffle(this.followImages_);

    exp.sequencer.add(
      'neuralInitIntro', .3, this.initIntro, {}, this, exp.Tags.NEURAL
    );
  }
};

/**
 * A chapter that is put into the experiment
 * @param {number} scale Optional scale value to use.
 */
exp.chapter.Neural.prototype.scaleEntities = function(scale) {
  this.scale_ = scale || this.scale_;
  if (this.circuit_) {
    this.circuit_.getObject().scale.set(this.scale_, this.scale_, 1);
  }
  if (this.eyesocket_) {
    this.eyesocket_.getObject().scale.set(this.scale_, this.scale_, 1);
  }

  if (this.eyeball_) {
    this.eyeball_.getObject().scale.set(this.scale_, this.scale_, 1);
  }

  if (this.pupil_) {
    this.pupil_.getObject().scale.set(this.scale_, this.scale_, 1);
  }

  for (var i = 0; i < this.processors_.length; i++) {
    this.processors_[i].getObject().scale.set(this.scale_, this.scale_, 1);
    this.processors_[i].getObject().position.set(
      Math.sin(Math.PI / 6 * i) * 100 * this.scale_,
      Math.cos(Math.PI / 6 * i) * 100 * this.scale_ + this.Y_OFFSET,
      0
    );
  }
};

/**
 * Move entities back.
 */
exp.chapter.Neural.prototype.moveEntitiesBack = function() {
  if (this.circuit_) {
    this.circuit_.getObject().position.z -= 3;
  }
  if (this.eyesocket_) {
    this.eyesocket_.getObject().position.z -= 3;
  }

  if (this.eyeball_) {
    this.eyeball_.getObject().position.z -= 3;
  }

  if (this.pupil_) {
    this.pupil_.getObject().position.z -= 3;
  }

  for (var i = 0; i < this.processors_.length; i++) {
    this.processors_[i].getObject().position.z -= 3;
  }
};

/**
 * Inits the intro.
 */
exp.chapter.Neural.prototype.initIntro = function() {
  var obj = this;
  this.circuit_ = new exp.entity.neural.Circuit();
  this.circuit_.getObject().position.z = -100;
  this.circuit_.getObject().position.y = this.Y_OFFSET;
  this.circuit_.getObject().scale.set(this.INIT_SCALE, this.INIT_SCALE, 1);
  var moveParams = {scale: this.INIT_SCALE, z: -100};
  TweenLite.to(moveParams, .6, {scale: this.scale_, z: -3,
    onUpdate: function() {
      obj.circuit_.getObject().position.z = moveParams.z;
      obj.circuit_.getObject().scale.set(moveParams.scale,
        moveParams.scale, 1);
    }
  });
  this.addEntity(this.circuit_);
  exp.sequencer.add(
    'neuralBuildAssets', .2, this.neuralBuildAssets, {}, this, exp.Tags.NEURAL
  );
};

/**
 * Build neural assets.
 */
exp.chapter.Neural.prototype.neuralBuildAssets = function() {
  exp.sequencer.add(
    'circuitOpen', 0, this.circuitOpen, {}, this, exp.Tags.NEURAL
  );
  exp.soundManager.playSound('neural/Loading_1');
};

/**
 * Add a processor.
 * @param {object} params Object containing parameters to use.
 */
exp.chapter.Neural.prototype.addProcessor = function(params) {
  var processor = new exp.entity.neural.Processor();
  processor.getObject().scale.set(this.scale_, this.scale_, 1);
  this.addEntity(processor);

  processor.getObject().position.set(
    Math.sin(Math.PI / 6 * params['num']) * 126 * this.scale_ + .5,
    (Math.cos(Math.PI / 6 * params['num']) * 126 * this.scale_ + 1) * 1.008,
    0
  );

  processor.getObject().rotation.z = -Math.PI / 6 * params['num'] + Math.PI / 2;
  this.processors_.push(processor);
};

/**
 * Add a pupil.
 */
exp.chapter.Neural.prototype.addPupil = function() {
  this.pupil_ = new exp.entity.neural.Pupil();
  this.pupil_.getObject().position.y = this.Y_OFFSET;
  this.pupil_.getObject().scale.set(this.scale_, this.scale_, 1);
  this.addEntity(this.pupil_);
  this.mouseMovementTracking_ = true;

  goog.events.listen(
    window,
    goog.events.EventType.MOUSEMOVE,
    goog.bind(this.moveHandler, this)
  );

  for (var i = 0; i < 12; i++) {
    exp.sequencer.add(
      'addProcessor' + i, .4 + (i % 6 * .1), this.addProcessor,
        {'num': i}, this, exp.Tags.NEURAL
    );
  }
  exp.soundManager.playSound('neural/Loading_2');

  var delayCount = 0;
  for (var i = 0; i < this.colors_.length; i++) {
    var colors = goog.array.concat(
      goog.array.slice(this.colors_, i), goog.array.slice(this.colors_, 0, i));
    var percStart = 360 * Math.random();
    exp.sequencer.add(
      'addData-' + i, delayCount++ * .12 + .8, function(data) {
        this.addDataToStream(data['colors'], data['percStart'], data['num']);
      }, {'colors': colors,
          'percStart': percStart,
          'num': i}, this, exp.Tags.NEURAL
    );
    exp.sequencer.add(
      'initFollowPix', 1.5, function() {
        this.lastInput_ = null;
        this.followPix_ = null;
        this.getFollowPix();
      }, null, this, null);
  }
  this.followPix_ = null;

};

/**
 * Add an eyesocket.
 */
exp.chapter.Neural.prototype.addEyesocket = function() {
  this.eyesocket_ = new exp.entity.neural.Eyesocket();
  this.eyesocket_.getObject().position.y = this.Y_OFFSET;
  this.eyesocket_.getObject().scale.set(this.scale_, this.scale_, 1);
  this.addEntity(this.eyesocket_);

  exp.sequencer.add(
    'addEyeball', .4, this.addEyeball, {}, this, exp.Tags.NEURAL
  );
};

/**
 * Add an eyeball.
 */
exp.chapter.Neural.prototype.addEyeball = function() {
  this.eyeball_ = new exp.entity.neural.Eyeball();
  this.eyeball_.getObject().position.y = this.Y_OFFSET;
  this.eyeball_.getObject().scale.set(this.scale_, this.scale_, 1);
  this.addEntity(this.eyeball_);

  exp.sequencer.add(
    'addPupil', .4, this.addPupil, {}, this, exp.Tags.NEURAL
  );
};

/**
 * Open a circuit.
 */
exp.chapter.Neural.prototype.circuitOpen = function() {
  this.circuit_.createSlice(true, .4);

  exp.sequencer.add(
    'addEyesocket', .6, this.addEyesocket, {}, this, exp.Tags.NEURAL
  );
};

/**
 * Open eye socket animation.
 */
exp.chapter.Neural.prototype.eyesocketOpen = function() {
  this.eyesocket_.createSlice(true, 0.4);
};

/**
 * Process flips.
 */
exp.chapter.Neural.prototype.process = function() {
  if (this.processorFlips_.length != 12 && this.processorFlips_.length) {
    var rand = 13;
    while (rand != -1 && this.processorFlips_.length) {
      rand = Math.floor(Math.random() * 12);

      if (goog.array.indexOf(this.processorFlips_, rand) === -1) {
        this.processors_[rand].processData();
        rand = -1;
      }
    }
  }

  if (this.isActive_) {
    this.startProcessing();
  }
};

/**
 * Start processing.
 */
exp.chapter.Neural.prototype.startProcessing = function() {
  this.stopProcessing();

  exp.sequencer.add(
    'showProcessing', this.PROCESSING_INTERVAL, this.process,
    {}, this, exp.Tags.NEURAL
  );
};

/**
 * Stop processing.
 */
exp.chapter.Neural.prototype.stopProcessing = function() {
  exp.sequencer.cancel('showProcessing');
};

/**
 * Reset processors.
 * @param {boolean} init Play a sound if init is false/undefined or empty.
 */
exp.chapter.Neural.prototype.resetProcessors = function(init) {
  if (!init || init == {}) {
    exp.soundManager.playSound('neural/Loading_2');
  }

  for (var i = 0; i <= 11; i++) {
    this.processorFlips_.push(i);
  }
  goog.array.shuffle(this.processorFlips_);

  for (var i = 0; i < this.processors_.length; i++) {
    var processor = this.processors_[i];
    exp.sequencer.add('resetProcessor' + i, (i % 12) * .05,
        processor.resetColors, {}, processor, null);
  }
};

/**
 * Increase the current aggitation level.
 * @param {boolean} isActive The new active state.
 * @override
 */
exp.chapter.Neural.prototype.increaseAggitation = function(isActive) {
  goog.base(this, 'increaseAggitation', isActive);
};

/**
 * Drag event handler for Hammer.js
 * @param {number} deltaX The amount of movement in the X axis.
 * @param {number} deltaY The amount of movement in the Y axis.
 * @param {Object} gesture The gesture object from Hammer.js.
 */
exp.chapter.Neural.prototype.onDrag = function(deltaX, deltaY, gesture) {
  if (this.isInteractive_ && this.mouseMovementTracking_) {
    this.lastMouseX_ = gesture['center']['pageX'];
    this.lastMouseY_ = gesture['center']['pageY'];
    this.hasMoved_ = true;
  }
};

/**
 * Sets the interaction.
 * @param {boolean?} set The reference to use to set the isInteractive boolean.
 */
exp.chapter.Neural.prototype.setInteraction = function(set) {
  if (set.set) {
    this.isInteractive_ = set.set;
  } else {
    this.isInteractive_ = set;
  }
};

/**
 * Move event handler
 * @param {object} e The event object to reference.
 */
exp.chapter.Neural.prototype.moveHandler = function(e) {
  if (this.isInteractive_ && this.mouseMovementTracking_) {
    this.lastMouseX_ = e.clientX;
    this.lastMouseY_ = e.clientY;
    this.hasMoved_ = true;
  }
};

/**
 * Active tick.
 * @param {number} delta Time between ticks, in fractional seconds.
 * @param {number} now The current run-time in fractional seconds.
 */
exp.chapter.Neural.prototype.activeTick = function(delta, now) {
  var obj = this;
  if (!this.isInteractive_ && this.pupil_ && !this.pupilCheck_) {
    if (this.pupil_.isReady()) {
      this.pupilCheck_ = true;
      this.setInteraction(true);
    }
  }
  if (!this.lastInput_) {
    this.lastInput_ = now;
  }
  if (this.hasMoved_) {
    this.lastInput_ = now;
    this.hasMoved_ = false;
    this.followPix_ = null;
  }
  if (now - this.lastInput_ > 3) {
    if (this.pix_.length) {
      if (!this.followPix_) {
        this.getFollowPix();
      }
      var perc = this.followPix_.orbitPerc_ * this.followPix_.rotateSpeed_;
      if (this.followPix_.side_) {
        perc = -perc;
      }
      this.lastMouseX_ = Math.cos(perc) *
        (window.innerWidth / 2) + (window.innerWidth / 2);
      this.lastMouseY_ = -Math.sin(perc) *
        (window.innerHeight / 2) + (window.innerHeight / 2);
    }
  }

  if (this.lastMouseX_ && this.lastMouseY_ && this.isInteractive_) {
    var pos = this.pupil_.getObject().position;
    var xOffset = -.5 + this.lastMouseX_ / window.innerWidth;
    var yOffset = -.5 + this.lastMouseY_ / window.innerHeight;

    var distx = xOffset * (window.innerWidth / 2);
    var disty = -yOffset * (window.innerHeight / 2) - this.Y_OFFSET;
    var dist = Math.sqrt(distx * distx + disty * disty);
    var rad = Math.atan2(distx, disty);

    var xLoc = Math.sin(rad) *
      (dist > (25 * this.scale_) ? (25 * this.scale_) : dist);
    var yLoc = Math.cos(rad) *
      (dist > (25 * this.scale_) ? (25 * this.scale_) : dist) + this.Y_OFFSET;

    var xStep = (pos.x - xLoc) / 12;
    var yStep = (pos.y - yLoc) / 12;
    var perc = pos.x / (pos.x + xStep);
    this.pupil_.getObject().position.x -= xStep;
    this.pupil_.getObject().position.y -= yStep;

    if (Math.sqrt(xStep * xStep + yStep * yStep) > 3 &&
      obj.lastMouseMovement_ + .4 < exp.manager.now() &&
      this.mouseMovementTracking_) {
        obj.lastMouseMovement_ = exp.manager.now();
    }

    if (Math.round(this.pupil_.getObject().position.x) == Math.round(xLoc) &&
      Math.round(this.pupil_.getObject().position.y) == Math.round(yLoc)) {
      this.lastMouseX_ = 0;
      this.lastMouseY_ = 0;
    }
  }
  exp.accelerometer.update(delta);
  if (exp.accelerometer.enabled) {
    var xOffset = -exp.accelerometer.getX() * 100;
    if (Math.abs(xOffset) > 150) {
      if (xOffset > 0) {
        xOffset = 150;
      } else {
        xOffset = -150;
      }
    }
    exp.manager.camera_.position.x = xOffset;

    var yOffset = -exp.accelerometer.getY() * 100;
    if (Math.abs(yOffset) > 150) {
      if (yOffset > 0) {
        yOffset = 150;
      } else {
        yOffset = -150;
      }
    }
    exp.manager.camera_.position.x = xOffset;

    exp.manager.camera_.lookAt(exp.manager.scene_.position);
  }
};

/**
 * Pupil blink animation.
 */
exp.chapter.Neural.prototype.blink = function() {
  this.pupil_.blink(this.BLINK_SPEED);

  if (this.isActive_) {
    exp.sequencer.add(
      'pupilBlink', this.BLINK_INTERVAL, this.blink, {}, this, exp.Tags.NEURAL
    );
  }
};

/**
 * Process pix.
 * @param {object} pix The pix object to reference.
 */
exp.chapter.Neural.prototype.processPix = function(pix) {
  var obj = this;
  var pixIndex = goog.array.indexOf(this.pix_, pix);

  if (++this.numPixProcessed_ === 3) {
    for (var i = 0; i < this.pix_.length; i++) {
      this.pix_[i].removeTapGesture();
    }
  }
  this.followPix_ = null;
  this.getFollowPix();
  var eyeCenter = {
    x: pix.getObject().position.x,
    y: pix.getObject().position.y,
    z: pix.getObject().position.z,
    scale: pix.getObject().scale.x};
  pix.currentTween = TweenLite['to'](eyeCenter, .5, {
    x: this.eyeball_.getObject().position.x,
    y: this.eyeball_.getObject().position.y,
    z: 5, scale: 2, onUpdate: function(d) {
      pix.getObject().position.set(
        eyeCenter.x,
        eyeCenter.y,
        eyeCenter.z
      );
      pix.getObject().scale.set(
        eyeCenter.scale,
        eyeCenter.scale,
        eyeCenter.scale
      );
    }, onComplete: function() {
      exp.soundManager.playSound('neural/Data_Appear_02');
      for (var i = 0; i < 4; i++) {
        var colors = pix.getColors();
        var initColor = colors[0] + '';
        if (i === 0) {
          obj.chosenImageColors_.push(
            goog.array.indexOf(obj.colors_, initColor));
        }
        var smallColors = goog.array.slice(colors, 0,
            Math.ceil(Math.random() * 5) + 3);
        goog.array.shuffle(smallColors);
        colors = goog.array.concat([initColor], smallColors);
        var processor = obj.processors_[obj.processorFlips_[0]];
        if (processor) {
          obj.processorFlips_.splice(0, 1);
          processor.addColors(colors);
          processor.processData();
          exp.soundManager.playSound(
            'neural/Information_Load', null, {'gain': .6});
        }
      }
      if (this.numPixProcessed_ !== 3) {
        pix.queueStopMoving_ = true;
      }
      pix.blink(.4);
      pix.orbitPerc_ += Math.PI;
      obj.checkProcessorFlips();
      obj.followPix_ = null;
      obj.getFollowPix();
    }
  });
};

/**
 * Select which data pix the eye should be following
 */
exp.chapter.Neural.prototype.getFollowPix = function() {
  var keyCount = 0;
  var possibilities = [];
  var possibilitiesNeeds = [];
  for (var key in this.images_) {
    var mand = goog.array.clone(this.images_[key][0]);
    var opt = goog.array.clone(this.images_[key][1]);
    var mandCount = 0;
    for (var i = 0; i < this.chosenImageColors_.length; i++) {
      if (goog.array.remove(mand, this.chosenImageColors_[i])) {
        mandCount++;
      }
    }
    var optCount = 0;
    for (var i = 0; i < this.chosenImageColors_.length; i++) {
      if (goog.array.remove(opt, this.chosenImageColors_[i])) {
        optCount++;
      }
    }
    if (mandCount + optCount >= this.chosenImageColors_.length &&
      goog.array.indexOf(this.shownImages_, keyCount) === -1) {
        possibilities.push(keyCount);
        possibilitiesNeeds.push(goog.array.concat(mand, opt));
    }
    keyCount++;
  }
  var chosenImage = null;
  for (var i = 0; i < this.followImages_.length; i++) {
    if (!chosenImage) {
      var index = goog.array.indexOf(possibilities, this.followImages_[i]);
      if (index !== -1) {
        chosenImage = this.followImages_[i];
        this.followPix_ = this.pix_[possibilitiesNeeds[index][0]];
      }
    }
  }

  if (!this.followPix_ && possibilities.length) {
    this.followPix_ = this.pix_[possibilitiesNeeds[0][0]];
  }
  if (!this.followPix_) {
    this.followPix_ =
      this.pix_[Math.floor(Math.random() * this.pix_.length)];
  }
};

/**
 * Check processor flips.
 */
exp.chapter.Neural.prototype.checkProcessorFlips = function() {
  if (!this.processorFlips_.length) {

    var keyCount = 0;
    var found = false;
    for (var key in this.images_) {
      var mand = goog.array.clone(this.images_[key][0]);
      var opt = goog.array.clone(this.images_[key][1]);
      var mandCount = 0;
      for (var i = 0; i < this.chosenImageColors_.length; i++) {
        if (goog.array.remove(mand, this.chosenImageColors_[i])) {
          mandCount++;
        }
      }
      var optCount = 0;
      for (var i = 0; i < this.chosenImageColors_.length; i++) {
        if (goog.array.remove(opt, this.chosenImageColors_[i])) {
          optCount++;
        }
      }
      if (mandCount === this.images_[key][0].length &&
          mandCount + optCount >= 3) {
          exp.log('neural-' + key);
          this.shownImages_.push(keyCount);
          goog.array.remove(this.followImages_, keyCount);
          this.eyeball_.currPattern_ = keyCount * 2;
        found = true;
      }
      keyCount++;
    }

    if (!found) {
      var offset = 9 + this.missedImages_++;
      this.shownImages_.push(offset);
      this.eyeball_.currPattern_ = offset * 2;
      this.eyeball_.failedColors_ = [
        this.colors_[this.chosenImageColors_[0]],
        this.colors_[this.chosenImageColors_[1]],
        this.colors_[this.chosenImageColors_[2]]
      ];
    }

    this.chosenImageColors_.length = 0;

    this.stopProcessing();
    this.imagesProcessed_++;
    exp.sequencer.cancel('pupilBlink');
    this.pupil_.setBlinkHold(true);
    this.pupil_.blink(this.BLINK_SPEED);
    this.setInteraction(false);
    this.mouseMovementTracking_ = false;

    exp.sequencer.add(
      'revealImage', 1, function() {
        exp.soundManager.playSound('neural/Picture_Appear');
        this.eyeball_.createSlice(true, 0.4);
      }, {}, this, exp.Tags.NEURAL
    );

    exp.sequencer.add(
      'hideImage', 3, this.resetDataInteractivity, {}, this, exp.Tags.NEURAL
    );
    if (this.imagesProcessed_ === 3) {
      for (var i = 0; i < this.pix_.length; i++) {
        var pix = this.pix_[i];
        exp.sequencer.add(
          'removePix' + i, 1.5 + i * .05, function(params) {
            params['pix'].blinkRemove_ = true;
            params['pix'].blink(.3);
        }, {'pix': pix}, this, exp.Tags.NEURAL);
      }
      this.pix_.length = 0;
    }
  }
};

/**
 * Add data to the stream.
 * @param {array} colors An array of hex colors.
 * @param {number} startPerc The starting percentage.
 * @param {object} num The color offset.
 */
exp.chapter.Neural.prototype.addDataToStream = function(colors,
                                                        startPerc,
                                                        num) {
  var obj = this;
  var pix = new exp.entity.neural.Pix({ fallSpeed: .9 },
            colors, this.pix_.length % 2, startPerc);
  pix.scene_ = this;
  pix.colorOffset = num;
  pix.getObject().position.y = -100;
  pix.getObject().position.z = 100 + Math.random() * 30;
  this.pix_.push(pix);
  this.addEntity(pix);
};



/**
 * Tap event handler for Hammer.js.
 * @param {object} gesture The gesture object from Hammer.js.
 */
exp.chapter.Neural.prototype.tap = function(gesture) {
  var obj = this;
  if (this.isInteractive_) {
    if (exp.manager.isIE) {
      this.pix_[Math.floor(Math.random() * this.pix_.length)].onRelease();
    }
    this.lastMouseX_ = gesture['center']['pageX'];
    this.lastMouseY_ = gesture['center']['pageY'];
    this.lastInput_ = exp.manager.now();
    this.followPix_ = null;
  }
};

/**
 * Resets data interactivity.
 */
exp.chapter.Neural.prototype.resetDataInteractivity = function() {
  if (this.imagesProcessed_ !== 3) {
    this.setInteraction(false);
    this.resetPupil();
    this.numPixProcessed_ = 0;
    exp.sequencer.add(
      'showImageResetProcessors', .3, this.resetProcessors, null,
      this, null
    );
    exp.sequencer.add(
      'addGesturesToPix', 1, function() {
        for (var i = 0; i < this.pix_.length; i++) {
          this.pix_[i].addTapGesture();
        }
      }, {}, this, null);
    exp.soundManager.playSound('neural/Picture_Appear');
    this.eyeball_.createSlice(true, .3);
    exp.sequencer.add(
      'removePupilBlinkClosed', .3, this.pupil_.removeBlinkClosed,
      {}, this.pupil_, null
    );
    exp.sequencer.add(
      'setInteractionAfterHideImage', 1, this.setInteraction,
      {set: true}, this, null
    );
    exp.sequencer.add(
      'resumeMouseTrackingNeural', 1, function() {
        this.mouseMovementTracking_ = true;
      }, {}, this, null
    );
    this.followPix_ = null;
    this.getFollowPix();
  } else {
    this.transitionToNextChapter();
  }
};

/**
 * Update viewport functionality
 */
exp.chapter.Neural.prototype.updateViewport = function() {
  var worldPosition = exp.manager.getWorldLocation(
    0,
    window.innerHeight * .8,
    100);

  this.widthScale = worldPosition.x;

  if (this.isInteractive_ && this.mouseMovementTracking_) {
    this.lastMouseX_ = window.innerWidth / 2;
    this.lastMouseY_ = window.innerHeight / 2;
    this.lastInput_ = exp.manager.now();
    this.followPix_ = null;
  }

  var ratio = window.innerWidth / window.innerHeight;
  for (var i = 0; i < this.pix_.length; i++) {
    this.pix_[i].updateParams(ratio);
  }
};

/**
 * Set object scales.
 * @param {number} newScale The new scale to apply.
 * @param {number} speed The speed of the tween.
 * @param {boolean} ending If the animation is ending or not.
 */
exp.chapter.Neural.prototype.setScale = function(newScale, speed, ending) {
  var scale = {'num': this.scale_};
  var obj = this;

  TweenLite.to(scale, speed, {
    'num': newScale,
    onUpdate: function() {
      obj.scaleEntities(scale['num']);
      if (ending) {
        obj.moveEntitiesBack();
      }
    }
  });
};

/**
 * Reset pupil.
 */
exp.chapter.Neural.prototype.resetPupil = function() {
  this.lastMouseX_ = null;
  this.lastMouseY_ = null;
  this.lastInput_ = exp.manager.now();
  this.followPix_ = null;
  this.pupil_.getObject().position.set(0, this.Y_OFFSET, 0);
  this.pupil_.getObject().rotation.set(0, 0, 0);
};

/**
 * Transition to the next chapter.
 */
exp.chapter.Neural.prototype.transitionToNextChapter = function() {
  this.setScale(.1, .6, true);

  goog.events.unlisten(
    window,
    goog.events.EventType.MOUSEMOVE,
    goog.bind(this.moveHandler, this)
  );

  exp.sequencer.cancelAllTagged(exp.Tags.NEURAL);

  exp.sequencer.add('neuralNextChapter', .3, exp.manager.nextChapter, {},
      exp.manager, null);

  exp.sequencer.add('neuralRemoveEntities', .4,
  function() {
    exp.manager.removeEntity(this.eyeball_);
    exp.manager.removeEntity(this.circuit_);
    exp.manager.removeEntity(this.eyesocket_);
    exp.manager.removeEntity(this.pupil_);
    for (var i = 0; i < this.processors_.length; i++) {
      exp.manager.removeEntity(this.processors_[i]);
    }
  }, {tag: exp.Tags.NEURAL}, this, null);
};
