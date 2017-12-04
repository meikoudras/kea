"use strict";

exports.__esModule = true;
exports.default = convertConstants;
// convert ['A', 'B'] ==> { 'A': 'A', 'B': 'B' }
function convertConstants(c) {
  if (Array.isArray(c)) {
    var a = {};
    for (var i = 0; i < c.length; i++) {
      a[c[i]] = c[i];
    }
    return a;
  }
  return c;
}