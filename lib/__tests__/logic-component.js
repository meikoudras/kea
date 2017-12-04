'use strict';

var _index = require('../index');

require('./helper/jsdom');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _enzyme = require('enzyme');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* global test, expect, beforeEach */


var SampleComponent = function (_Component) {
  _inherits(SampleComponent, _Component);

  function SampleComponent() {
    _classCallCheck(this, SampleComponent);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  SampleComponent.prototype.render = function render() {
    var _props = this.props,
        id = _props.id,
        name = _props.name,
        capitalizedName = _props.capitalizedName;
    var updateName = this.actions.updateName;


    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        { className: 'id' },
        id
      ),
      _react2.default.createElement(
        'div',
        { className: 'name' },
        name
      ),
      _react2.default.createElement(
        'div',
        { className: 'capitalizedName' },
        capitalizedName
      ),
      _react2.default.createElement(
        'div',
        { className: 'updateName', onClick: updateName },
        'updateName'
      )
    );
  };

  return SampleComponent;
}(_react.Component);

var ActionComponent = function (_Component2) {
  _inherits(ActionComponent, _Component2);

  function ActionComponent() {
    _classCallCheck(this, ActionComponent);

    return _possibleConstructorReturn(this, _Component2.apply(this, arguments));
  }

  ActionComponent.prototype.render = function render() {
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(
        'div',
        { className: 'actions' },
        Object.keys(this.actions).sort().join(',')
      ),
      _react2.default.createElement(
        'div',
        { className: 'props' },
        Object.keys(this.props).sort().join(',')
      ),
      _react2.default.createElement(
        'div',
        { className: 'name' },
        this.props.name
      )
    );
  };

  return ActionComponent;
}(_react.Component);

beforeEach(function () {
  (0, _index.resetKeaCache)();
});

test('singletons connect to react components', function () {
  var store = (0, _index.getStore)();

  var singletonLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'something'];
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

  var ConnectedComponent = singletonLogic(SampleComponent);

  var wrapper = (0, _enzyme.mount)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(ConnectedComponent, { id: 12 })
  ));

  expect(wrapper.find('.id').text()).toEqual('12');
  expect(wrapper.find('.name').text()).toEqual('chirpy');
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy');

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { name: 'chirpy' } } });

  var sampleComponent = wrapper.find('SampleComponent').node;

  expect(sampleComponent.actions).toBeDefined();
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName']);

  var updateName = sampleComponent.actions.updateName;

  updateName('somename');

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { name: 'somename' } } });

  wrapper.render();

  expect(wrapper.find('.id').text()).toEqual('12');
  expect(wrapper.find('.name').text()).toEqual('somename');
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename');

  wrapper.unmount();
});

test('dynamic connect to react components', function () {
  var store = (0, _index.getStore)();

  var dynamicLogic = (0, _index.kea)({
    key: function key(props) {
      return props.id;
    },
    path: function path(key) {
      return ['scenes', 'something', key];
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
          return payload.name + payload.key;
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

  var ConnectedComponent = dynamicLogic(SampleComponent);

  var wrapper = (0, _enzyme.mount)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(ConnectedComponent, { id: 12 })
  ));

  expect(wrapper.find('.id').text()).toEqual('12');
  expect(wrapper.find('.name').text()).toEqual('chirpy');
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy');

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { 12: { name: 'chirpy' } } } });

  var sampleComponent = wrapper.find('SampleComponent').node;

  expect(sampleComponent.actions).toBeDefined();
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName']);

  var updateName = sampleComponent.actions.updateName;

  updateName('somename');

  expect(store.getState()).toEqual({ kea: {}, scenes: { something: { 12: { name: 'somename12' } } } });

  wrapper.render();

  expect(wrapper.find('.id').text()).toEqual('12');
  expect(wrapper.find('.name').text()).toEqual('somename12');
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename12');

  wrapper.unmount();
});

test('connected props can be used as selectors', function () {
  var store = (0, _index.getStore)();

  var firstLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'first'];
    },
    actions: function actions(_ref9) {
      var constants = _ref9.constants;
      return {
        updateName: function updateName(name) {
          return { name: name };
        }
      };
    },
    reducers: function reducers(_ref10) {
      var _ref11;

      var actions = _ref10.actions,
          constants = _ref10.constants;
      return {
        name: ['chirpy', _propTypes2.default.string, (_ref11 = {}, _ref11[actions.updateName] = function (state, payload) {
          return payload.name;
        }, _ref11)]
      };
    }
  });

  var secondLogic = (0, _index.kea)({
    path: function path() {
      return ['scenes', 'homepage', 'second'];
    },
    connect: {
      props: [firstLogic, ['name']],
      actions: [firstLogic, ['updateName']]
    },
    selectors: function selectors(_ref12) {
      var constants = _ref12.constants,
          _selectors3 = _ref12.selectors;
      return {
        capitalizedName: [function () {
          return [_selectors3.name];
        }, function (name) {
          return name.trim().split(' ').map(function (k) {
            return '' + k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
          }).join(' ');
        }, _propTypes2.default.string]
      };
    }
  });

  var ConnectedComponent = secondLogic(SampleComponent);

  var wrapper = (0, _enzyme.mount)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(ConnectedComponent, { id: 12 })
  ));

  expect(wrapper.find('.id').text()).toEqual('12');
  expect(wrapper.find('.name').text()).toEqual('chirpy');
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpy');

  expect(store.getState()).toEqual({ kea: {}, scenes: { homepage: { first: { name: 'chirpy' }, second: {} } } });

  var sampleComponent = wrapper.find('SampleComponent').node;

  expect(sampleComponent.actions).toBeDefined();
  expect(Object.keys(sampleComponent.actions)).toEqual(['updateName']);

  var updateName = sampleComponent.actions.updateName;

  updateName('somename');

  expect(store.getState()).toEqual({ kea: {}, scenes: { homepage: { first: { name: 'somename' }, second: {} } } });

  wrapper.render();

  expect(wrapper.find('.id').text()).toEqual('12');
  expect(wrapper.find('.name').text()).toEqual('somename');
  expect(wrapper.find('.capitalizedName').text()).toEqual('Somename');

  wrapper.unmount();
});

test('doubly connected actions are merged', function () {
  var store = (0, _index.getStore)();

  var firstLogic = (0, _index.kea)({
    actions: function actions(_ref13) {
      var constants = _ref13.constants;
      return {
        updateName: function updateName(name) {
          return { name: name };
        }
      };
    },
    reducers: function reducers(_ref14) {
      var _ref15;

      var actions = _ref14.actions,
          constants = _ref14.constants;
      return {
        name: ['chirpy', _propTypes2.default.string, (_ref15 = {}, _ref15[actions.updateName] = function (state, payload) {
          return payload.name;
        }, _ref15)]
      };
    }
  });

  var secondLogic = (0, _index.kea)({
    actions: function actions(_ref16) {
      var constants = _ref16.constants;
      return {
        updateNameAgain: function updateNameAgain(name) {
          return { name: name };
        }
      };
    }
  });

  var ConnectedComponent = firstLogic(secondLogic(ActionComponent));

  var wrapper = (0, _enzyme.mount)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(ConnectedComponent, null)
  ));

  expect(wrapper.find('.props').text()).toEqual('actions,dispatch,name,root');
  expect(wrapper.find('.actions').text()).toEqual('updateName,updateNameAgain');

  wrapper.unmount();
});

test('no protypes needed', function () {
  var store = (0, _index.getStore)();

  var firstLogic = (0, _index.kea)({
    actions: function actions(_ref17) {
      var constants = _ref17.constants;
      return {
        updateName: function updateName(name) {
          return { name: name };
        }
      };
    },
    reducers: function reducers(_ref18) {
      var _ref19;

      var actions = _ref18.actions,
          constants = _ref18.constants;
      return {
        name: ['chirpy', (_ref19 = {}, _ref19[actions.updateName] = function (state, payload) {
          return payload.name;
        }, _ref19)]
      };
    }
  });

  var secondLogic = (0, _index.kea)({
    actions: function actions(_ref20) {
      var constants = _ref20.constants;
      return {
        updateNameAgain: function updateNameAgain(name) {
          return { name: name };
        }
      };
    }
  });

  var ConnectedComponent = firstLogic(secondLogic(ActionComponent));

  var wrapper = (0, _enzyme.mount)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(ConnectedComponent, null)
  ));

  expect(wrapper.find('.props').text()).toEqual('actions,dispatch,name,root');
  expect(wrapper.find('.actions').text()).toEqual('updateName,updateNameAgain');
  var sampleComponent = wrapper.find('ActionComponent').node;

  var updateName = sampleComponent.actions.updateName;

  updateName('somename');

  expect(wrapper.find('.name').text()).toEqual('somename');

  wrapper.unmount();
});