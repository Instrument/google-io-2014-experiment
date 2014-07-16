goog.provide('exp.Toggle');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.style');


/**
 * Simple open / close toggle.
 * @param {Element} container The toggle container.
 * @constructor
 */
exp.Toggle = function(container) {
  var self = this;

  this.firstRun = true;

  /**
   * Container.
   * @type {Element}
   * @private
   */
  this.container_ = container;

  /**
   * Close dropdown element.
   * @type {Array}
   * @private
   */
  this.closers_ = goog.dom.getElementsByClass(
                    'js-toggle-close', this.container_);

  /**
   * Open dropdown element.
   * @type {Element}
   * @private
   */
  this.opener_ = goog.dom.getElementByClass(
                     'js-toggle-open', this.container_);

  /**
   * Dropdown element to open/close.
   * @type {Element}
   * @private
   */
  this.item_ = goog.dom.getElementByClass('js-toggle-item', this.container_);

  /**
   * Whether the dropdown is open or not.
   * @type {boolean}
   * @private
   */
  this.open_ = true;

  // start off closed.
  this.toggle('close', false);

  if (this.opener_) {
    new Hammer(this.opener_)['on']('tap', function(e) {
      self.toggle('open', true);
      e.stopPropagation();
    });
  }

  goog.array.forEach(this.closers_, function(closer) {
    new Hammer(closer)['on']('tap', function(e) {
      self.toggle('close', true);
      e.stopPropagation();
    });
  });
};

/**
 * Custom ease.
 */
exp.Toggle.Expo2 = (function() {
  var C = function() {};
  var p = C.prototype = new Ease();
  p.constructor = C;
  p['getRatio'] = function(p2) {
    return 1 - Math.pow(4, -10 * p2);
  };
  return C;
})();

/**
 * Toggle dropdown open or close.
 * @param {string} action Whether to open or close.
 * @param {boolean} animate Whether to animate.
 * @param {number} delay Time to delay
 * @param {boolean} pause Pause on open.
 */
exp.Toggle.prototype.toggle = function(action, animate, delay, pause) {
  if (!this.open_ && (action === 'close')) {
    return;
  } else if (this.open_ === (action === 'open')) {
    action = 'close';
  }

  this.open_ = (action === 'open');
  delay = delay || 0;

  var isMobile = (window.innerWidth < 768);

  var animateFrom = {};
  var animateTo = {};
  var duration;
  var ease;

  this.hud = this.hud || goog.dom.getElementByClass('hud-renderer');

  if (this.open_) {
    if (pause) {
      exp.manager.pauseExp();
    }

    duration = 0.8;
    ease = new exp.Toggle.Expo2();

    if (isMobile) {
      animateFrom['opacity'] = 0;
      animateFrom['scale'] = 1;
      animateTo['opacity'] = 1;
      animateTo['scale'] = 1;
      animateTo['onStart'] = function() {
        goog.style.setStyle(this.item_, 'height', 'auto');
      };
      animateTo['onStartScope'] = this;
    } else {
      animateFrom['x'] = 24;
      animateFrom['y'] = 24;
      animateTo['x'] = 0;
      animateTo['y'] = 0;

      animateFrom['opacity'] = 1;
      animateFrom['scale'] = 0;
      animateTo['scale'] = 1;

      TweenLite['fromTo'](this.hud, 0.6, {
        'x': 0,
        'y': 0
      }, {
        'x': -72,
        'y': -72,
        'delay': isMobile ? 0 : delay,
        'ease': Expo['easeOut']
      });
    }
  } else {
    if (exp.manager) {
      exp.manager.unPauseExp();
    }

    duration = 0.3;
    ease = Circ['easeIn'];

    if (isMobile) {
      animateFrom['opacity'] = 1;
      animateFrom['scale'] = 1;
      animateTo['opacity'] = 0;
      animateTo['scale'] = 1;
      animateTo['onComplete'] = function() {
        goog.style.setStyle(this.item_, 'height', 0);
      };
      animateTo['onCompleteScope'] = this;
    } else {
      animateFrom['x'] = 0;
      animateFrom['y'] = 0;
      animateTo['x'] = 24;
      animateTo['y'] = 24;

      animateFrom['scale'] = 1;
      animateFrom['opacity'] = 1;
      animateTo['scale'] = 0;

      if (animate) {
        TweenLite['fromTo'](this.hud, 0.4, {
          'x': -224,
          'y': -224
        }, {
          'x': 0,
          'y': 0,
          'delay': 0.1,
          'ease': Expo['easeOut']
        });
      }
    }
  }

  animateTo['delay'] = isMobile ? 0 : delay;
  animateTo['ease'] = ease;

  TweenLite['fromTo'](
    this.item_, animate ? duration : 0, animateFrom, animateTo);
};
