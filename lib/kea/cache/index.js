'use strict';

exports.__esModule = true;
exports.getCache = getCache;
exports.setCache = setCache;
exports.resetCache = resetCache;
// keep track of what path has been mounted, what is in redux, which saga has been started, etc

var cache = {};

function getCache(path, variable) {
  var joinedPath = Array.isArray(path) ? path.join('.') : path;

  var cachePart = cache[joinedPath] || {};

  if (variable) {
    return cachePart[variable];
  } else {
    return cachePart;
  }
}

function setCache(path, object) {
  var joinedPath = Array.isArray(path) ? path.join('.') : path;
  cache[joinedPath] = Object.assign(cache[joinedPath] || {}, object);

  return cache[joinedPath];
}

function resetCache() {
  cache = {};
}