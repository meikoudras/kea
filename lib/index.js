'use strict';

exports.__esModule = true;
exports.connect = exports.activatePlugin = exports.setCache = exports.getCache = exports.getStore = exports.createAction = exports.keaReducer = exports.kea = undefined;

var _kea = require('./kea');

Object.defineProperty(exports, 'kea', {
  enumerable: true,
  get: function get() {
    return _kea.kea;
  }
});

var _reducer = require('./kea/reducer');

Object.defineProperty(exports, 'keaReducer', {
  enumerable: true,
  get: function get() {
    return _reducer.keaReducer;
  }
});

var _create = require('./kea/actions/create');

Object.defineProperty(exports, 'createAction', {
  enumerable: true,
  get: function get() {
    return _create.createAction;
  }
});

var _store = require('./kea/store');

Object.defineProperty(exports, 'getStore', {
  enumerable: true,
  get: function get() {
    return _store.getStore;
  }
});

var _cache = require('./kea/cache');

Object.defineProperty(exports, 'getCache', {
  enumerable: true,
  get: function get() {
    return _cache.getCache;
  }
});
Object.defineProperty(exports, 'setCache', {
  enumerable: true,
  get: function get() {
    return _cache.setCache;
  }
});

var _plugins = require('./kea/plugins');

Object.defineProperty(exports, 'activatePlugin', {
  enumerable: true,
  get: function get() {
    return _plugins.activatePlugin;
  }
});
exports.resetKeaCache = resetKeaCache;
var connect = exports.connect = function connect(mapping) {
  return (0, _kea.kea)({ connect: mapping });
};

function resetKeaCache() {
  (0, _cache.resetCache)();
  (0, _create.clearActionCache)();
  (0, _reducer.clearReducerCache)();
  (0, _plugins.clearActivatedPlugins)();
}