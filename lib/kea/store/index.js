'use strict';

exports.__esModule = true;
exports.getStore = getStore;

var _redux = require('redux');

var _reducer = require('../reducer');

var _plugins = require('../plugins');

var reduxDevToolsCompose = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : _redux.compose;

var defaultOptions = {
  paths: ['kea', 'scenes'],
  reducers: {},
  preloadedState: undefined,
  middleware: [],
  compose: reduxDevToolsCompose,
  enhancers: [],
  plugins: []
};

function getStore() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  // clone options
  var options = Object.assign({}, defaultOptions, opts);

  // activate all the global plugins
  options.plugins.forEach(function (plugin) {
    (0, _plugins.activatePlugin)(plugin);
  });

  // clone reducers
  options.reducers = Object.assign({}, options.reducers);
  options.paths.forEach(function (path) {
    options.reducers[path] = (0, _reducer.keaReducer)(path);
  });

  // run pre-hooks
  _plugins.globalPlugins.beforeReduxStore.forEach(function (f) {
    return f(options);
  });

  // combine middleware into the first enhancer
  if (options.middleware.length > 0) {
    options.enhancers = [_redux.applyMiddleware.apply(undefined, options.middleware)].concat(options.enhancers);
  }

  // use a special compose function?
  var composeEnchancer = options.compose || _redux.compose;

  // create the store creator
  var finalCreateStore = composeEnchancer.apply(undefined, options.enhancers)(_redux.createStore);

  // combine reducers
  var combinedReducers = (0, _redux.combineReducers)(options.reducers);

  // create store
  var store = finalCreateStore(combinedReducers, options.preloadedState);

  // run post-hooks
  _plugins.globalPlugins.afterReduxStore.forEach(function (f) {
    return f(options, store);
  });

  return store;
}