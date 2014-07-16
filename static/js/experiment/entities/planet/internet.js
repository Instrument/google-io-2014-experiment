goog.provide('exp.entity.planet.Internet');

goog.require('exp.entity.Svg');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.object');

/**
 * An entity that represents the internet (appears as an overlay on the Earth).
 * @param {array} nodes An array of coordinates for the connection nodes.
 * @constructor
 */
exp.entity.planet.Internet = function(nodes) {

  var pathPoints = [];
  // add connection lines to each city.
  for (var i = 0; i < nodes.length; i++) {
    var x = nodes[i].x * 200;
    var y = nodes[i].y * 200;
    pathPoints.push(x + ',' + y);
  }

  // add additional lines to make it more interesting.
  for (var i = 0; i < 5; i += 2) {
    var x = nodes[i].x * 200;
    var y = nodes[i].y * 200;
    pathPoints.push(x + ',' + y);
  }

  // drop shadow
  var svgSource = '<polyline class="network_connections" opacity="0.2" ' +
  'fill="none" stroke="rgba(1,1,1,0.15)" stroke-width="3" ' +
  ' stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" ' +
  'transform="translate(1.5, 1.5)" ' +
  'points="' + pathPoints.join(' ') + '" />';

  // data path
  svgSource += '<polyline class="network_connections" opacity="1" ' +
  'fill="none" stroke="#ffeb3b" stroke-width="3" stroke-linecap="round" ' +
  'stroke-linejoin="round" stroke-miterlimit="10" ' +
  'points="' + pathPoints.join(' ') + '" />';

  var params = {
    'content': {
      'html': svgSource,
      'viewBox': exp.entity.Core.makeViewBox(0, 0, 200, 200)
    },
    'useLighting': false,
    'detailFactor': 1.5,
    'position': [0, 0, 8],
    'width': 280,
    'height': 280,
    'tags': exp.Tags.PLANET
  };
  goog.base(this, params, 'internet');

  this.velocity_ = 0;
  this.pathOffset_ = 0;
  this.pathAlpha_ = 0;
  this.lineAlpha_ = 0;
  this.alpha_ = 0;
  this.nodeAlpha_ = 0;
  this.pathDirection_ = 1;

  this.element_['style']['pointerEvents'] = 'none';

  this.audioPeakCallback_ = goog.bind(function() {
    this.pathDirection_ *= -1;
  }, this);

  // Get all elements that are child nodes of the connection group.
  this.paths_ = goog.dom.findNodes(this.element_, function(node) {
    return (node.nodeType == 1);
  });
};
goog.inherits(exp.entity.planet.Internet, exp.entity.Svg);

/**
 * Set this entity to be active or inactive.
 * @param {boolean} isActive The active state to be set.
 * @override
 */
exp.entity.planet.Internet.prototype.setActive = function(isActive) {
  goog.base(this, 'setActive', isActive);
  if (isActive) {
    for (var i = 0; i < this.paths_.length; i++) {
      this.paths_[i]['style']['opacity'] = 0;
      this.paths_[i]['style']['strokeDasharray'] = '10 15';
    }
    this.element_['style']['opacity'] = 0;
    this.pathOffset_ = 0;
    this.pathAlpha_ = 0;

    exp.soundManager.setPeakDetectionCallback(this.audioPeakCallback_);

    var obj = this;
    TweenLite.to(obj, 0.5, {
      delay: 0.1,
      nodeAlpha_: 1,
      onStart: function() {
        exp.soundManager.playSound('planet/CityLines');
      },
      onUpdate: function() {
        obj.element_['style']['opacity'] = obj.nodeAlpha_;
      }
    });

    TweenLite.to(obj, 0.5, {
      lineAlpha_: 1,
      delay: 0.35,
      onUpdate: function() {
        for (var i = 0; i < obj.paths_.length; i++) {
          obj.paths_[i]['style']['opacity'] = obj.lineAlpha_;
        }
      }
    });
  }
};

/**
 * Run this entity when it is inactive.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Internet.prototype.inactiveTick = function(delta, now) {
  this.object_.scale.multiplyScalar(0.8);
  if (this.object_.scale.x < 0.01) {
    exp.manager.removeEntity(this);
  }
};

/**
 * Run this entity when it is active.
 * @param {number} delta time between ticks, in fractional seconds.
 * @param {number} now the current run-time in fractional seconds.
 * @override
 */
exp.entity.planet.Internet.prototype.activeTick = function(delta, now) {
  this.pathOffset_ += delta * 30;

  for (var i = 0; i < this.paths_.length; i++) {
    this.paths_[i]['style']['strokeDashoffset'] = this.pathOffset_;
  }
};
