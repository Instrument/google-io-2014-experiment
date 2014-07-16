goog.provide('exp.Sequencer');

/**
 * Sequence actions along a timeline.
 * @constructor
 */
exp.Sequencer = function() {
};

/**
 * Add a callback to the sequence.
 * @param {string} name The name of the action.
 * @param {number} time The time to wait.
 * @param {function} func The callback.
 * @param {array} params Arguments for the callback.
 * @param {object} scope The scope to execute the callback in.
 * @param {number} tags A list of tags.
 */
exp.Sequencer.prototype.add = function(name, time, func, params, scope, tags) {
  if (!this.sequences_) {
    this.sequences_ = {};
  }

  if (!this.sequences_[name]) {
    this.sequences_[name] = {
      time: exp.manager.now() + time,
      func: goog.bind(func, scope),
      params: params,
      'tags': tags
    };
  }
};

/**
 * Cancel a callback.
 * @param {string} name The name of the callback.
 */
exp.Sequencer.prototype.cancel = function(name) {
  delete this.sequences_[name];
};

/**
 * Cancel all callbacks with the given tags.
 * @param {number} tag Tag to check.
 */
exp.Sequencer.prototype.cancelAllTagged = function(tag) {
  for (name in this.sequences_) {
    if ((this.sequences_[name].tags & tag) !== 0) {
      delete this.sequences_[name];
    }
  }
};

/**
 * Tick the sequence.
 * @param {number} delta The time delta.
 * @param {number} now The current time.
 */
exp.Sequencer.prototype.tick = function(delta, now) {
  for (name in this.sequences_) {
    if (this.sequences_[name].time < now) {
      var func = this.sequences_[name].func;
      var params = this.sequences_[name].params;
      delete this.sequences_[name];
      func(params);
    }
  }
};
