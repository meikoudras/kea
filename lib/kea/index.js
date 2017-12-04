'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.kea = kea;

var _props = require('./connect/props');

var _propTypes = require('./connect/prop-types');

var _reducer = require('./logic/reducer');

var _selectors = require('./logic/selectors');

var _create = require('./actions/create');

var _actions = require('./connect/actions');

var _convertConstants = require('../utils/convert-constants');

var _convertConstants2 = _interopRequireDefault(_convertConstants);

var _shallowEqual = require('../utils/shallow-equal');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _reselect = require('reselect');

var _reactRedux = require('react-redux');

var _cache = require('./cache');

var _reducer2 = require('./reducer');

var _plugins = require('./plugins');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isStateless(Component) {
  return !Component.prototype.render;
}

var nonamePathCounter = 0;

function createUniquePathFunction() {
  var reducerRoot = (0, _reducer2.firstReducerRoot)();
  if (!reducerRoot) {
    console.error('[KEA] Could not find the root of the keaReducer! Make sure you call keaReducer() before any call to kea() is made. See: https://kea.js.org/api/reducer');
  }
  var inlinePath = [reducerRoot, '_kea', 'inline-' + nonamePathCounter++];
  return function () {
    return inlinePath;
  };
}

var hydrationAction = '@@kea/hydrate store';

function kea(_input) {
  // a few helpers for later
  var hasManualPath = !!_input.path;
  var hasConnect = !!_input.connect;
  var hasLogic = !!(_input.actions || _input.reducers || _input.selectors);
  var shouldMountReducer = hasManualPath || !!_input.reducers;

  // clone the input and add a path if needed
  var input = Object.assign({}, _input, hasManualPath ? {} : { path: createUniquePathFunction() });

  // this will be filled in and passed to plugins as needed
  var output = {
    activePlugins: {},
    isSingleton: !input.key,

    path: null,
    constants: {},

    connected: { actions: {}, selectors: {}, propTypes: {} },
    created: { actions: {}, reducerObjects: {}, selectors: {}, propTypes: {}, defaults: {} },

    actions: {},
    reducers: {},
    selector: null,
    selectors: {},
    propTypes: {},
    defaults: {}
  };

  var plugins = _plugins.globalPlugins;

  if (input.plugins) {
    plugins = Object.assign({}, _plugins.globalPlugins);
    input.plugins.forEach(function (plugin) {
      (0, _plugins.activatePlugin)(plugin, plugins);
    });
  }

  // check which plugins are active based on the input
  plugins.isActive.forEach(function (isActive) {
    output.activePlugins[isActive._name] = isActive(input, output);
  });

  // set the constants
  output.constants = input.constants ? (0, _convertConstants2.default)(input.constants(output)) : {};

  // anything to connect to?
  if (hasConnect) {
    // the { connect: { props, actions } } part
    var connect = input.connect || {};

    // store connected actions, selectors and propTypes separately
    output.connected = {
      actions: (0, _actions.selectActionsFromLogic)(connect.actions),
      selectors: (0, _props.selectPropsFromLogic)(connect.props),
      propTypes: (0, _propTypes.propTypesFromConnect)(connect)

      // set actions, selectors and propTypes to the connected ones
    };Object.assign(output, output.connected);

    // run the afterConnect plugin hook
    plugins.afterConnect.forEach(function (f) {
      return f(input, output);
    });
  }

  // we don't know yet if it's going to be a singleton (no key) or inline (key)
  // however the actions and constants are common for all, so get a path without the dynamic
  // component and initialize them
  output.path = input.path('').filter(function (p) {
    return p;
  });

  if (input.actions) {
    // create new actions
    output.created.actions = (0, _create.createActions)(input.actions(output), output.path);

    // add them to the actions hash
    output.actions = Object.assign(output.actions, output.created.actions);
  }

  // if it's a singleton, create all the reducers and selectors and add them to redux
  if (output.isSingleton) {
    // we have reducer or selector inputs, create all output reducers and selectors
    // ... or the "path" is manually defined, so we must put something in redux
    if (hasManualPath || input.reducers || input.selectors) {
      // create the reducers from the input
      output.created.reducerObjects = input.reducers ? (0, _reducer.convertReducerArrays)(input.reducers(output)) : {};

      // run plugins on the created reducer objects
      plugins.mutateReducerObjects.forEach(function (f) {
        return f(input, output, output.created.reducerObjects);
      });

      // add propTypes
      Object.keys(output.created.reducerObjects).forEach(function (reducerKey) {
        var reducerObject = output.created.reducerObjects[reducerKey];
        if (reducerObject.type) {
          output.created.propTypes[reducerKey] = reducerObject.type;
        }

        output.created.defaults[reducerKey] = reducerObject.value;
        output.reducers[reducerKey] = reducerObject.reducer;
      });

      // combine the created reducers into one
      output.reducer = (0, _reducer.combineReducerObjects)(output.path, output.created.reducerObjects);

      // run plugins on the created reducer
      plugins.mutateReducer.forEach(function (f) {
        return f(input, output, output.reducer);
      });

      // add a global selector for the path
      output.selector = function (state) {
        return (0, _selectors.pathSelector)(output.path, state);
      };

      // create selectors from the reducers
      output.created.selectors = (0, _selectors.createSelectors)(output.path, Object.keys(output.created.reducerObjects));

      // add the created selectors and propTypes to the output
      output.selectors = Object.assign(output.selectors, output.created.selectors);
      output.propTypes = Object.assign(output.propTypes, output.created.propTypes);
      output.defaults = Object.assign(output.defaults, output.created.defaults);

      // any additional selectors to create?
      if (input.selectors) {
        var selectorResponse = input.selectors(output);

        Object.keys(selectorResponse).forEach(function (selectorKey) {
          // s == [() => args, selectorFunction, propType]
          var s = selectorResponse[selectorKey];
          var args = s[0]();

          if (s[2]) {
            output.created.propTypes[selectorKey] = s[2];
            output.propTypes[selectorKey] = output.created.propTypes[selectorKey];
          }

          output.created.selectors[selectorKey] = _reselect.createSelector.apply(undefined, args.concat([s[1]]));
          output.selectors[selectorKey] = output.created.selectors[selectorKey];
        });
      }

      // hook up the reducer to the global kea reducers object
      if (shouldMountReducer) {
        (0, _reducer2.addReducer)(output.path, output.reducer);
      }
    }

    plugins.afterCreateSingleton.forEach(function (f) {
      return f(input, output);
    });
  }

  // we will return this function which can wrap the logic store around a component
  var response = function response(Klass) {
    if (!Klass) {
      console.error('[KEA] Logic stores must be wrapped around React Components or stateless functions!', input, output);
      return;
    }

    // inject the propTypes to the class
    Klass.propTypes = Object.assign({}, output.propTypes, Klass.propTypes || {});

    // dealing with a Component
    if (!isStateless(Klass)) {
      // inject to the component something that
      // converts this.props.actions to this.actions
      if (Object.keys(output.actions).length > 0) {
        var originalComponentWillMount = Klass.prototype.componentWillMount;
        Klass.prototype.componentWillMount = function () {
          this.actions = this.props.actions;
          originalComponentWillMount && originalComponentWillMount.bind(this)();
        };
      }

      // Since Klass == Component, tell the plugins to add themselves to it.
      // if it's a stateless functional component, we'll do it in the end with Redux's Connect class
      plugins.injectToClass.forEach(function (f) {
        return f(input, output, Klass);
      });
    }

    var selectorFactory = function selectorFactory(dispatch, options) {
      var lastProps = {};
      var result = null;

      if (!(0, _reducer2.isSyncedWithStore)()) {
        dispatch({ type: hydrationAction });
      }

      return function (nextState, nextOwnProps) {
        // get the key if it's defined
        var key = input.key ? input.key(nextOwnProps) : null;

        // if the key function was defined and returns undefined, something is up. give an error
        if (typeof key === 'undefined') {
          console.error('"key" can\'t be undefined in path: ' + input.path('undefined').join('.'));
        }

        // get the path of this logic store
        var path = input.path(key);
        var joinedPath = path.join('.');

        // get a selector to the root of the path in redux. cache it so it's only created once
        var selector = (0, _cache.getCache)(joinedPath, 'selector');
        if (!selector) {
          selector = function selector(state) {
            return (0, _selectors.pathSelector)(path, state);
          };
          (0, _cache.setCache)(joinedPath, { selector: selector });
        }

        var selectors = (0, _cache.getCache)(joinedPath, 'selectors');

        // add data from the connected selectors into nextProps
        // only do this if we have no own reducers/selectors, otherwise it gets done later
        if (hasConnect && !hasLogic && !selectors) {
          selectors = output.connected.selectors;

          // store in the cache. kea-saga wants to access this. TODO: find a better way?
          (0, _cache.setCache)(joinedPath, { selectors: output.connected.selectors });
        }

        // did we create any reducers/selectors inside the logic store?
        if (hasLogic) {
          // now we must check if the reducer is already in redux, or we need to add it
          // if we need to add it, create "dummy" selectors for the default values until then

          // is the reducer created? if we have "true" in the cache, it's definitely created
          var reduxMounted = shouldMountReducer && !!(0, _cache.getCache)(joinedPath, 'reduxMounted');

          // if it's not and should eventually be, let's double check. maybe it is now?
          if (shouldMountReducer && !reduxMounted) {
            try {
              reduxMounted = typeof selector(nextState) !== 'undefined';
            } catch (e) {
              reduxMounted = false;
            }
          }

          // we don't have the selectors cached with the current reduxMounted state!
          if (!!(0, _cache.getCache)(joinedPath, reduxMounted) !== reduxMounted) {
            // create a new "output" that also contains { path, key, props }
            // this will be used as /input/ to create the reducers and selectors
            var wrappedOutput = Object.assign({}, output, { path: path, key: key, props: nextOwnProps });

            // we can't just recycle this from the singleton, as the reducers can have defaults that depend on props
            var reducerObjects = input.reducers ? (0, _reducer.convertReducerArrays)(input.reducers(wrappedOutput)) : {};

            // run plugins on the created reducer objects
            plugins.mutateReducerObjects.forEach(function (f) {
              return f(input, output, reducerObjects);
            });

            // not in redux, so add the reducer!
            if (shouldMountReducer && !reduxMounted) {
              var reducer = (0, _reducer.combineReducerObjects)(path, reducerObjects);

              // run plugins on the created reducer
              plugins.mutateReducer.forEach(function (f) {
                return f(input, output, reducer);
              });

              (0, _reducer2.addReducer)(path, reducer);
            }

            // send a hydration action to redux, to make sure that the store is up to date on the next render
            if (!(0, _reducer2.isSyncedWithStore)()) {
              dispatch({ type: hydrationAction });
            }

            // get connected selectors and selectors created from the reducer
            var connectedSelectors = output.connected ? output.connected.selectors : {};
            var createdSelectors = (0, _selectors.createSelectors)(path, Object.keys(reducerObjects));

            // if the reducer is in redux, get real reducer selectors. otherwise add dummies that return defaults
            if (reduxMounted) {
              selectors = Object.assign({}, connectedSelectors, createdSelectors);
            } else {
              // if we don't know for sure that the reducer is in the current store output,
              // then fallback to giving the default value
              selectors = Object.assign({}, connectedSelectors || {});
              Object.keys(reducerObjects).forEach(function (key) {
                selectors[key] = function (state) {
                  try {
                    return createdSelectors[key](state);
                  } catch (error) {
                    return reducerObjects[key].value;
                  }
                };
              });
            }

            // create the additional selectors
            var _selectorResponse = input.selectors ? input.selectors(Object.assign({}, wrappedOutput, { selectors: selectors })) : {};

            Object.keys(_selectorResponse).forEach(function (selectorKey) {
              // s == [() => args, selectorFunction, propType]
              var s = _selectorResponse[selectorKey];
              var args = s[0]();
              selectors[selectorKey] = _reselect.createSelector.apply(undefined, args.concat([s[1]]));
            });

            // store in the cache
            (0, _cache.setCache)(joinedPath, {
              reduxMounted: reduxMounted,
              selectors: selectors
            });
          }
        }

        // store the props given to the component in nextProps.
        // already fill it with the props passed to the component from above
        var nextProps = Object.assign({}, nextOwnProps);

        // and add to props
        if (selectors) {
          Object.keys(selectors).forEach(function (selectorKey) {
            nextProps[selectorKey] = selectors[selectorKey](nextState, nextOwnProps);
          });
        }

        // actions need to be created just once, see if they are cached
        var actions = (0, _cache.getCache)(joinedPath, 'actions');

        // nothing was in the cache, so create them
        if (!actions) {
          actions = nextOwnProps.actions ? Object.assign({}, nextOwnProps.actions) : {};

          // pass conneted actions as they are, just wrap with dispatch
          var connectedActionKeys = Object.keys(output.connected.actions);
          connectedActionKeys.forEach(function (actionKey) {
            actions[actionKey] = function () {
              var _output$connected$act;

              return dispatch((_output$connected$act = output.connected.actions)[actionKey].apply(_output$connected$act, arguments));
            };
          });

          // inject key to the payload of created actions, if there is a key
          var createdActionKeys = Object.keys(output.created.actions);
          createdActionKeys.forEach(function (actionKey) {
            if (key) {
              actions[actionKey] = function () {
                var _output$created$actio;

                var createdAction = (_output$created$actio = output.created.actions)[actionKey].apply(_output$created$actio, arguments);

                // an object! add the key and dispatch
                if ((typeof createdAction === 'undefined' ? 'undefined' : _typeof(createdAction)) === 'object') {
                  return dispatch(Object.assign({}, createdAction, { payload: Object.assign({ key: key }, createdAction.payload) }));
                } else {
                  // a function? a string? return it!
                  return dispatch(createdAction);
                }
              };
            } else {
              actions[actionKey] = function () {
                var _output$created$actio2;

                return dispatch((_output$created$actio2 = output.created.actions)[actionKey].apply(_output$created$actio2, arguments));
              };
            }
          });

          (0, _cache.setCache)(joinedPath, { actions: actions });
        }

        // if the props did not change, return the old cached output
        if (!result || !(0, _shallowEqual2.default)(lastProps, nextProps)) {
          lastProps = nextProps;
          result = Object.assign({}, nextProps, { actions: actions, dispatch: dispatch });
        }

        return result;
      };
    };

    // connect this function to Redux
    var KonnektedKlass = (0, _reactRedux.connectAdvanced)(selectorFactory, { methodName: 'kea' })(Klass);

    // If we were wrapping a stateless functional React component, add the plugin code to the connected component.
    if (isStateless(Klass)) {
      plugins.injectToConnectedClass.forEach(function (f) {
        return f(input, output, KonnektedKlass);
      });
    }

    return KonnektedKlass;
  };

  // the response will contain a path only if
  // - it's a singleton
  // - or we manually specified a path
  // - or it contains some data (e.g. reducers)
  response.path = output.isSingleton && (hasManualPath || hasLogic) ? output.path : undefined;

  response.constants = output.constants;
  response.actions = output.actions;
  response.propTypes = output.propTypes;

  if (output.isSingleton) {
    response.reducer = output.reducer;
    response.reducers = output.reducers;
    response.defaults = output.defaults;
    response.selector = output.selector;
    response.selectors = output.selectors;
  }

  response._isKeaFunction = true;
  response._isKeaSingleton = output.isSingleton;

  response._hasKeaConnect = hasConnect;
  response._hasKeaLogic = hasLogic;
  response._keaPlugins = output.activePlugins;

  plugins.addToResponse.forEach(function (f) {
    return f(input, output, response);
  });

  return response;
}