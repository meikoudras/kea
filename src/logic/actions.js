// actions
let actionCache = {}

const isObject = (item) => typeof item === 'object' && !Array.isArray(item) && item !== null
const toSpaces = (key) => key.replace(/(?:^|\.?)([A-Z])/g, (x, y) => ' ' + y.toLowerCase()).replace(/^ /, '')

export function createActionType (key, path) {
  // remove 'scenes.' from the path
  const pathString = (path[0] === 'scenes' ? path.slice(1) : path).join('.')
  return `${toSpaces(key)} (${pathString})`
}

export function createAction (type, payloadCreator) {
  if (actionCache[type]) {
    return actionCache[type]
  }

  const action = (...payloadArgs) => ({
    type: type,
    payload: typeof payloadCreator === 'function'
      ? payloadCreator(...payloadArgs)
      : isObject(payloadCreator)
        ? payloadCreator
        : { value: payloadCreator }
  })
  action.toString = () => type

  actionCache[type] = action

  return action
}

export function createActions (input, output) {
  if (!input.actions) {
    return
  }

  const path = output.path
  const payloadCreators = input.actions(input)

  Object.keys(payloadCreators).forEach(key => {
    output.actions[key] = createAction(createActionType(key, path), payloadCreators[key])
  })
}
