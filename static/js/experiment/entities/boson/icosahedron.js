goog.provide('exp.entity.boson.Icosahedron');

goog.require('exp.entity.Triangle');

/**
 * Icosahedron for Boson chapter.
 * @constructor
 */
exp.entity.boson.Icosahedron = function() {
  goog.base(this, {});

  this.scaleSteps_ = [.4, .7, .8, 1.0, 1.25];
  this.breatheDepths_ = [-40, -20, -8, -4, 0];
  this.pulseDepths_ = [-100, -50, -20, -5, 0];
  this.hoboDepths_ = [125, 100, 90, 105];

  this.childrenHidden = false;
  this.reset();

  this.verticesRaw_ = [
     [-52.57311121191336, 85.065080835204, 0],
     [52.57311121191336, 85.065080835204, 0],
    [-52.57311121191336, -85.065080835204, 0],
    [52.57311121191336, -85.065080835204, 0],
    [0, -52.57311121191336, 85.065080835204],
     [0, 52.57311121191336, 85.065080835204],
    [0, -52.57311121191336, -85.065080835204],
    [0, 52.57311121191336, -85.065080835204],
    [85.065080835204, 0, -52.57311121191336],
    [85.065080835204, 0, 52.57311121191336],
    [-85.065080835204, 0, -52.57311121191336],
    [-85.065080835204, 0, 52.57311121191336]
  ];

  this.triangles_ = [];

  this.vertices_ = [];

  this.colors_ = [
    '#6ad085',
    '#3ebfcb',
    '#3ebfcb',
    '#6ad085',
    '#80d967',
    '#ade94c',
    '#80d967',
    '#53c7a7',
    '#3ebfcb',
    '#ffffff',
    '#2ab7f0',
    '#3ebfcb',
    '#53c7a7',
    '#6ad085',
    '#80d967',
    '#ade94c',
    '#80d967',
    '#2ab7f0',
    '#3ebfcb',
    '#80d967'
  ];

  this.icoData = [
    {'vertices': [5, 1, 0],
      'normal': [0, 0.9341723589627157, 0.35682208977308993],
      'centroid': [0, 74.23442429410711, 28.355026945068],
      'rotation': 1.05,
      'part': 0
    },
    {'vertices': [1, 7, 0],
      'normal': [0, 0.9341723589627157, -0.35682208977308993],
      'centroid': [0, 74.23442429410711, -28.355026945068],
      'rotation': -1.04,
      'part': 0
    },
    {'vertices': [1, 8, 7],
      'normal': [0.5773502691896258, 0.5773502691896258, -0.5773502691896258],
      'centroid': [45.87939734903912, 45.87939734903912, -45.87939734903912],
      'rotation': -0.66,
      'part': 0
    },
    {'vertices': [8, 1, 9],
      'normal': [0.9341723589627157, 0.35682208977308993, 0],
      'centroid': [74.23442429410711, 28.355026945068, 0],
      'rotation': 0,
      'part': 0
      }, // red
    {'vertices': [5, 9, 1],
      'normal': [0.5773502691896258, 0.5773502691896258, 0.5773502691896258],
      'centroid': [45.87939734903912, 45.87939734903912, 45.87939734903912],
      'rotation': 0.66,
      'part': 0
    },

    {'vertices': [11, 5, 0],
      'normal': [-0.5773502691896258, 0.5773502691896258, 0.5773502691896258],
      'centroid': [-45.87939734903912, 45.87939734903912, 45.87939734903912],
      'rotation': -2.75,
      'part': 1},
    {'vertices': [10, 11, 0],
      'normal': [-0.9341723589627157, 0.35682208977308993, 0],
      'centroid': [-74.23442429410711, 28.355026945068, 0],
      'part': 1},
    {'vertices': [7, 10, 0],
      'normal': [-0.5773502691896258, 0.5773502691896258, -0.5773502691896258],
      'centroid': [-45.87939734903912, 45.87939734903912, -45.87939734903912],
      'rotation': 2.75,
      'part': 1},
    {'vertices': [7, 6, 10],
      'normal': [-0.35682208977308993, 0, -0.9341723589627157],
      'centroid': [-28.355026945068, 0, -74.23442429410711],
      'rotation': -.53,
      'part': 1},
    {'vertices': [8, 9, 3],
      'normal': [0.9341723589627157, -0.35682208977308993, 0],
      'centroid': [74.23442429410711, -28.355026945068, 0],
      'rotation': Math.PI,
      'part': 1},
    {'vertices': [6, 8, 3],
      'normal': [0.5773502691896258, -0.5773502691896258, -0.5773502691896258],
      'centroid': [45.87939734903912, -45.87939734903912, -45.87939734903912],
      'rotation': -.39,
      'part': 1},
    {'vertices': [6, 7, 8],
      'normal': [0.35682208977308993, 0, -0.9341723589627157],
      'centroid': [28.355026945068, 0, -74.23442429410711],
      'rotation': 2.62,
      'part': 1},
    {'vertices': [9, 4, 3],
      'normal': [0.5773502691896258, -0.5773502691896258, 0.5773502691896258],
      'centroid': [45.87939734903912, -45.87939734903912, 45.87939734903912],
      'rotation': .39,
      'part': 1},
    {'vertices': [9, 5, 4],
      'normal': [0.35682208977308993, 0, 0.9341723589627157],
      'centroid': [28.355026945068, 0, 74.23442429410711],
      'rotation': 3.67,
      'part': 1},
    {'vertices': [11, 4, 5],
      'normal': [-0.35682208977308993, 0, 0.9341723589627157],
      'centroid': [-28.355026945068, 0, 74.23442429410711],
      'rotation': .53,
      'part': 1},

    {'vertices': [4, 11, 2],
      'normal': [-0.5773502691896258, -0.5773502691896258, 0.5773502691896258],
      'centroid': [-45.87939734903912, -45.87939734903912, 45.87939734903912],
      'rotation': -2.49,
      'part': 2},
    {'vertices': [10, 2, 11],
      'normal': [-0.9341723589627157, -0.35682208977308993, 0],
      'centroid': [-74.23442429410711, -28.355026945068, 0],
      'rotation': 3.14,
      'part': 2},
    {'vertices': [2, 6, 3],
      'normal': [0, -0.9341723589627157, -0.35682208977308993],
      'centroid': [0, -74.23442429410711, -28.355026945068],
      'rotation': 0,
      'part': 2},
    {'vertices': [4, 2, 3],
      'normal': [0, -0.9341723589627157, 0.35682208977308993],
      'centroid': [0, -74.23442429410711, 28.355026945068],
      'rotation': 0,
      'part': 2},
    {'vertices': [2, 10, 6],
      'normal': [-0.5773502691896258, -0.5773502691896258, -0.5773502691896258],
      'centroid': [-45.87939734903912, -45.87939734903912, -45.87939734903912],
      'rotation': .39,
      'part': 2}
  ];

  this.fillOrder_ = [
    [0, 4, 8, 12, 16],
    [1, 5, 9, 13, 17],
    [2, 6, 10, 14, 18],
    [3, 7, 11, 15, 19]
  ];
  this.fillCount_ = 0;

  this.interacting_ = false;
  this.expanded_ = false;

  for (var i = 0; i < this.icoData.length; i++) {
    var centroid = new THREE.Vector3();
    centroid.x = (this.verticesRaw_[this.icoData[i]['vertices'][0]][0] +
      this.verticesRaw_[this.icoData[i]['vertices'][1]][0] +
      this.verticesRaw_[this.icoData[i]['vertices'][2]][0]) / 3;
    centroid.y = (this.verticesRaw_[this.icoData[i]['vertices'][0]][1] +
      this.verticesRaw_[this.icoData[i]['vertices'][1]][1] +
      this.verticesRaw_[this.icoData[i]['vertices'][2]][1]) / 3;
    centroid.z = (this.verticesRaw_[this.icoData[i]['vertices'][0]][2] +
      this.verticesRaw_[this.icoData[i]['vertices'][1]][2] +
      this.verticesRaw_[this.icoData[i]['vertices'][2]][2]) / 3;

    var triangle = null;

    triangle = new exp.entity.Triangle(
      this.colors_[i], i, this.breatheDepths_[this.currScale_]);

    if (triangle) {
      var holder = new THREE.Object3D();
      exp.manager.addEntity(triangle);
      holder.add(triangle.getObject());
      this.getObject().add(holder);

      var normal = new THREE.Vector3(
        this.icoData[i]['normal'][0],
        this.icoData[i]['normal'][1],
        this.icoData[i]['normal'][2]);

      holder.position = centroid.multiplyScalar(1);
      holder.normal_ = normal;
      holder.lookAt(normal);
      if (this.icoData[i]['rotation']) {
        triangle.getObject().rotation.z = this.icoData[i]['rotation'];
      }
      holder.geo_ = triangle;
      this.triangles_.push(holder);
    }
  }
};
goog.inherits(exp.entity.boson.Icosahedron, exp.entity.Core);

/**
 * Kill all twenty triangles.
 */
exp.entity.boson.Icosahedron.prototype.killTris = function() {
  for (var i = 0; i < this.triangles_.length; i++) {
    exp.manager.removeEntity(this.triangles_[i].geo_);
    exp.manager.scene_.remove(this.triangles_[i]);
  }
  this.triangles_.length = 0;
};

/**
 * Grow the icosahedron.
 */
exp.entity.boson.Icosahedron.prototype.increaseScale = function() {
  var scale = this.scaleSteps_[++this.currScale_];
  TweenMax.to(this.getObject().scale, 1, {
    'x': scale,
    'y': scale,
    'z': scale
  });
};

/**
 * Reset to the initial state.
 */
exp.entity.boson.Icosahedron.prototype.reset = function() {
  this.currScale_ = -1;
  this.getObject().scale.set(0, 0, 0);
  this.getObject().position.z = 0;
  this.getObject().rotation.x = 0;
  this.getObject().rotation.y = 0;
  this.getObject().rotation.z = 0.5;

  this.fillCount_ = 0;

  if (this.triangles_) {
    for (var i = 0; i < this.triangles_.length; i++) {
      var tri = this.triangles_[i];
      tri.geo_.reset();
    }
  }
};

/**
 * Show all triangles.
 */
exp.entity.boson.Icosahedron.prototype.showChildren = function() {
  this.childrenHidden = false;
  for (var i = 0; i < this.triangles_.length; i++) {
    var tri = this.triangles_[i];
    tri.geo_.cssObject_['visible'] = true;
  }
};

/**
 * Hide all triangles.
 */
exp.entity.boson.Icosahedron.prototype.hideChildren = function() {
  this.childrenHidden = true;
  this.expanded_ = false;
  for (var i = 0; i < this.triangles_.length; i++) {
    var tri = this.triangles_[i];
    tri.geo_.cssObject_['visible'] = false;
  }
};


/**
 * Get or set interaction toggle.
 * @param {boolean} update New value of interaction.
 * @return {boolean} Value of interaction.
 */
exp.entity.boson.Icosahedron.prototype.isInteracting = function(update) {
  if ('undefined' === typeof update) {
    return this.interacting_;
  } else {
    this.interacting_ = update;
  }
};

/**
 * Spread apart triangles of icosahedron.
 * @param {boolean} fillIn If triangles should be filled in.
 * @return {array} Values for Hobo Cloud of triangles needing filling.
 */
exp.entity.boson.Icosahedron.prototype.expandIco = function(fillIn) {
  var stopBreathing = this.currScale_ === this.breatheDepths_.length - 2;
  if (!this.expanded_) {
    exp.soundManager.playSound('boson/20Sided_Opening', null, {'gain': 2});
  }
  for (var i = 0; i < this.triangles_.length; i++) {
    this.triangles_[i].geo_.bigPulseOpen(
      this.pulseDepths_[this.currScale_],
      this.breatheDepths_[this.currScale_], fillIn, stopBreathing);
  }
  this.expanded_ = true;
  if (fillIn) {
    this.increaseScale();
    return this.fillIn();
  }
  return null;
};

/**
 * Close up triangles.
 */
exp.entity.boson.Icosahedron.prototype.compressIco = function() {
  this.expanded_ = false;
  exp.soundManager.playSound(
    'boson/20Sided_Closing', null, {'offset': .4, 'gain': 2});
  for (var i = 0; i < this.triangles_.length; i++) {
    this.triangles_[i].geo_.bigPulseClose();
  }
};

/**
 * Fill in triangles with color.
 * @return {array} Positions of triangles to fill in with color.
 */
exp.entity.boson.Icosahedron.prototype.fillIn = function() {
  if (this.fillCount_ === 4) {
    return null;
  }
  var fillers = this.fillOrder_[this.fillCount_];
  var fillerPositions = [];
  for (var i = 0; i < fillers.length; i++) {
    this.triangles_[fillers[i]].geo_.markFill();
    fillerPositions.push(
      [this.hoboDepths_[this.fillCount_], this.triangles_[fillers[i]]]);
  }
  this.fillCount_++;
  return fillerPositions;
};
