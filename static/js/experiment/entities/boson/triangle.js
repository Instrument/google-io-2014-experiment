goog.provide('exp.entity.Triangle');
goog.require('exp.entity.Circle');
goog.require('exp.entity.Svg');

/**
 * Create a triangle for the icosahedron.
 * @param {string} color The color upon filling.
 * @param {number} part Order of triangle in icosahedron.
 * @param {number} pulseDepth Initial pulse depth.
 * @constructor
 */
exp.entity.Triangle = function(color, part, pulseDepth) {
  var obj = this;
  this.part_ = part;
  this.color_ = color;
  var randWhite = 220 + (part * 3) % 30;
  this.fillColor_ = color === '#ffffff' ? color :
    'rgb(' + randWhite + ', ' + randWhite + ', ' + randWhite + ')';
  this.isBreathing_ = true;

  var params = {
    'content' : {
      'html': '<defs><clipPath id="tri-clip-' + this.part_ + '"><polygon ' +
        'points="100.0,5 18,147 182,148" /></clipPath></defs>' +
        '<g clip-path="url(#tri-clip-' + this.part_ + ')" >' +
        '<polygon class="poly-tri-' + part + '" ' +
        'points="100.0,5 18,147 182,148" ' +
        'fill-opacity="1" fill="' + this.fillColor_ + '"/>' +
        '<circle id="tri-circle-' + this.part_ + '" fill="' + this.color_ +
        '" cx="100" cy="100" r="0" /><polygon stroke="#94d9f2" ' +
        'stroke-width="0" points="100,8 20,146 180,146" ' +
        'fill-opacity="0" stroke-location="inside" fill="red"/></g>',
      'viewBox' : '0 0 200 200',
      'clipPath': 'asdf'
    },
    'useLighting': false,
    'detailFactor': exp.manager.isMobile() ? 1 : 5,
    'width' : 122,
    'height' : 122,
    'tags': exp.Tags.BOSON
  };

  goog.base(this, params);

  this.markFill_ = false;

  this.pulseDepth_ = pulseDepth;

  this.fillTween_ = null;
  this.pulseTween_ = null;
};
goog.inherits(exp.entity.Triangle, exp.entity.Svg);

/**
 * Triagle pulses like a breath.
 * @param {number} delayAdd Delay breath time.
 */
exp.entity.Triangle.prototype.nextPulse = function(delayAdd) {
  var obj = this;
  var pulseParams = {'z': 0};

  this.pulseTween_ = TweenMax.to(pulseParams, 1, {
    'z': this.pulseDepth_,
    'repeat': 1,
    'yoyo': true,
    'delay': 1.6 + delayAdd,
    'onUpdate': function() {
      obj.getObject().position.z = pulseParams.z;
    }
  });
};

/**
 * Reset elements of triangle.
 */
exp.entity.Triangle.prototype.reset = function() {
  var obj = this;
  if (!exp.manager.isMobile()) {
    var circle = goog.dom.getElement('tri-circle-' + this.part_);
    circle.setAttribute('r', 0);
  } else {
    var tri = goog.dom.getElementByClass('poly-tri-' + this.part_);
    tri.setAttribute('fill', this.fillColor_);
  }
  this.markFill_ = false;
};

/**
 * Animate the fill color of triangle.
 */
exp.entity.Triangle.prototype.fillIn = function() {
  var obj = this;
  if (!exp.manager.isMobile() && !(window.devicePixelRatio > 1)) {
    var circle = goog.dom.getElement('tri-circle-' + this.part_);
    if (circle) {
      var opacParams = {'r': 0};

      this.fillTween_ = TweenMax.to(opacParams, .5, {
        'r': 200,
        'ease': Linear.easeNone,
        'onUpdate': function() {
          circle.setAttribute('r', opacParams.r);
        }
      });
    }
  } else {
    var tri = goog.dom.getElementByClass('poly-tri-' + this.part_);
    tri.setAttribute('fill', this.color_);
  }
  exp.soundManager.playSound(
    'boson/PolyFillTone_0' + Math.ceil(Math.random() * 8), null,
        {offset: .4, gain: 4});
};

/**
 * Push triangle away from center.
 * @param {number} bigDepth The pulse open size.
 * @param {number} pulseDepth Breathing depth of triangle.
 * @param {boolean} fillIn Should fill in on next pass.
 * @param {boolean} stopBreathing If Icosahedron is large enough.
 */
exp.entity.Triangle.prototype.bigPulseOpen = function(bigDepth,
                                                      pulseDepth,
                                                      fillIn,
                                                      stopBreathing) {
  var obj = this;
  this.isBreathing_ = !stopBreathing;
  var pulseParams = {'z': this.getObject().position.z};
  this.pulseDepth_ = pulseDepth;

  if (this.pulseTween_) {
    this.pulseTween_['kill']();
  }
  this.pulseTween_ = TweenMax.to(pulseParams, .3, {
    'z': bigDepth,
    'ease': Expo.easeOut,
    onUpdate: function() {
      obj.getObject().position.z = pulseParams.z;
    },
    onComplete: function() {
      if (fillIn) {
        obj.bigPulseClose(fillIn);
      }
    }
  });
};

/**
 * Bring triangle back to center.
 * @param {boolean} fillIn If entity should fill in with color.
 */
exp.entity.Triangle.prototype.bigPulseClose = function(fillIn) {
  var obj = this;
  var pulseParams = {'z': this.getObject().position.z};

  var delay = 1;
  if (!fillIn) {
    delay = 0;
  }

  if (this.pulseTween_) {
    this.pulseTween_['kill']();
  }
  this.pulseTween_ = TweenMax.to(pulseParams, .3, {
    'z': 0,
    'ease': Expo.easeOut,
    'delay': delay,
    onUpdate: function() {
      obj.getObject().position.z = pulseParams.z;
    },
    onComplete: function() {
      obj.pulseTween_['kill']();
    }
  });
};

/**
 * Designate if triangle should be filled.
 */
exp.entity.Triangle.prototype.markFill = function() {
  this.markFill_ = true;
};
