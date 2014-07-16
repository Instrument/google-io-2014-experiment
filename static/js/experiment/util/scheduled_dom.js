/**
 * A wrapper around `goog.dom` which runs in a rAF loop.
 */
goog.provide('exp.dom');
goog.provide('exp.dom.classes');

goog.require('goog.dom');
goog.require('goog.dom.classes');

/**
 * An array of commands to be run in order.
 * @type {array}
 * @private
 */
exp.dom.unprocessedCommands_ = [];

/**
 * Schedule a function to be called on the next frame.
 * @private
 * @param {function} command The function to call.
 * @param {array} args The arguments to the function call.
 */
exp.dom.schedule_ = function(command, args) {
  Array.prototype.unshift.call(args, command);
  exp.dom.unprocessedCommands_.push(args);

  requestAnimationFrame(exp.dom.onFrame_);
};

/**
 * Get the next scheduled command.
 * @private
 * @return {array} The command and its arguments.
 */
exp.dom.nextScheduled_ = function() {
  return exp.dom.unprocessedCommands_.shift();
};

/**
 * On each rAF frame.
 * @private
 */
exp.dom.onFrame_ = function() {
  var instruction;
  var command;

  while (instruction = exp.dom.nextScheduled_()) {
    command = Array.prototype.shift.call(instruction);
    command.apply(null, instruction);
  }
};

/**
 * Wrap appendChild.
 */
exp.dom.appendChild = function() {
  exp.dom.schedule_(goog.dom.appendChild, arguments);
};

/**
 * Wrap removeNode.
 */
exp.dom.removeNode = function() {
  exp.dom.schedule_(goog.dom.removeNode, arguments);
};

/**
 * Wrap setTextContent.
 */
exp.dom.setTextContent = function() {
  exp.dom.schedule_(goog.dom.setTextContent, arguments);
};

/**
 * Wrap classes.add.
 */
exp.dom.classes.add = function() {
  exp.dom.schedule_(goog.dom.classes.add, arguments);
};

/**
 * Wrap classes.remove.
 */
exp.dom.classes.remove = function() {
  exp.dom.schedule_(goog.dom.classes.remove, arguments);
};
