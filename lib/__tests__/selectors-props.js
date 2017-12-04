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


beforeEach(function () {
  (0, _index.resetKeaCache)();
});

var BookDetail = function (_Component) {
  _inherits(BookDetail, _Component);

  function BookDetail() {
    _classCallCheck(this, BookDetail);

    return _possibleConstructorReturn(this, _Component.apply(this, arguments));
  }

  BookDetail.prototype.render = function render() {
    var _props = this.props,
        book = _props.book,
        bookId = _props.bookId;

    return _react2.default.createElement(
      'div',
      { id: 'book-' + bookId },
      book
    );
  };

  return BookDetail;
}(_react.Component);

test('selectors have access to the component\'s props', function () {
  var store = (0, _index.getStore)();

  var books = {
    1: 'book1',
    2: 'book2'
  };

  var booksLogic = (0, _index.kea)({
    reducers: function reducers(_ref) {
      var actions = _ref.actions;
      return {
        books: [books, _propTypes2.default.object, {}]
      };
    }
  });

  var bookDetailLogic = (0, _index.kea)({
    selectors: function selectors(_ref2) {
      var _selectors = _ref2.selectors;
      return {
        book: [function () {
          return [booksLogic.selectors.books, function (_, props) {
            return props.bookId;
          }];
        }, function (books, bookId) {
          return books[bookId];
        }, _propTypes2.default.string]
      };
    }
  });

  // make sure booksLogic has been mounted to the store by dispatching some random action
  // TODO: this should not be necessary!
  store.dispatch({ type: 'bla' });

  var ConnectedBookDetail = bookDetailLogic(BookDetail);

  var wrapper = (0, _enzyme.mount)(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(
      'div',
      { className: 'playground-scene' },
      _react2.default.createElement(ConnectedBookDetail, { bookId: 1 }),
      _react2.default.createElement(ConnectedBookDetail, { bookId: 2 })
    )
  ));

  expect(wrapper.find('#book-1').text()).toEqual('book1');
  expect(wrapper.find('#book-2').text()).toEqual('book2');

  // only one of the components should be in the store, as only one has a reducer
  expect(Object.keys(store.getState().kea._kea).length).toEqual(1);

  wrapper.unmount();
});