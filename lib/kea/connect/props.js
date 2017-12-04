'use strict';

exports.__esModule = true;
exports.selectPropsFromLogic = selectPropsFromLogic;

var _mapping = require('./mapping');

function selectPropsFromLogic() {
  var propsMapping = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var propsArray = (0, _mapping.deconstructMapping)(propsMapping);

  if (!propsArray) {
    return;
  }

  var hash = {};

  propsArray.forEach(function (_ref) {
    var logic = _ref[0],
        from = _ref[1],
        to = _ref[2];

    // we were given a function (state) => state.something as logic input
    var isFunction = typeof logic === 'function' && !logic._isKeaFunction;
    var selectors = isFunction ? null : logic.selectors ? logic.selectors : logic;

    if (from === '*') {
      hash[to] = isFunction ? logic : logic.selector ? logic.selector : selectors;
    } else if (isFunction) {
      hash[to] = function (state) {
        return (logic(state) || {})[from];
      };
    } else if (typeof selectors[from] !== 'undefined') {
      hash[to] = selectors[from];
    } else {
      console.error('[KEA-LOGIC] selector "' + from + '" missing for logic:', logic);
      console.trace();
    }
  });

  return hash;
}