'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* global test, expect, beforeEach */


var _index = require('../index');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(function () {
  (0, _index.resetKeaCache)();
});

test('singleton logic has all the right properties', function () {
  (0, _index.keaReducer)('scenes');

  var response = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'index'];
    },
    constants: function constants() {
      return ['SOMETHING', 'SOMETHING_ELSE'];
    },
    actions: function actions(_ref) {
      var constants = _ref.constants;
      return {
        updateName: function updateName(name) {
          return { name: name };
        }
      };
    },
    reducers: function reducers(_ref2) {
      var _ref3;

      var actions = _ref2.actions,
          constants = _ref2.constants;
      return {
        name: ['chirpy', _propTypes2.default.string, (_ref3 = {}, _ref3[actions.updateName] = function (state, payload) {
          return payload.name;
        }, _ref3)]
      };
    },
    selectors: function selectors(_ref4) {
      var constants = _ref4.constants,
          _selectors = _ref4.selectors;
      return {
        capitalizedName: [function () {
          return [_selectors.name];
        }, function (name) {
          return name.trim().split(' ').map(function (k) {
            return '' + k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
          }).join(' ');
        }, _propTypes2.default.string]
      };
    }
  });

  // check generic
  expect(response._isKeaFunction).toBe(true);
  expect(response._isKeaSingleton).toBe(true);
  expect(response.path).toEqual(['scenes', 'homepage', 'index']);
  expect(response.constants).toEqual({ SOMETHING: 'SOMETHING', SOMETHING_ELSE: 'SOMETHING_ELSE' });

  // actions
  expect(Object.keys(response.actions)).toEqual(['updateName']);
  var updateName = response.actions.updateName;

  expect(typeof updateName === 'undefined' ? 'undefined' : _typeof(updateName)).toBe('function');
  expect(updateName.toString()).toBe('update name (homepage.index)');
  expect(updateName('newname')).toEqual({ payload: { name: 'newname' }, type: updateName.toString() });

  // reducers
  var defaultValues = { name: 'chirpy' };
  var state = { scenes: { homepage: { index: defaultValues } } };
  expect(Object.keys(response.reducers).sort()).toEqual(['name']);

  expect(response.reducers).toHaveProperty('name');
  expect(response.propTypes.name).toEqual(_propTypes2.default.string);
  expect(response.defaults.name).toEqual('chirpy');

  var nameReducer = response.reducers.name;
  expect(nameReducer).toBeDefined();
  expect(nameReducer('', updateName('newName'))).toBe('newName');

  // TODO: add defaults and propTypes

  expect(response.reducers).not.toHaveProperty('capitalizedName');
  expect(response.propTypes).toHaveProperty('capitalizedName', _propTypes2.default.string);
  expect(response.defaults).not.toHaveProperty('capitalizedName', 'chirpy');

  // big reducer
  expect(_typeof(response.reducer)).toBe('function');
  expect(response.reducer({}, { type: 'random action' })).toEqual(defaultValues);
  expect(response.reducer({ name: 'something' }, { type: 'random action' })).toEqual({ name: 'something' });
  expect(response.reducer({ name: 'something' }, updateName('newName'))).toEqual({ name: 'newName' });

  // selectors
  expect(Object.keys(response.selectors).sort()).toEqual(['capitalizedName', 'name', 'root']);
  expect(response.selectors.name(state)).toEqual('chirpy');
  expect(response.selectors.capitalizedName(state)).toEqual('Chirpy');

  // root selector
  expect(response.selector(state)).toEqual(defaultValues);
  expect(response.selectors.root(state)).toEqual(defaultValues);
});

test('it is not a singleton if there is a key', function () {
  (0, _index.keaReducer)('scenes');

  var response = (0, _index.kea)({
    key: function key(props) {
      return props.id;
    },
    path: function path(key) {
      return ['scenes', 'homepage', 'index', key];
    },
    constants: function constants() {
      return ['SOMETHING', 'SOMETHING_ELSE'];
    },
    actions: function actions(_ref5) {
      var constants = _ref5.constants;
      return {
        updateName: function updateName(name) {
          return { name: name };
        }
      };
    },
    reducers: function reducers(_ref6) {
      var _ref7;

      var actions = _ref6.actions,
          constants = _ref6.constants;
      return {
        name: ['chirpy', _propTypes2.default.string, (_ref7 = {}, _ref7[actions.updateName] = function (state, payload) {
          return payload.name;
        }, _ref7)]
      };
    },
    selectors: function selectors(_ref8) {
      var constants = _ref8.constants,
          _selectors2 = _ref8.selectors;
      return {
        capitalizedName: [function () {
          return [_selectors2.name];
        }, function (name) {
          return name.trim().split(' ').map(function (k) {
            return '' + k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
          }).join(' ');
        }, _propTypes2.default.string]
      };
    }
  });

  // check generic
  expect(response._isKeaFunction).toBe(true);
  expect(response._isKeaSingleton).toBe(false);
  expect(response.path).not.toBeDefined();
  expect(response.constants).toEqual({ SOMETHING: 'SOMETHING', SOMETHING_ELSE: 'SOMETHING_ELSE' });

  // actions
  expect(Object.keys(response.actions)).toEqual(['updateName']);
  var updateName = response.actions.updateName;

  expect(typeof updateName === 'undefined' ? 'undefined' : _typeof(updateName)).toBe('function');
  expect(updateName.toString()).toBe('update name (homepage.index)');
  expect(updateName('newname')).toEqual({ payload: { name: 'newname' }, type: updateName.toString() });

  // reducers
  expect(response.reducer).not.toBeDefined();
  expect(response.reducers).not.toBeDefined();

  // selectors
  expect(response.selector).not.toBeDefined();
  expect(response.selectors).not.toBeDefined();
});