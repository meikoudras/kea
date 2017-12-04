'use strict';

exports.__esModule = true;
exports.selectActionsFromLogic = selectActionsFromLogic;

var _mapping = require('./mapping');

function selectActionsFromLogic() {
  var mapping = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var actionsArray = (0, _mapping.deconstructMapping)(mapping);

  if (!actionsArray) {
    return;
  }

  var hash = {};

  actionsArray.forEach(function (_ref) {
    var logic = _ref[0],
        from = _ref[1],
        to = _ref[2];

    var actions = logic && logic.actions ? logic.actions : logic;

    if (typeof actions[from] === 'function') {
      hash[to] = actions[from];
    } else {
      console.error('[KEA-LOGIC] action "' + from + '" missing for logic:', logic);
      console.trace();
    }
  });

  return hash;
}