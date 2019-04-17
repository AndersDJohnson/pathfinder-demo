(function () {
  var __hasProp = Object.prototype.hasOwnProperty;

  if (typeof this.define !== 'function') this.define = require('amdefine')(module);

  this.define(function (require) {
    var array_random, exports, getName, isInt, object_clone, object_merge;
    getName = function (thing) {
      var funcNameRegex, results;
      if (typeof this.name !== 'undefined') {
        return this.name;
      } else {
        funcNameRegex = /function (.{1,})\(/;
        results = funcNameRegex.exec(thing.constructor.toString());
        return (results && results.length > 1 ? results[1] : "");
      }
    };
    isInt = function (n) {
      return !!((getName(n) === 'Number') && (parseFloat(n) === parseInt(n)) && (!isNaN(n)));
    };
    array_random = function (array) {
      return Math.round(Math.random() * array.length);
    };
    object_clone = function (src) {
      var k, neu, v, _i, _len;
      if (typeof src !== 'object' || src === null) return src;
      neu = new src.constructor();
      if (src instanceof Object) {
        for (k in src) {
          if (!__hasProp.call(src, k)) continue;
          v = src[k];
          neu[k] = object_clone(v);
        }
      } else if (src instanceof Array) {
        neu = [];
        for (_i = 0, _len = src.length; _i < _len; _i++) {
          v = src[_i];
          neu.push(object_clone(v));
        }
      }
      return neu;
    };
    object_merge = function (original, merging, clone, join_arrays) {
      var recursive;
      if (clone == null) clone = false;
      if (join_arrays == null) join_arrays = false;
      recursive = function (original, merging, clone) {
        var key, obj, value;
        if (original === null || typeof original !== "object") return merging;
        obj = clone ? module.exports.object_clone(original) : original;
        if (join_arrays && obj instanceof Array && merging instanceof Array) {
          obj = obj.concat(merging);
        } else {
          for (key in merging) {
            if (!__hasProp.call(merging, key)) continue;
            value = merging[key];
            if (key in obj) {
              if (obj instanceof Object) {
                if (value instanceof Object) {
                  obj[key] = recursive(obj[key], value, clone, join_arrays);
                } else {
                  obj[key] = value;
                }
              }
            } else {
              obj[key] = value;
            }
          }
        }
        return obj;
      };
      return recursive(original, merging, clone, join_arrays);
    };
    exports = {
      'getName': getName,
      'isInt': isInt,
      'array_random': array_random,
      'object_clone': object_clone,
      'object_merge': object_merge
    };
    return exports;
  });

}).call(this);
