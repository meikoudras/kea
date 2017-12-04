'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.clearActionCache = clearActionCache;
exports.createAction = createAction;
exports.createActions = createActions;
function isObject(item) {
  return (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && !Array.isArray(item) && item !== null;
}

var actionCache = {};

function clearActionCache() {
  actionCache = {};
}

function createAction(type, payloadCreator) {
  if (actionCache[type]) {
    return actionCache[type];
  }

  var action = function action() {
    return {
      type: type,
      payload: typeof payloadCreator === 'function' ? payloadCreator.apply(undefined, arguments) : isObject(payloadCreator) ? payloadCreator : { value: payloadCreator }
    };
  };
  action.toString = function () {
    return type;
  };

  actionCache[type] = action;

  return action;
}

var toSpaces = function toSpaces(key) {
  return key.replace(/(?:^|\.?)([A-Z])/g, function (x, y) {
    return ' ' + y.toLowerCase();
  }).replace(/^ /, '');
};

function createActions() {
  var mapping = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var path = arguments[1];

  var actions = {};

  var _ref = typeof path === 'string' ? path.split('.') : path,
      scenes = _ref[0],
      rest = _ref.slice(1);

  var fullPath = scenes === 'scenes' ? rest.join('.') : scenes + (rest.length > 0 ? '.' + rest.join('.') : '');
  Object.keys(mapping).forEach(function (key) {
    var fullKey = toSpaces(key) + ' (' + fullPath + ')';
    actions[key] = createAction(fullKey, mapping[key]);
  });

  return actions;
}