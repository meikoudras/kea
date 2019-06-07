import { createConstants } from '../core/steps/constants'

import { getContext } from '../context'
import { runPlugins, getLocalPlugins } from '../plugins'

export function buildLogic ({ input, key: inputKey, props, extendedInputs }) {
  const key = inputKey || (props && input.key ? input.key(props) : null)

  if (!key && input.key) {
    throw new Error('Must have key')
  }

  const path = getPathForInput(input, key)
  const pathString = path.join('.')

  const { build: { cache } } = getContext()

  if (!cache[pathString]) {
    const plugins = getLocalPlugins(input)
    let logic = createBlankLogic({ key, path, plugins, props })

    runPlugins(logic.plugins, 'beforeBuild', logic, input)

    applyInputToLogic(logic, input)

    const extend = (input.extend || []).concat(extendedInputs || [])
    extend.forEach(extendedInput => applyInputToLogic(logic, extendedInput))

    runPlugins(logic.plugins, 'afterBuild', logic, input)

    cache[pathString] = logic
  } else {
    enhanceExistingLogic(cache[pathString], { props })
  }

  return cache[pathString]
}

export function convertPartialDynamicInput ({ input, plugins }) {
  let logic = {
    plugins: plugins,
    constants: {}
  }

  createConstants(logic, input)

  return logic
}

function createBlankLogic ({ key, path, plugins, props }) {
  let logic = {
    key,
    path,
    plugins,
    props,
    extend: input => applyInputToLogic(logic, input),
    mounted: false
  }

  plugins.activated.forEach(p => p.defaults && Object.assign(logic, p.defaults()))

  return logic
}

function enhanceExistingLogic (logic, { props }) {
  logic.props = props
}

// Converts `input` into `logic`.
function applyInputToLogic (logic, input) {
  // We will start with an object like this and extend it as we go along.
  // In the end this object will be returned as `const logic = kea(input)`
  // let logic = createBlankLogic({ key, path, plugins, props })

  // Let's call all plugins that want to hook into this moment.
  runPlugins(logic.plugins, 'beforeLogic', logic, input)

  const steps = logic.plugins.logicSteps

  for (const step of Object.keys(steps)) {
    for (const func of steps[step]) {
      func(logic, input)
    }
  }

  /*
    add a connection to ourselves in the end
    logic.connections = { ...logic.connections, 'scenes.path.to.logic': logic }
  */
  logic.connections[logic.path.join('.')] = logic
  runPlugins(logic.plugins, 'afterLogic', logic, input)

  return logic
}

function getPathForInput (input, key) {
  if (input.path) {
    return input.path(key)
  }

  const { input: { inlinePathCreators } } = getContext()

  let pathCreator = inlinePathCreators.get(input)

  if (pathCreator) {
    return pathCreator(key)
  }

  const count = (++getContext().input.inlinePathCounter).toString()

  if (input.key) {
    pathCreator = (key) => ['kea', 'inline', count, key]
  } else {
    pathCreator = () => ['kea', 'inline', count]
  }

  inlinePathCreators.set(input, pathCreator)

  return pathCreator(key)
}

export function getInputId (input) {
  const { input: { inputIds } } = getContext()

  let id = inputIds.get(input)

  if (!id) {
    id = getPathForInput(input, '*').join('.')
    inputIds.set(input, id)
  }

  return id
}
