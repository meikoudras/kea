'use strict';

var _index = require('../index');

var _redux = require('redux');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

beforeEach(function () {
  (0, _index.resetKeaCache)();
}); /* global test, expect, beforeEach */


test('connected props and actions get passed, reducers get added to the store', function () {
  var scenesReducer = (0, _index.keaReducer)('scenes');

  var reducerState1 = scenesReducer({}, { type: 'discard' });
  expect(reducerState1).toEqual({});

  var firstLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'first'];
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

  var reducerState2 = scenesReducer({}, { type: 'discard' });
  expect(reducerState2).toEqual({ homepage: { first: { name: 'chirpy' } } });
  expect(Object.keys(firstLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'root']);

  var secondLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'second'];
    },
    connect: {
      actions: [firstLogic, ['updateName']],
      props: [firstLogic, ['name', 'capitalizedName']]
    }
  });

  expect(secondLogic._isKeaFunction).toBe(true);
  expect(secondLogic._isKeaSingleton).toBe(true);
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second']);
  expect(Object.keys(secondLogic.actions)).toEqual(['updateName']);
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'root']);

  var reducerState3 = scenesReducer({}, { type: 'discard' });
  expect(reducerState3).toEqual({ homepage: { first: { name: 'chirpy' }, second: {} } });

  var thirdLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'third'];
    },
    connect: {
      actions: [firstLogic, ['updateName']],
      props: [firstLogic, ['name', 'capitalizedName']]
    },
    actions: function actions(_ref5) {
      var constants = _ref5.constants;
      return {
        updateNameAgain: function updateNameAgain(name) {
          return { name: name };
        }
      };
    }
  });

  expect(thirdLogic._isKeaFunction).toBe(true);
  expect(thirdLogic._isKeaSingleton).toBe(true);
  expect(thirdLogic.path).toEqual(['scenes', 'homepage', 'third']);
  expect(Object.keys(thirdLogic.actions)).toEqual(['updateName', 'updateNameAgain']);
  expect(Object.keys(thirdLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'root']);

  var reducerState4 = scenesReducer({}, { type: 'discard' });
  expect(reducerState4).toEqual({ homepage: { first: { name: 'chirpy' }, second: {}, third: {} } });

  var fourthLogic = (0, _index.kea)({
    connect: {
      actions: [firstLogic, ['updateName'], thirdLogic, ['updateNameAgain']],
      props: [firstLogic, ['name', 'capitalizedName']]
    }
  });

  expect(fourthLogic._isKeaFunction).toBe(true);
  expect(fourthLogic._isKeaSingleton).toBe(true);
  expect(fourthLogic.path).not.toBeDefined();
  expect(Object.keys(fourthLogic.actions)).toEqual(['updateName', 'updateNameAgain']);
  expect(Object.keys(fourthLogic.selectors).sort()).toEqual(['capitalizedName', 'name']);

  var reducerState5 = scenesReducer({}, { type: 'discard' });
  expect(reducerState5).toEqual(reducerState4);
});

test('connected props can be used as selectors', function () {
  var store = (0, _redux.createStore)((0, _redux.combineReducers)({
    scenes: (0, _index.keaReducer)('scenes')
  }));

  var firstLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'first'];
    },
    actions: function actions(_ref6) {
      var constants = _ref6.constants;
      return {
        updateName: function updateName(name) {
          return { name: name };
        }
      };
    },
    reducers: function reducers(_ref7) {
      var _ref8;

      var actions = _ref7.actions,
          constants = _ref7.constants;
      return {
        name: ['chirpy', _propTypes2.default.string, (_ref8 = {}, _ref8[actions.updateName] = function (state, payload) {
          return payload.name;
        }, _ref8)]
      };
    }
  });

  var secondLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'second'];
    },
    connect: {
      props: [firstLogic, ['name']]
    },
    selectors: function selectors(_ref9) {
      var constants = _ref9.constants,
          _selectors2 = _ref9.selectors;
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

  expect(secondLogic._isKeaFunction).toBe(true);
  expect(secondLogic._isKeaSingleton).toBe(true);
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second']);
  expect(Object.keys(secondLogic.actions)).toEqual([]);
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['capitalizedName', 'name', 'root']);

  store.dispatch(firstLogic.actions.updateName('derpy'));
  expect(secondLogic.selectors.capitalizedName(store.getState())).toBe('Derpy');
});

test('can get everything with *', function () {
  var store = (0, _redux.createStore)((0, _redux.combineReducers)({
    scenes: (0, _index.keaReducer)('scenes')
  }));

  var firstLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'first'];
    },
    actions: function actions(_ref10) {
      var constants = _ref10.constants;
      return {
        updateName: function updateName(name) {
          return { name: name };
        }
      };
    },
    reducers: function reducers(_ref11) {
      var _ref12;

      var actions = _ref11.actions,
          constants = _ref11.constants;
      return {
        name: ['chirpy', _propTypes2.default.string, (_ref12 = {}, _ref12[actions.updateName] = function (state, payload) {
          return payload.name;
        }, _ref12)]
      };
    }
  });

  var secondLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'second'];
    },
    connect: {
      props: [firstLogic, ['name', '* as everything']]
    }
  });

  expect(secondLogic._isKeaFunction).toBe(true);
  expect(secondLogic._isKeaSingleton).toBe(true);
  expect(secondLogic.path).toEqual(['scenes', 'homepage', 'second']);
  expect(Object.keys(secondLogic.actions)).toEqual([]);
  expect(Object.keys(secondLogic.selectors).sort()).toEqual(['everything', 'name', 'root']);

  store.dispatch(firstLogic.actions.updateName('derpy'));
  expect(secondLogic.selectors.everything(store.getState())).toEqual({ name: 'derpy' });
});