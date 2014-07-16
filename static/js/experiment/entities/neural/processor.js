goog.provide('exp.entity.neural.Processor');

goog.require('exp.entity.Slice');

/**
 * The entity that is a Silicon atom.
 * @constructor
 * @param {object} params All parameters for initialization.
 */
exp.entity.neural.Processor = function(params) {
  var obj = this;
  obj.originalColor_ = '#7293a2';
  this.colors_ = [];
  params = {
    'foldable': true,
    'patterns': [
      {
        'html': '<circle r="50" fill="' + obj.originalColor_ +
          '" cx="50" cy="50"/>',
        'viewBox': '0 0 100 100'
      }
    ],
    'useLighting': true,
    'width': 16,
    'height': 16,
    'direction': -1,
    'unfoldOpen': true,
    'unfoldOpenSpeed': .4,
    'unfoldAngle': 90,
    'detailFactor': 2,
    'patternsRepeat': true,
    'tags': exp.Tags.NEURAL
  };
  goog.base(this, params);

  this.isFoldable();

  this.processingTicks_ = false;
};
goog.inherits(exp.entity.neural.Processor, exp.entity.Core);

/**
 * Set the next color.
 * @param {string} color The hex color to set as the next color.
 */
exp.entity.neural.Processor.prototype.setNextColor = function(color) {
  this.nextColor_ = color;
};

/**
 * Reset colors.
 */
exp.entity.neural.Processor.prototype.resetColors = function() {
  this.params_['patterns'] = [{
    'html': '<circle r="50" fill="' + this.originalColor_ +
      '" cx="50" cy="50"/>',
    'viewBox': '0 0 100 100'
  }];
  exp.sequencer.cancel('processData' + this.id_);
  this.processingTicks_ = 0;
  this.currPattern_ = 0;
  this.process();
};

/**
 * Add colors
 * @param {array} colors Array of hex colors to add.
 */
exp.entity.neural.Processor.prototype.addColors = function(colors) {
  this.colors_ = colors;

  this.params_['patterns'].length = 0;
  for (var i = 0; i < colors.length; i++) {
    this.params_['patterns'].push({
      'html': '<circle r="50" fill="' + colors[i] +
          '" cx="50" cy="50"/>',
      'viewBox': '0 0 100 100'
    });
  }
};

/**
 * Check if the processor is available.
 * @return {boolean} Returns if the processor is available or not.
 */
exp.entity.neural.Processor.prototype.isAvailable = function() {
  return this.processingTicks_ > 0 ? false : true;
};

/**
 * Process data.
 */
exp.entity.neural.Processor.prototype.processData = function() {
  this.processingTicks_ = this.colors_.length;
  exp.sequencer.cancel('processData' + this.id_);
  exp.sequencer.add(
    'processData' + this.id_, .1, this.process, {}, this, null
  );
};

/**
 * Process data.
 */
exp.entity.neural.Processor.prototype.process = function() {
  this.createSlice(true, 0.3);
  --this.processingTicks_;
  if (this.processingTicks_ > 0) {
    exp.sequencer.add(
      'processData' + this.id_, .1, this.process, {}, this, null
    );
  } else {
    this.processingTicks_ = 0;
  }
};

/**
 * Reset processor.
 * @param {boolean} skipBlink If a blink is to be skipped or not.
 */
exp.entity.neural.Processor.prototype.reset = function(skipBlink) {
  this.nextColor_ = this.originalColor_;

  if (!skipBlink) {
    this.blink();
  }
};
