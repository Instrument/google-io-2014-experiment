goog.provide('exp.entity.silicon.Structure');

goog.require('exp.entity.silicon.Atom');
goog.require('exp.entity.silicon.Connection');
goog.require('goog.array');

/**
 * The entity to hold all atoms and connections for Silicon chapter.
 * @constructor
 * @param {object} params All parameters for initialization.
 */
exp.entity.silicon.Structure = function(params) {
  goog.base(this, params);
  this.delayInc = 0;
  var obj = this;

  this.RADIUS = 50;
  this.SCALE_STEPS = [5, 3, 2, 1.6, 1.15, 1];
  this.currScaleStep_ = 0;

  this.scale_ = 11;
  this.rotationSpeedX_ = 0;
  this.rotationSpeedY_ = 0.03;

  this.atoms_ = [];
  this.connections_ = [];
  this.object_ = new THREE.Object3D();

  this.object_.scale.set(this.scale_, this.scale_, this.scale_);

  this.setScale(this.SCALE_STEPS[0], 1);
  this.isInteractive_ = false;

  this.atomLevels_ = [1, 5, 8, 11, 18];
  this.atomsExpanded_ = 0;
  this.transitionReady_ = false;
  this.currAtomLevel_ = 0;
  obj.atomPositions_ = [
    {
      'x': 0,
      'y': 0,
      'z': 0,
      'connection': [1]
    },
    {
      'x': 1,
      'y': 1,
      'z': 1,
      'connection': [0, 2, 3, 4]
    },
    {
      'x': 2,
      'y': 0,
      'z': 2,
      'connection': [1, 5]
    },
    {
      'x': 2,
      'y': 2,
      'z': 0,
      'connection': [1, 6]
    },
    {
      'x': 0,
      'y': 2,
      'z': 2,
      'connection': [1, 7]
    },
    {
      'x': 3,
      'y': 1,
      'z': 3,
      'connection': [2, 8, 9, 11]
    },
    {
      'x': 3,
      'y': 3,
      'z': 1,
      'connection': [3, 8, 10, 12]
    },
    {
      'x': 1,
      'y': 3,
      'z': 3,
      'connection': [4, 9, 10, 13]
    },
    {
      'x': 4,
      'y': 2,
      'z': 2,
      'connection': [5, 6]
    },
    {
      'x': 2,
      'y': 2,
      'z': 4,
      'connection': [5, 7]
    },
    {
      'x': 2,
      'y': 4,
      'z': 2,
      'connection': [6, 7]
    },
    {
      'x': 4,
      'y': 0,
      'z': 4,
      'connection': [5]
    },
    {
      'x': 4,
      'y': 4,
      'z': 0,
      'connection': [6]
    },
    {
      'x': 0,
      'y': 4,
      'z': 4,
      'connection': [7]
    },
    {
      'x': 4,
      'y': 0,
      'z': 0
    },
    {
      'x': 0,
      'y': 4,
      'z': 0
    },
    {
      'x': 0,
      'y': 0,
      'z': 4
    },
    {
      'x': 4,
      'y': 4,
      'z': 4
    }
  ];

  this.internalStructure_ = new THREE.Object3D();
  this.getObject().add(this.internalStructure_);

  this.internalStructure_.position.set(this.RADIUS, this.RADIUS, this.RADIUS);

  this.boundingConnections_ = [
    [0, 14, -1, 0, 0],
    [11, 14, 0, 0, 1],
    [12, 14, 0, 1, 0],
    [0, 15, 0, -1, 0],
    [12, 15, 1, 0, 0],
    [13, 15, 0, 0, 1],
    [0, 16, 0, 0, -1],
    [13, 16, 0, 1, 0],
    [11, 16, 1, 0, 0],
    [11, 17, 0, -1, 0],
    [12, 17, 0, 0, -1],
    [13, 17, -1, 0, 0]
  ];

  this.expandedNodes_ = [1];

  var position = obj.atomPositions_[1];
  var atom = new exp.entity.silicon.Atom(
    {'node': 1},
    obj,
    [(position.x - 2) * this.RADIUS, (position.y - 2) *
        this.RADIUS, (position.z - 2) * this.RADIUS],
    obj.atomPositions_[1]['connection']);

  exp.manager.addEntity(atom);
  obj.internalStructure_.add(atom.getObject());

  obj.atoms_.push(atom);
  atom.expand(null, true);

  exp.log('silicon1');

  this.setInteractiveDelay();
};
goog.inherits(exp.entity.silicon.Structure, exp.entity.Core);

/**
 * Delay interaction to prevent bad logic states.
 */
exp.entity.silicon.Structure.prototype.pauseInteraction = function() {
  this.isInteractive_ = false;
  this.setInteractiveDelay();
};

/**
 * Turn on interaction after a bit.
 */
exp.entity.silicon.Structure.prototype.setInteractiveDelay = function() {
  exp.sequencer.add('siliconDelay', 1, function() {
    this.isInteractive_ = true;
  }, null, this, null);
};

/**
 * Set the scale of the structure.
 * @param {number} newScale The new scale.
 * @param {number} speed The animation speed.
 */
exp.entity.silicon.Structure.prototype.setScale = function(newScale, speed) {
  var ratio = window.innerWidth / window.innerHeight;
  var ratioDiff = 1.2 - ratio;
  if (ratio < 1.2) {
    if (ratioDiff > .2) {
      ratioDiff = .2;
    }
  } else {
    ratioDiff = 0;
  }

  var scale = { num: this.scale_ };
  var obj = this;
  TweenLite.to(scale, typeof speed !== 'undefined' ? speed : 0, {
    num: newScale * (1 + (ratioDiff * 5) * .2),
    onUpdate: function() {
     obj.scale_ = scale.num;
    },
    'ease': this.currScaleStep_ === 0 ? Expo.easeOut : Back.easeOut
  });
};

/**
 * Update the scale.
 */
exp.entity.silicon.Structure.prototype.updateScale = function() {
  this.setScale(this.SCALE_STEPS[this.currScaleStep_], 0);
};

/**
 * Add a silicon node.
 * @param {number} num The node number.
 * @param {array} atomPosition An array of [x, y, z] position coords.
 * @param {exp.entity.silicon.Atom} atomParent The parent Atom.
 * @param {number} delay Delay before adding node.
 * @return {exp.entity.silicon.Atom}
 */
exp.entity.silicon.Structure.prototype.addNode = function(num,
                                                          atomPosition,
                                                          atomParent, delay) {
  if (goog.array.indexOf(this.expandedNodes_, num) === -1) {
    var position = this.atomPositions_[num];
    var parentPosition = atomParent.getObject().position;
    var atom = new exp.entity.silicon.Atom(
      { 'node': num,
        'tempPosition': [atomPosition[0], atomPosition[1], atomPosition[2]],
        'position': [parentPosition.x, parentPosition.y, parentPosition.z]
      },
      this,
      [(position.x - 2) * this.RADIUS, (position.y - 2) *
          this.RADIUS, (position.z - 2) * this.RADIUS],
      this.atomPositions_[num]['connection']);
    atom.parent = atomParent;
    exp.manager.addEntity(atom);
    this.internalStructure_.add(atom.getObject());

    this.atoms_.push(atom);
    atom.show(null, delay);

    return atom;
  } else {
    return null;
  }
};

/**
 * Check the spacing of the atoms.
 * @return {object} The details of the spacing.
 */
exp.entity.silicon.Structure.prototype.checkSpacing = function() {
  var minX = null;
  var minY = null;
  var minZ = null;
  var maxX = null;
  var maxY = null;
  var maxZ = null;

  for (var i = 0; i < this.expandedNodes_.length; i++) {
    var pos = this.atomPositions_[this.expandedNodes_[i]];
    if (minX === null || minX > pos.x) {
      minX = pos.x;
    }
    if (minY === null || minY > pos.y) {
      minY = pos.y;
    }
    if (minZ === null || minZ > pos.z) {
      minZ = pos.z;
    }
    if (maxX === null || maxX < pos.x) {
      maxX = pos.x;
    }
    if (maxY === null || maxY < pos.y) {
      maxY = pos.y;
    }
    if (maxZ === null || maxZ < pos.z) {
      maxZ = pos.z;
    }
  }

  return {minX: minX, maxX: maxX, minY: minY,
          maxY: maxY, minZ: minZ, maxZ: maxZ};
};

/**
 * Expand the next node.
 */
exp.entity.silicon.Structure.prototype.expandNextNode = function() {
  if (!this.transitionReady_) {
    var nextAtom = null;
    var atomCount = -1;

    while (nextAtom == null && ++atomCount < 15) {
      if (this.atoms_[atomCount]) {
        if (!this.atoms_[atomCount].isExpanded()) {
          nextAtom = this.atoms_[atomCount];
        }
      } else {
        atomCount = 15;
      }
    }

    if (nextAtom && this.isInteractive_) {
      if (nextAtom.isShown()) {
        this.expandNode(nextAtom.params_.node, [], nextAtom);
      }
    }
  }
};

/**
 * Draw attention to the node.
 */
exp.entity.silicon.Structure.prototype.drawAttention = function() {
  if (this.atomsExpanded_ < 14) {
    var nextAtom = null;
    var atomCount = -1;

    while (nextAtom == null && ++atomCount < 14) {
      if (this.atoms_[atomCount].hasNodes()) {
        nextAtom = this.atoms_[atomCount];
      }
    }
  }
};

/**
 * Expand a node.
 * @param {number} num The node number.
 * @param {array} connectedAtoms The connected atoms.
 * @param {exp.entity.silicon.Atom} mainAtom The main atom.
 * @param {boolean} force Force the killing of slices.
 * @return {boolean} Whether the atom was expanded.
 */
exp.entity.silicon.Structure.prototype.expandNode = function(num,
                                                             connectedAtoms,
                                                             mainAtom,
                                                             force) {
  var obj = this;
  if (goog.array.indexOf(this.expandedNodes_, num) !== -1 ||
    this.transitionReady_) {
      return false;
  }
  if (this.expandedNodes_.length === 1) {
    this.expandedNodes_.push(num);

    // delay increment for the first 4 build ins.
    var delayInc = .1;
    for (var i = 0; i <= 4; i++) {
      if (i !== 1) {
        exp.sequencer.add('expandNode' + i, delayInc, function(params) {
          this.expandNode(params['num'], [], this.atoms_[params['num']], true);
        }, {'num': i}, this, null);

        delayInc = delayInc + .5;
      }
    }
    if (!connectedAtoms) {
      return true;
    }
  } else {
    this.expandedNodes_.push(num);
  }
  var connections = [];
  var expandingNode = mainAtom;
  var removeAtoms = [];

  for (var i = 0; i < this.atoms_.length; i++) {
    if (this.atoms_[i].params_['node'] == num) {
      if (this.atoms_[i].parent) {
        connections.push([
          this.atoms_[i].finalPosition_,
          this.atoms_[i].parent.finalPosition_
        ]);
        if ((goog.array.indexOf(connectedAtoms, this.atoms_[i]) !== -1 ||
            (!connectedAtoms.length && this.atoms_[i] == mainAtom))) {
          expandingNode = this.atoms_[i];
          this.atoms_[i].expand();
        } else {
          if (!force) {
            this.atoms_[i].killSlices();
            exp.manager.removeEntity(this.atoms_[i]);
            removeAtoms.push(this.atoms_[i]);
          } else {
            expandingNode = this.atoms_[i];
            this.atoms_[i].expand();
          }
        }
      }
    }
  }

  for (var i = 0; i < removeAtoms.length; i++) {
    var spliceIndex = goog.array.indexOf(this.atoms_, removeAtoms[i]);
    if (spliceIndex !== -1) {
      this.atoms_.splice(spliceIndex, 1);
    }
  }

  for (var i = 0; i < connections.length; i++) {
    expandingNode.addConnectionToDraw(
      connections[i][0],
      connections[i][1]
    );
  }

  var offsets = this.checkSpacing();
  var xOffset = this.RADIUS * 2 -
      (offsets.maxX + offsets.minX) * (this.RADIUS / 2);
  var yOffset = this.RADIUS * 2 -
      (offsets.maxY + offsets.minY) * (this.RADIUS / 2);
  var zOffset = this.RADIUS * 2 -
      (offsets.maxZ + offsets.minZ) * (this.RADIUS / 2);

  TweenLite.to(this.internalStructure_.position, 1, {
    x: xOffset, y: yOffset, z: zOffset
  });

  var maxOffset = offsets.maxX - offsets.minX;
  if (offsets.maxY - offsets.minY > maxOffset) {
    maxOffset = offsets.maxY - offsets.minY;
  }

  if (offsets.maxZ - offsets.minZ > maxOffset) {
    maxOffset = offsets.maxZ - offsets.minZ;
  }

  this.currScaleStep_ = maxOffset;
  this.setScale(this.SCALE_STEPS[maxOffset], 1);

  return true;
};

/**
 * Draw a new connection.
 * @param {array} pos1 An array of x, y, z coords.
 * @param {array} pos2 An array of x, y, z coords.
 * @param {number} size The size of the connection.
 * @param {string} color The color of the connection.
 * @param {number} radius The connection radius.
 * @param {number} offset The offset.
 * @return {exp.entity.silicon.Connection}
 */
exp.entity.silicon.Structure.prototype.drawConnection = function(pos1,
                                                                 pos2,
                                                                 size,
                                                                 color,
                                                                 radius,
                                                                 offset) {
  var connection = new exp.entity.silicon.Connection({
    'positions': [
      pos1,
      pos2
    ],
    'size': size,
    'color': color,
    'radius': radius,
    'offset': offset,
    'tags': exp.Tags.SILICON
  });

  exp.manager.addEntity(connection);
  this.internalStructure_.add(connection.getObject());
  this.connections_.push(connection);

  return connection;
};

/**
 * Check if the transition is ready.
 * @return {boolean}
 */
exp.entity.silicon.Structure.prototype.transitionReady = function() {
  return this.transitionReady_;
};

/**
 * When an atom is expanded.
 */
exp.entity.silicon.Structure.prototype.atomExpanded = function() {
  this.atomsExpanded_++;

  if (this.atomsExpanded_ == 6) {
    exp.log('silicon2');
  } else if (this.atomsExpanded_ == 10) {
    exp.log('silicon3');
  } else if (this.atomsExpanded_ == 14) {
    exp.log('silicon4');
    this.buildBoundingBox();
    exp.sequencer.add('siliconNextChapter', 5,
      exp.manager.nextChapter, null, exp.manager, null);
  }
};

/**
 * Build the bounding box.
 */
exp.entity.silicon.Structure.prototype.buildBoundingBox = function() {
  exp.sequencer.add('boundingBoxDelay', 1, function() {
    this.transitionReady_ = true;
  }, null, this, null);

  for (var i = 14; i < this.atomPositions_.length; i++) {
    var position = this.atomPositions_[i];
    var atom =
      new exp.entity.silicon.Atom({
        'node': i,
        'position': [(position.x - 2) * this.RADIUS,
                      (position.y - 2) * this.RADIUS,
                      (position.z - 2) * this.RADIUS]
      });

    exp.manager.addEntity(atom);
    this.internalStructure_.add(atom.getObject());

    this.atoms_.push(atom);
    atom.show(true);
  }

  for (var j = 0; j < this.boundingConnections_.length; j++) {
    var bound = this.boundingConnections_[j];
    var position1 = this.atomPositions_[bound[0]];
    var position2 = this.atomPositions_[bound[1]];
    var connection = this.drawConnection(
      [(position1.x - 2) * this.RADIUS,
       (position1.y - 2) * this.RADIUS,
       (position1.z - 2) * this.RADIUS],
      [(position2.x - 2) * this.RADIUS,
       (position2.y - 2) * this.RADIUS,
       (position2.z - 2) * this.RADIUS],
      2, '#55c4f5', (this.RADIUS / 2), [bound[2], bound[3], bound[4]]
    );
  }

  this.currScaleStep_ = 5;
  this.setScale(this.SCALE_STEPS[this.currScaleStep_], 1);

  exp.sequencer.add('siliconChord', .2, function() {
    exp.soundManager.playSound('silicon/Note_01', null, {'gain': .8});
    exp.soundManager.playSound('silicon/Note_03', null, {'gain': .8});
    exp.soundManager.playSound('silicon/Note_05', null, {'gain': .8});
  }, null, this, null);
};

/**
 * Rotate the structure.
 */
exp.entity.silicon.Structure.prototype.rotate = function() {
  this.getObject().rotation.x += this.rotationSpeedX_;

  if (this.getObject().rotation.x > Math.PI / 8) {
    this.getObject().rotation.x = Math.PI / 8;
  } else if (this.getObject().rotation.x < -Math.PI / 8) {
    this.getObject().rotation.x = -Math.PI / 8;
  }

  this.getObject().rotation.y -= this.rotationSpeedY_;

  if (this.rotationSpeedX_ > .003 || this.rotationSpeedX_ < -.003) {
    this.rotationSpeedX_ *= 0.93;
  }

  if (this.rotationSpeedY_ > .003 || this.rotationSpeedY_ < -.003) {
    this.rotationSpeedY_ *= 0.93;
  }
};

/**
 * Tick activity when entity is inactive.
 * @param {number} delta Time in seconds since last tick.
 * @param {number} now Time in seconds since epoch.
 */
exp.entity.silicon.Structure.prototype.inactiveTick = function(delta, now) {
  goog.base(this, 'inactiveTick', delta, now);
  this.rotate();
};

/**
 * Transition the structure out.
 */
exp.entity.silicon.Structure.prototype.transitionOut = function() {
  exp.soundManager.playSound('silicon/BigRumble_01');
  var obj = this;
  var moveParams = {scale: this.scale_, x: this.getObject().position.x};

  TweenLite.to(moveParams, .75, {
    scale: .1,
    onUpdate: function() {
      obj.getObject().position.x = moveParams.x;
      obj.getObject().scale.set(moveParams.scale,
        moveParams.scale, moveParams.scale);
    },
    onComplete: function() {
      obj.removeAll();
    }
  });
};

/**
 * Remove everything from structure.
 */
exp.entity.silicon.Structure.prototype.removeAll = function() {
  for (var i = 0; i < this.atoms_.length; i++) {
    this.atoms_[i].killSlices();
    exp.manager.removeEntity(this.atoms_[i]);
  }

  for (var i = 0; i < this.connections_.length; i++) {
    this.connections_[i].removeEntities();
    exp.manager.removeEntity(this.connections_[i]);
  }

  this.atoms_ = [];
  this.connections_ = [];
  exp.manager.removeEntity(this);
};

/**
 * Tick activity when entity is inactive.
 * @param {number} delta Time in seconds since last tick.
 * @param {number} now Time in seconds since epoch.
 */
exp.entity.silicon.Structure.prototype.activeTick = function(delta, now) {
  this.rotate();
  this.getObject().scale.set(this.scale_, this.scale_, this.scale_);

  var tmpVector = exp.vectorPool.allocate();
  tmpVector.copy(exp.manager.camera_.position);
  this.internalStructure_.worldToLocal(tmpVector);

  for (var i = 0; i < this.atoms_.length; i++) {
    this.atoms_[i].getObject().lookAt(tmpVector);
  }

  exp.vectorPool.free(tmpVector);
};
