goog.provide('exp.entity.Core');

goog.require('exp.DOMPool');
goog.require('exp.Tags');
goog.require('goog.Disposable');
goog.require('goog.dom');

/**
 * A entity that is put into the experiment.
 * @constructor
 * @param {object} params Initial parameters for Core entity.
 */
exp.entity.Core = function(params) {
  goog.base(this);

  if (typeof params['detailFactor'] === 'undefined') {
    params['detailFactor'] = 1;
  }

  var obj = this;
  obj.boundEvents_ = {};

  if (params && typeof params['scene'] !== 'undefined') {
    obj.scene = params['scene'];
  } else {
    obj.scene = exp.manager.scene_;
  }

  /**
   * Set initial active state.
   * @type {boolean}
   */
  obj.isActive_ = true;
  obj.params_ = params;

  if (exp.manager) {
    obj.id_ = exp.manager.entityId++;
  }
  obj.params_.id = obj.id_;
  obj.currPattern_ = 0;

  obj.element_ = null;
  obj.object_ = new THREE.Object3D();
  obj.object_.add(obj.element_);
  obj.isDraggingSlice_ = false;

  if (params && typeof params['position'] !== 'undefined') {
    obj.object_.position.set(
      params['position'][0],
      params['position'][1],
      params['position'][2]
    );
  }

  if (this.params_ && typeof this.params_['direction'] === 'undefined') {
    this.params_['direction'] = 1;
  }

  if (typeof params['patterns'] !== 'undefined') {
    if (params['patterns'][0]['viewBox']) {
      obj.params_.viewBoxArray = params['patterns'][0]['viewBox'].split(' ');
    } else {
      obj.params_.viewBoxArray = [0, 0, params['width'], params['height']];
    }
  } else {
    obj.params_.viewBoxArray = [0, 0, params['width'], params['height']];
  }

  // offset amount to hide the anti-aliased seam
  // between masked halves of a folded entity.
  obj.seamBuffer_ = 0.0;

  obj.previousTouchX_ = 0;
  obj.previousTouchY_ = 0;

  // Vectors used with lighting
  obj.useLighting_ = (params && typeof params['useLighting'] !== 'undefined') ?
                      params['useLighting'] : true;
  obj.surfaceNormal_ = new THREE.Vector3(0, 0, 1);
  obj.lightVector_ = new THREE.Vector3(0, 0, 1);
  obj.rotationMatrix_ = new THREE.Matrix4();

  obj.shadow_ = null;
  obj.previousRotationZ_ = null;
};
goog.inherits(exp.entity.Core, goog.Disposable);

/**
 * Return CSS3D element.
 * @return {Element} this.element_ The CSS3D element.
 */
exp.entity.Core.prototype.getElement = function() {
  return this.element_;
};

/**
 * Return entity's Object3D.
 * @return {THREE.Object3D} this.object_ The Object3D object.
 */
exp.entity.Core.prototype.getObject = function() {
  return this.object_;
};

/**
 * Check if entity has tag.
 * @param {number} tag The tag to search entity for.
 * @return {number} Number boolean if a tag was found or not.
 */
exp.entity.Core.prototype.hasTag = function(tag) {
  return (this.params_['tags'] & tag) !== 0;
};

/**
 * Sets active state.
 * @param {boolean} isActive Sets whether Entity is currently active.
 */
exp.entity.Core.prototype.setActive = function(isActive) {
  this.isActive_ = isActive;
};

/**
 * Get the next pattern in sequence.
 * @return {string}
 */
exp.entity.Core.prototype.nextPatternParams = function() {
  return this.params_['patterns'][this.increaseCurrPattern(true)];
};

/**
 * Increase the current pattern for entity.
 * @param {boolean} check Doesn't increase, but checks to see what next is.
 * @return {number} this.currPattern_ The currnet pattern.
 */
exp.entity.Core.prototype.increaseCurrPattern = function(check) {
  if (!this.params_['patterns']) {
    return 0;
  }

  var next = this.currPattern_ + 1;
  if (next >= this.params_['patterns'].length) {
    if (this.params_['patternsRepeat']) {
      next = 0;
    } else {
      next = this.currPattern_;
    }
  }

  if (check) {
    return next;
  }

  this.currPattern_ = next;
  return this.currPattern_;
};

/**
 * Decrease the current pattern for entity.
 */
exp.entity.Core.prototype.decreaseCurrPattern = function() {
  this.currPattern_--;

  if (this.currPattern_ < 0) {
    this.currPattern_ = this.params_['patterns'].length - 1;
  }
};

/**
 * Trigger the start of a fold.
 */
exp.entity.Core.prototype.fold = function() {
  this.isFolding_ = true;
  this.foldStart_ = exp.manager.now();
};

/**
 * @return {boolean} this.isFolding_ True if the entity is currently folding.
 */
exp.entity.Core.prototype.isFolding = function() {
  return this.isFolding_;
};

/**
 * Callback invoked when a fold starts.
 */
exp.entity.Core.prototype.startFolding = function() {
  // no-op
};

/**
 * Callback invoked when a fold completes.
 */
exp.entity.Core.prototype.completeFolding = function() {
  // no-op
};

/**
 * Callback invoked when a fold is half-way closed.
 */
exp.entity.Core.prototype.halfwayClosed = function() {
  // no-op
};

/**
 * Callback invoked when a fold is closed.
 */
exp.entity.Core.prototype.closed = function() {
  // no-op
};

/**
 * Callback invoked when a fold is half-way open.
 */
exp.entity.Core.prototype.halfwayOpened = function() {
  // no-op
};

/**
 * Run when a blink is closed.
 */
exp.entity.Core.prototype.blinkClosed = function() {
  if (this.blinkRemove_) {
    this.blinkClose_ = false;
    this.blinkOpen_ = false;
    this.killSlices();
    exp.manager.removeEntity(this);
  }
};

/**
 * Run when a blink is opened.
 */
exp.entity.Core.prototype.blinkOpened = function() {
  // no-op
};

/**
 * Run when a blink updates.
 */
exp.entity.Core.prototype.blinkUpdate = function() {
  // no-op
};

/**
 * Bind a Hammer.js input event for this entity.
 * @param {string} eventType The Hammer event type.
 * @param {function} callback The callback to be invoked.
 */
exp.entity.Core.prototype.bindInputEvent = function(eventType, callback) {
  if (this.params_['foldable'] && this.leftSlice_ && this.rightSlice_) {
    this.leftSlice_.bindInputEvent(eventType, goog.bind(callback, this));
    this.rightSlice_.bindInputEvent(eventType, goog.bind(callback, this));
  } else {
    this.unbindInputEvent(eventType);
    this.boundEvents_[eventType] = goog.bind(callback, this);
    Hammer(this.getElement())['on'](eventType, this.boundEvents_[eventType]);
  }
};

/**
 * Define the shadow for an entity.
 */
exp.entity.Core.prototype.defineShadow = function() {
  if (this.params_ && typeof this.params_['shadows'] !== 'undefined' &&
    this.params_['shadows'] !== null) {
      this.shadow_ = goog.dom.getElementByClass(
        'svg-shadow', this.getElement());
  }
};

/**
 * Update the shadow for an entity.
 */
exp.entity.Core.prototype.updateShadow = function() {
  var zRot = this.getObject().rotation.z + (Math.PI * 2) *
    (this.params_['shadows'] % 360 / 360);
  var distance = this.params_['shadowDistance'] || 5;
  var translate = 'translate(' + (Math.cos(zRot) * distance) + ', ' +
    Math.sin(zRot) * distance + ')';
  if (this.leftSlice_ && this.rightSlice_) {
    if (this.leftSlice_.shadow_) {
      this.leftSlice_.shadow_.setAttribute('transform', translate);
    }
    if (this.rightSlice_.shadow_) {
      this.rightSlice_.shadow_.setAttribute('transform', translate);
    }
  } else {
    if (this.shadow_) {
      this.shadow_.setAttribute('transform', translate);
    }
  }
};

/**
 * Unbind a previously bound Hammer.js event.
 * @param {string} eventType The Hammer event type.
 */
exp.entity.Core.prototype.unbindInputEvent = function(eventType) {
  if (this.params_['foldable'] && this.leftSlice_ && this.rightSlice_) {
    this.leftSlice_.unbindInputEvent(eventType);
    this.rightSlice_.unbindInputEvent(eventType);
  } else {
    if (this.boundEvents_[eventType]) {
      Hammer(this.getElement())['off'](eventType, this.boundEvents_[eventType]);
      delete this.boundEvents_[eventType];
    }
  }
};

/**
 * Invoked when a fold is updated.
 * @param {number} delta the amount of time since the previous tick.
 * @param {number} now the current total run-time.
 */
exp.entity.Core.prototype.foldTick = function(delta, now) {
  perc = (now - this.foldStart_) / this.params_.foldSpeed;

  if (perc >= 1) {
    perc = 1;
    this.isFolding_ = false;
  }

  newRotY = perc * Math.PI * 2;

  if (perc < .5 && !this.isClosing_) {
    this.isClosing_ = true;
    this.startFolding();
  } else if (perc > .5 && this.isClosing_) {
    this.isClosing_ = false;
    this.closed();
  } else if (perc > .25 && this.isClosing_ && !this.isHalfway_) {
    this.isHalfway_ = true;
    this.halfwayClosed();
  } else if (perc > .75 && !this.isClosing_ && this.isHalfway_) {
    this.isHalfway_ = false;
    this.halfwayOpened();
  } else if (perc == 1) {
    this.completeFolding();
  }

  this.leftSlice_.getObject().rotation.y = newRotY;
};

/**
 * Update and redraw the fill content for an entity.
 * @param {Element} element The svg element.
 * @param {object} pattern The svg content and viewBox data for the new contnet.
 * @param {boolean} isLeft Indicates that this is the left-hand side of a fold.
 * @param {boolean} removeShadow Whether to remove svg shadow.
 */
exp.entity.Core.prototype.redrawPattern = function(element, pattern,
                                                   isLeft, removeShadow) {
  if (!pattern) {
    return;
  }
  if (pattern.color) {
    element.innerHTML = exp.entity.Core.makeCircle(
      this.params_['radius'], pattern.color);
  } else if (pattern['html']) {
    element.innerHTML = exp.svgs.makeUniqueIds(pattern['html']);
  }

  if (pattern['viewBox']) {

    var parts = pattern['viewBox'].split(' ');

    var x = parseInt(parts[0], 10);
    var y = parseInt(parts[1], 10);
    var w = parseInt(parts[2], 10);
    var h = parseInt(parts[3], 10);

    if (isLeft) {
      w = w / 2;
    } else {
      w = w / 2;
      x += w;
    }

    var vb = exp.entity.Core.makeViewBox(x, y, w, h);
    element.setAttribute('viewBox', vb);
  } else {

    var w = this.params_['radius'];
    var h = this.params_['radius'] * 2;
    var x = 0;

    if (!isLeft) {
      x += w;
    }
    var viewBox = exp.entity.Core.makeViewBox(x, 0, w, h);
    element.setAttribute('viewBox', viewBox);
  }
};

/**
 * Clean up for disposal (unbind events).
  */
exp.entity.Core.prototype.disposeInternal = function() {
  for (var itm in this.boundEvents_) {
    this.unbindInputEvent(itm);
  }
};

/**
 * Call when slice has started moving.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.Core.prototype.sliceStart = function(data) {
  if (this.params_['patterns']) {
    var pattern = this.params_['patterns'][data.pattern];
    var entity = this.leftSlice_;
    var side = true;

    if (this.params_['direction'] == -1) {
      entity = this.rightSlice_;
      side = false;
    }
    if (this.params_['shadows']) {
      entity.defineShadow();
      entity.updateShadow();
    }
    this.redrawPattern(entity.getElement(), pattern, side);
    if (goog.dom.getElementByClass('svg-shadow', data.slice.getElement())) {
      goog.style.setStyle(goog.dom.getElementByClass('svg-shadow',
        data.slice.getElement()), 'fill-opacity', '0');
    }
  }
};

/**
 * Call when slice has reached halfway point.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.Core.prototype.sliceHalfway = function(data) {
  if (this.params_['patterns']) {
    var pattern = this.params_['patterns'][data.pattern];
    var element = this.leftSlice_.getElement();
    var side = false;

    if (this.params_['direction'] == -1) {
      side = true;
      var element = this.rightSlice_.getElement();
    }
    if (this.params_['shadows']) {
      data.slice.defineShadow();
      data.slice.updateShadow();
    }
    this.redrawPattern(data.slice.getElement(), pattern, side, true);
    if (!side && goog.dom.getElementByClass('svg-shadow', element)) {
      if (goog.dom.getElementByClass('svg-shadow', data.slice.getElement()) &&
        this.hasShadowsIgnored_ && this.currPattern_ === 2 &&
        this.params_['node'] !== 1) {
          goog.style.setStyle(goog.dom.getElementByClass('svg-shadow',
            data.slice.getElement()), 'fill-opacity', '0');
      }
    }
  } else {
    this.redrawPattern(data.slice.getElement(), {}, false, true);
    goog.dom.removeNode(
      goog.dom.getElementByClass('svg-shadow', data.slice.getElement()));
  }
};

/**
 * Call when slice is a quarter open.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.Core.prototype.sliceQuarterOpen = function(data) {
  // no-op
};

/**
 * Call when slice has stoped moving.
 * @param {object} data Pattern and object information for slice.
 */
exp.entity.Core.prototype.sliceClosed = function(data) {
  if (this.params_['startPattern']) {
    this.params_['startPattern'] = null;
  }
  if (this.params_['patterns']) {
    var pattern = this.params_['patterns'][data.pattern];
    var entity = this.rightSlice_;
    var side = false;

    if (this.params_['direction'] == -1) {
      entity = this.leftSlice_;
      var side = true;
    }
    if (this.params_['shadows']) {
      entity.defineShadow();
      entity.updateShadow();
    }
    this.redrawPattern(entity.getElement(), pattern, side);
  }
};

/**
 * Call when a slice is being reclosed (via dragging) and has passed
 * the half-way point.
 * @param {object} slice Pattern and object data for this slice.
 */
exp.entity.Core.prototype.sliceHalfwayReclose = function(slice) {
  // no-op
};

/**
 * Call when a slice is very nearly closed.
 * @param {object} data Pattern and object data for this slice.
 */
exp.entity.Core.prototype.sliceNotClosed = function(data) {
  if (this.params_['patterns']) {
    var pattern = this.params_['patterns'][data.patternOld];
    var entity = this.leftSlice_;
    var side = true;

    if (this.params_['direction'] === -1) {
      entity = this.rightSlice_;
      side = false;
    }
    if (this.params_['shadows']) {
      entity.defineShadow();
      entity.updateShadow();
    }
    this.redrawPattern(entity.getElement(), pattern, side);
  }
};

/**
 * Call when and unfold is complete.
 * @param {object} data Pattern and object data for this slice.
 */
exp.entity.Core.prototype.unfoldComplete = function(data) {
  // no-op
};

/**
 * Invoked when a fold is updated.
 * @param {number} delta the amount of time since the previous tick.
 * @param {number} now the current total run-time.
 */
exp.entity.Core.prototype.sliceTick = function(delta, now) {
  for (var i = this.slices_.length - 1; i >= 0; i--) {
    var slice = this.slices_[i];
    var perc = 0;

    if (slice['animate']) {
      perc = (now - slice['start']) / slice['speed'] + .1;
      if (slice['reverse']) {
        perc = slice['startAngle'] - (perc - slice['startAngle']);
      }
    } else {
      if (slice.closing) {
        perc = (slice['slice'].getObject().rotation.y - Math.PI) / Math.PI;
      } else {
        perc = (slice['slice'].getObject().rotation.y) / Math.PI;
      }
    }
    if (slice['animate']) {
      if (!slice['reverse']) {
        if (!slice.opening) {
          slice.opening = true;
          this.sliceStart(slice);
        } else if (perc > .25 && !slice.quarterOpen) {
          slice.quarterOpen = true;
          this.sliceQuarterOpen(slice);
        } else if (perc > .5 && !slice.closing) {
          slice.closing = true;
          this.sliceHalfway(slice);
          slice.slice.getObject().children[0].rotation.y = Math.PI;
        }
      }

      if (slice['animate'] && perc > slice['angle'] / Math.PI) {
        perc = slice['angle'] / Math.PI;
        slice.complete = true;
        slice['animate'] = false;
      }

      var rotY = perc * Math.PI * this.params_['direction'];
      slice['slice'].getObject().rotation.y = rotY;

      if (perc >= .98 || (perc <= .02 && slice['reverse'])) {
        if (perc >= .98) {
          this.sliceClosed(slice);
        } else {
          this.sliceNotClosed(slice);
          this.decreaseCurrPattern();
        }

        if (slice['slice'] !== this.rightSlice_) {
          exp.manager.removeEntity(slice['slice']);
        }

        this.slices_.splice(i, 1);
      }
    }
  }
};

/**
 * Start animating a single slice.
 * @param {object} slice The slice to start animating.
 */
exp.entity.Core.prototype.animateSlice = function(slice) {
  for (var i = this.slices_.length - 1; i >= 0; i--) {
    if (this.slices_[i].slice == slice) {
      var perc = (slice.getObject().rotation.y) / Math.PI *
        this.params_['direction'];

      if (perc < 0) {
        perc = perc + 1;
      }

      if (this.slices_[i].closing) {
        perc = (slice.getObject().rotation.y) / Math.PI *
          this.params_['direction'];
      } else {
        this.slices_[i].reverse = true;
      }

      var now = exp.manager.now();
      var timeOffset = now - this.slices_[i]['speed'] * perc;
      this.slices_[i].start = timeOffset;
      this.slices_[i]['animate'] = true;
      this.slices_[i].startAngle = perc;
    }
  }
};

/**
 * Remove all slices from this entity.
 */
exp.entity.Core.prototype.killSlices = function() {
  if (this.slices_) {
    while (this.slices_.length && this.slices_.length > 0) {
      var slice = this.slices_[0];
      exp.manager.removeEntity(slice['slice']);
      this.slices_.splice(0, 1);
    }
  }

  if (this.leftSlice_) {
    exp.manager.removeEntity(this.leftSlice_);
    this.leftSlice_ = null;
  }

  if (this.rightSlice_) {
    exp.manager.removeEntity(this.rightSlice_);
    this.rightSlice_ = null;
  }
};

/**
 * Enable drag-to-flip behavior for a foldable entity.
 */
exp.entity.Core.prototype.makeDraggable = function() {
  this.mainSlice_ = null;

  this.bindInputEvent('dragstart', function(e) {
    this.onDragStart(e);
  });

  this.bindInputEvent('drag', function(e) {
    this.onDrag(e);
  });

  this.bindInputEvent('dragend', function(e) {
    this.onDragEnd(e);
  });
};

/**
 * On drag start.
 * @param {Event} e Event gesture.
 */
exp.entity.Core.prototype.onDragStart = function(e) {
  if (!this.mainSlice_) {
    this.mainSlice_ = this.createSlice();
  }
  this.sliceStart(this.slices_[0]);
  this.isDraggingSlice_ = true;
};

/**
 * On drag.
 * @param {Event} e Event gesture.
 */
exp.entity.Core.prototype.onDrag = function(e) {
  if (!this.isDraggingSlice_) {
    return;
  }

  var angle = e['gesture']['deltaX'] / 200 *
    Math.PI * this.params_['direction'];

  var a1 = angle;

  if (angle < 0) {
    angle = 0;
  } else if (angle > Math.PI) {
    angle = Math.PI;
  }
  if (this.params_['direction'] === -1) {
    angle = Math.PI - angle;
  }

  if ((angle > Math.PI / 2 && this.params_['direction'] !== -1) ||
      (angle < Math.PI / 2 && this.params_['direction'] === -1)) {
    if (!this.slices_[0].closing) {
      if (this.params_['direction'] !== -1) {
        this.mainSlice_.sliceHalfway(this.slices_[0]);
      } else {
        this.mainSlice_.sliceHalfway(this.slices_[0], true);
      }
      this.mainSlice_.getObject().children[0].rotation.y = Math.PI;
      this.slices_[0].closing = true;
    }
  } else {
    if (this.slices_[0].closing) {
      if (this.params_['direction'] !== -1) {
        this.mainSlice_.sliceHalfwayReclose(this.slices_[0]);
      } else {
        this.mainSlice_.sliceHalfwayReclose(this.slices_[0], true);
      }
      this.mainSlice_.getObject().children[0].rotation.y = 0;
      this.slices_[0].closing = false;
    }
  }

  if (this.params_['direction'] === -1) {
    angle = angle - Math.PI;
  }

  this.mainSlice_.getObject().rotation.y = angle;
};

/**
 * On drag end.
 * @param {Event} e Event gesture.
 */
exp.entity.Core.prototype.onDragEnd = function(e) {
  var angle = e['gesture']['deltaX'] / 200 *
    Math.PI * this.params_['direction'];

  this.animateSlice(this.mainSlice_);
  this.mainSlice_ = null;
  this.isDraggingSlice_ = false;
};

/**
 * Invoked on each tick when this entity is inactive.
 * @param {number} delta the amount of time since the previous tick.
 * @param {number} now the current total run-time.
 */
exp.entity.Core.prototype.inactiveTick = function(delta, now) {
  if (this.slices_) {
    this.sliceTick(delta, now);
  }
};

/**
 * Invoked on each tick when this entity is active.
 * @param {number} delta the amount of time since the previous tick.
 * @param {number} now the current total run-time.
 */
exp.entity.Core.prototype.activeTick = function(delta, now) {
  if (this.params_['foldable'] && this.isFolding_) {
    this.foldTick(delta, now);
  }

  if (this.slices_) {
    this.sliceTick(delta, now);
  }

  if (this.params_['unfoldOpen'] && this.leftSlice_) {
    var perc = (exp.manager.now() - this.startUnfold_) /
        this.params_['unfoldOpenSpeed'];
    this.leftSlice_.getObject().rotation.y = Math.PI / 2 - ((perc) *
        (Math.PI / 180 * (this.params_['unfoldAngle'] || 90)));
    this.rightSlice_.getObject().rotation.y = -(Math.PI / 2 - ((perc) *
        (Math.PI / 180 * (this.params_['unfoldAngle'] || 90))));

    if (perc >= 1) {
      this.leftSlice_.getObject().rotation.y = Math.PI / 180 *
          (90 - (this.params_['unfoldAngle'] || 90));
      this.rightSlice_.getObject().rotation.y = Math.PI / 180 *
          -(90 - (this.params_['unfoldAngle'] || 90));
      this.params_['unfoldOpen'] = false;
      this.unfoldComplete();
    }
  }

  if (this.blinkClose_ || this.blinkOpen_) {
    this.blinkTick();
  }
};

/**
 * Unblink.
 */
exp.entity.Core.prototype.unblink = function() {
  this.leftSlice_.getObject().rotation.y = Math.PI / 2;
  this.rightSlice_.getObject().rotation.y = -Math.PI / 2;
  this.startUnfold_ = exp.manager.now();
  this.params_['unfoldOpen'] = true;
};

/**
 * Blink.
 * @param {number} speed Set the blink speed.
 * @param {number} angle Set the blink angle.
 */
exp.entity.Core.prototype.blink = function(speed, angle) {
  if (!this.blinkClose_ && !this.blinkOpen_) {
    this.blinkClose_ = true;
    this.startBlink_ = exp.manager.now();
    this.blinkSpeed_ = speed || .4;
    this.blinkAngle_ = angle || 90;
  }
};


/**
 * Remove a blink.
 * @param {number} speed Set the blink speed.
 * @param {number} angle Set the blink angle.
 */
exp.entity.Core.prototype.blinkRemove = function(speed, angle) {
  this.blink(speed, angle);
  this.blinkRemove_ = true;
};

/**
 * Tick a blink.
 */
exp.entity.Core.prototype.blinkTick = function() {
  var perc = (exp.manager.now() - this.startBlink_) / this.blinkSpeed_;
  var newX = ((perc * 2) * (Math.PI / 180 * (this.blinkAngle_ || 90)));
  var newY = ((perc * 2) * (Math.PI / 180 * (this.blinkAngle_ || 90)));

  if (this.blinkClose_) {
    this.leftSlice_.getObject().rotation.y = newX;
    this.rightSlice_.getObject().rotation.y = -newY;

    if (perc >= .5) {
      this.blinkClose_ = false;
      this.blinkOpen_ = true;
      this.blinkClosed();
    }
  } else {
    this.leftSlice_.getObject().rotation.y = Math.PI - newX;
    this.rightSlice_.getObject().rotation.y = -(Math.PI - newY);

    if (perc >= 1) {
      this.blinkOpen_ = false;
      this.blinkOpened();
      this.leftSlice_.getObject().rotation.y = Math.PI / 180 *
          (90 - (this.blinkAngle_ || 90));
      this.rightSlice_.getObject().rotation.y = Math.PI / 180 *
          -(90 - (this.blinkAngle_ || 90));
    }
  }

  this.blinkUpdate();
};

/**
 * Invoked on each tick.
 * @param {number} delta the amount of time since the previous tick.
 * @param {number} now the current total run-time.
 */
exp.entity.Core.prototype.tick = function(delta, now) {
  if (this.isActive_) {
    this.activeTick(delta, now);
  } else {
    this.inactiveTick(delta, now);
  }

  if (this.useLighting_ && this.element_) {
    this.applyLighting(this.object_, this.element_);
  }

  if ('undefined' !== typeof this.params_['shadows']) {
    if (this.previousRotationZ_ !== this.getObject().rotation.z ||
        this.previousRotationZ_ === null) {
      this.updateShadow();
      this.previousRotationZ_ = this.getObject().rotation.z;
    }
  }
};

/**
 * Update the lighting for this entity (based on relative camera angle).
 * @param {THREE.Object3D} obj3d The object to base the lighting upon.
 * @param {element} element The HTML element to which lighting will be applied.
 */
exp.entity.Core.prototype.applyLighting = function(obj3d, element) {
  var minimumBrightness = 0.65;  // ambient light level
  var brightnessExponent = 1.0; // 1 == flat shading, bigger == more metalic

  this.surfaceNormal_.set(0, 0, 1);

  this.rotationMatrix_.extractRotation(obj3d.matrixWorld);
  this.surfaceNormal_.applyMatrix4(this.rotationMatrix_);

  var angle = Math.abs(this.surfaceNormal_.dot(this.lightVector_));
  var brightness = (Math.pow(angle, brightnessExponent) *
    (1 - minimumBrightness)) + minimumBrightness;
  if (brightness === 1) {
    this.element_.style.webkitFilter = '';
  } else if (brightness !== this.previousBrightness_) {
    this.element_.style.webkitFilter = 'brightness(' + brightness + ')';
    this.previousBrightness_ = brightness;
  }
};


/**
 * Convert a non-foldable entity into a foldable one.
 * @param {number} width The width of the source SVG.
 * @param {number} height The height of the source SVG.
 * @param {string} content The SVG content.
 * @param {boolean} side True if this is the right-hand side, false for left.
 * @return {THREE.CSS3DObject} slice The new foldable slice.
 */
exp.entity.Core.prototype.createFoldable = function(width, height,
  content, side) {

  var sideType = side ? exp.entity.Core.RIGHT_SIDE : exp.entity.Core.LEFT_SIDE;

  this.element_ = exp.entity.Core.createSVGSlice(Math.ceil(width / 2) + 0.5,
    height, this.params_.viewBoxArray, content, sideType);

  var slice = new THREE.CSS3DObject(this.element_);

  var scale = 1 / this.params_.detailFactor;

  if (sideType === exp.entity.Core.RIGHT_SIDE) {
    slice.position.x = scale * width / 4 - this.seamBuffer_;
  } else {
    slice.position.x = scale * -width / 4 + this.seamBuffer_;
  }

  slice.scale.set(scale, scale, scale);

  slice.cssLightingTarget = this.element_;

  this.defineShadow();

  return slice;
};

/**
 * Sets an entity to be foldable.
 */
exp.entity.Core.prototype.isFoldable = function() {
  this.slices_ = [];
  this.sliceCount_ = 0;

  this.leftSlice_ = new exp.entity.Slice(this.params_);

  exp.manager.addEntity(this.leftSlice_);
  this.getObject().add(this.leftSlice_.getObject());

  this.rightSlice_ = new exp.entity.Slice(this.params_,
    this.params_['openSpeed'] ? false : true);

  exp.manager.addEntity(this.rightSlice_);
  this.getObject().add(this.rightSlice_.getObject());

  if (this.params_['unfoldOpen']) {
    this.unblink();
  }

  if (this.params_['openSpeed']) {
    this.currPattern_--;
    this.slices_.push({
      'slice': this.rightSlice_,
      'speed': this.params_['openSpeed'],
      'start': exp.manager.now(),
      'angle': 180 * Math.PI / 180,
      'pattern': this.increaseCurrPattern(),
      'animate': true,
      'count': this.sliceCount_++
    });
  }

  if (this.params_.draggable) {
    this.makeDraggable();
  }
};

/**
 * Kill a foldable entity.
 */
exp.entity.Core.prototype.killFoldable = function() {
  if (this.rightSlice_) {
    exp.manager.removeEntity(this.rightSlice_);
  }

  for (var i = 0; i < this.slices_.length; i++) {
    exp.manager.removeEntity(this.slices_[i].slice);
  }

  if (this.leftSlice_) {
    this.leftSlice_.getElement().setAttribute('width', this.params_.width *
      this.params_.detailFactor);
    this.leftSlice_.object_.children[0].position.x = 0;
    this.leftSlice_.getElement().setAttribute('viewBox',
      this.params_.viewBoxArray.join(' '));
  }
};

/**
 * Create a slice and add it to this entity.
 * @param {boolean=false} animate If the slice should animate.
 * @param {number=1} speed The animation speed.
 * @param {number=0} angle The slice angle.
 * @return {exp.entity.Slice} The new slice.
 */
exp.entity.Core.prototype.createSlice = function(animate, speed, angle) {
  if ('undefined' === typeof animate) {
    animate = false;
  }

  if ('undefined' === typeof speed) {
    speed = 1;
  }

  if ('undefined' === typeof angle) {
    angle = 180;
  }

  this.params_['currPattern'] = this.currPattern_;

  var newSlice = new exp.entity.Slice(
    this.params_, this.params_['direction'] == -1 ? true : false);

  if (angle && !animate) {
    newSlice.getObject().rotation.y = this.params_['direction'] *
                                      (angle * Math.PI / 180);
  } else {
    newSlice.getObject().rotation.y = Math.PI / 180 * 2;
  }

  if (goog.dom.getElementByClass('svg-shadow', newSlice.getElement())) {
    goog.style.setStyle(goog.dom.getElementByClass('svg-shadow',
      newSlice.getElement()), 'fill-opacity', '0');
  }

  if ('undefined' === typeof this.slices_) {
    this.slices_ = [];
    this.sliceCount_ = 0;
  }

  this.slices_.push({
    'slice': newSlice,
    'speed': speed,
    'start': exp.manager.now(),
    'angle': angle * Math.PI / 180,
    'patternOld': this.currPattern_ + 0,
    'pattern': this.increaseCurrPattern(),
    'animate': animate,
    'count': this.sliceCount_++
  });

  exp.manager.addEntity(newSlice);
  this.getObject().add(newSlice.getObject());

  return newSlice;
};

/**
 * Value indicating the left-hand side of a folded entity.
 */
exp.entity.Core.LEFT_SIDE = 1;

/**
 * Value indicating the left-hand side of a folded entity.
 */
exp.entity.Core.RIGHT_SIDE = 2;


/**
 * Create half of an entity with the provided parameters.
 * @param {number} width The width of the element.
 * @param {number} height The height of the element.
 * @param {array} viewBox An array of numbers representing the viewbox values.
 * @param {string} svgContent The SVG content for this element.
 * @param {number} side The side that this slice represents (left or right).
 * @return {element} An SVG element.
 */
exp.entity.Core.createSVGSlice = function(width, height, viewBox,
  svgContent, side) {

  var x = viewBox[0];
  var y = viewBox[1];
  var w = viewBox[2];
  var h = viewBox[3];

  var vb = (side === exp.entity.Core.LEFT_SIDE) ?
    exp.entity.Core.makeViewBox(x, y, w / 2, h) :
    exp.entity.Core.makeViewBox(x + w / 2, y, w / 2, h);

  return exp.entity.Core.createSVG(width, height, vb, svgContent);
};

/**
 * Create the proper viewBox attribute value from a set of view box metrics.
 * @param {number} x The x coordinate of the viewbox.
 * @param {number} y The y coordinate of the viewbox.
 * @param {number} width The width of the viewbox.
 * @param {number} height The height of the viewbox.
 * @return {string} The viewBox attribute value.
 */
exp.entity.Core.makeViewBox = function(x, y, width, height) {
  return x + ' ' + y + ' ' + width + ' ' + height;
};

/**
 * Create an SVG circle.
 * @param {number} radius Radius of the circle.
 * @param {string} fill The fill color for the circle.
 * @return {string} SVG source for the circle.
 */
exp.entity.Core.makeCircle = function(radius, fill) {
  return '<circle cx="' + radius + '" cy="' + radius + '" r="' + radius + '" ' +
    'fill="' + fill + '" />';
};

/**
 * Create an SVG with the given parameters.
 * @param {number} width The width of the SVG.
 * @param {number} height The height of the SVG.
 * @param {string} viewBox The viewBox attribute for the SVG.
 * @param {string} svgContent The SVG content for this element.
 * @return {element} The SVG element.
 */
exp.entity.Core.createSVG = function(width, height, viewBox, svgContent) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  svg.setAttribute('class', 'entity');

  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', viewBox);

  svg.style.display = 'block';
  svg.style.overflow = 'hidden';
  svg.style.width = width + 'px';
  svg.style.height = height + 'px';

  svg.innerHTML = svgContent;

  return svg;
};
