'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* global test, expect */


var _reducer = require('../kea/logic/reducer');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

test('it converts reducer arrays correctly', function () {
  var reducerFunction = function reducerFunction(state) {
    return state;
  };

  var convertedArrays = (0, _reducer.convertReducerArrays)({
    everything: [0, _propTypes2.default.number, { persist: true }, { ACTION: reducerFunction }],
    noProp: [0, { persist: true }, { ACTION: reducerFunction }],
    noOptions: [0, _propTypes2.default.number, { ACTION: reducerFunction }],
    noPropNoOptions: [0, { ACTION: reducerFunction }]
  });

  expect(_typeof(convertedArrays.everything.reducer)).toBe('function');
  expect(_typeof(convertedArrays.noProp.reducer)).toBe('function');
  expect(_typeof(convertedArrays.noOptions.reducer)).toBe('function');
  expect(_typeof(convertedArrays.noPropNoOptions.reducer)).toBe('function');

  expect(convertedArrays).toEqual({
    everything: {
      options: { persist: true },
      reducer: convertedArrays.everything.reducer,
      type: _propTypes2.default.number,
      value: 0
    },
    noProp: {
      options: { persist: true },
      reducer: convertedArrays.noProp.reducer,
      type: undefined,
      value: 0
    },
    noOptions: {
      reducer: convertedArrays.noOptions.reducer,
      type: _propTypes2.default.number,
      value: 0
    },
    noPropNoOptions: {
      reducer: convertedArrays.noPropNoOptions.reducer,
      type: undefined,
      value: 0
    }
  });
});