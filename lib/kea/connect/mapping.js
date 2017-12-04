'use strict';

exports.__esModule = true;
exports.deconstructMapping = deconstructMapping;

var _reducer = require('../reducer');

function connectLogicIfUnconnected(logic) {
  if (logic._isKeaSingleton && !logic._keaReducerConnected && logic.reducer) {
    (0, _reducer.addReducer)(logic.path, logic.reducer);
    logic._keaReducerConnected = true;
  }
} // input: [ logic1, [ 'a', 'b as c' ], logic2, [ 'c', 'd' ] ]
// output: [ [logic1, 'a', 'a'], [logic1, 'b', 'c'], [logic2, 'c', 'c'], [logic2, 'd', 'd'] ]

function deconstructMapping(mapping) {
  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to connect:', mapping);
    console.trace();
    return null;
  }

  var response = [];

  for (var i = 0; i < mapping.length; i += 2) {
    var logic = mapping[i];
    var array = mapping[i + 1];

    connectLogicIfUnconnected(logic);

    for (var j = 0; j < array.length; j++) {
      if (array[j].includes(' as ')) {
        var parts = array[j].split(' as ');
        response.push([logic, parts[0], parts[1]]);
      } else {
        response.push([logic, array[j], array[j]]);
      }
    }
  }

  return response;
}