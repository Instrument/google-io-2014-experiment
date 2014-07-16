goog.provide('exp.Topic');

goog.require('exp.DoublyLinkedList');
goog.require('exp.chapter.Boson');
goog.require('exp.chapter.Exoplanet');
goog.require('exp.chapter.Neural');
goog.require('exp.chapter.Planet');
goog.require('exp.chapter.Silicon');
goog.require('exp.dom');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/**
 * A manager for the experiment
 * @constructor
 */
exp.Topic = function() {
  var obj = this;
  var isIE11 = navigator.userAgent.indexOf('.NET CLR') > -1;
  obj.isIE = isIE11 || navigator.appVersion.indexOf('MSIE') != -1;

  obj.isNexus7 = !!navigator.userAgent.match(/Nexus 7/);

  if (obj.isNexus7) {
    goog.dom.classes.add(document.body, 'nexus-7');
  }

  obj.clock_ = new THREE.Clock();
  obj.entityId = 1;

  obj.camera_ = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 1, 1000);
  obj.camera_.position.set(0, 0, 500);
  obj.scene_ = new THREE.Scene();

  obj.renderer_ = obj.isIE ?
    new THREE.CSS3DRendererIE() : new THREE.CSS3DRenderer();
  obj.renderer_.setSize(window.innerWidth, window.innerHeight);
  obj.renderer_.domElement.className = 'renderer';
  obj.renderer_.domElement['style']['position'] = 'absolute';
  obj.renderer_.domElement['style']['top'] = 0;
  obj.renderer_.domElement['style']['left'] = 0;

  exp.dom.appendChild(document.body, obj.renderer_.domElement);


  // initialize the HUD layer.
  obj.HUDCamera_ = new THREE.PerspectiveCamera(45, 1, 1, 1000);
  obj.HUDCamera_.position.set(0, 0, 182);
  obj.HUDScene_ = new THREE.Scene();
  obj.HUDRenderer_ = obj.isIE ?
    new THREE.CSS3DRendererIE() : new THREE.CSS3DRenderer();
  obj.HUDRenderer_.setSize(103, 103);
  obj.HUDRenderer_.domElement.className = 'hud-renderer';
  obj.HUDRenderer_.domElement['style']['position'] = 'absolute';
  obj.HUDRenderer_.domElement['style']['right'] = 0;
  obj.HUDRenderer_.domElement['style']['bottom'] = 0;
  exp.dom.appendChild(document.body, obj.HUDRenderer_.domElement);


  obj.projector = new THREE.Projector();

  obj.previousTouchX_ = 0;
  obj.previousTouchY_ = 0;

  obj.setWorldScale();

  obj.updateViewport();

  obj.entities_ = new exp.DoublyLinkedList();

  obj.isRenderPaused = false;

  obj.infoButtonRadius_ = 40;

  obj.supportsTouch = Modernizr['touch'];



  obj.isMobile_ =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.
    test(navigator.userAgent);

  obj.disabled = false;

  var hiddenProp = (function getHiddenProp() {
    var prefixes = ['webkit', 'moz', 'ms', 'o'];

    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';

    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++) {
        if ((prefixes[i] + 'Hidden') in document)
            return prefixes[i] + 'Hidden';
    }

    // otherwise it's not supported
    return null;
  })();

  if (hiddenProp) {
    var eventName = hiddenProp.replace(/[H|h]idden/, '') + 'visibilitychange';

    // Pause on tab change
    document.addEventListener(eventName, function() {
      // if (document[hiddenProp]) {
      //   if (!obj.disabled) {
      //     // exp.manager.pauseExp(true);
      //   }
      // } else {
      //   if (!obj.disabled) {
      //     // exp.manager.unPauseExp(true);
      //   }
      // }
    }, false);
  }
};

/**
 * Initialize manager after everything has loaded.
 */
exp.Topic.prototype.init = function() {
  var obj = this;

  var a = new exp.chapter.Silicon();
  a.setActive(true);

};

/**
 * Create and initialize the info button.
 * @private
 */
exp.Topic.prototype.initInfoButton_ = function() {
  var startPos;
  if (this.isNexus7 || (window.innerWidth < 768)) {
    startPos = [14, -14, 0];
  } else {
    startPos = [0, 0, 0];
  }

  this.infoButton_ = new exp.entity.Circle({
    'startPattern': {
        'html': exp.entity.Core.makeCircle(28,
          '#c0c0c0'),
        'viewBox': exp.entity.Core.makeViewBox(0, 0, 56, 56)
    },
    'patterns': [
      exp.svgs.getSvg('ui-guide-boson'),
      exp.svgs.getSvg('ui-guide-silicon'),
      exp.svgs.getSvg('ui-guide-neural-network'),
      exp.svgs.getSvg('ui-guide-connected-world'),
      exp.svgs.getSvg('ui-guide-exoplanets')
    ],
    'scene': this.HUDScene_,
    'radius': this.infoButtonRadius_,
    'width': this.infoButtonRadius_ * 2,
    'height': this.infoButtonRadius_ * 2,
    'position': startPos,
    'useLighting': true,
    'direction': -1,
    'patternsRepeat': true,
    'foldable': true,
    'detailFactor': 1.0
  });

  this.entities_.push(this.infoButton_);
  this.HUDScene_.add(this.infoButton_.getObject());

  this.infoButton_.bindInputEvent('tap', function(e) {
    e.preventDefault();
    e.stopPropagation();

    e['gesture'].preventDefault();
    e['gesture'].stopPropagation();

    exp.ui.toggle.toggle('open', true, 0,
      exp.topic.isNexus7 || (window.innerWidth < 768));
  });
};

/**
 * Flip the info button to the next chapter.
 * @param {number} jumpToIndex Pattern to jump to.
 */
exp.Topic.prototype.flipInfoButton = function(jumpToIndex) {
  if (this.infoButton_) {
    if (jumpToIndex < this.infoButton_.params_['patterns'].length) {
      this.infoButton_.currPattern_ = jumpToIndex - 1;
      this.infoButton_.createSlice({ 'animate': true });
    }
  }
};

/**
 * pause Exp, stop rendering and remove touch eventListener.
 * @param {boolean=false} dontTweenSound If we shouldn't tween the sound.
 */
exp.Topic.prototype.pauseExp = function(dontTweenSound) {
  this.isRenderPaused = true;

  document.removeEventListener('touchmove', exp.blockScrollFunction, false);

  Hammer.gestures.Drag.defaults.drag_block_vertical = false;

  exp.soundManager.setVolume(0, !dontTweenSound);
};

/**
 * unpause Exp, resume rendering and add touch eventListener.
 * @param {boolean=false} dontTweenSound If we shouldn't tween the sound.
 */
exp.Topic.prototype.unPauseExp = function(dontTweenSound) {
  if (this.isRenderPaused) {
    this.isRenderPaused = false;

    Hammer.gestures.Drag.defaults.drag_block_vertical = true;

    document.addEventListener('touchmove', exp.blockScrollFunction, false);

    this.animate();

    exp.soundManager.setVolume(1, !dontTweenSound);
  }
};

/**
 * Check if user is on mobile.
 * @return {boolean} User is mobile or not.
 */
exp.Topic.prototype.isMobile = function() {
  return this.isMobile_;
};

/**
 * Given a position, get the world location.
 * @param {number} x The x position.
 * @param {number} y The y position.
 * @param {number} z The z position.
 * @return {THREE.Vector3}
 */
exp.Topic.prototype.getWorldLocation = function(x, y, z) {
  var aspectRatio = window.innerWidth / window.innerHeight;

  var vector = new THREE.Vector3();
  vector.set(
    (x / window.innerWidth) * 2 - 1,
    - (y / window.innerHeight) * 2 + 1,
    0.5
  );

  this.projector['unprojectVector'](vector, this.camera_);

  var dir = vector.sub(this.camera_.position).normalize();
  var distance = (-(this.camera_.position.z - z) / dir.z);
  var pos = this.camera_.position.clone().add(dir.multiplyScalar(distance));

  if (aspectRatio >= 1.2) {
    pos.x = pos.x * ((1 / 1.2) * aspectRatio);
  } else if (aspectRatio < .2) {
    pos.x = pos.x * ((1 / .2) * aspectRatio);
  }

  return pos;
};

/**
 * Callback to update the field of view when the viewport size changes.
 */
exp.Topic.prototype.updateViewport = function() {
  var aspectRatio = window.innerWidth / window.innerHeight;
  aspectRatio = THREE.Math.clamp(aspectRatio, 0.2, 1.2);

  var f = aspectRatio - 0.2;
  var a = 120;
  var b = 45;

  this.camera_.aspect = aspectRatio;
  this.camera_.fov = a + f * (b - a);

  this.camera_.updateProjectionMatrix();
  this.renderer_.setSize(window.innerWidth, window.innerHeight);

  if (typeof this.currChapter_ !== 'undefined') {
    this.currChapter().updateViewport();
  }
};

/**
 * Get the elapsed time for the experiment.
 * @return {number} this.clock_.getElapsedTime Time since manager was initted.
 */
exp.Topic.prototype.now = function() {
  return this.clock_.getElapsedTime();
};

/**
 * Get the chapter the experiment is currently on.
 * @return {object} this.chapters_[this.currChapter_] The current chapter.
 */
exp.Topic.prototype.currChapter = function() {
  return this.chapters_[this.currChapter_];
};

/**
 * Get list of all chapters for experiment.
 * @return {array} this.chapters_ Array of all chapters loaded.
 */
exp.Topic.prototype.chapters = function() {
  return this.chapters_;
};

/**
 * Reset the world scale based on viewport and created object ratio.
 */
exp.Topic.prototype.setWorldScale = function() {
  var wsElement = goog.dom.createElement('div');

  var wsSVG = goog.dom.createDom('svg', {
    'width': '100px',
    'height': '100px'
  });

  var wsCircle = goog.dom.createDom('circle', {
    'cx': '50',
    'cy': '50',
    'r': '50',
    'fill': '#ff00ff'
  });

  goog.dom.appendChild(wsElement, wsSVG);
  goog.dom.appendChild(wsSVG, wsCircle);

  var wsCssObject = new THREE.CSS3DObject(wsElement);
  this.scene_.add(wsCssObject);
  this.renderScene();
  this.worldScale_ = 100 / wsSVG.getBoundingClientRect().width;
  this.scene_.remove(wsCssObject);
  exp.dom.removeNode(wsElement);
};

/**
 * Force the scene to render.
 */
exp.Topic.prototype.renderScene = function() {
  this.renderer_.render(this.scene_, this.camera_);
};

/**
 * Add entity to world scene.
 * @param {Entity} entity Entity to add to world scene.
 */
exp.Topic.prototype.addEntity = function(entity) {
  this.entities_.push(entity);
  entity.scene.add(entity.getObject());
};

/**
 * Remove entity from the world.
 * @param {Entity} entity Entity to remove.
 */
exp.Topic.prototype.removeEntity = function(entity) {
  entity.killSlices();

  if (entity) {
    entity.dispose();
  }

  if (entity.getObject().parent) {
    entity.getObject().parent.remove(entity.getObject());
  }

  this.entities_.remove(entity);

  exp.dom.removeNode(entity.getElement());
};

/**
 * Detach entity and put onto world stage.
 * @param {exp.Entity} entity Entity to detach.
 */
exp.Topic.prototype.detachEntity = function(entity) {
  try {
    entity.getObject().applyMatrix(entity.getObject().parent.matrixWorld);
  } catch (e) {
    // no-op
  }
  this.scene_.add(entity.getObject());
};

/**
 * Remove entities for a given tag.
 * @param {number} tag The tag.
 */
exp.Topic.prototype.removeEntitiesForTag = function(tag) {
  tag = tag.tag || tag;

  this.entities_.forEach(function(entity) {
    if (entity.hasTag(tag)) {
      this.removeEntity(entity);
    }
  }, this);
};

/**
 * Start next chapter of sequence.
 * @param {number=0} delay Delay between chapters.
 */
exp.Topic.prototype.nextChapter = function(delay) {
  delay = delay || 0;

  var obj = this;
  obj.chapters_[obj.currChapter_].setActive(false);

  this.entities_.forEach(function(entity) {
    if (entity.hasTag(obj.chapters_[obj.currChapter_].tag)) {
      entity.setActive(false);
    }
  }, this);

  setTimeout(function() {
    obj.currChapter_++;

    if (obj.currChapter_ >= obj.chapters_.length) {
      obj.currChapter_ = 0;
    }

    obj.chapters_[obj.currChapter_].setActive(true);
  }, delay);
};

/**
 * Set the current chapter.
 * @param {number} num The chapter number.
 */
exp.Topic.prototype.setChapter = function(num) {
  var obj = this;
  obj.chapters_[obj.currChapter_].setActive(false);

  for (var i = 0; i < this.entities_.length; i++) {
    if (obj.entities_[i].hasTag(obj.chapters_[obj.currChapter_].tag)) {
      obj.entities_[i].setActive(false);
    }
  }

  obj.currChapter_ = num;
  obj.chapters_[obj.currChapter_].setActive(true);
};

/**
 * Run animation on requestAnimationFrame.
 * @param {boolean} force Force entity logic without new animate loop.
 */
exp.Topic.prototype.animate = function(force) {
  // boolean to pause and unpause rendering.
  if (this.isRenderPaused == false) {
    var delta = this.clock_.getDelta();
    var now = this.now();

    this.animationFrame = this.animationFrame || goog.bind(function() {
      this.animate();
    }, this);

    if (delta > 0.25) {
      // turn very long frames back into short frames..
      delta = 0.03333333333333;
      // don't process long frames (usually indicates an inactive tab) to
      // avoid crazy animation behaviors due to huge delta values.
      //requestAnimationFrame(this.animationFrame);
      //return;
    }

    exp.background.update(delta);

    if (exp.accelerometer.enabled) {
      // exp.accelerometer.update(delta);
    } else if (!Modernizr['touch'] && exp.mouseTracker.enabled) {
      exp.mouseTracker.update(delta);
      this.camera_.position.x = -exp.mouseTracker.getX() *
        exp.mouseTracker.multiplierX;
      this.camera_.position.y = -exp.mouseTracker.getY() *
        exp.mouseTracker.multiplierY;
      this.camera_.lookAt(this.scene_.position);
    }

    for (var i = 0; i < this.chapters_.length; i++) {
      this.chapters_[i].tick(delta, now);
    }

    // Avoid creating a new function on every frame.
    this.lastDelta_ = delta;
    this.lastNow_ = now;
    this.tickFunction_ = this.tickFunction_ || function(entity) {
      entity.tick(this.lastDelta_, this.lastNow_);
    };
    this.entities_.forEach(this.tickFunction_, this);

    exp.sequencer.tick(delta, now);

    this.renderer_.render(this.scene_, this.camera_);
    this.HUDRenderer_.render(this.HUDScene_, this.HUDCamera_);

    if (!force) {
      requestAnimationFrame(this.animationFrame);
    }
   }
};
