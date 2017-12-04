'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.clearReducerCache = clearReducerCache;
exports.keaReducer = keaReducer;
exports.firstReducerRoot = firstReducerRoot;
exports.addReducer = addReducer;
exports.regenerateRootReducer = regenerateRootReducer;
exports.isSyncedWithStore = isSyncedWithStore;
exports.recursiveCreateReducer = recursiveCreateReducer;

var _redux = require('redux');

// worker functions are loaded globally, reducers locally in store
var defaultReducerRoot = null;

// all reducers that are created
var reducerTree = {};
var rootReducers = {};
var syncedWithStore = {};

var defaultState = {};

function clearReducerCache() {
  defaultReducerRoot = null;
  reducerTree = {};
  rootReducers = {};
  syncedWithStore = {};
}

function initRootReducerTree(pathStart) {
  if (!reducerTree[pathStart]) {
    reducerTree[pathStart] = {};
    regenerateRootReducer(pathStart);
  }
}

function keaReducer() {
  var pathStart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'scenes';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  initRootReducerTree(pathStart);

  if (options && options.default) {
    defaultReducerRoot = pathStart;
  }

  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;
    var action = arguments[1];

    return rootReducers[pathStart] ? rootReducers[pathStart](state, action) : state;
  };
}

function firstReducerRoot() {
  return defaultReducerRoot || Object.keys(reducerTree)[0];
}

function addReducer(path, reducer) {
  var pathStart = path[0];

  initRootReducerTree(pathStart);

  syncedWithStore[pathStart] = false;

  var pointer = reducerTree;

  for (var i = 0; i < path.length; i++) {
    var pathPart = path[i];

    // last part of the path, so [..., pathPart] = path
    if (i === path.length - 1) {
      // there's already something here!
      if (pointer[pathPart]) {
        // if we're in the root level in the tree and it's an empty object
        if (i === 0 && _typeof(pointer[pathPart]) === 'object' && Object.keys(pointer[pathPart]).length === 0) {
          // don't block here

          // if it's a function, assume it's a reducer and replacing it is fine
          // otherwise give an error
        } else if (typeof pointer[pathPart] !== 'function') {
          console.error('[KEA-LOGIC] Can not add reducer to "' + path.join('.') + '". There is something in the way:', pointer[pathPart]);
          return;
        }
      }

      pointer[pathPart] = reducer;
    } else {
      if (!pointer[pathPart]) {
        pointer[pathPart] = {};
      }
      pointer = pointer[pathPart];
    }
  }

  regenerateRootReducer(pathStart);
}

function regenerateRootReducer(pathStart) {
  var rootReducer = recursiveCreateReducer(reducerTree[pathStart]);

  rootReducers[pathStart] = function (state, action) {
    syncedWithStore[pathStart] = true;
    return rootReducer(state, action);
  };
}

function isSyncedWithStore() {
  var pathStart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if (pathStart) {
    return syncedWithStore[pathStart];
  } else {
    return Object.values(syncedWithStore).filter(function (k) {
      return !k;
    }).length === 0;
  }
}

function recursiveCreateReducer(treeNode) {
  if (typeof treeNode === 'function') {
    return treeNode;
  }

  var children = {};

  Object.keys(treeNode).forEach(function (key) {
    children[key] = recursiveCreateReducer(treeNode[key]);
  });

  return Object.keys(children).length > 0 ? (0, _redux.combineReducers)(children) : function (state, action) {
    return state;
  };
}