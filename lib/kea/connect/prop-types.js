'use strict';

exports.__esModule = true;
exports.propTypesFromConnect = propTypesFromConnect;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _mapping = require('./mapping');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function propTypesFromConnect(mapping) {
  var extra = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  var propTypes = Object.assign({}, mapping.propTypes || mapping.passedProps || {});

  if (mapping.props) {
    var propsArray = (0, _mapping.deconstructMapping)(mapping.props);

    if (!propsArray) {
      return;
    }

    propsArray.forEach(function (_ref) {
      var logic = _ref[0],
          from = _ref[1],
          to = _ref[2];

      if (logic && logic.propTypes) {
        var propType = logic.propTypes[from];

        if (propType) {
          propTypes[to] = propType;
        } else if (from !== '*') {
          console.error('[KEA-LOGIC] prop type for "' + from + '" missing for logic:', logic);
          console.trace();
        }
      }
    });
  }

  if (mapping.actions) {
    var actionsArray = (0, _mapping.deconstructMapping)(mapping.actions);

    if (!actionsArray) {
      return;
    }

    propTypes.actions = {};

    actionsArray.forEach(function (_ref2) {
      var logic = _ref2[0],
          from = _ref2[1],
          to = _ref2[2];

      var actions = logic && logic.actions ? logic.actions : logic;

      if (actions[from]) {
        propTypes.actions[to] = _propTypes2.default.func;
      } else {
        console.error('[KEA-LOGIC] action "' + from + '" missing for logic:', logic);
        console.trace();
      }
    });

    propTypes.actions = _propTypes2.default.shape(propTypes.actions);
  }

  if (extra) {
    Object.assign(propTypes, extra);
  }

  return propTypes;
}