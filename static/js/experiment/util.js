goog.provide('ww.util');

goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.string');

/**
 * Add an event listener which works for mouse and touch events.
 * @param {Element} element The element to watch.
 * @param {Function} callback The method to run on event.
 * @param {Object} scope Scope to call callback in.
 * @param {Boolean} prevent Whether to prevent the default event in Hammer.
 * @return {Function} Unlisten function.
 */
ww.util.onClickish = ww.util.onTap = function onClickish(
                                            element, callback, scope, prevent) {
  var forwarder = function(e) {
    e.preventDefault();
    e.stopPropagation();

    callback.call(scope, e);
  };

  if ((prevent !== false) &&
      ww.util.mouseEventsDetected &&
      !Modernizr['touch']) {
    var listenKey = goog.events.listen(element, 'click', function(e) {
      forwarder(e);
    });

    return function() {
      goog.events.unlistenByKey(listenKey);
    };
  }

  var inst = Hammer(element, { 'prevent_default': (prevent !== false) });

  inst['on']('tap', forwarder);

  return function() {
    if (listenKey) {
      goog.events.unlistenByKey(listenKey);
    }

    inst['off']('tap', forwarder);
  };
};

/**
 * Send an event to Google Analytics
 * @param {String} category Category of the action.
 * @param {String} action Name of the action.
 * @param {Object} value Value of the action.
 */
ww.util.trackEvent = function(category, action, value) {
  if ('undefined' !== typeof ga) {
    ga('send', 'event', category, action, null, value);
  }
};

/**
 * Throttling function will limit callbacks to once every wait window.
 * @param {Function} func Function to throttle.
 * @param {Number} wait Wait window.
 * @return {Function} Throttled function.
 */
ww.util.throttle = function(func, wait) {
  var context, args, timeout, result;
  var previous = 0;
  var later = function() {
    previous = +(new Date());
    timeout = null;
    result = func.apply(context, args);
  };
  return function() {
    var now = +(new Date());
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @param {Function} func Function to throttle.
 * @param {Number} wait Wait window.
 * @param {Boolean} immediate Whether to run immediately.
 * @return {Function} Debounced function.
 */
ww.util.debounce = function(func, wait, immediate) {
  var result;
  var timeout = null;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) result = func.apply(context, args);
    return result;
  };
};

/**
 * Boolean if mouse has been detected.
 */
ww.util.mouseEventsDetected = !Modernizr['touch'];


/**
 * Boolean if listening for first mouse event.
 */
ww.util.listeningForFirstMouseEvent = false;


/**
 * Listens for first mouse event.
 * @param {function} cb Callback function.
 */
ww.util.listenForFirstMouseEvent = function(cb) {
  if (ww.util.listeningForFirstMouseEvent) { return; }

  ww.util.listeningForFirstMouseEvent = true;

  goog.events.listenOnce(document, 'mousemove', function() {
    ww.util.mouseEventsDetected = true;
    ww.util.listeningForFirstMouseEvent = false;

    cb();
  });
};


/**
 * Boolean flag if scrolling.
 */
ww.util.isScrolling = window['isScrolling'] = false;

/**
 * Add a 'hoverable' body class when :hover events should
 * be attached (eg not scrolling or on touch device).
 * @param {string=hoverable} clsName Name of the class to apply.
 */
ww.util.applyBodyClassWhenNotScrolling = function(clsName) {
  clsName = clsName || 'hoverable';

  if (!ww.util.mouseEventsDetected) {
    ww.util.listenForFirstMouseEvent(function() {
      ww.util.applyBodyClassWhenNotScrolling(clsName);
    });
    return;
  }

  goog.dom.classes.add(document.body, clsName);

  var debouncedOnScroll = ww.util.debounce(function() {
    ww.util.isScrolling = window['isScrolling'] = false;
    goog.dom.classes.add(document.body, clsName);
  }, 200);

  goog.events.listen(window, 'scroll', function() {
    if (!ww.util.isScrolling) {
      ww.util.isScrolling = window['isScrolling'] = true;
      goog.dom.classes.remove(document.body, clsName);
    }

    debouncedOnScroll();
  });
};

/**
 * Cross-browser mouseenter event.
 * @param {Element} elem Element to watch.
 * @param {Function} cb Event callback.
 * @return {String} Event UID.
 */
ww.util.onMouseEnter = function(elem, cb) {
  var eventKey;

  if ('onmouseenter' in document.documentElement) {
    eventKey = goog.events.listen(elem, 'mouseenter', cb);
  } else {
    eventKey = goog.events.listen(elem, 'mouseover', function(e) {
      if (!e.relatedTarget || (e.relatedTarget !== this &&
          !(this.compareDocumentPosition(e.relatedTarget) &
            Node.DOCUMENT_POSITION_CONTAINED_BY))) {
        cb(e);
      }
    });
  }

  return eventKey;
};

/**
 * Cross-browser mouseleave event.
 * @param {Element} elem Element to watch.
 * @param {Function} cb Event callback.
 * @return {String} Event UID.
 */
ww.util.onMouseLeave = function(elem, cb) {
  var eventKey;

  if ('onmouseleave' in document.documentElement) {
    eventKey = goog.events.listen(elem, 'mouseleave', cb);
  } else {
    eventKey = goog.events.listen(elem, 'mouseout', function(e) {
      if (!e.relatedTarget || (e.relatedTarget !== this &&
        !(this.compareDocumentPosition(e.relatedTarget) &
          Node.DOCUMENT_POSITION_CONTAINED_BY))) {
        cb(e);
      }
    });
  }

  return eventKey;
};

/**
 * Add &nbsp; in between last 2 words on certain tags.
 * @param {Array} elems Array of elements.
 */
ww.util.avoidOrphans = function(elems) {
  goog.array.forEach(elems, function(elem) {
    var words = goog.string.trim(elem.textContent ||
                                 elem.innerText || '').split(' ');

    if (words.length < 3) {
      return;
    }

    var lastWord = words.pop();
    var previousWords = words.join('');

    if (lastWord.length > previousWords.length) {
      return;
    }

    var last = elem.lastChild;

    if (last && (last.nodeType == 3)) {
     last.nodeValue = last.nodeValue.replace(/\s+([^\s]+\s*)$/g, '\xA0$1');
    }
  });
};

/**
 * Create a CORS request with IE8-9 polyfill.
 * @param {String} method The HTTP request method.
 * @param {String} url The URL to request.
 * @return {Object} The XHR object.
 */
ww.util.createCORSRequest = function(method, url) {
  var xhr = new XMLHttpRequest();

  // Check if the XMLHttpRequest object has a "withCredentials" property.
  // "withCredentials" only exists on XMLHTTPRequest2 objects.
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != 'undefined') {
    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making
    // CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

    // Empty callbacks are required to make this work in IE9 :(
    xhr.onerror = function() {};
    xhr.ontimeout = function() {};
    xhr.onprogress = function() {};
  } else {
    // Otherwise, CORS is not supported by the browser.
    xhr = null;
  }

  return xhr;
};

/**
 * Localstorage-backed cache.
 * @type {Storage|Object}
 */
ww.util.cacheStore = Modernizr['localstorage'] ? localStorage : {};

/**
 * Set a cache value by path.
 * @param {string} path The path.
 * @param {Object} value The value.
 */
ww.util.cacheSet = function(path, value) {
  ww.util.cacheStore[path] = value;
};

/**
 * Delete a cache value by path.
 * @param {string} path The path.
 */
ww.util.cacheDelete = function(path) {
  delete ww.util.cacheStore[path];
};

/**
 * Get a cache value by path.
 * @param {string} path The path.
 * @return {Object}
 */
ww.util.cacheGet = function(path) {
  return ww.util.cacheStore[path];
};

/**
 * Cache a pure (no side-effects, no scope) function.
 * @param {function} f The function.
 * @param {string} name The name of the function.
 * @param {?number} timeout How long to keep the cache.
 * @return {function} The cached function.
 */
ww.util.cachePureFunction = function(f, name, timeout) {
  var cachePrefix = 'cacheFunction';

  return function cachePureFunctionExecute_() {
    var argsHash = arguments.length > 0 ?
        JSON.stringify(arguments) :
        'noargs';
    var key = cachePrefix + '.' + name + '.' + argsHash;
    var timeoutKey = cachePrefix + '.' + name + '.timeouts.' + argsHash;

    var now = +(new Date());
    if (timeout) {
      var setupTime = ww.util.cacheGet(timeoutKey);
      if (!setupTime || ((now - setupTime) >= timeout)) {
        ww.util.cacheDelete(timeoutKey);
        ww.util.cacheDelete(key);
      }
    }

    var result = ww.util.cacheGet(key);

    if (!result) {
      result = f.apply(null, arguments);
      ww.util.cacheSet(key, JSON.stringify(result));
      if (timeout) {
        ww.util.cacheSet(timeoutKey, now);
      }
    } else {
      result = result === 'undefined' ? undefined : JSON.parse(result);
    }

    return result;
  };
};

// Recursive comparison function for `isEqual`.
function eq(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  if (a === b) {
    return a !== 0 || 1 / a == 1 / b;
  }

  // A strict comparison is necessary because `null == undefined`.
  if (a == null || b == null) {
    return a === b;
  }

  // Compare `[[Class]]` names.
  var className = a.toString();
  if (className != b.toString()) {
    return false;
  }
  switch (className) {
    // Strings, numbers, dates, and booleans are compared by value.
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent;
      // thus, `"5"` is
      // equivalent to `new String("5")`.
      return a == String(b);
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is
      // performed for
      // other numeric values.
      return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are
      // compared by their
      // millisecond representations. Note that invalid dates with millisecond
      // representations
      // of `NaN` are not equivalent.
      return +a == +b;
    // RegExps are compared by their source patterns and flags.
    case '[object RegExp]':
      return a.source == b.source &&
             a.global == b.global &&
             a.multiline == b.multiline &&
             a.ignoreCase == b.ignoreCase;
  }

  if (typeof a != 'object' || typeof b != 'object') {
    return false;
  }

  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] == a) {
      return bStack[length] == b;
    }
  }

  // Objects with different constructors are not equivalent, but `Object`s
  // from different frames are.
  var aCtor = a.constructor, bCtor = b.constructor;
  if (aCtor !== bCtor && !(isFunction(aCtor) && (aCtor instanceof aCtor) &&
                           isFunction(bCtor) && (bCtor instanceof bCtor)) &&
      ('constructor' in a && 'constructor' in b)) {
    return false;
  }

  // Add the first object to the stack of traversed objects.
  aStack.push(a);
  bStack.push(b);

  var size = 0, result = true;
  // Recursively compare objects and arrays.
  if (className == '[object Array]') {
    // Compare array lengths to determine if a deep comparison is necessary.
    size = a.length;
    result = size == b.length;
    if (result) {
      // Deep compare the contents, ignoring non-numeric properties.
      while (size--) {
        if (!(result = eq(a[size], b[size], aStack, bStack))) {
          break;
        }
      }
    }
  } else {
    // Deep compare objects.
    for (var key in a) {
      if (has(a, key)) {
        // Count the expected number of properties.
        size++;
        // Deep compare each member.
        if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack))) {
          break;
        }
      }
    }
    // Ensure that both objects contain the same number of properties.
    if (result) {
      for (key in b) {
        if (has(b, key) && !(size--)) {
          break;
        }
      }
      result = !size;
    }
  }

  // Remove the first object from the stack of traversed objects.
  aStack.pop();
  bStack.pop();

  return result;
}

function isFunction(obj) {
  return typeof obj === 'function';
}

function has(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if two objects are deeply equal.
 * @param {object} a The first object.
 * @param {object} b The second object.
 * @return {boolean}
 */
ww.util.equals = function(a, b) {
  return eq(a, b, [], []);
};
