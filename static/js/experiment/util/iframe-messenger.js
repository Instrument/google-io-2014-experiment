goog.provide('exp.util.Messenger');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

/**
 * The Messenger. Communicates back and forth with iframe parent.
 * @constructor
 */
exp.util.Messenger = function() {
  var self = this;

  /**
   * Reference to parent window.
   * @type {Element}
   * @private
   */
  self.parent_ = window.parent;

  // Now that the window is ready, it's ready to listen for messages.
  goog.events.listen(window, 'message', function(message) {
    self.receiveMessage(message.event_);
  }, false);

  goog.base(this);
};
goog.inherits(exp.util.Messenger, goog.events.EventTarget);


/**
 * Send messages to parent.
 * @param {Object} message Message to be sent. Message is stringified.
 */
exp.util.Messenger.prototype.sendMessage = function(message) {

  // Fix for missing window.location.origin in IE.
  if (!window['location']['origin']) {
    window['location']['origin'] = window['location']['protocol'] + '//' +
     window['location']['hostname'] +
     (window['location']['port'] ? ':' + window['location']['port'] : '');
  }

  this.parent_['postMessage'](
    JSON.stringify(message),
    window['location']['origin']);
};


/**
 * Process the message. Delegating tasks based on the given instruction.
 * @param {string} message Instruction string (JSON) with action to take.
 */
exp.util.Messenger.prototype.receiveMessage = function(message) {
  try {
    var instruction = JSON.parse(message['data'] || '{}');
    var e = new goog.events.Event('message', instruction);
    this.dispatchEvent(e);

    if (instruction['action'] === 'pause') {
      exp.manager.disabled = true;
      exp.manager.pauseExp();
    } else if (instruction['action'] === 'unpause') {
      exp.manager.disabled = false;
      exp.manager.unPauseExp();
    } else if (instruction['action'] === 'enter-mobile') {
      exp.ui.chapter.constantlyRecalcSize = true;
      exp.ui.chapter.recalcSizes();
    } else if (instruction['action'] === 'exit-mobile') {
      exp.ui.chapter.constantlyRecalcSize = false;
      exp.ui.chapter.recalcSizes();
    }
  } catch (err) {}
};
