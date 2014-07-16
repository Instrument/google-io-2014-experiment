goog.provide('exp.DoublyLinkedList');

/**
 * A doubly linked list.
 * @constructor
 */
exp.DoublyLinkedList = function() {
  this.head_ = null;
  this.tail_ = null;
  this.count = 0;
};

/**
 * An array of available nodes.
 * @type {array}
 * @private
 */
exp.DoublyLinkedList.nodePool_ = [];

/**
 * The number of created nodes.
 * @type {number}
 * @private
 */
exp.DoublyLinkedList.nodesCreated_ = 0;

/**
 * Get a node from the pool.
 * @private
 * @return {object}
 */
exp.DoublyLinkedList.prototype.getNode_ = function() {
  if (exp.DoublyLinkedList.nodePool_.length) {
    return exp.DoublyLinkedList.nodePool_.pop();
  } else {
    exp.DoublyLinkedList.nodesCreated_++;

    return {
      next: null,
      prev: null,
      obj: null
    };
  }
};

/**
 * Return a node to the pool.
 * @private
 * @param {object} n The node.
 */
exp.DoublyLinkedList.prototype.returnNode_ = function(n) {
  n.next = null;
  n.prev = null;
  n.obj = null;
  exp.DoublyLinkedList.nodePool_.push(n);
};

/**
 * Wrap an object in a node.
 * @private
 * @param {object} objToWrap Incoming object.
 * @return {object}
 */
exp.DoublyLinkedList.prototype.makeNode_ = function(objToWrap) {
  var n = this.getNode_();
  n.obj = objToWrap;
  return n;
};

/**
 * Push a new item onto the end list.
 * @param {object} objToInsert An object to push into the list.
 */
exp.DoublyLinkedList.prototype.push = function(objToInsert) {
  var node = this.makeNode_(objToInsert);

  node.prev = this.tail_;

  if (this.tail_ !== null) {
    this.tail_.next = node;
  }

  this.tail_ = node;
  node.next = null;

  if (this.head_ === null) {
    this.head_ = node;
  }

  this.count++;
};

/**
 * Unshift a new item onto the front the list.
 * @param {object} objToInsert An object to push into the list.
 */
exp.DoublyLinkedList.prototype.unshift = function(objToInsert) {
  var node = this.makeNode_(objToInsert);

  node.next = this.head_;
  if (this.head_ !== null) {
    this.head_.prev = node;
  }
  this.head_ = node;
  node.prev = null;

  if (this.tail_ === null) {
    this.tail_ = node;
  }

  this.count++;
};

/**
 * Is the list empty?
 * @return {boolean} If the list is empty.
 */
exp.DoublyLinkedList.prototype.isEmpty = function() {
  return !this.count;
};

/**
 * Remove the tail item from the list.
 * @return {object} The popped object.
 */
exp.DoublyLinkedList.prototype.pop = function() {
  if (!this.isEmpty()) {
    var currentTail = this.tail_;
    return this.remove(currentTail.obj);
  }
};

/**
 * Remove the head item from the list.
 * @return {object} The shifted object.
 */
exp.DoublyLinkedList.prototype.shift = function() {
  if (!this.isEmpty()) {
    var currentHead = this.head_;
    return this.remove(currentHead.obj);
  }
};

/**
 * Loop over the list.
 * @param {function} iterator The function to call on each item.
 * @param {object} scope The iterator scope.
 */
exp.DoublyLinkedList.prototype.forEach = function(iterator, scope) {
  var current = this.head_;

  var i = 0;
  while (current) {
    iterator.call(scope, current.obj, i++);
    current = current.next;
  }
};

/**
 * Remove an element from the list.
 * @param {object} objectToRemove The target object.
 * @return {object} Removed object.
 */
exp.DoublyLinkedList.prototype.remove = function(objectToRemove) {
  var node;
  var current = this.head_;

  while (!node && current) {
    if (current.obj === objectToRemove) {
      node = current;
    }

    current = current.next;
  }

  if (node) {
    if (node.prev === null) {
      this.head_ = node.next;
    } else {
      node.prev.next = node.next;
    }

    if (node.next === null) {
      this.tail_ = node.prev;
    } else {
      node.next.prev = node.prev;
    }

    this.count--;
    this.returnNode_(node);
  }

  return objectToRemove;
};
