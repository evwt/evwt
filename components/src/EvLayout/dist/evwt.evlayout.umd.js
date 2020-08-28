(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.evwt = global.evwt || {}, global.evwt.evlayout = {})));
}(this, (function (exports) { 'use strict';

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  var _listCacheClear = listCacheClear;

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  var eq_1 = eq;

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq_1(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  var _assocIndexOf = assocIndexOf;

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  var _listCacheDelete = listCacheDelete;

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  var _listCacheGet = listCacheGet;

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return _assocIndexOf(this.__data__, key) > -1;
  }

  var _listCacheHas = listCacheHas;

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  var _listCacheSet = listCacheSet;

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = _listCacheClear;
  ListCache.prototype['delete'] = _listCacheDelete;
  ListCache.prototype.get = _listCacheGet;
  ListCache.prototype.has = _listCacheHas;
  ListCache.prototype.set = _listCacheSet;

  var _ListCache = ListCache;

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = new _ListCache;
    this.size = 0;
  }

  var _stackClear = stackClear;

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  var _stackDelete = stackDelete;

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    return this.__data__.get(key);
  }

  var _stackGet = stackGet;

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    return this.__data__.has(key);
  }

  var _stackHas = stackHas;

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global$1 == 'object' && global$1 && global$1.Object === Object && global$1;

  module.exports = freeGlobal;

  var _freeGlobal = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = _freeGlobal || freeSelf || Function('return this')();

  var _root = root;

  /** Built-in value references. */
  var Symbol = _root.Symbol;

  var _Symbol = Symbol;

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Built-in value references. */
  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  var _getRawTag = getRawTag;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  var _objectToString = objectToString;

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag$1 && symToStringTag$1 in Object(value))
      ? _getRawTag(value)
      : _objectToString(value);
  }

  var _baseGetTag = baseGetTag;

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1 = isObject;

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject_1(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = _baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  var isFunction_1 = isFunction;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = _root['__core-js_shared__'];

  var _coreJsData = coreJsData;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  var _isMasked = isMasked;

  /** Used for built-in method references. */
  var funcProto = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  var _toSource = toSource;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype,
      objectProto$2 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject_1(value) || _isMasked(value)) {
      return false;
    }
    var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
    return pattern.test(_toSource(value));
  }

  var _baseIsNative = baseIsNative;

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  var _getValue = getValue;

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = _getValue(object, key);
    return _baseIsNative(value) ? value : undefined;
  }

  var _getNative = getNative;

  /* Built-in method references that are verified to be native. */
  var Map = _getNative(_root, 'Map');

  var _Map = Map;

  /* Built-in method references that are verified to be native. */
  var nativeCreate = _getNative(Object, 'create');

  var _nativeCreate = nativeCreate;

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
    this.size = 0;
  }

  var _hashClear = hashClear;

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  var _hashDelete = hashDelete;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (_nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
  }

  var _hashGet = hashGet;

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);
  }

  var _hashHas = hashHas;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
    return this;
  }

  var _hashSet = hashSet;

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = _hashClear;
  Hash.prototype['delete'] = _hashDelete;
  Hash.prototype.get = _hashGet;
  Hash.prototype.has = _hashHas;
  Hash.prototype.set = _hashSet;

  var _Hash = Hash;

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new _Hash,
      'map': new (_Map || _ListCache),
      'string': new _Hash
    };
  }

  var _mapCacheClear = mapCacheClear;

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  var _isKeyable = isKeyable;

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return _isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  var _getMapData = getMapData;

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    var result = _getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  var _mapCacheDelete = mapCacheDelete;

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return _getMapData(this, key).get(key);
  }

  var _mapCacheGet = mapCacheGet;

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return _getMapData(this, key).has(key);
  }

  var _mapCacheHas = mapCacheHas;

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    var data = _getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  var _mapCacheSet = mapCacheSet;

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = _mapCacheClear;
  MapCache.prototype['delete'] = _mapCacheDelete;
  MapCache.prototype.get = _mapCacheGet;
  MapCache.prototype.has = _mapCacheHas;
  MapCache.prototype.set = _mapCacheSet;

  var _MapCache = MapCache;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof _ListCache) {
      var pairs = data.__data__;
      if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new _MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  var _stackSet = stackSet;

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack(entries) {
    var data = this.__data__ = new _ListCache(entries);
    this.size = data.size;
  }

  // Add methods to `Stack`.
  Stack.prototype.clear = _stackClear;
  Stack.prototype['delete'] = _stackDelete;
  Stack.prototype.get = _stackGet;
  Stack.prototype.has = _stackHas;
  Stack.prototype.set = _stackSet;

  var _Stack = Stack;

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  var _arrayEach = arrayEach;

  var defineProperty = (function() {
    try {
      var func = _getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  var _defineProperty = defineProperty;

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && _defineProperty) {
      _defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  var _baseAssignValue = baseAssignValue;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$4.call(object, key) && eq_1(objValue, value)) ||
        (value === undefined && !(key in object))) {
      _baseAssignValue(object, key, value);
    }
  }

  var _assignValue = assignValue;

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        _baseAssignValue(object, key, newValue);
      } else {
        _assignValue(object, key, newValue);
      }
    }
    return object;
  }

  var _copyObject = copyObject;

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  var _baseTimes = baseTimes;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  var isObjectLike_1 = isObjectLike;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
  }

  var _baseIsArguments = baseIsArguments;

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
    return isObjectLike_1(value) && hasOwnProperty$5.call(value, 'callee') &&
      !propertyIsEnumerable.call(value, 'callee');
  };

  var isArguments_1 = isArguments;

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  var isArray_1 = isArray;

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  	  path: basedir,
  	  exports: {},
  	  require: function (path, base) {
        return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
      }
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  var stubFalse_1 = stubFalse;

  var isBuffer_1 = createCommonjsModule(function (module, exports) {
  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Built-in value references. */
  var Buffer = moduleExports ? _root.Buffer : undefined;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse_1;

  module.exports = isBuffer;
  });

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  var _isIndex = isIndex;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
  }

  var isLength_1 = isLength;

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike_1(value) &&
      isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
  }

  var _baseIsTypedArray = baseIsTypedArray;

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  var _baseUnary = baseUnary;

  var _nodeUtil = createCommonjsModule(function (module, exports) {
  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports && _freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule && freeModule.require && freeModule.require('util').types;

      if (types) {
        return types;
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  module.exports = nodeUtil;
  });

  /* Node.js helper references. */
  var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

  var isTypedArray_1 = isTypedArray;

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray_1(value),
        isArg = !isArr && isArguments_1(value),
        isBuff = !isArr && !isArg && isBuffer_1(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? _baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$6.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             _isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  var _arrayLikeKeys = arrayLikeKeys;

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

    return value === proto;
  }

  var _isPrototype = isPrototype;

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  var _overArg = overArg;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = _overArg(Object.keys, Object);

  var _nativeKeys = nativeKeys;

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!_isPrototype(object)) {
      return _nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeys = baseKeys;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength_1(value.length) && !isFunction_1(value);
  }

  var isArrayLike_1 = isArrayLike;

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
  }

  var keys_1 = keys;

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return object && _copyObject(source, keys_1(source), object);
  }

  var _baseAssign = baseAssign;

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  var _nativeKeysIn = nativeKeysIn;

  /** Used for built-in method references. */
  var objectProto$a = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject_1(object)) {
      return _nativeKeysIn(object);
    }
    var isProto = _isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$8.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeysIn = baseKeysIn;

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
  }

  var keysIn_1 = keysIn;

  /**
   * The base implementation of `_.assignIn` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssignIn(object, source) {
    return object && _copyObject(source, keysIn_1(source), object);
  }

  var _baseAssignIn = baseAssignIn;

  var _cloneBuffer = createCommonjsModule(function (module, exports) {
  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Built-in value references. */
  var Buffer = moduleExports ? _root.Buffer : undefined,
      allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

  /**
   * Creates a clone of  `buffer`.
   *
   * @private
   * @param {Buffer} buffer The buffer to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Buffer} Returns the cloned buffer.
   */
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length,
        result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

    buffer.copy(result);
    return result;
  }

  module.exports = cloneBuffer;
  });

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  var _copyArray = copyArray;

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  var _arrayFilter = arrayFilter;

  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */
  function stubArray() {
    return [];
  }

  var stubArray_1 = stubArray;

  /** Used for built-in method references. */
  var objectProto$b = Object.prototype;

  /** Built-in value references. */
  var propertyIsEnumerable$1 = objectProto$b.propertyIsEnumerable;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return _arrayFilter(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable$1.call(object, symbol);
    });
  };

  var _getSymbols = getSymbols;

  /**
   * Copies own symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols(source, object) {
    return _copyObject(source, _getSymbols(source), object);
  }

  var _copySymbols = copySymbols;

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  var _arrayPush = arrayPush;

  /** Built-in value references. */
  var getPrototype = _overArg(Object.getPrototypeOf, Object);

  var _getPrototype = getPrototype;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own and inherited enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
    var result = [];
    while (object) {
      _arrayPush(result, _getSymbols(object));
      object = _getPrototype(object);
    }
    return result;
  };

  var _getSymbolsIn = getSymbolsIn;

  /**
   * Copies own and inherited symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbolsIn(source, object) {
    return _copyObject(source, _getSymbolsIn(source), object);
  }

  var _copySymbolsIn = copySymbolsIn;

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
  }

  var _baseGetAllKeys = baseGetAllKeys;

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys(object) {
    return _baseGetAllKeys(object, keys_1, _getSymbols);
  }

  var _getAllKeys = getAllKeys;

  /**
   * Creates an array of own and inherited enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeysIn(object) {
    return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
  }

  var _getAllKeysIn = getAllKeysIn;

  /* Built-in method references that are verified to be native. */
  var DataView = _getNative(_root, 'DataView');

  var _DataView = DataView;

  /* Built-in method references that are verified to be native. */
  var Promise = _getNative(_root, 'Promise');

  var _Promise = Promise;

  /* Built-in method references that are verified to be native. */
  var Set$1 = _getNative(_root, 'Set');

  var _Set = Set$1;

  /* Built-in method references that are verified to be native. */
  var WeakMap = _getNative(_root, 'WeakMap');

  var _WeakMap = WeakMap;

  /** `Object#toString` result references. */
  var mapTag$1 = '[object Map]',
      objectTag$1 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$1 = '[object Set]',
      weakMapTag$1 = '[object WeakMap]';

  var dataViewTag$1 = '[object DataView]';

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = _toSource(_DataView),
      mapCtorString = _toSource(_Map),
      promiseCtorString = _toSource(_Promise),
      setCtorString = _toSource(_Set),
      weakMapCtorString = _toSource(_WeakMap);

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag = _baseGetTag;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
      (_Map && getTag(new _Map) != mapTag$1) ||
      (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
      (_Set && getTag(new _Set) != setTag$1) ||
      (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
    getTag = function(value) {
      var result = _baseGetTag(value),
          Ctor = result == objectTag$1 ? value.constructor : undefined,
          ctorString = Ctor ? _toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag$1;
          case mapCtorString: return mapTag$1;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag$1;
          case weakMapCtorString: return weakMapTag$1;
        }
      }
      return result;
    };
  }

  var _getTag = getTag;

  /** Used for built-in method references. */
  var objectProto$c = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$c.hasOwnProperty;

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray(array) {
    var length = array.length,
        result = new array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty$9.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  var _initCloneArray = initCloneArray;

  /** Built-in value references. */
  var Uint8Array = _root.Uint8Array;

  var _Uint8Array = Uint8Array;

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
    return result;
  }

  var _cloneArrayBuffer = cloneArrayBuffer;

  /**
   * Creates a clone of `dataView`.
   *
   * @private
   * @param {Object} dataView The data view to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned data view.
   */
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }

  var _cloneDataView = cloneDataView;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  var _cloneRegExp = cloneRegExp;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = _Symbol ? _Symbol.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }

  var _cloneSymbol = cloneSymbol;

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  var _cloneTypedArray = cloneTypedArray;

  /** `Object#toString` result references. */
  var boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      mapTag$2 = '[object Map]',
      numberTag$1 = '[object Number]',
      regexpTag$1 = '[object RegExp]',
      setTag$2 = '[object Set]',
      stringTag$1 = '[object String]',
      symbolTag = '[object Symbol]';

  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$2 = '[object DataView]',
      float32Tag$1 = '[object Float32Array]',
      float64Tag$1 = '[object Float64Array]',
      int8Tag$1 = '[object Int8Array]',
      int16Tag$1 = '[object Int16Array]',
      int32Tag$1 = '[object Int32Array]',
      uint8Tag$1 = '[object Uint8Array]',
      uint8ClampedTag$1 = '[object Uint8ClampedArray]',
      uint16Tag$1 = '[object Uint16Array]',
      uint32Tag$1 = '[object Uint32Array]';

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag$1:
        return _cloneArrayBuffer(object);

      case boolTag$1:
      case dateTag$1:
        return new Ctor(+object);

      case dataViewTag$2:
        return _cloneDataView(object, isDeep);

      case float32Tag$1: case float64Tag$1:
      case int8Tag$1: case int16Tag$1: case int32Tag$1:
      case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
        return _cloneTypedArray(object, isDeep);

      case mapTag$2:
        return new Ctor;

      case numberTag$1:
      case stringTag$1:
        return new Ctor(object);

      case regexpTag$1:
        return _cloneRegExp(object);

      case setTag$2:
        return new Ctor;

      case symbolTag:
        return _cloneSymbol(object);
    }
  }

  var _initCloneByTag = initCloneByTag;

  /** Built-in value references. */
  var objectCreate = Object.create;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} proto The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate = (function() {
    function object() {}
    return function(proto) {
      if (!isObject_1(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }());

  var _baseCreate = baseCreate;

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !_isPrototype(object))
      ? _baseCreate(_getPrototype(object))
      : {};
  }

  var _initCloneObject = initCloneObject;

  /** `Object#toString` result references. */
  var mapTag$3 = '[object Map]';

  /**
   * The base implementation of `_.isMap` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   */
  function baseIsMap(value) {
    return isObjectLike_1(value) && _getTag(value) == mapTag$3;
  }

  var _baseIsMap = baseIsMap;

  /* Node.js helper references. */
  var nodeIsMap = _nodeUtil && _nodeUtil.isMap;

  /**
   * Checks if `value` is classified as a `Map` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   * @example
   *
   * _.isMap(new Map);
   * // => true
   *
   * _.isMap(new WeakMap);
   * // => false
   */
  var isMap = nodeIsMap ? _baseUnary(nodeIsMap) : _baseIsMap;

  var isMap_1 = isMap;

  /** `Object#toString` result references. */
  var setTag$3 = '[object Set]';

  /**
   * The base implementation of `_.isSet` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   */
  function baseIsSet(value) {
    return isObjectLike_1(value) && _getTag(value) == setTag$3;
  }

  var _baseIsSet = baseIsSet;

  /* Node.js helper references. */
  var nodeIsSet = _nodeUtil && _nodeUtil.isSet;

  /**
   * Checks if `value` is classified as a `Set` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   * @example
   *
   * _.isSet(new Set);
   * // => true
   *
   * _.isSet(new WeakSet);
   * // => false
   */
  var isSet = nodeIsSet ? _baseUnary(nodeIsSet) : _baseIsSet;

  var isSet_1 = isSet;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;

  /** `Object#toString` result references. */
  var argsTag$2 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      boolTag$2 = '[object Boolean]',
      dateTag$2 = '[object Date]',
      errorTag$1 = '[object Error]',
      funcTag$2 = '[object Function]',
      genTag$1 = '[object GeneratorFunction]',
      mapTag$4 = '[object Map]',
      numberTag$2 = '[object Number]',
      objectTag$2 = '[object Object]',
      regexpTag$2 = '[object RegExp]',
      setTag$4 = '[object Set]',
      stringTag$2 = '[object String]',
      symbolTag$1 = '[object Symbol]',
      weakMapTag$2 = '[object WeakMap]';

  var arrayBufferTag$2 = '[object ArrayBuffer]',
      dataViewTag$3 = '[object DataView]',
      float32Tag$2 = '[object Float32Array]',
      float64Tag$2 = '[object Float64Array]',
      int8Tag$2 = '[object Int8Array]',
      int16Tag$2 = '[object Int16Array]',
      int32Tag$2 = '[object Int32Array]',
      uint8Tag$2 = '[object Uint8Array]',
      uint8ClampedTag$2 = '[object Uint8ClampedArray]',
      uint16Tag$2 = '[object Uint16Array]',
      uint32Tag$2 = '[object Uint32Array]';

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] =
  cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] =
  cloneableTags[boolTag$2] = cloneableTags[dateTag$2] =
  cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
  cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
  cloneableTags[int32Tag$2] = cloneableTags[mapTag$4] =
  cloneableTags[numberTag$2] = cloneableTags[objectTag$2] =
  cloneableTags[regexpTag$2] = cloneableTags[setTag$4] =
  cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] =
  cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
  cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
  cloneableTags[errorTag$1] = cloneableTags[funcTag$2] =
  cloneableTags[weakMapTag$2] = false;

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Deep clone
   *  2 - Flatten inherited properties
   *  4 - Clone symbols
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG;

    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject_1(value)) {
      return value;
    }
    var isArr = isArray_1(value);
    if (isArr) {
      result = _initCloneArray(value);
      if (!isDeep) {
        return _copyArray(value, result);
      }
    } else {
      var tag = _getTag(value),
          isFunc = tag == funcTag$2 || tag == genTag$1;

      if (isBuffer_1(value)) {
        return _cloneBuffer(value, isDeep);
      }
      if (tag == objectTag$2 || tag == argsTag$2 || (isFunc && !object)) {
        result = (isFlat || isFunc) ? {} : _initCloneObject(value);
        if (!isDeep) {
          return isFlat
            ? _copySymbolsIn(value, _baseAssignIn(result, value))
            : _copySymbols(value, _baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = _initCloneByTag(value, tag, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new _Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    if (isSet_1(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap_1(value)) {
      value.forEach(function(subValue, key) {
        result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
    }

    var keysFunc = isFull
      ? (isFlat ? _getAllKeysIn : _getAllKeys)
      : (isFlat ? keysIn_1 : keys_1);

    var props = isArr ? undefined : keysFunc(value);
    _arrayEach(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }

  var _baseClone = baseClone;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG$1 = 1,
      CLONE_SYMBOLS_FLAG$1 = 4;

  /**
   * This method is like `_.clone` except that it recursively clones `value`.
   *
   * @static
   * @memberOf _
   * @since 1.0.0
   * @category Lang
   * @param {*} value The value to recursively clone.
   * @returns {*} Returns the deep cloned value.
   * @see _.clone
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var deep = _.cloneDeep(objects);
   * console.log(deep[0] === objects[0]);
   * // => false
   */
  function cloneDeep(value) {
    return _baseClone(value, CLONE_DEEP_FLAG$1 | CLONE_SYMBOLS_FLAG$1);
  }

  var cloneDeep_1 = cloneDeep;

  const numeric = (value, unit) => Number(value.slice(0, -1 * unit.length));

  const parseValue = value => {
    if (value.endsWith('px')) { return { value, type: 'px', numeric: numeric(value, 'px') }; }
    if (value.endsWith('fr')) { return { value, type: 'fr', numeric: numeric(value, 'fr') }; }
    if (value.endsWith('%')) { return { value, type: '%', numeric: numeric(value, '%') }; }
    if (value === 'auto') return { value, type: 'auto' };
    return null;
  };

  const parse = rule => rule.split(' ').map(parseValue);

  const getSizeAtTrack = (index, tracks, gap = 0, end = false) => {
    const newIndex = end ? index + 1 : index;
    const trackSum = tracks
      .slice(0, newIndex)
      .reduce((accum, value) => accum + value.numeric, 0);
    const gapSum = gap ? index * gap : 0;

    return trackSum + gapSum;
  };

  const getStyles = (rule, ownRules, matchedRules) =>
      [...ownRules, ...matchedRules]
          .map(r => r.style[rule])
          .filter(style => style !== undefined && style !== '');

  const getGapValue = (unit, size) => {
      if (size.endsWith(unit)) {
          return Number(size.slice(0, -1 * unit.length))
      }
      return null
  };

  const firstNonZero = tracks => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < tracks.length; i++) {
          if (tracks[i].numeric > 0) {
              return i
          }
      }
      return null
  };

  const NOOP = () => false;

  const defaultWriteStyle = (element, gridTemplateProp, style) => {
      // eslint-disable-next-line no-param-reassign
      element.style[gridTemplateProp] = style;
  };

  const getOption = (options, propName, def) => {
      const value = options[propName];
      if (value !== undefined) {
          return value
      }
      return def
  };

  var getMatchedCSSRules = el =>
      []
          .concat(
              ...Array.from(el.ownerDocument.styleSheets).map(s => {
                  let rules = [];

                  try {
                      rules = Array.from(s.cssRules || []);
                  } catch (e) {
                      // Ignore results on security error
                  }

                  return rules
              }),
          )
          .filter(r => {
              let matches = false;
              try {
                  matches = el.matches(r.selectorText);
              } catch (e) {
                  // Ignore matching erros
              }

              return matches
          });

  const gridTemplatePropColumns = 'grid-template-columns';
  const gridTemplatePropRows = 'grid-template-rows';

  class Gutter {
    constructor(direction, options, parentOptions) {
      this.direction = direction;
      this.element = options.element;
      this.track = options.track;

      if (direction === 'column') {
        this.gridTemplateProp = gridTemplatePropColumns;
        this.gridGapProp = 'grid-column-gap';
        this.cursor = getOption(
          parentOptions,
          'columnCursor',
          getOption(parentOptions, 'cursor', 'col-resize'),
        );
        this.snapOffset = getOption(
          parentOptions,
          'columnSnapOffset',
          getOption(parentOptions, 'snapOffset', 30),
        );
        this.dragInterval = getOption(
          parentOptions,
          'columnDragInterval',
          getOption(parentOptions, 'dragInterval', 1),
        );
        this.clientAxis = 'clientX';
        this.optionStyle = getOption(parentOptions, 'gridTemplateColumns');
      } else if (direction === 'row') {
        this.gridTemplateProp = gridTemplatePropRows;
        this.gridGapProp = 'grid-row-gap';
        this.cursor = getOption(
          parentOptions,
          'rowCursor',
          getOption(parentOptions, 'cursor', 'row-resize'),
        );
        this.snapOffset = getOption(
          parentOptions,
          'rowSnapOffset',
          getOption(parentOptions, 'snapOffset', 30),
        );
        this.dragInterval = getOption(
          parentOptions,
          'rowDragInterval',
          getOption(parentOptions, 'dragInterval', 1),
        );
        this.clientAxis = 'clientY';
        this.optionStyle = getOption(parentOptions, 'gridTemplateRows');
      }

      this.onDragStart = getOption(parentOptions, 'onDragStart', NOOP);
      this.onDragEnd = getOption(parentOptions, 'onDragEnd', NOOP);
      this.onDrag = getOption(parentOptions, 'onDrag', NOOP);
      this.writeStyle = getOption(
        parentOptions,
        'writeStyle',
        defaultWriteStyle,
      );

      this.startDragging = this.startDragging.bind(this);
      this.stopDragging = this.stopDragging.bind(this);
      this.drag = this.drag.bind(this);
      this.dblClick = this.dblClick.bind(this);

      this.minSizeStart = options.minSizeStart;
      this.minSizeEnd = options.minSizeEnd;

      if (options.element) {
        this.element.addEventListener('dblclick', this.dblClick);
        this.element.addEventListener('mousedown', this.startDragging);
        this.element.addEventListener('touchstart', this.startDragging);
      }
    }

    getDimensions() {
      const {
        width,
        height,
        top,
        bottom,
        left,
        right
      } = this.grid.getBoundingClientRect();

      if (this.direction === 'column') {
        this.start = top;
        this.end = bottom;
        this.size = height;
      } else if (this.direction === 'row') {
        this.start = left;
        this.end = right;
        this.size = width;
      }
    }

    getSizeAtTrack(track, end) {
      return getSizeAtTrack(
        track,
        this.computedPixels,
        this.computedGapPixels,
        end,
      );
    }

    getSizeOfTrack(track) {
      return this.computedPixels[track].numeric;
    }

    getRawTracks() {
      const tracks = getStyles(
        this.gridTemplateProp,
        [this.grid],
        getMatchedCSSRules(this.grid),
      );
      if (!tracks.length) {
        if (this.optionStyle) return this.optionStyle;

        throw Error('Unable to determine grid template tracks from styles.');
      }
      return tracks[0];
    }

    getGap() {
      const gap = getStyles(
        this.gridGapProp,
        [this.grid],
        getMatchedCSSRules(this.grid),
      );
      if (!gap.length) {
        return null;
      }
      return gap[0];
    }

    getRawComputedTracks() {
      return window.getComputedStyle(this.grid)[this.gridTemplateProp];
    }

    getRawComputedGap() {
      return window.getComputedStyle(this.grid)[this.gridGapProp];
    }

    setTracks(raw) {
      this.tracks = raw.split(' ');
      this.trackValues = parse(raw);
    }

    setComputedTracks(raw) {
      this.computedTracks = raw.split(' ');
      this.computedPixels = parse(raw);
    }

    setGap(raw) {
      this.gap = raw;
    }

    setComputedGap(raw) {
      this.computedGap = raw;
      this.computedGapPixels = getGapValue('px', this.computedGap) || 0;
    }

    getMousePosition(e) {
      if ('touches' in e) return e.touches[0][this.clientAxis];
      return e[this.clientAxis];
    }

    dblClick() {
      this.element.dispatchEvent(new Event('doubleclick'));
    }

    startDragging(e) {
      if ('button' in e && e.button !== 0) {
        return;
      }

      // Don't actually drag the element. We emulate that in the drag function.
      e.preventDefault();

      if (this.element) {
        this.grid = this.element.parentNode;
      } else {
        this.grid = e.target.parentNode;
      }

      this.getDimensions();
      this.setTracks(this.getRawTracks());
      this.setComputedTracks(this.getRawComputedTracks());
      this.setGap(this.getGap());
      this.setComputedGap(this.getRawComputedGap());

      const trackPercentage = this.trackValues.filter(
        track => track.type === '%',
      );
      const trackFr = this.trackValues.filter(track => track.type === 'fr');

      this.totalFrs = trackFr.length;

      if (this.totalFrs) {
        const track = firstNonZero(trackFr);

        if (track !== null) {
          this.frToPixels = this.computedPixels[track].numeric / trackFr[track].numeric;
          if (this.frToPixels === 0) {
            this.frToPixels = Number.EPSILON;
          }
        }
      }

      if (trackPercentage.length) {
        const track = firstNonZero(trackPercentage);

        if (track !== null) {
          this.percentageToPixels = this.computedPixels[track].numeric
                      / trackPercentage[track].numeric;
        }
      }

      // get start of gutter track
      const gutterStart = this.getSizeAtTrack(this.track, false) + this.start;
      this.dragStartOffset = this.getMousePosition(e) - gutterStart;

      this.aTrack = this.track - 1;

      if (this.track < this.tracks.length - 1) {
        this.bTrack = this.track + 1;
      } else {
        throw Error(
          `Invalid track index: ${this.track}. Track must be between two other tracks and only ${this.tracks.length} tracks were found.`,
        );
      }

      this.aTrackStart = this.getSizeAtTrack(this.aTrack, false) + this.start;
      this.bTrackEnd = this.getSizeAtTrack(this.bTrack, true) + this.start;

      // Set the dragging property of the pair object.
      this.dragging = true;

      // All the binding. `window` gets the stop events in case we drag out of the elements.
      window.addEventListener('mouseup', this.stopDragging);
      window.addEventListener('touchend', this.stopDragging);
      window.addEventListener('touchcancel', this.stopDragging);
      window.addEventListener('mousemove', this.drag);
      window.addEventListener('touchmove', this.drag);
      window.addEventListener('dblclick', this.dblClick);

      // Disable selection. Disable!
      this.grid.addEventListener('selectstart', NOOP);
      this.grid.addEventListener('dragstart', NOOP);

      this.grid.style.userSelect = 'none';
      this.grid.style.webkitUserSelect = 'none';
      this.grid.style.MozUserSelect = 'none';
      this.grid.style.pointerEvents = 'none';

      // Set the cursor at multiple levels
      this.grid.style.cursor = this.cursor;
      window.document.body.style.cursor = this.cursor;

      this.onDragStart(this.direction, this.track, this.element);
    }

    stopDragging() {
      this.dragging = false;

      // Remove the stored event listeners. This is why we store them.
      this.cleanup();

      this.onDragEnd(this.direction, this.track, this.element);

      if (this.needsDestroy) {
        if (this.element) {
          this.element.removeEventListener(
            'mousedown',
            this.startDragging,
          );
          this.element.removeEventListener(
            'touchstart',
            this.startDragging,
          );
        }
        this.destroyCb();
        this.needsDestroy = false;
        this.destroyCb = null;
      }
    }

    drag(e) {
      let mousePosition = this.getMousePosition(e);

      const gutterSize = this.getSizeOfTrack(this.track);
      const minMousePosition = this.aTrackStart
              + this.minSizeStart
              + this.dragStartOffset
              + this.computedGapPixels;
      const maxMousePosition = this.bTrackEnd
              - this.minSizeEnd
              - this.computedGapPixels
              - (gutterSize - this.dragStartOffset);
      const minMousePositionOffset = minMousePosition + this.snapOffset;
      const maxMousePositionOffset = maxMousePosition - this.snapOffset;

      if (mousePosition < minMousePositionOffset) {
        mousePosition = minMousePosition;
      }

      if (mousePosition > maxMousePositionOffset) {
        mousePosition = maxMousePosition;
      }

      if (mousePosition < minMousePosition) {
        mousePosition = minMousePosition;
      } else if (mousePosition > maxMousePosition) {
        mousePosition = maxMousePosition;
      }

      let aTrackSize = mousePosition
              - this.aTrackStart
              - this.dragStartOffset
              - this.computedGapPixels;
      let bTrackSize = this.bTrackEnd
              - mousePosition
              + this.dragStartOffset
              - gutterSize
              - this.computedGapPixels;

      if (this.dragInterval > 1) {
        const aTrackSizeIntervaled = Math.round(aTrackSize / this.dragInterval) * this.dragInterval;
        bTrackSize -= aTrackSizeIntervaled - aTrackSize;
        aTrackSize = aTrackSizeIntervaled;
      }

      if (aTrackSize < this.minSizeStart) {
        aTrackSize = this.minSizeStart;
      }

      if (bTrackSize < this.minSizeEnd) {
        bTrackSize = this.minSizeEnd;
      }

      if (this.trackValues[this.aTrack].type === 'px') {
        this.tracks[this.aTrack] = `${aTrackSize}px`;
      } else if (this.trackValues[this.aTrack].type === 'fr') {
        if (this.totalFrs === 1) {
          this.tracks[this.aTrack] = '1fr';
        } else {
          const targetFr = aTrackSize / this.frToPixels;
          this.tracks[this.aTrack] = `${targetFr}fr`;
        }
      } else if (this.trackValues[this.aTrack].type === '%') {
        const targetPercentage = aTrackSize / this.percentageToPixels;
        this.tracks[this.aTrack] = `${targetPercentage}%`;
      }

      if (this.trackValues[this.bTrack].type === 'px') {
        this.tracks[this.bTrack] = `${bTrackSize}px`;
      } else if (this.trackValues[this.bTrack].type === 'fr') {
        if (this.totalFrs === 1) {
          this.tracks[this.bTrack] = '1fr';
        } else if (this.trackValues[this.aTrack].type === 'fr') {
          const targetFr = bTrackSize / this.frToPixels;
          this.tracks[this.bTrack] = `${targetFr}fr`;
        }
      } else if (this.trackValues[this.bTrack].type === '%') {
        const targetPercentage = bTrackSize / this.percentageToPixels;
        this.tracks[this.bTrack] = `${targetPercentage}%`;
      }

      const style = this.tracks.join(' ');
      this.writeStyle(this.grid, this.gridTemplateProp, style);
      this.onDrag(this.direction, this.track, this.element, style);
    }

    cleanup() {
      window.removeEventListener('mouseup', this.stopDragging);
      window.removeEventListener('touchend', this.stopDragging);
      window.removeEventListener('touchcancel', this.stopDragging);
      window.removeEventListener('mousemove', this.drag);
      window.removeEventListener('touchmove', this.drag);

      // Double click apparently needs to go to the end of the event loop
      setTimeout(() => {
        window.removeEventListener('dblclick', this.dblClick);
      }, 0);

      if (this.grid) {
        this.grid.removeEventListener('selectstart', NOOP);
        this.grid.removeEventListener('dragstart', NOOP);

        this.grid.style.userSelect = '';
        this.grid.style.webkitUserSelect = '';
        this.grid.style.MozUserSelect = '';
        this.grid.style.pointerEvents = '';

        this.grid.style.cursor = '';
      }

      window.document.body.style.cursor = '';
    }

    destroy(immediate = true, cb) {
      if (immediate || this.dragging === false) {
        this.cleanup();
        if (this.element) {
          this.element.removeEventListener(
            'mousedown',
            this.startDragging,
          );
          this.element.removeEventListener(
            'touchstart',
            this.startDragging,
          );
        }

        if (cb) {
          cb();
        }
      } else {
        this.needsDestroy = true;
        if (cb) {
          this.destroyCb = cb;
        }
      }
    }
  }

  const getTrackOption = (options, track, defaultValue) => {
      if (track in options) {
          return options[track]
      }

      return defaultValue
  };

  const createGutter = (direction, options) => gutterOptions => {
      if (gutterOptions.track < 1) {
          throw Error(
              `Invalid track index: ${gutterOptions.track}. Track must be between two other tracks.`,
          )
      }

      const trackMinSizes =
          direction === 'column'
              ? options.columnMinSizes || {}
              : options.rowMinSizes || {};
      const trackMinSize = direction === 'column' ? 'columnMinSize' : 'rowMinSize';

      return new Gutter(
          direction,
          {
              minSizeStart: getTrackOption(
                  trackMinSizes,
                  gutterOptions.track - 1,
                  getOption(
                      options,
                      trackMinSize,
                      getOption(options, 'minSize', 0),
                  ),
              ),
              minSizeEnd: getTrackOption(
                  trackMinSizes,
                  gutterOptions.track + 1,
                  getOption(
                      options,
                      trackMinSize,
                      getOption(options, 'minSize', 0),
                  ),
              ),
              ...gutterOptions,
          },
          options,
      )
  };

  class Grid {
      constructor(options) {
          this.columnGutters = {};
          this.rowGutters = {};

          this.options = {
              columnGutters: options.columnGutters || [],
              rowGutters: options.rowGutters || [],
              columnMinSizes: options.columnMinSizes || {},
              rowMinSizes: options.rowMinSizes || {},
              ...options,
          };

          this.options.columnGutters.forEach(gutterOptions => {
              this.columnGutters[options.track] = createGutter(
                  'column',
                  this.options,
              )(gutterOptions);
          });

          this.options.rowGutters.forEach(gutterOptions => {
              this.rowGutters[options.track] = createGutter(
                  'row',
                  this.options,
              )(gutterOptions);
          });
      }

      addColumnGutter(element, track) {
          if (this.columnGutters[track]) {
              this.columnGutters[track].destroy();
          }

          this.columnGutters[track] = createGutter(
              'column',
              this.options,
          )({
              element,
              track,
          });
      }

      addRowGutter(element, track) {
          if (this.rowGutters[track]) {
              this.rowGutters[track].destroy();
          }

          this.rowGutters[track] = createGutter(
              'row',
              this.options,
          )({
              element,
              track,
          });
      }

      removeColumnGutter(track, immediate = true) {
          if (this.columnGutters[track]) {
              this.columnGutters[track].destroy(immediate, () => {
                  delete this.columnGutters[track];
              });
          }
      }

      removeRowGutter(track, immediate = true) {
          if (this.rowGutters[track]) {
              this.rowGutters[track].destroy(immediate, () => {
                  delete this.rowGutters[track];
              });
          }
      }

      handleDragStart(e, direction, track) {
          if (direction === 'column') {
              if (this.columnGutters[track]) {
                  this.columnGutters[track].destroy();
              }

              this.columnGutters[track] = createGutter(
                  'column',
                  this.options,
              )({
                  track,
              });
              this.columnGutters[track].startDragging(e);
          } else if (direction === 'row') {
              if (this.rowGutters[track]) {
                  this.rowGutters[track].destroy();
              }

              this.rowGutters[track] = createGutter(
                  'row',
                  this.options,
              )({
                  track,
              });
              this.rowGutters[track].startDragging(e);
          }
      }

      destroy(immediate = true) {
          Object.keys(this.columnGutters).forEach(track =>
              this.columnGutters[track].destroy(immediate, () => {
                  delete this.columnGutters[track];
              }),
          );
          Object.keys(this.rowGutters).forEach(track =>
              this.rowGutters[track].destroy(immediate, () => {
                  delete this.rowGutters[track];
              }),
          );
      }
  }

  var Split = options => new Grid(options);

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script = {
    name: 'EvLayoutChild',

    props: {
      child: Object
    },

    computed: {
      classForChild() {
        if (this.child && this.child.name) {
          return `ev-pane-${this.child.name}`;
        }

        return '';
      },

      childStyle() {
        if (!this.child.sizes || !this.child.sizes.length || !this.child.direction) {
          return;
        }

        let sizes = this.child.sizes.map(s => [s, '0']).flat();
        sizes.pop();

        return `grid-template-${this.child.direction}s: ${sizes.join(' ')}`;
      }
    },

    methods: {
      gutterClass(child, direction) {
        let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;

        if (child.resizable === false) {
          className += ' ev-gutter-no-resize';
        }

        return className;
      }
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  const isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return (id, style) => addStyle(id, style);
  }
  let HEAD;
  const styles = {};
  function addStyle(id, css) {
      const group = isOldIE ? css.media || 'default' : id;
      const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          let code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  style.element.setAttribute('media', css.media);
              if (HEAD === undefined) {
                  HEAD = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              const index = style.ids.size - 1;
              const textNode = document.createTextNode(code);
              const nodes = style.element.childNodes;
              if (nodes[index])
                  style.element.removeChild(nodes[index]);
              if (nodes.length)
                  style.element.insertBefore(textNode, nodes[index]);
              else
                  style.element.appendChild(textNode);
          }
      }
  }

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      {
        staticClass: "d-grid overflow-hidden h-100 w-100",
        class: _vm.classForChild,
        style: _vm.childStyle,
        attrs: {
          "data-min-size": _vm.child.minSize,
          "data-evlayout-name": _vm.child.name
        }
      },
      [
        !_vm.child.panes
          ? _c(
              "div",
              { staticClass: "ev-layout-pane h-100 w-100 overflow-auto" },
              [_vm._t(_vm.child.name)],
              2
            )
          : _vm._e(),
        _vm._v(" "),
        _vm._l(_vm.child.panes, function(grandChild, idx) {
          return [
            _c(
              "ev-layout-child",
              {
                key: grandChild.name,
                attrs: { child: grandChild },
                scopedSlots: _vm._u(
                  [
                    _vm._l(_vm.$scopedSlots, function(_, name) {
                      return {
                        key: name,
                        fn: function(slotData) {
                          return [_vm._t(name, null, null, slotData)]
                        }
                      }
                    })
                  ],
                  null,
                  true
                )
              },
              [
                _vm._l(_vm.$slots, function(_, name) {
                  return _vm._t(name, null, { slot: name })
                })
              ],
              2
            ),
            _vm._v(" "),
            _vm.child.panes[idx + 1]
              ? _c("div", {
                  key: grandChild.name + "gutter",
                  class: _vm.gutterClass(grandChild, _vm.child.direction)
                })
              : _vm._e()
          ]
        })
      ],
      2
    )
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    const __vue_inject_styles__ = function (inject) {
      if (!inject) return
      inject("data-v-748ace0d_0", { source: "*[data-v-748ace0d] {\n  box-sizing: border-box;\n}\n*[data-v-748ace0d]:before,\n*[data-v-748ace0d]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-748ace0d] {\n  height: 100%;\n}\n.vh-100[data-v-748ace0d] {\n  height: 100vh;\n}\n.w-100[data-v-748ace0d] {\n  width: 100%;\n}\n.vw-100[data-v-748ace0d] {\n  width: 100vw;\n}\n.pre-line[data-v-748ace0d] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-748ace0d] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-748ace0d] {\n  white-space: nowrap;\n}\n.d-block[data-v-748ace0d] {\n  display: block;\n}\n.d-inline-block[data-v-748ace0d] {\n  display: inline-block;\n}\n.d-flex[data-v-748ace0d] {\n  display: flex;\n}\n.d-inline-flex[data-v-748ace0d] {\n  display: inline-flex;\n}\n.d-grid[data-v-748ace0d] {\n  display: grid;\n}\n.d-none[data-v-748ace0d] {\n  display: none;\n}\n.hide[data-v-748ace0d] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-748ace0d] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-748ace0d] {\n  overflow: auto;\n}\n.flex-center[data-v-748ace0d] {\n  justify-content: center;\n}\n.flex-middle[data-v-748ace0d] {\n  align-items: center;\n}\n.flex-grow[data-v-748ace0d] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-748ace0d] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-748ace0d] {\n  flex-direction: column;\n}\n.flex-space[data-v-748ace0d] {\n  justify-content: space-between;\n}\n.flex-end[data-v-748ace0d] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-748ace0d] {\n  justify-content: flex-start;\n}\n.text-center[data-v-748ace0d] {\n  text-align: center;\n}\n.m-z[data-v-748ace0d] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-748ace0d] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-748ace0d] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-748ace0d] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-748ace0d] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-748ace0d] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-748ace0d] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-748ace0d] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-748ace0d] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-748ace0d] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-748ace0d] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-748ace0d] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-748ace0d] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-748ace0d] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-748ace0d] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-748ace0d] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-748ace0d] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-748ace0d] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-748ace0d] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-748ace0d] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-748ace0d] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-748ace0d] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-748ace0d] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-748ace0d] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-748ace0d] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-748ace0d] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-748ace0d] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-748ace0d] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-748ace0d] {\n  margin-left: 2px;\n}\n.p-z[data-v-748ace0d] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-748ace0d] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-748ace0d] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-748ace0d] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-748ace0d] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-748ace0d] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-748ace0d] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-748ace0d] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-748ace0d] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-748ace0d] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-748ace0d] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-748ace0d] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-748ace0d] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-748ace0d] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-748ace0d] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-748ace0d] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-748ace0d] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-748ace0d] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-748ace0d] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-748ace0d] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-748ace0d] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-748ace0d] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-748ace0d] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-748ace0d] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-748ace0d] {\n  padding-left: 5px;\n}\n.p-xs[data-v-748ace0d] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-748ace0d] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-748ace0d] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-748ace0d] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-748ace0d] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-748ace0d] {\n  padding: 2px;\n}\n.p-xs[data-v-748ace0d] {\n  padding: 5px;\n}\n.p-sm[data-v-748ace0d] {\n  padding: 10px;\n}\n.p-med[data-v-748ace0d] {\n  padding: 15px;\n}\n.p-lg[data-v-748ace0d] {\n  padding: 20px;\n}\n.p-xl[data-v-748ace0d] {\n  padding: 25px;\n}\n.m-xxs[data-v-748ace0d] {\n  margin: 2px;\n}\n.m-xs[data-v-748ace0d] {\n  margin: 5px;\n}\n.m-sm[data-v-748ace0d] {\n  margin: 10px;\n}\n.m-med[data-v-748ace0d] {\n  margin: 15px;\n}\n.m-lg[data-v-748ace0d] {\n  margin: 20px;\n}\n.m-xl[data-v-748ace0d] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-748ace0d] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-748ace0d] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-748ace0d]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-748ace0d]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-748ace0d]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n.ev-layout-pane-maximized[data-v-748ace0d] {\n  border: 0;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */", map: {"version":3,"sources":["EvLayoutChild.vue","/Users/john/Code/evwt/components/src/EvLayoutChild.vue"],"names":[],"mappings":"AAAA;EACE,sBAAsB;AACxB;AAEA;;EAEE,sBAAsB;AACxB;AAEA;EACE,YAAY;AACd;AAEA;EACE,aAAa;AACf;AAEA;EACE,WAAW;AACb;AAEA;EACE,YAAY;AACd;AAEA;EACE,qBAAqB;AACvB;AAEA;EACE,qBAAqB;AACvB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,cAAc;AAChB;AAEA;EACE,qBAAqB;AACvB;AAEA;EACE,aAAa;AACf;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,aAAa;AACf;AAEA;EACE,aAAa;AACf;AAEA;EACE,kBAAkB;AACpB;AAEA;ECQA,gBAAA;ADNA;AAEA;EACE,cAAc;AAChB;AAEA;EACE,uBAAuB;AACzB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,YAAY;AACd;AAEA;EACE,cAAc;AAChB;AAEA;EACE,sBAAsB;AACxB;AAEA;EACE,8BAA8B;AAChC;AAEA;EACE,yBAAyB;AAC3B;AAEA;EACE,2BAA2B;AAC7B;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,wBAAwB;AAC1B;AAEA;EACE,0BAA0B;AAC5B;AAEA;EACE,2BAA2B;AAC7B;AAEA;EACE,yBAAyB;AAC3B;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,eAAe;AACjB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,eAAe;AACjB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,qBAAqB;AACvB;AAEA;EACE,yBAAyB;AAC3B;AAEA;EACE,2BAA2B;AAC7B;AAEA;EACE,4BAA4B;AAC9B;AAEA;EACE,0BAA0B;AAC5B;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,YAAY;AACd;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,YAAY;AACd;AAEA;EACE,YAAY;AACd;AAEA;EACE,aAAa;AACf;AAEA;EACE,aAAa;AACf;AAEA;EACE,aAAa;AACf;AAEA;EACE,aAAa;AACf;AAEA;EACE,WAAW;AACb;AAEA;EACE,WAAW;AACb;AAEA;EACE,YAAY;AACd;AAEA;EACE,YAAY;AACd;AAEA;EACE,YAAY;AACd;AAEA;EACE,YAAY;AACd;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,cAAc;EACd,kBAAkB;EAClB,WAAW;AACb;AACA;EACE,UAAU;EACV,YAAY;EACZ,iBAAiB;AACnB;AACA;EACE,WAAW;EACX,WAAW;EACX,gBAAgB;AAClB;AAEA;EACE,SAAS;AACX;;AAEA,4CAA4C","file":"EvLayoutChild.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n.ev-layout-pane-maximized {\n  border: 0;\n}\n\n/*# sourceMappingURL=EvLayoutChild.vue.map */","<template>\n  <div\n    :style=\"childStyle\"\n    :data-min-size=\"child.minSize\"\n    :data-evlayout-name=\"child.name\"\n    class=\"d-grid overflow-hidden h-100 w-100\"\n    :class=\"classForChild\">\n    <div v-if=\"!child.panes\" class=\"ev-layout-pane h-100 w-100 overflow-auto\">\n      <slot :name=\"child.name\" class=\"overflow-auto\" />\n    </div>\n\n    <template v-for=\"(grandChild, idx) in child.panes\">\n      <ev-layout-child\n        :key=\"grandChild.name\"\n        :child=\"grandChild\">\n        <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n        <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n          <slot :name=\"name\" v-bind=\"slotData\" />\n        </template>\n      </ev-layout-child>\n\n      <div\n        v-if=\"child.panes[idx + 1]\"\n        :key=\"grandChild.name + 'gutter'\"\n        :class=\"gutterClass(grandChild, child.direction)\" />\n    </template>\n  </div>\n</template>\n\n<script>\nexport default {\n  name: 'EvLayoutChild',\n\n  props: {\n    child: Object\n  },\n\n  computed: {\n    classForChild() {\n      if (this.child && this.child.name) {\n        return `ev-pane-${this.child.name}`;\n      }\n\n      return '';\n    },\n\n    childStyle() {\n      if (!this.child.sizes || !this.child.sizes.length || !this.child.direction) {\n        return;\n      }\n\n      let sizes = this.child.sizes.map(s => [s, '0']).flat();\n      sizes.pop();\n\n      return `grid-template-${this.child.direction}s: ${sizes.join(' ')}`;\n    }\n  },\n\n  methods: {\n    gutterClass(child, direction) {\n      let className = `ev-gutter ev-gutter-${child.name} ev-gutter-${direction}`;\n\n      if (child.resizable === false) {\n        className += ' ev-gutter-no-resize';\n      }\n\n      return className;\n    }\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '../../style/reset.scss';\n@import '../../style/utilities.scss';\n@import '../../style/split-grid.scss';\n</style>\n"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__ = "data-v-748ace0d";
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__ = /*#__PURE__*/normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      createInjector,
      undefined,
      undefined
    );

  //

  var script$1 = {
    name: 'EvLayout',

    components: {
      EvLayoutChild: __vue_component__
    },

    props: {
      // The top-level Pane
      layout: {
        type: Object,
        required: true
      }
    },

    data() {
      return {
        layoutData: null
      };
    },

    async created() {
      this.layoutData = cloneDeep_1(this.layout);
      this.loadUiState();
    },

    async mounted() {
      let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({
        track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
        element: gutter
      }));

      let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({
        track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),
        element: gutter
      }));

      // Return the panes before and after this gutter to their default sizes
      for (const gutter of [...this.$el.querySelectorAll('.ev-gutter')]) {
        gutter.addEventListener('doubleclick', (e) => {
          let parent = e.target.parentElement;
          let parentName = parent.dataset.evlayoutName;
          let track = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
          let leadingIndex = Math.floor(track / 2);
          let trailingIndex = Math.ceil(track / 2);
          let gridTemplate = parent.style.gridTemplateColumns || parent.style.gridTemplateRows;
          let sizes = gridTemplate.split(' ').filter(s => s !== '0px');
          let defaultSizes = this.defaultSizeForTrack(parentName, this.layout);

          sizes[leadingIndex] = defaultSizes[leadingIndex];
          sizes[trailingIndex] = defaultSizes[trailingIndex];

          gridTemplate = sizes.join(' 0px ');

          if (this.$evstore && this.$evstore.$ui) {
            this.syncLayoutDataForPane(parentName, this.layoutData, sizes);
            this.saveUiState();
          }
        });
      }

      let minSizeReducer = (acc, gutter) => {
        let prevPane = gutter.previousElementSibling;

        if (prevPane) {
          let minSize = parseInt(prevPane.dataset.minSize || 0);
          let index = Array.prototype.indexOf.call(prevPane.parentNode.children, prevPane);
          acc[index] = minSize;
        }

        let nextPane = gutter.nextElementSibling;

        if (nextPane) {
          let minSizeNext = parseInt(nextPane.dataset.minSize || 0);
          let indexNext = Array.prototype.indexOf.call(nextPane.parentNode.children, nextPane);

          acc[indexNext] = minSizeNext;
        }

        return acc;
      };

      let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce(minSizeReducer, {});
      let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce(minSizeReducer, {});

      let onDragStart = (direction, track, element) => {
        // Fired when any pane starts dragging
        // @arg direction, track, gutter element
        this.$emit('dragStart', { direction, track, element });
      };

      let onDrag = (direction, track, element, gridTemplateStyle) => {
        addMinimizedMaximizedClasses(direction, track, element);

        // Fired when any pane is dragging
        // @arg direction, track, gutter element, gridTemplateStyle
        this.$emit('drag', {
          direction, track, element, gridTemplateStyle
        });
      };

      let addMinimizedMaximizedClasses = (direction, track, element) => {
        let maximizedClassName = 'ev-layout-pane-maximized';
        let minimizedClassName = 'ev-layout-pane-minimized';
        let offsetKey = direction === 'column' ? 'offsetWidth' : 'offsetHeight';
        let parent = element.parentElement;
        let previousPane = element.previousElementSibling;
        let nextPane = element.nextElementSibling;

        if (previousPane && previousPane[offsetKey] === parent[offsetKey]) {
          previousPane.classList.add(maximizedClassName);
        } else if (previousPane.classList.contains(maximizedClassName)) {
          previousPane.classList.remove(maximizedClassName);
        }

        if (previousPane && previousPane[offsetKey] === 0) {
          previousPane.classList.add(minimizedClassName);
        } else if (previousPane.classList.contains(minimizedClassName)) {
          previousPane.classList.remove(minimizedClassName);
        }

        if (nextPane && nextPane[offsetKey] === parent[offsetKey]) {
          nextPane.classList.add(maximizedClassName);
        } else if (nextPane.classList.contains(maximizedClassName)) {
          nextPane.classList.remove(maximizedClassName);
        }

        if (nextPane && nextPane[offsetKey] === 0) {
          nextPane.classList.add(minimizedClassName);
        } else if (nextPane.classList.contains(minimizedClassName)) {
          nextPane.classList.remove(minimizedClassName);
        }
      };

      for (const gutter of rowGutters) {
        addMinimizedMaximizedClasses('row', gutter.track, gutter.element);
      }

      for (const gutter of columnGutters) {
        addMinimizedMaximizedClasses('column', gutter.track, gutter.element);
      }

      let onDragEnd = async (direction, track, element) => {
        // Fired when any pane ends dragging
        // @arg direction, track, gutter element
        this.$emit('dragEnd', { direction, track, element });

        if (this.$evstore && this.$evstore.$ui) {
          let { gridTemplateColumns, gridTemplateRows } = element.parentElement.style;
          let gridTemplate = gridTemplateColumns || gridTemplateRows;
          let sizes = gridTemplate.split(' 0px ');
          let name = element.parentElement.dataset.evlayoutName;
          this.syncLayoutDataForPane(name, this.layoutData, sizes);
          this.saveUiState();
        }
      };

      Split({
        columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd
      });
    },

    methods: {
      loadUiState() {
        if (!this.$evstore || !this.$evstore.$ui) return;

        if (typeof this.$evstore.$ui.store.layout === 'object') {
          for (const [paneName, paneSizes] of Object.entries(this.$evstore.$ui.store.layout)) {
            this.syncLayoutDataForPane(paneName, this.layoutData, paneSizes);
          }
        }
      },

      saveUiState() {
        this.$set(this.$evstore.$ui.store, 'layout', this.getSizesForPanes(this.layoutData));
      },

      syncLayoutDataForPane(name, layoutData, sizes) {
        if (layoutData.name === name) {
          layoutData.sizes = sizes;
          return;
        }

        for (let idx = 0; idx < layoutData.panes.length; idx++) {
          let pane = layoutData.panes[idx];
          if (!pane) continue;
          if (pane.name === name) {
            pane.sizes = sizes;
          }
          if (pane.panes) {
            this.syncLayoutDataForPane(name, pane, sizes);
          }
        }
      },

      defaultSizeForTrack(name, layoutData) {
        if (layoutData.name === name) {
          return layoutData.sizes;
        }

        for (let idx = 0; idx < layoutData.panes.length; idx++) {
          let pane = layoutData.panes[idx];
          if (!pane) continue;
          if (pane.name === name) {
            return pane.sizes;
          }
          if (pane.panes) {
            this.defaultSizeForTrack(name, pane);
          }
        }
      },

      getSizesForPanes(layoutData, sizes = {}) {
        sizes[layoutData.name] = layoutData.sizes;

        for (let idx = 0; idx < layoutData.panes.length; idx++) {
          let pane = layoutData.panes[idx];
          if (!pane) continue;
          sizes[pane.name] = pane.sizes;
          if (pane.panes) {
            this.getSizesForPanes(pane, sizes);
          }
        }

        return sizes;
      }

    }
  };

  function normalizeComponent$1(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  const isOldIE$1 = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector$1(context) {
      return (id, style) => addStyle$1(id, style);
  }
  let HEAD$1;
  const styles$1 = {};
  function addStyle$1(id, css) {
      const group = isOldIE$1 ? css.media || 'default' : id;
      const style = styles$1[group] || (styles$1[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          let code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  style.element.setAttribute('media', css.media);
              if (HEAD$1 === undefined) {
                  HEAD$1 = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD$1.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              const index = style.ids.size - 1;
              const textNode = document.createTextNode(code);
              const nodes = style.element.childNodes;
              if (nodes[index])
                  style.element.removeChild(nodes[index]);
              if (nodes.length)
                  style.element.insertBefore(textNode, nodes[index]);
              else
                  style.element.appendChild(textNode);
          }
      }
  }

  /* script */
  const __vue_script__$1 = script$1;

  /* template */
  var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _vm.layoutData
      ? _c(
          "ev-layout-child",
          {
            attrs: { child: _vm.layoutData },
            scopedSlots: _vm._u(
              [
                _vm._l(_vm.$scopedSlots, function(_, name) {
                  return {
                    key: name,
                    fn: function(slotData) {
                      return [_vm._t(name, null, null, slotData)]
                    }
                  }
                })
              ],
              null,
              true
            )
          },
          [
            _vm._l(_vm.$slots, function(_, name) {
              return _vm._t(name, null, { slot: name })
            })
          ],
          2
        )
      : _vm._e()
  };
  var __vue_staticRenderFns__$1 = [];
  __vue_render__$1._withStripped = true;

    /* style */
    const __vue_inject_styles__$1 = function (inject) {
      if (!inject) return
      inject("data-v-6ba1d8c3_0", { source: "*[data-v-6ba1d8c3] {\n  box-sizing: border-box;\n}\n*[data-v-6ba1d8c3]:before,\n*[data-v-6ba1d8c3]:after {\n  box-sizing: border-box;\n}\n.h-100[data-v-6ba1d8c3] {\n  height: 100%;\n}\n.vh-100[data-v-6ba1d8c3] {\n  height: 100vh;\n}\n.w-100[data-v-6ba1d8c3] {\n  width: 100%;\n}\n.vw-100[data-v-6ba1d8c3] {\n  width: 100vw;\n}\n.pre-line[data-v-6ba1d8c3] {\n  white-space: pre-line;\n}\n.pre-wrap[data-v-6ba1d8c3] {\n  white-space: pre-wrap;\n}\n.no-wrap[data-v-6ba1d8c3] {\n  white-space: nowrap;\n}\n.d-block[data-v-6ba1d8c3] {\n  display: block;\n}\n.d-inline-block[data-v-6ba1d8c3] {\n  display: inline-block;\n}\n.d-flex[data-v-6ba1d8c3] {\n  display: flex;\n}\n.d-inline-flex[data-v-6ba1d8c3] {\n  display: inline-flex;\n}\n.d-grid[data-v-6ba1d8c3] {\n  display: grid;\n}\n.d-none[data-v-6ba1d8c3] {\n  display: none;\n}\n.hide[data-v-6ba1d8c3] {\n  visibility: hidden;\n}\n.overflow-hidden[data-v-6ba1d8c3] {\n  overflow: hidden;\n}\n.overflow-auto[data-v-6ba1d8c3] {\n  overflow: auto;\n}\n.flex-center[data-v-6ba1d8c3] {\n  justify-content: center;\n}\n.flex-middle[data-v-6ba1d8c3] {\n  align-items: center;\n}\n.flex-grow[data-v-6ba1d8c3] {\n  flex-grow: 1;\n}\n.flex-shrink[data-v-6ba1d8c3] {\n  flex-shrink: 1;\n}\n.flex-vertical[data-v-6ba1d8c3] {\n  flex-direction: column;\n}\n.flex-space[data-v-6ba1d8c3] {\n  justify-content: space-between;\n}\n.flex-end[data-v-6ba1d8c3] {\n  justify-content: flex-end;\n}\n.flex-start[data-v-6ba1d8c3] {\n  justify-content: flex-start;\n}\n.text-center[data-v-6ba1d8c3] {\n  text-align: center;\n}\n.m-z[data-v-6ba1d8c3] {\n  margin: 0 !important;\n}\n.m-n-z[data-v-6ba1d8c3] {\n  margin-top: 0 !important;\n}\n.m-e-z[data-v-6ba1d8c3] {\n  margin-right: 0 !important;\n}\n.m-s-z[data-v-6ba1d8c3] {\n  margin-bottom: 0 !important;\n}\n.m-w-z[data-v-6ba1d8c3] {\n  margin-left: 0 !important;\n}\n.m-n-xl[data-v-6ba1d8c3] {\n  margin-top: 25px;\n}\n.m-e-xl[data-v-6ba1d8c3] {\n  margin-right: 25px;\n}\n.m-s-xl[data-v-6ba1d8c3] {\n  margin-bottom: 25px;\n}\n.m-w-xl[data-v-6ba1d8c3] {\n  margin-left: 25px;\n}\n.m-n-lg[data-v-6ba1d8c3] {\n  margin-top: 20px;\n}\n.m-e-lg[data-v-6ba1d8c3] {\n  margin-right: 20px;\n}\n.m-s-lg[data-v-6ba1d8c3] {\n  margin-bottom: 20px;\n}\n.m-w-lg[data-v-6ba1d8c3] {\n  margin-left: 20px;\n}\n.m-n-med[data-v-6ba1d8c3] {\n  margin-top: 15px;\n}\n.m-e-med[data-v-6ba1d8c3] {\n  margin-right: 15px;\n}\n.m-s-med[data-v-6ba1d8c3] {\n  margin-bottom: 15px;\n}\n.m-w-med[data-v-6ba1d8c3] {\n  margin-left: 15px;\n}\n.m-n-sm[data-v-6ba1d8c3] {\n  margin-top: 10px;\n}\n.m-e-sm[data-v-6ba1d8c3] {\n  margin-right: 10px;\n}\n.m-s-sm[data-v-6ba1d8c3] {\n  margin-bottom: 10px;\n}\n.m-w-sm[data-v-6ba1d8c3] {\n  margin-left: 10px;\n}\n.m-n-xs[data-v-6ba1d8c3] {\n  margin-top: 5px;\n}\n.m-e-xs[data-v-6ba1d8c3] {\n  margin-right: 5px;\n}\n.m-s-xs[data-v-6ba1d8c3] {\n  margin-bottom: 5px;\n}\n.m-w-xs[data-v-6ba1d8c3] {\n  margin-left: 5px;\n}\n.m-n-xxs[data-v-6ba1d8c3] {\n  margin-top: 2px;\n}\n.m-e-xxs[data-v-6ba1d8c3] {\n  margin-right: 2px;\n}\n.m-s-xxs[data-v-6ba1d8c3] {\n  margin-bottom: 2px;\n}\n.m-w-xxs[data-v-6ba1d8c3] {\n  margin-left: 2px;\n}\n.p-z[data-v-6ba1d8c3] {\n  padding: 0 !important;\n}\n.p-n-z[data-v-6ba1d8c3] {\n  padding-top: 0 !important;\n}\n.p-e-z[data-v-6ba1d8c3] {\n  padding-right: 0 !important;\n}\n.p-s-z[data-v-6ba1d8c3] {\n  padding-bottom: 0 !important;\n}\n.p-w-z[data-v-6ba1d8c3] {\n  padding-left: 0 !important;\n}\n.p-n-xl[data-v-6ba1d8c3] {\n  padding-top: 25px;\n}\n.p-e-xl[data-v-6ba1d8c3] {\n  padding-right: 25px;\n}\n.p-s-xl[data-v-6ba1d8c3] {\n  padding-bottom: 25px;\n}\n.p-w-xl[data-v-6ba1d8c3] {\n  padding-left: 25px;\n}\n.p-n-lg[data-v-6ba1d8c3] {\n  padding-top: 20px;\n}\n.p-e-lg[data-v-6ba1d8c3] {\n  padding-right: 20px;\n}\n.p-s-lg[data-v-6ba1d8c3] {\n  padding-bottom: 20px;\n}\n.p-w-lg[data-v-6ba1d8c3] {\n  padding-left: 20px;\n}\n.p-n-med[data-v-6ba1d8c3] {\n  padding-top: 15px;\n}\n.p-e-med[data-v-6ba1d8c3] {\n  padding-right: 15px;\n}\n.p-s-med[data-v-6ba1d8c3] {\n  padding-bottom: 15px;\n}\n.p-w-med[data-v-6ba1d8c3] {\n  padding-left: 15px;\n}\n.p-n-sm[data-v-6ba1d8c3] {\n  padding-top: 10px;\n}\n.p-e-sm[data-v-6ba1d8c3] {\n  padding-right: 10px;\n}\n.p-s-sm[data-v-6ba1d8c3] {\n  padding-bottom: 10px;\n}\n.p-w-sm[data-v-6ba1d8c3] {\n  padding-left: 10px;\n}\n.p-n-xs[data-v-6ba1d8c3] {\n  padding-top: 5px;\n}\n.p-e-xs[data-v-6ba1d8c3] {\n  padding-right: 5px;\n}\n.p-s-xs[data-v-6ba1d8c3] {\n  padding-bottom: 5px;\n}\n.p-w-xs[data-v-6ba1d8c3] {\n  padding-left: 5px;\n}\n.p-xs[data-v-6ba1d8c3] {\n  padding: 5px;\n}\n.p-n-xxs[data-v-6ba1d8c3] {\n  padding-top: 2px;\n}\n.p-e-xxs[data-v-6ba1d8c3] {\n  padding-right: 2px;\n}\n.p-s-xxs[data-v-6ba1d8c3] {\n  padding-bottom: 2px;\n}\n.p-w-xxs[data-v-6ba1d8c3] {\n  padding-left: 2px;\n}\n.p-xxs[data-v-6ba1d8c3] {\n  padding: 2px;\n}\n.p-xs[data-v-6ba1d8c3] {\n  padding: 5px;\n}\n.p-sm[data-v-6ba1d8c3] {\n  padding: 10px;\n}\n.p-med[data-v-6ba1d8c3] {\n  padding: 15px;\n}\n.p-lg[data-v-6ba1d8c3] {\n  padding: 20px;\n}\n.p-xl[data-v-6ba1d8c3] {\n  padding: 25px;\n}\n.m-xxs[data-v-6ba1d8c3] {\n  margin: 2px;\n}\n.m-xs[data-v-6ba1d8c3] {\n  margin: 5px;\n}\n.m-sm[data-v-6ba1d8c3] {\n  margin: 10px;\n}\n.m-med[data-v-6ba1d8c3] {\n  margin: 15px;\n}\n.m-lg[data-v-6ba1d8c3] {\n  margin: 20px;\n}\n.m-xl[data-v-6ba1d8c3] {\n  margin: 25px;\n}\n.ev-gutter-column[data-v-6ba1d8c3] {\n  cursor: col-resize;\n}\n.ev-gutter-row[data-v-6ba1d8c3] {\n  cursor: row-resize;\n}\n.ev-gutter[data-v-6ba1d8c3]:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column[data-v-6ba1d8c3]::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row[data-v-6ba1d8c3]::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n.ev-layout-pane-maximized[data-v-6ba1d8c3] {\n  border: 0;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */", map: {"version":3,"sources":["EvLayout.vue","/Users/john/Code/evwt/components/src/EvLayout/EvLayout.vue"],"names":[],"mappings":"AAAA;EACE,sBAAsB;AACxB;AAEA;;EAEE,sBAAsB;AACxB;AAEA;EACE,YAAY;AACd;AAEA;EACE,aAAa;AACf;AAEA;EACE,WAAW;AACb;AAEA;EACE,YAAY;AACd;AAEA;EACE,qBAAqB;AACvB;AAEA;EACE,qBAAqB;AACvB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,cAAc;AAChB;AAEA;EACE,qBAAqB;AACvB;AAEA;EACE,aAAa;AACf;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,aAAa;AACf;AAEA;EACE,aAAa;AACf;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,cAAc;AAChB;AAEA;EACE,uBAAuB;AACzB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,YAAY;AACd;AAEA;EACE,cAAc;AAChB;AAEA;EACE,sBAAsB;AACxB;AAEA;EACE,8BAA8B;AAChC;AAEA;EACE,yBAAyB;AAC3B;AAEA;EACE,2BAA2B;AAC7B;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,wBAAwB;AAC1B;AAEA;EACE,0BAA0B;AAC5B;AAEA;EACE,2BAA2B;AAC7B;AAEA;EACE,yBAAyB;AAC3B;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,eAAe;AACjB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,eAAe;AACjB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,qBAAqB;AACvB;ACqBA;EACA,yBAAA;ADlBA;AAEA;EACE,2BAA2B;AAC7B;AAEA;EACE,4BAA4B;AAC9B;AAEA;EACE,0BAA0B;AAC5B;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,oBAAoB;AACtB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,YAAY;AACd;AAEA;EACE,gBAAgB;AAClB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,mBAAmB;AACrB;AAEA;EACE,iBAAiB;AACnB;AAEA;EACE,YAAY;AACd;AAEA;EACE,YAAY;AACd;AAEA;EACE,aAAa;AACf;AAEA;EACE,aAAa;AACf;AAEA;EACE,aAAa;AACf;AAEA;EACE,aAAa;AACf;AAEA;EACE,WAAW;AACb;AAEA;EACE,WAAW;AACb;AAEA;EACE,YAAY;AACd;AAEA;EACE,YAAY;AACd;AAEA;EACE,YAAY;AACd;AAEA;EACE,YAAY;AACd;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,kBAAkB;AACpB;AAEA;EACE,cAAc;EACd,kBAAkB;EAClB,WAAW;AACb;AACA;EACE,UAAU;EACV,YAAY;EACZ,iBAAiB;AACnB;AACA;EACE,WAAW;EACX,WAAW;EACX,gBAAgB;AAClB;AAEA;EACE,SAAS;AACX;;AAEA,uCAAuC","file":"EvLayout.vue","sourcesContent":["* {\n  box-sizing: border-box;\n}\n\n*:before,\n*:after {\n  box-sizing: border-box;\n}\n\n.h-100 {\n  height: 100%;\n}\n\n.vh-100 {\n  height: 100vh;\n}\n\n.w-100 {\n  width: 100%;\n}\n\n.vw-100 {\n  width: 100vw;\n}\n\n.pre-line {\n  white-space: pre-line;\n}\n\n.pre-wrap {\n  white-space: pre-wrap;\n}\n\n.no-wrap {\n  white-space: nowrap;\n}\n\n.d-block {\n  display: block;\n}\n\n.d-inline-block {\n  display: inline-block;\n}\n\n.d-flex {\n  display: flex;\n}\n\n.d-inline-flex {\n  display: inline-flex;\n}\n\n.d-grid {\n  display: grid;\n}\n\n.d-none {\n  display: none;\n}\n\n.hide {\n  visibility: hidden;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-grow {\n  flex-grow: 1;\n}\n\n.flex-shrink {\n  flex-shrink: 1;\n}\n\n.flex-vertical {\n  flex-direction: column;\n}\n\n.flex-space {\n  justify-content: space-between;\n}\n\n.flex-end {\n  justify-content: flex-end;\n}\n\n.flex-start {\n  justify-content: flex-start;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.m-z {\n  margin: 0 !important;\n}\n\n.m-n-z {\n  margin-top: 0 !important;\n}\n\n.m-e-z {\n  margin-right: 0 !important;\n}\n\n.m-s-z {\n  margin-bottom: 0 !important;\n}\n\n.m-w-z {\n  margin-left: 0 !important;\n}\n\n.m-n-xl {\n  margin-top: 25px;\n}\n\n.m-e-xl {\n  margin-right: 25px;\n}\n\n.m-s-xl {\n  margin-bottom: 25px;\n}\n\n.m-w-xl {\n  margin-left: 25px;\n}\n\n.m-n-lg {\n  margin-top: 20px;\n}\n\n.m-e-lg {\n  margin-right: 20px;\n}\n\n.m-s-lg {\n  margin-bottom: 20px;\n}\n\n.m-w-lg {\n  margin-left: 20px;\n}\n\n.m-n-med {\n  margin-top: 15px;\n}\n\n.m-e-med {\n  margin-right: 15px;\n}\n\n.m-s-med {\n  margin-bottom: 15px;\n}\n\n.m-w-med {\n  margin-left: 15px;\n}\n\n.m-n-sm {\n  margin-top: 10px;\n}\n\n.m-e-sm {\n  margin-right: 10px;\n}\n\n.m-s-sm {\n  margin-bottom: 10px;\n}\n\n.m-w-sm {\n  margin-left: 10px;\n}\n\n.m-n-xs {\n  margin-top: 5px;\n}\n\n.m-e-xs {\n  margin-right: 5px;\n}\n\n.m-s-xs {\n  margin-bottom: 5px;\n}\n\n.m-w-xs {\n  margin-left: 5px;\n}\n\n.m-n-xxs {\n  margin-top: 2px;\n}\n\n.m-e-xxs {\n  margin-right: 2px;\n}\n\n.m-s-xxs {\n  margin-bottom: 2px;\n}\n\n.m-w-xxs {\n  margin-left: 2px;\n}\n\n.p-z {\n  padding: 0 !important;\n}\n\n.p-n-z {\n  padding-top: 0 !important;\n}\n\n.p-e-z {\n  padding-right: 0 !important;\n}\n\n.p-s-z {\n  padding-bottom: 0 !important;\n}\n\n.p-w-z {\n  padding-left: 0 !important;\n}\n\n.p-n-xl {\n  padding-top: 25px;\n}\n\n.p-e-xl {\n  padding-right: 25px;\n}\n\n.p-s-xl {\n  padding-bottom: 25px;\n}\n\n.p-w-xl {\n  padding-left: 25px;\n}\n\n.p-n-lg {\n  padding-top: 20px;\n}\n\n.p-e-lg {\n  padding-right: 20px;\n}\n\n.p-s-lg {\n  padding-bottom: 20px;\n}\n\n.p-w-lg {\n  padding-left: 20px;\n}\n\n.p-n-med {\n  padding-top: 15px;\n}\n\n.p-e-med {\n  padding-right: 15px;\n}\n\n.p-s-med {\n  padding-bottom: 15px;\n}\n\n.p-w-med {\n  padding-left: 15px;\n}\n\n.p-n-sm {\n  padding-top: 10px;\n}\n\n.p-e-sm {\n  padding-right: 10px;\n}\n\n.p-s-sm {\n  padding-bottom: 10px;\n}\n\n.p-w-sm {\n  padding-left: 10px;\n}\n\n.p-n-xs {\n  padding-top: 5px;\n}\n\n.p-e-xs {\n  padding-right: 5px;\n}\n\n.p-s-xs {\n  padding-bottom: 5px;\n}\n\n.p-w-xs {\n  padding-left: 5px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-n-xxs {\n  padding-top: 2px;\n}\n\n.p-e-xxs {\n  padding-right: 2px;\n}\n\n.p-s-xxs {\n  padding-bottom: 2px;\n}\n\n.p-w-xxs {\n  padding-left: 2px;\n}\n\n.p-xxs {\n  padding: 2px;\n}\n\n.p-xs {\n  padding: 5px;\n}\n\n.p-sm {\n  padding: 10px;\n}\n\n.p-med {\n  padding: 15px;\n}\n\n.p-lg {\n  padding: 20px;\n}\n\n.p-xl {\n  padding: 25px;\n}\n\n.m-xxs {\n  margin: 2px;\n}\n\n.m-xs {\n  margin: 5px;\n}\n\n.m-sm {\n  margin: 10px;\n}\n\n.m-med {\n  margin: 15px;\n}\n\n.m-lg {\n  margin: 20px;\n}\n\n.m-xl {\n  margin: 25px;\n}\n\n.ev-gutter-column {\n  cursor: col-resize;\n}\n\n.ev-gutter-row {\n  cursor: row-resize;\n}\n\n.ev-gutter:not(.ev-gutter-no-resize)::after {\n  display: block;\n  position: relative;\n  content: \"\";\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-column::after {\n  width: 8px;\n  height: 100%;\n  margin-left: -4px;\n}\n.ev-gutter:not(.ev-gutter-no-resize).ev-gutter-row::after {\n  width: 100%;\n  height: 8px;\n  margin-top: -4px;\n}\n\n.ev-layout-pane-maximized {\n  border: 0;\n}\n\n/*# sourceMappingURL=EvLayout.vue.map */","<template>\n  <ev-layout-child v-if=\"layoutData\" :child=\"layoutData\">\n    <!-- EvLayout will create one slot for each pane you define -->\n    <slot v-for=\"(_, name) in $slots\" :slot=\"name\" :name=\"name\" />\n    <template v-for=\"(_, name) in $scopedSlots\" :slot=\"name\" slot-scope=\"slotData\">\n      <!-- @vuese-ignore -->\n      <slot :name=\"name\" v-bind=\"slotData\" />\n    </template>\n  </ev-layout-child>\n</template>\n\n<script>\nimport cloneDeep from 'lodash/cloneDeep';\nimport Split from '../../../vendor/split-grid';\nimport EvLayoutChild from '../EvLayoutChild.vue';\n\nexport default {\n  name: 'EvLayout',\n\n  components: {\n    EvLayoutChild\n  },\n\n  props: {\n    // The top-level Pane\n    layout: {\n      type: Object,\n      required: true\n    }\n  },\n\n  data() {\n    return {\n      layoutData: null\n    };\n  },\n\n  async created() {\n    this.layoutData = cloneDeep(this.layout);\n    this.loadUiState();\n  },\n\n  async mounted() {\n    let rowGutters = [...this.$el.querySelectorAll('.ev-gutter-row')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    let columnGutters = [...this.$el.querySelectorAll('.ev-gutter-column')].map((gutter) => ({\n      track: Array.prototype.indexOf.call(gutter.parentNode.children, gutter),\n      element: gutter\n    }));\n\n    // Return the panes before and after this gutter to their default sizes\n    for (const gutter of [...this.$el.querySelectorAll('.ev-gutter')]) {\n      gutter.addEventListener('doubleclick', (e) => {\n        let parent = e.target.parentElement;\n        let parentName = parent.dataset.evlayoutName;\n        let track = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);\n        let leadingIndex = Math.floor(track / 2);\n        let trailingIndex = Math.ceil(track / 2);\n        let gridTemplate = parent.style.gridTemplateColumns || parent.style.gridTemplateRows;\n        let sizes = gridTemplate.split(' ').filter(s => s !== '0px');\n        let defaultSizes = this.defaultSizeForTrack(parentName, this.layout);\n\n        sizes[leadingIndex] = defaultSizes[leadingIndex];\n        sizes[trailingIndex] = defaultSizes[trailingIndex];\n\n        gridTemplate = sizes.join(' 0px ');\n\n        if (this.$evstore && this.$evstore.$ui) {\n          this.syncLayoutDataForPane(parentName, this.layoutData, sizes);\n          this.saveUiState();\n        }\n      });\n    }\n\n    let minSizeReducer = (acc, gutter) => {\n      let prevPane = gutter.previousElementSibling;\n\n      if (prevPane) {\n        let minSize = parseInt(prevPane.dataset.minSize || 0);\n        let index = Array.prototype.indexOf.call(prevPane.parentNode.children, prevPane);\n        acc[index] = minSize;\n      }\n\n      let nextPane = gutter.nextElementSibling;\n\n      if (nextPane) {\n        let minSizeNext = parseInt(nextPane.dataset.minSize || 0);\n        let indexNext = Array.prototype.indexOf.call(nextPane.parentNode.children, nextPane);\n\n        acc[indexNext] = minSizeNext;\n      }\n\n      return acc;\n    };\n\n    let columnMinSizes = [...this.$el.querySelectorAll('.ev-gutter-column')].reduce(minSizeReducer, {});\n    let rowMinSizes = [...this.$el.querySelectorAll('.ev-gutter-row')].reduce(minSizeReducer, {});\n\n    let onDragStart = (direction, track, element) => {\n      // Fired when any pane starts dragging\n      // @arg direction, track, gutter element\n      this.$emit('dragStart', { direction, track, element });\n    };\n\n    let onDrag = (direction, track, element, gridTemplateStyle) => {\n      addMinimizedMaximizedClasses(direction, track, element);\n\n      // Fired when any pane is dragging\n      // @arg direction, track, gutter element, gridTemplateStyle\n      this.$emit('drag', {\n        direction, track, element, gridTemplateStyle\n      });\n    };\n\n    let addMinimizedMaximizedClasses = (direction, track, element) => {\n      let maximizedClassName = 'ev-layout-pane-maximized';\n      let minimizedClassName = 'ev-layout-pane-minimized';\n      let offsetKey = direction === 'column' ? 'offsetWidth' : 'offsetHeight';\n      let parent = element.parentElement;\n      let previousPane = element.previousElementSibling;\n      let nextPane = element.nextElementSibling;\n\n      if (previousPane && previousPane[offsetKey] === parent[offsetKey]) {\n        previousPane.classList.add(maximizedClassName);\n      } else if (previousPane.classList.contains(maximizedClassName)) {\n        previousPane.classList.remove(maximizedClassName);\n      }\n\n      if (previousPane && previousPane[offsetKey] === 0) {\n        previousPane.classList.add(minimizedClassName);\n      } else if (previousPane.classList.contains(minimizedClassName)) {\n        previousPane.classList.remove(minimizedClassName);\n      }\n\n      if (nextPane && nextPane[offsetKey] === parent[offsetKey]) {\n        nextPane.classList.add(maximizedClassName);\n      } else if (nextPane.classList.contains(maximizedClassName)) {\n        nextPane.classList.remove(maximizedClassName);\n      }\n\n      if (nextPane && nextPane[offsetKey] === 0) {\n        nextPane.classList.add(minimizedClassName);\n      } else if (nextPane.classList.contains(minimizedClassName)) {\n        nextPane.classList.remove(minimizedClassName);\n      }\n    };\n\n    for (const gutter of rowGutters) {\n      addMinimizedMaximizedClasses('row', gutter.track, gutter.element);\n    }\n\n    for (const gutter of columnGutters) {\n      addMinimizedMaximizedClasses('column', gutter.track, gutter.element);\n    }\n\n    let onDragEnd = async (direction, track, element) => {\n      // Fired when any pane ends dragging\n      // @arg direction, track, gutter element\n      this.$emit('dragEnd', { direction, track, element });\n\n      if (this.$evstore && this.$evstore.$ui) {\n        let { gridTemplateColumns, gridTemplateRows } = element.parentElement.style;\n        let gridTemplate = gridTemplateColumns || gridTemplateRows;\n        let sizes = gridTemplate.split(' 0px ');\n        let name = element.parentElement.dataset.evlayoutName;\n        this.syncLayoutDataForPane(name, this.layoutData, sizes);\n        this.saveUiState();\n      }\n    };\n\n    Split({\n      columnGutters, rowGutters, columnMinSizes, rowMinSizes, onDragStart, onDrag, onDragEnd\n    });\n  },\n\n  methods: {\n    loadUiState() {\n      if (!this.$evstore || !this.$evstore.$ui) return;\n\n      if (typeof this.$evstore.$ui.store.layout === 'object') {\n        for (const [paneName, paneSizes] of Object.entries(this.$evstore.$ui.store.layout)) {\n          this.syncLayoutDataForPane(paneName, this.layoutData, paneSizes);\n        }\n      }\n    },\n\n    saveUiState() {\n      this.$set(this.$evstore.$ui.store, 'layout', this.getSizesForPanes(this.layoutData));\n    },\n\n    syncLayoutDataForPane(name, layoutData, sizes) {\n      if (layoutData.name === name) {\n        layoutData.sizes = sizes;\n        return;\n      }\n\n      for (let idx = 0; idx < layoutData.panes.length; idx++) {\n        let pane = layoutData.panes[idx];\n        if (!pane) continue;\n        if (pane.name === name) {\n          pane.sizes = sizes;\n        }\n        if (pane.panes) {\n          this.syncLayoutDataForPane(name, pane, sizes);\n        }\n      }\n    },\n\n    defaultSizeForTrack(name, layoutData) {\n      if (layoutData.name === name) {\n        return layoutData.sizes;\n      }\n\n      for (let idx = 0; idx < layoutData.panes.length; idx++) {\n        let pane = layoutData.panes[idx];\n        if (!pane) continue;\n        if (pane.name === name) {\n          return pane.sizes;\n        }\n        if (pane.panes) {\n          this.defaultSizeForTrack(name, pane);\n        }\n      }\n    },\n\n    getSizesForPanes(layoutData, sizes = {}) {\n      sizes[layoutData.name] = layoutData.sizes;\n\n      for (let idx = 0; idx < layoutData.panes.length; idx++) {\n        let pane = layoutData.panes[idx];\n        if (!pane) continue;\n        sizes[pane.name] = pane.sizes;\n        if (pane.panes) {\n          this.getSizesForPanes(pane, sizes);\n        }\n      }\n\n      return sizes;\n    }\n\n  }\n};\n</script>\n\n<style lang=\"scss\" scoped>\n@import '../../../style/reset.scss';\n@import '../../../style/utilities.scss';\n@import '../../../style/split-grid.scss';\n</style>\n"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__$1 = "data-v-6ba1d8c3";
    /* module identifier */
    const __vue_module_identifier__$1 = undefined;
    /* functional template */
    const __vue_is_functional_template__$1 = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$1 = /*#__PURE__*/normalizeComponent$1(
      { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
      __vue_inject_styles__$1,
      __vue_script__$1,
      __vue_scope_id__$1,
      __vue_is_functional_template__$1,
      __vue_module_identifier__$1,
      false,
      createInjector$1,
      undefined,
      undefined
    );

  function install(Vue) {
    if (install.installed) return;
    install.installed = true;
    Vue.component('EvLayout', __vue_component__$1);
  }

  const plugin = {
    install
  };

  let GlobalVue = null;
  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }
  if (GlobalVue) {
    GlobalVue.use(plugin);
  }

  exports.default = __vue_component__$1;
  exports.install = install;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
