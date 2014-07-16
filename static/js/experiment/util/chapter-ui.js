goog.provide('exp.ChapterUI');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.query');
goog.require('goog.events');
goog.require('goog.style');


/**
 * Chapter UI.
 * @constructor
 */
exp.ChapterUI = function() {
  var self = this;

  this.currentChapter = null;

  /**
   * Container.
   * @type {Element}
   * @private
   */
  this.container_ = goog.dom.getElementByClass('js-chapters-ui');

  /**
   * Chapters.
   * @type {array}
   * @private
   */
  this.chapters_ = goog.dom.getElementsByClass('js-chapter', this.container_);

  /**
   * More buttons.
   * @type {array}
   * @private
   */
  this.moreButtons_ =
    goog.dom.getElementsByClass('js-chapter-more', this.container_);

  /**
   * More buttons.
   * @type {array}
   * @private
   */
  this.closeButton_ =
    goog.dom.getElementByClass('js-close-sidebar');

  // All hidden by default.
  this.hideAll_();

  new Hammer(this.closeButton_)['on']('tap', function(e) {
    self.hideMoreInfo();
    e.stopPropagation();
    e['gesture'].stopPropagation();
  });

  // Keep taps from trickling up to the document.
  new Hammer(this.container_)['on']('tap', function(e) {
    e.stopPropagation();
    e['gesture'].stopPropagation();
  });

  this.fullThing = goog.dom.getElementByClass('more-info');
  this.innerThing = goog.dom.getElementByClass('wrapper', this.fullThing);
  new Hammer(this.fullThing)['on']('tap', function(e) {
    self.hideMoreInfo();
    e.stopPropagation();
  });
  new Hammer(this.innerThing)['on']('tap', function(e) {
    e.stopPropagation();
  });

  goog.array.forEach(this.moreButtons_, function(more) {
    new Hammer(more)['on']('tap', function(e) {
      e.stopPropagation();
      self.showMoreInfo_();
    });
  });

  this.itemsToMoveForInfo_ = goog.dom.query(
    '.renderer, .hud-renderer, .chapters');

  this.constantlyRecalcSize = false;

  goog.events.listen(window, 'resize', function() {
    if (self.constantlyRecalcSize) {
      self.recalcSizes();
    }
  });
};

/**
 * Get the box sizes.
 * @param {boolean} sync If the request is synchronous.
 */
exp.ChapterUI.prototype.getSizes = function(sync) {
  this.sizes_ = [];

  var self = this;
  goog.array.forEach(this.chapters_, function(chapter, i) {
    self.sizes_.push(0);

    if (sync) {
      self.sizes_[i] = goog.style.getSize(chapter).height;
    } else {
      var intervalId = setInterval(function() {
        if (self.sizes_[i] === 0) {
          self.sizes_[i] = goog.style.getSize(chapter).height;
        } else {
          clearInterval(intervalId);
        }
      }, 100);
    }
  });
};

/**
 * Reset the box sizes.
 */
exp.ChapterUI.prototype.recalcSizes = function() {
  this.getSizes(true);

  if (window.innerWidth >= 768) {
    if (this.sizes_) {
      goog.style.setStyle(this.container_, 'height',
        this.sizes_[this.currentChapter] + 'px');
    }
  }

  if (this.currentChapter === 0) {
    if (this.sizes_) {
      if (window.innerWidth < 768) {
        goog.style.setStyle(this.container_, 'height',
          this.sizes_[this.currentChapter] + 'px');
      }
    }
  }
};

/**
 * Hide all chapters.
 * @private
 */
exp.ChapterUI.prototype.hideAll_ = function() {
  goog.array.forEach(this.chapters_, function(chapter) {
    goog.dom.classes.add(chapter, 'hidden-chapter');
  });
};

/**
 * Show more info.
 * @private
 */
exp.ChapterUI.prototype.showMoreInfo_ = function() {
  goog.dom.classes.add(document.body, 'show-more');
  exp.sideBarIsOpen = true;
  exp.manager.pauseExp();

  var targetWidth;
  if (window.innerWidth < 768) {
    targetWidth = window.innerWidth;
  } else {
    targetWidth = 320;
  }

  TweenLite.fromTo(this.itemsToMoveForInfo_, 0.6, {
    'x': -targetWidth * 0.6
  }, {
    'x': -targetWidth,
    'ease': Expo['easeOut']
  });

  var bgElem = goog.dom.getElement('background');
  TweenLite.fromTo(bgElem, 0.6, {
    'x': -targetWidth * 0.6,
    'scaleY': 0,
    'scaleX': 0
  }, {
    'x': -targetWidth,
    'scaleY': 0,
    'scaleX': 0,
    'ease': Expo['easeOut']
  });

  TweenLite.set(this.fullThing, { 'width': window.innerWidth });

  TweenLite.fromTo(this.innerThing, 0.6, {
    'width': targetWidth,
    'x': targetWidth * 0.4
  }, {
    'x': 0,
    'ease': Expo['easeOut']
  });
};

/**
 * Hide more info.
 */
exp.ChapterUI.prototype.hideMoreInfo = function() {
  exp.manager.unPauseExp();
  exp.sideBarIsOpen = false;
  goog.dom.classes.remove(document.body, 'show-more');

  var targetWidth;
  if (window.innerWidth < 768) {
    targetWidth = window.innerWidth;
  } else {
    targetWidth = 320;
  }

  TweenLite.fromTo(this.itemsToMoveForInfo_, 0.6, {
    'x': -targetWidth * 0.4
  }, {
    'x': 0,
    'ease': Expo['easeOut'],
    'clearProps': 'transform',
    'onComplete': function() {
      setTimeout(function() {
        exp.background.resize();
      }, 100);
    }
  });

  TweenLite.fromTo(this.innerThing, 0.6, {
    'x': targetWidth * 0.6
  } , {
    'x': targetWidth,
    'ease': Expo['easeOut'],
    'onComplete': function() {
      TweenLite.set(this.fullThing, { 'width': 0 });
    },
    'onCompleteScope': this
  });
};

/**
 * Go to a particular chapter.
 * @param {number} index Chapter index to activate.
 */
exp.ChapterUI.prototype.setChapter = function(index) {
  if (this.currentChapter === index) {
    return;
  }

  this.currentChapter = index;

  index = index || 0;
  index = parseInt(index, 10);

  this.hideAll_();
  goog.dom.classes.remove(this.chapters_[index], 'hidden-chapter');

  if (window.innerWidth >= 768) {
    if (this.sizes_) {
      goog.style.setStyle(this.container_, 'height',
        this.sizes_[index] + 'px');
    }
  }

  if (index === 0) {
    goog.dom.classes.add(this.container_, 'first');
    if (this.sizes_) {
      if (window.innerWidth < 768) {
        goog.style.setStyle(this.container_, 'height',
          this.sizes_[index] + 'px');
      }
    }
  } else {
    goog.dom.classes.remove(document.body, 'info-open');
    goog.dom.classes.remove(this.container_, 'first');
  }
};
