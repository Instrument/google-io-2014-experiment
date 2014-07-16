goog.provide('exp.entity.silicon.Atom');

goog.require('exp.entity.Slice');
goog.require('goog.array');

/**
 * The entity that is a Silicon atom.
 * @constructor
 * @param {object} params All parameters for initialization.
 * @param {object} structure Structure holding the atoms.
 * @param {object} finalPosition Final atom position.
 * @param {number} connectionNums The number of atom connections.
 */
exp.entity.silicon.Atom = function(
                            params, structure, finalPosition, connectionNums) {
  var circ = '<circle fill="#ff0000" fill-opacity="0" cx="50" cy="50" r="50"/>';

  params = {
    'foldable': true,
    'patterns': [
      {
        'html': circ,
        'viewBox': '0 0 120 120'
      },
      exp.svgs.getSvg('silicon-open-slot'),
      exp.svgs.getSvg('silicon-atom')
    ],
    'useLighting': false,
    'patternsRepeat': true,
    'width': 50,
    'height': 50,
    'direction': 1,
    'detailFactor': exp.manager.isMobile() ? 3 : 8,
    'unfoldOpen': true,
    'unfoldOpenSpeed': .4,
    'unfoldAngle': 90,
    'tags': exp.Tags.SILICON,
    'node': params['node'],
    'position': params['position'],
    'tempPosition': params['tempPosition']
  };


  this.params_ = params;

  goog.base(this, params);

  var obj = this;

  obj.structure_ = structure;
  obj.finalPosition_ = finalPosition;
  obj.connectionNums_ = connectionNums || [];
  obj.connectedAtoms_ = [];
  obj.connectionsToDraw_ = [];
  this.transSpeed_ = .55;
  this.pulseTween_ = null;
  this.hasShadowsIgnored_ = true;

  this.isFoldable();

  this.expanded_ = false;

  if (params['node'] != 1) {
    this.getObject().scale.set(0, 0, 0);
  }

  if (params['tempPosition'] && finalPosition) {
    TweenLite['to'](this.getObject().position, .3, {
      'delay': .1,
      'x': params['tempPosition'][0] + .33 *
         (obj.finalPosition_[0] - params['tempPosition'][0]),
      'y': params['tempPosition'][1] + .33 *
         (obj.finalPosition_[1] - params['tempPosition'][1]),
      'z': params['tempPosition'][2] + .33 *
         (obj.finalPosition_[2] - params['tempPosition'][2])
    });
  }
};
goog.inherits(exp.entity.silicon.Atom, exp.entity.Core);

/**
 * Remove a connection.
 * @param {number} num The number of the connection to remove.
 */
exp.entity.silicon.Atom.prototype.removeConnection = function(num) {
  var idx = goog.array.indexOf(this.connectionNums_, num);
  if (idx !== -1) {
    this.connectionNums_.splice(idx, 1);
  }
};

/**
 * add pulse tween.
 */
exp.entity.silicon.Atom.prototype.addPulseTween = function() {
    var params = this.params_;
    var scaleParams = {scale: .2};
    var obj = this;
    if (!this.expanded_) {
      obj.pulseTween_ = TweenMax['to'](scaleParams, 1, {
        'scale': .25,
        'repeat': -1,
        'yoyo': true,
        'delay': (params['node'] % 4) * .2,
        'onUpdate': function(e, d) {
          var audioOffset = 0;

          if (exp.soundManager.supportsAudioAnalysis) {
            audioOffset = exp.soundManager.smoothedVolume * 0.5;
          }

          obj.getObject().scale.set(scaleParams.scale + audioOffset,
            scaleParams.scale + audioOffset, scaleParams.scale + audioOffset);
        }
      });
    }
};

/**
 * Add a connection.
 * @param {object} atom The atom connection to add.
 */
exp.entity.silicon.Atom.prototype.addConnection = function(atom) {
  if (!this.connections_) {
    this.connections_ = [];
  }

  this.connections_.push(atom);
};

/**
 * Check expanded status.
 * @return {boolean} this.expanded_ If atom is expanded or not.
 */
exp.entity.silicon.Atom.prototype.isExpanded = function() {
  return this.expanded_;
};

/**
 * Check shown status.
 * @return {boolean} this.shown_ If atom is shown or not.
 */
exp.entity.silicon.Atom.prototype.isShown = function() {
  return this.shown_;
};

/**
 * Show an atom.
 * @param {boolean} kill If atom should be killed.
 * @param {number} delay Time to delay showing of ataom.
 */
exp.entity.silicon.Atom.prototype.show = function(kill, delay) {
  if (!this.shown_) {
    if (!delay) {
      delay = 0;
    }

    exp.sequencer.add('delaySlice' + this.id_, .2 + delay,
      this.delaySliceOpenBlueDots, null, this, null);
    this.addTapGesture();
  }
};

/**
 * Show an atom delay small blue dots.
 */
exp.entity.silicon.Atom.prototype.delaySliceOpenBlueDots = function() {
  this.shown_ = true;

  if (!this.expanded_) {
    TweenLite.fromTo(this.getObject().scale, .5, {'x': 0 , 'y': 0, 'z': 0},
    {'x': .2 , 'y': .2, 'z': .2, 'delay': 0, 'onComplete': this.addPulseTween,
    'onCompleteScope': this, 'ease': Back.easeOut});
  }
  this.createSlice(true, this.transSpeed_);
  exp.soundManager.playSound('silicon/Paper_0' +
    Math.ceil(Math.random() * 6) + '', null, {'gain': .8});
};

/**
 * Show an atom.
 */
exp.entity.silicon.Atom.prototype.delaySliceOpen = function() {
  this.shown_ = true;
  this.createSlice(true, this.transSpeed_);
};

/**
 * Run when the slice is a quarter open.
 */
exp.entity.silicon.Atom.prototype.sliceQuarterOpen = function() {
  if (this.expanded_) {
    this.addAllNodes();
  }
};

/**
 * Expand an atom.
 * @param {object} atom The atom to expand.
 * @param {boolean} init If an atom should be created.
 */
exp.entity.silicon.Atom.prototype.expand = function(atom, init) {
  if (!this.expanded_) {
    var obj = this;
    exp.soundManager.playSound('silicon/Paper_0' +
        Math.ceil(Math.random() * 6) + '', null, {'gain': .8});
    exp.soundManager.playSound('silicon/Bubble_0' +
        Math.ceil(Math.random() * 2) + '', null, {'gain': .8});
    exp.soundManager.playSound('silicon/Note_0' +
        Math.ceil(Math.random() * 9) + '', null, {'gain': .6});

    if (obj.pulseTween_) {
      obj.pulseTween_['kill']();
    }
    TweenLite['to'](this.getObject().scale, (init) ? 0 : this.transSpeed_, {
      'x': 1,
      'y': 1,
      'z': 1,
      'onComplete': function() {
        for (var i = 0; i < obj.connectionsToDraw_.length; i++) {
          obj.structure_.drawConnection(
            obj.connectionsToDraw_[i][0],
            obj.connectionsToDraw_[i][1],
            2, '#d1d3d4', 40);
        }

        if (!init) {
          obj.structure_.atomExpanded();
        }
      },
      'ease': Back.easeOut
    });

    TweenLite['to'](this.getObject().position, (init) ? 0 : this.transSpeed_, {
      'x': this.finalPosition_[0],
      'y': this.finalPosition_[1],
      'z': this.finalPosition_[2],
      'ease': Back.easeOut
    });

    this.expanded_ = true;

    if (init) {
      this.increaseCurrPattern();
      exp.sequencer.add(
        'initializeGestures', 1.5, this.addTapGesture, null, this, null);
      this.structure_.atomExpanded();
    }

    exp.sequencer.add('delaySlice' + this.id_, (init) ? 0 : .6,
      this.delaySliceOpen, null, this, null);

    if (atom) {
      this.removeConnection(atom);
    }
  }
};

/**
 * Check if an atom has nodes.
 * @return {boolean} If an atom has nodes or not.
 */
exp.entity.silicon.Atom.prototype.hasNodes = function() {
  return this.connectionNums_.length > 0 && this.connectedAtoms_.length !== 0;
};

/**
 * Bind a tap gesture.
 */
exp.entity.silicon.Atom.prototype.addTapGesture = function() {
  var obj = this;
  this.bindInputEvent('tap', function(gesture) {
    if (obj.structure_.isInteractive_) {
      if (!obj.expanded_) {
        this.structure_.expandNode(obj.params_.node, [], this);
      } else if (this.hasNodes()) {
        if (this.connectedAtoms_.length) {
          var shown = 0;
          for (var i = 0; i < this.connectedAtoms_.length; i++) {
            if (this.connectedAtoms_[i].isShown()) {
              shown++;
            }
          }
          if (shown !== this.connectedAtoms_.length) {
            return;
          }
        }
        if (obj.connectionNums_.length) {
          var expanded = false;

          while (!expanded && obj.connectionNums_.length) {
            expanded = this.structure_.expandNode(
                         obj.connectionNums_[0], this.connectedAtoms_, this);

            if (!expanded) {
              obj.removeConnection(obj.connectionNums_[0]);
            }
          }
        }
      } else {
        this.structure_.drawAttention();
      }
    }
  });
};

/**
 * Add a connection that will be drawn.
 * @param {object} pos1 Coordinate for position origin.
 * @param {object} pos2 Coordinate for position end.
 */
exp.entity.silicon.Atom.prototype.addConnectionToDraw = function(pos1, pos2) {
  if (pos1 && pos2) {
    this.connectionsToDraw_.push([pos1, pos2]);
  }
};

/**
 * Add all nodes.
 */
exp.entity.silicon.Atom.prototype.addAllNodes = function() {
  if (this.connectionNums_) {
    for (var i = 0; i < this.connectionNums_.length; i++) {
      var delay = i * .3;
      var connectedAtom = this.structure_.addNode(
      this.connectionNums_[i], this.finalPosition_, this, delay);

      if (connectedAtom) {
        this.connectedAtoms_.push(connectedAtom);
      }
    }
  }
};
