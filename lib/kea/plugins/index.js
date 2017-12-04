'use strict';

exports.__esModule = true;
exports.activatePlugin = activatePlugin;
exports.clearActivatedPlugins = clearActivatedPlugins;
var globalPlugins = exports.globalPlugins = {
  // all plugins that are activated
  _activated: {},

  // f(options)
  beforeReduxStore: [],

  // f(options, store)
  afterReduxStore: [],

  // f(input, output) => bool
  isActive: [],

  // f(input, output)
  afterConnect: [],

  // f(input, output)
  afterCreateSingleton: [],

  // f(input, output, reducerObjects)
  mutateReducerObjects: [],

  // f(input, output, reducer)
  mutateReducer: [],

  // f(input, output, Klass)
  injectToClass: [],

  // f(input, output, KonnektedKlass)
  injectToConnectedClass: [],

  // f(input, output, response)
  addToResponse: [],

  // f()
  clearCache: []
};

function activatePlugin(plugin) {
  var pluginTarget = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : globalPlugins;

  if (!pluginTarget._activated[plugin.name]) {
    if (process.env.NODE_ENV !== 'production') {
      if (pluginTarget === globalPlugins && plugin.global === false) {
        console.error('[KEA] Plugin "' + plugin.name + '" can not be used as a global plugin! Please use locally in kea({}) calls.');
      }
      if (pluginTarget !== globalPlugins && plugin.local === false) {
        console.error('[KEA] Plugin "' + plugin.name + '" can not be used as a local plugin! Please install globally in getStore({})! Also, make sure the call to getStore({}) takes place before any call to kea({}), otherwise the plugin will not yet be active! See https://kea.js.org/guide/installation');
      }
    }

    Object.keys(plugin).forEach(function (key) {
      if (typeof plugin[key] === 'function') {
        plugin[key]._name = plugin.name;
        pluginTarget[key].push(plugin[key]);
      }
    });

    pluginTarget._activated[plugin.name] = true;
  }
}

function clearActivatedPlugins() {
  var pluginTarget = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : globalPlugins;

  pluginTarget.clearCache.forEach(function (f) {
    return f();
  });

  Object.keys(pluginTarget).forEach(function (key) {
    pluginTarget[key] = [];
  });
  pluginTarget._activated = {};
}