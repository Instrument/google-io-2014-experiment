goog.provide('exp.DOMPool');

goog.require('exp.Pool');
goog.require('exp.dom');
goog.require('goog.dom');

/**
 * A Vector3 specific pool.
 * @constructor
 * @param {Element} container The container of DOM elements.
 */
exp.DOMPool = function(container) {
  this.container_ = container;

  var self = this;

  goog.base(
    this,
    this.initializeElement,
    this.prepareElement,
    this.cleanupElement,
    1
  );
};
goog.inherits(exp.DOMPool, exp.Pool);

/**
 * Initialize and element.
 * @param {Element} e An element to be initialized.
 * @return {Element} The container element for the newly inited element.
 */
exp.DOMPool.prototype.initializeElement = function(e) {
  var div = goog.dom.createElement('div');

  this.hideElement(div);

  exp.dom.appendChild(this.container_, div);

  return div;
};

/**
 * Hide an element.
 * @param {Element} e An element to hide.
 */
exp.DOMPool.prototype.hideElement = function(e) {
  e.style.visibility = 'hidden';
};

/**
 * Prepare an element for something.
 * @param {Element} e An element.
 */
exp.DOMPool.prototype.prepareElement = function(e) {
};

/**
 * Clean up an element.
 * @param {Element} e An element to be cleaned up.
 */
exp.DOMPool.prototype.cleanupElement = function(e) {
  this.hideElement(e);
};
