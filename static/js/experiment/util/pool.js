goog.provide('exp.Pool');

goog.require('exp.DoublyLinkedList');

/**
 * A pool of objects.
 * @constructor
 * @param {function} creator Function that creates a type.
 * @param {function} prepare Function that prepare an instance.
 * @param {number=100} poolChunkSize How many items should be preallocated.
 */
exp.Pool = function(creator, prepare, poolChunkSize) {
  this.pool_ = new exp.DoublyLinkedList();
  this.creator_ = creator;
  this.prepare_ = prepare;
  this.poolChunkSize_ = poolChunkSize || 100;
  this.active = true;
};

/**
 * Expand the pool.
 * @param {number} num Number of objects to pre-allocate.
 */
exp.Pool.prototype.preAllocate = function(num) {
  if (!this.active) { return; }

  for (var i = 0; i < num; i++) {
    this.pool_.push(this.creator_());
  }
};

/**
 * Get (or create) an object from the pool.
 * @return {object} The object.
 */
exp.Pool.prototype.allocate = function() {
  if (!this.active) { return; }

  if (this.pool_.isEmpty()) {
    this.preAllocate(this.poolChunkSize_);
  }

  var v = this.pool_.pop();
  this.prepare_.call(this, v, arguments);

  return v;
};

/**
 * Return an object to the pool.
 * @param {object} obj The obj to return.
 */
exp.Pool.prototype.free = function(obj) {
  if (!this.active) { return; }

  this.pool_.push(obj);
};

/**
 * Destroy the pool itself.
 */
exp.Pool.prototype.destroy = function() {
  this.pool_.length = 0;
  this.active = false;
};
