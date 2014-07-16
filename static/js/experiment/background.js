goog.provide('exp.Background');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');

/**
 * Canvas background animator.
 * @constructor
 * @param {string=white} startingPattern Starting background pattern.
 */
exp.Background = function(startingPattern) {
  this.elem_ = goog.dom.getElement('background');

  var logo = goog.dom.getElement('logo');
  this.logoChildren = goog.dom.getElementsByClass('change', logo);
  this.continueLink = goog.dom.getElement('continue');
  this.continueIcon = goog.dom.getElement('arrowPath');

  var volumeOn = goog.dom.getElement('volume-on');
  this.volumeOnChildren = goog.dom.getElementsByClass('change', volumeOn);

  var volumeOff = goog.dom.getElement('volume-off');
  this.volumeOffChildren = goog.dom.getElementsByClass('change', volumeOff);

  this.useCanvas = !Modernizr['touch'] && (window.innerWidth >= 768);

  this.scaleCanvasFactor_ = 1;
  this.setLogoColor('rgba(0,0,0,0.15)');

  if (!this.useCanvas && this.elem_) {
    var radius = 100;

    this.elem_.width = radius * 2;
    this.elem_.height = radius * 2;

    TweenLite.set(this.elem_, {
      'x': (window.innerWidth / 2) - radius,
      'y': (window.innerHeight / 2) - radius,
      'scaleX': 0,
      'scaleY': 0
    });

    var ctx = this.elem_.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.elem_.width / 2, this.elem_.height / 2,
      this.elem_.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  var self = this;
  goog.events.listen(window, 'resize', function() {
    self.resize();
  });
  this.resize();

  this.dirty_ = true;
  this.currentPattern_ = startingPattern || 'white';
  this['currentRadius'] = 0.0;

  this.fromCenter_ = false;
};

/**
 * Animate the background to the given pattern.
 * @param {string|img} pattern The new pattern.
 * @param {string} logoColor The new logo color.
 * @param {number} duration The length of the animation.
 * @param {boolean=false} fromCenter Whether the animation starts at the center.
 * @param {function=Expo['easeOut']} easing The easing function.
 */
exp.Background.prototype.maskToPattern = function(pattern,
                                                  logoColor,
                                                  duration,
                                                  fromCenter,
                                                  easing) {
  this.nextPattern_ = pattern;

  this.fromCenter_ = 'undefined' !== typeof fromCenter ? fromCenter : false;

  if ('undefined' === typeof easing) {
    easing = Cubic['easeIn'];
  }

  if (this.useCanvas) {
    TweenLite.to(this, duration, {
      'currentRadius': 1.0,
      'ease': easing,
      'onComplete': function() {
        this.currentPattern_ = pattern;
        this['currentRadius'] = 0.0;
        this.dirty_ = true;

        if (fromCenter) {
          this.setLogoColor(logoColor);
        }
      },
      'onCompleteScope': this,
      'onStart': function() {
        if (!fromCenter) {
          this.setLogoColor(logoColor);
        }
      },
      'onStartScope': this
    });
  } else {

    var ctx = this.elem_.getContext('2d');

    if (fromCenter) {
      ctx.fillStyle = pattern;
    } else {
      ctx.fillStyle = this.currentPattern_;
      document.body.style.backgroundColor = pattern;
    }

    ctx.beginPath();
    ctx.arc(this.elem_.width / 2, this.elem_.height / 2,
      this.elem_.width / 2, 0, Math.PI * 2);
    ctx.fill();

    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2;
    var max = Math.sqrt(
      (halfWidth * halfWidth) + (halfHeight * halfHeight)
    );

    var scaledRadius = max / (this.elem_.width / 2);

    TweenLite.fromTo(this.elem_, duration * 1.4, {
      'scaleX': fromCenter ? 0 : scaledRadius,
      'scaleY': fromCenter ? 0 : scaledRadius
    }, {
      'scaleX': fromCenter ? scaledRadius : 0,
      'scaleY': fromCenter ? scaledRadius : 0,
      'ease': easing,
      'onComplete': function() {
        this.currentPattern_ = pattern;

        document.body.style.backgroundColor = this.currentPattern_;
        TweenLite.set(this.elem_, { 'scaleX': 0, 'scaleY': 0 });

        if (fromCenter) {
          this.setLogoColor(logoColor);
        }
      },
      'onCompleteScope': this,
      'onStart': function() {
        if (!fromCenter) {
          this.setLogoColor(logoColor);
        }
      },
      'onStartScope': this
    });
  }
};

/**
 * On browser resize, change the canvas.
 */
exp.Background.prototype.resize = function() {
  if (this.elem_) {
    if (this.useCanvas && !exp.manager.params_['partial']) {
      this.elem_.width =
        Math.ceil(window.innerWidth / this.scaleCanvasFactor_);
      this.elem_.height =
        Math.ceil(window.innerHeight / this.scaleCanvasFactor_);

      var scaleFactor = this.scaleCanvasFactor_ * 2;
      TweenLite.set(this.elem_, {
        'x': (window.innerWidth / 2) - (window.innerWidth / scaleFactor),
        'y': (window.innerHeight / 2) - (window.innerHeight / scaleFactor),
        'scaleX': this.scaleCanvasFactor_,
        'scaleY': this.scaleCanvasFactor_
      });

      this.dirty_ = true;
    } else if (!exp.manager.params_['partial']) {
      var radius = 100;

      TweenLite.set(this.elem_, {
        'opacity': 0,
        'scaleX': 0,
        'scaleY': 0
      });

      var self = this;
      setTimeout(function() {
        TweenLite.set(self.elem_, {
          'x': (window.innerWidth / 2) - radius,
          'y': (window.innerHeight / 2) - radius,
          'opacity': 1
        });
      }, 200);
    } else {
      var size = goog.style.getSize(exp.manager.params_['element']);
      // this.elem_.width = size.width;
      // this.elem_.height = size.height;
      // console.log(size);
      // this.elem_.opacity = 1;
      // this.elem_.scaleX = this.scaleCanvasFactor_;
      // this.elem_.scaleY = this.scaleCanvasFactor_;
    }
  }
};

/**
 * On frame.
 */
exp.Background.prototype.update = function() {
  if (this.useCanvas) {
    this.updateCanvas_();
  }
};

/**
 * Canvas rendering of transition.
 * @private
 */
exp.Background.prototype.updateCanvas_ = function() {
  if (this.elem_) {
    if (this['currentRadius'] > 0) {
      var ctx = this.elem_.getContext('2d');
      ctx.clearRect(0, 0, this.elem_.width, this.elem_.height);

      var halfWidth = this.elem_.width / 2;
      var halfHeight = this.elem_.height / 2;
      var max = Math.sqrt(
        (halfWidth * halfWidth) + (halfHeight * halfHeight)
      );

      if (this.fromCenter_) {
        ctx.fillStyle = this.currentPattern_;
        ctx.fillRect(0, 0, this.elem_.width, this.elem_.height);

        var radius = max * this['currentRadius'];

        ctx.fillStyle = this.nextPattern_;
        ctx.beginPath();
        ctx.arc(halfWidth, halfHeight,
                  radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = this.nextPattern_;
        ctx.fillRect(0, 0, this.elem_.width, this.elem_.height);

        var radius = max * (1.0 - this['currentRadius']);

        ctx.fillStyle = this.currentPattern_;
        ctx.beginPath();
        ctx.arc(halfWidth, halfHeight,
                  radius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      if (this.dirty_) {
        var ctx = this.elem_.getContext('2d');
        ctx.clearRect(0, 0, this.elem_.width, this.elem_.height);
        ctx.fillStyle = this.currentPattern_;
        ctx.fillRect(0, 0, this.elem_.width, this.elem_.height);
        this.dirty_ = false;
      }
    }
  }
};

/**
 * Set the color of the I/O in the upper left corner.
 * @param {string} color Hex value of color.
 */
exp.Background.prototype.setLogoColor = function(color) {
  goog.array.forEach(this.logoChildren, function(path) {
    path.style.fill = color;
  });

  var darkerColor;
  if (color === 'rgba(0,0,0,0.15)') {
    darkerColor = 'rgba(0,0,0,0.35)';
  } else {
    darkerColor = 'rgba(255,255,255,0.6)';
  }

  goog.array.forEach(this.volumeOffChildren, function(path2) {
    path2.style.fill = darkerColor;
  });

  goog.array.forEach(this.volumeOnChildren, function(path3) {
    path3.style.fill = darkerColor;
  });

  var navColor = (color === 'rgba(0,0,0,0.15)') ? 'black' : 'white';

  if (this.continueLink) {
    this.continueLink.style.color = navColor;
  }

  if (this.continueIcon) {
    this.continueIcon.style.fill = navColor;
  }
};
