goog.provide('exp');
goog.provide('exp.ui');

goog.require('exp.Accelerometer');
goog.require('exp.Background');
goog.require('exp.ChapterUI');
goog.require('exp.Manager');
goog.require('exp.MouseTracker');
goog.require('exp.Sequencer');
goog.require('exp.SoundManager');
goog.require('exp.Svgs');
goog.require('exp.Toggle');
goog.require('exp.VectorPool');
goog.require('exp.messages');
goog.require('exp.util.Messenger');
goog.require('goog.Disposable');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('ww.util');

/**
 * Initialize the entire experiment.  This is the main entry point.
 * @param {boolean} iframed Whether to initialize iframe messaging.
 */
exp.init = function(iframed) {
  // Check if need to fallback
  if (exp.fallback_()) {
    return;
  }

  exp.sideBarIsOpen = false;
  exp.iframed_ = (iframed === undefined) ? false : iframed;

  exp.initiallyHidden = goog.dom.getElementsByClass('js-remove-hidden');
  setTimeout(function() {
    goog.array.forEach(exp.initiallyHidden, function(elem) {
      goog.style.setStyle(elem, 'display', '');
    });
  }, 300);

  if (ww.util.mouseEventsDetected) {
    goog.dom.classes.add(document.body, 'mouse');
  } else {
    ww.util.listenForFirstMouseEvent(function() {
      goog.dom.classes.add(document.body, 'mouse');
    });
  }

  exp.ui.toggle = new exp.Toggle(document.body);
  exp.ui.chapter = new exp.ChapterUI();

 // exp.ui.chapter.setChapter(0);

  exp.blockScrollFunction = function(e) {
    if (!exp.sideBarIsOpen) {
      e.preventDefault();
    }
  };

  var continueLink = goog.dom.getElement('continue');

  if (exp.iframed_) {
    document.addEventListener('touchmove', exp.blockScrollFunction, false);
    exp.util.messenger = new exp.util.Messenger();

    // Let parent know experiment dom/window is loaded.
    exp.util.messenger.sendMessage({ 'action': 'loaded' });

    var listenKey = exp.util.messenger.listen('message', function(e) {
      var action = e.target && e.target['action'];

      // Parent frame is ready for experiment to initialize.
      if (action === 'initialize') {
        exp.util.messenger.unlistenByKey(listenKey);
        exp.buildApp();
      }
    });

    var isNexus7 = !!navigator.userAgent.match(/Nexus 7/);
    var isMobile = isNexus7 || (window.innerWidth < 1044);

    new Hammer(continueLink)['on']('tap', function(e) {
      exp.util.messenger.sendMessage({
        'action': 'continue'
      });
      e.stopPropagation();
    });
  } else {
    goog.style.setStyle(continueLink, 'display', 'none');

    var logoElem = goog.dom.getElement('logo');
    logoElem.style.cursor = 'pointer';
    new Hammer(logoElem)['on']('tap', function(e) {
      window.location.href = 'https://www.google.com/events/io';
    });

    // Not iframed, so continue to build app.
    exp.buildApp();
    document.addEventListener('touchmove', exp.blockScrollFunction, false);
  }

  var volumeButton = goog.dom.getElement('volume');
  new Hammer(volumeButton)['on']('tap', function(e) {
    if (exp.soundManager.enabled) {
      exp.soundManager.disable();
      goog.dom.classes.add(volumeButton, 'off');
    } else {
      exp.soundManager.enable();
      goog.dom.classes.remove(volumeButton, 'off');
    }
    e.stopPropagation();
  });
};

/**
 * Console log wrapper.
 * @param {string} msg The message.
 * @param {?string} prefix An optional prefix.
 */
exp.log = function(msg, prefix) {
  if (('undefined' !== typeof console) &&
      ('function' === typeof console.info)) {
    var foundMsg = exp.messages[msg];

    if (foundMsg) {
      if ('undefined' !== typeof prefix) {
        console.info(prefix + ':' + foundMsg);
      } else {
        console.info(foundMsg);
      }
    }
  }
};

/**
 * Once we're communicating with the parent iframe, start the app.
 */
exp.buildApp = function() {
  // init stuff

  exp.vectorPool = new exp.VectorPool();
  exp.vectorPool.preAllocate(50);
  exp.sequencer = new exp.Sequencer();
  exp.manager = new exp.Manager();
  exp.background = new exp.Background();
  exp.svgs = new exp.Svgs();
  exp.accelerometer = new exp.Accelerometer();
  exp.accelerometer.init();

  exp.mouseTracker = new exp.MouseTracker();
  if (!exp.accelerometer.enabled) {
    exp.mouseTracker.init();
  }

  exp.soundManager = new exp.SoundManager('/sounds/', '.mp3');

  exp.manager.init();

  if (exp.iframed_) {
    exp.util.messenger.sendMessage({ 'action': 'ready' });
  }
};
goog.exportSymbol('exp.init', exp.init);

/**
 * Determine if experiment needs to show the fallback state or not.
 * @return {boolean} Whether to fallback or not.
 * @private
 */
exp.fallback_ = function() {
  var fallback = !(
    Modernizr['inlinesvg'] &&
    Modernizr['csstransforms'] &&
    ('ArrayBuffer' in window));

  if (fallback) {
    var fallbackElement = goog.dom.getElementByClass('js-fallback');

    TweenMax['to'](fallbackElement, 0.4, {
      'autoAlpha': 1,
      'ease': Expo['easeOut'],
      'delay': 0.4,
      'onStart': function() {
        goog.style.setStyle(fallbackElement, 'display', 'block');
      }
    });
  }

  return fallback;
};
