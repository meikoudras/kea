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

beforeEach(function () {
  (0, _index.resetKeaCache)();
});

test('getStore can be initalized with a preloaded state', function () {
  var preloadedState = {
    'kea': {},
    'scenes': { 'something': { 'name': 'chirpy' } }
  };
  var store = (0, _index.getStore)({
    preloadedState: preloadedState
  });
  expect(store.getState()).toEqual(preloadedState);
});

test('getStore preloaded state will not be immidiatly overiden by reducer default state', function () {
  var preloadedState = {
    'kea': {},
    'scenes': { 'something': { 'name': 'chirpoo' } }
  };
  var store = (0, _index.getStore)({
    preloadedState: preloadedState
  });

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
  expect(wrapper.find('.name').text()).toEqual('chirpoo');
  expect(wrapper.find('.capitalizedName').text()).toEqual('Chirpoo');

  expect(store.getState()).toEqual(preloadedState);

  wrapper.unmount();
});