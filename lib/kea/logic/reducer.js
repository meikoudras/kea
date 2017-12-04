'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.createReducer = createReducer;
exports.combineReducerObjects = combineReducerObjects;
exports.convertReducerArrays = convertReducerArrays;

var _redux = require('redux');

function warnIfUndefinedActionCreator(object, property) {
  if (process.env.NODE_ENV !== 'production') {
    if (object.reducer.undefined !== undefined) {
      console.warn('A reducer with the property "' + property + '" is waiting for an action where its key is not defined.');
    }
  }

  return object;
}

// create reducer function from such an object { [action]: (state, payload) => state }
function createReducer(mapping, defaultValue) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultValue;
    var action = arguments[1];

    if (mapping[action.type]) {
      return mapping[action.type](state, action.payload, action.meta);
    } else {
      return state;
    }
  };
}

// input: object with values: { value, type, reducer, ...options } or function(state, action) {}
// output: combined reducer function (state, action) {}
function combineReducerObjects(path, objects) {
  var reducers = {};

  Object.keys(objects).forEach(function (key) {
    reducers[key] = objects[key].reducer;
  });

  if (Object.keys(reducers).length > 0) {
    return (0, _redux.combineReducers)(reducers);
  } else {
    return function () {
      return {};
    };
  }
}

// input: object with values: [value, (type), (options), reducer]
// output: object with values: { value, type, reducer, ...options }
function convertReducerArrays(reducers) {
  if (!reducers) {
    return reducers;
  }

  var keys = Object.keys(reducers);
  for (var i = 0; i < keys.length; i++) {
    var s = reducers[keys[i]];
    if (Array.isArray(s)) {
      // s = [ value, (type), (options), reducer ]
      var value = s[0];
      var reducer = s[s.length - 1];
      var type = typeof s[1] === 'function' ? s[1] : undefined;
      var options = _typeof(s[s.length - 2]) === 'object' ? s[s.length - 2] : undefined;

      var reducerObject = {
        value: value,
        type: type,
        reducer: typeof reducer === 'function' ? reducer : createReducer(reducer, value)
      };

      if (options) {
        reducerObject.options = options;
      }

      reducers[keys[i]] = warnIfUndefinedActionCreator(reducerObject, keys[i]);
    }
  }

  return reducers;
}