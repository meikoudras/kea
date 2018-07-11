import PropTypes from 'prop-types'
import { createStructuredSelector } from 'reselect'

export function createPropTransforms (mapping = []) {
  if (mapping.length % 2 === 1) {
    console.error('[KEA-LOGIC] uneven mapping given to selectPropsFromLogic:', mapping)
    console.trace()
    return
  }

  let hash = {}
  let transforms = {}

  for (let i = 0; i < mapping.length; i += 2) {
    const logic = mapping[i]
    const props = mapping[i + 1]

    // we were given a function (state) => state.something as logic input
    const isFunction = typeof logic === 'function'

    const selectors = isFunction ? null : (logic.selectors ? logic.selectors : logic)

    props.forEach(query => {
      let from = query
      let to = query

      if (query.includes(' as ')) {
        [from, to] = query.split(' as ')
      }

      const matches = from.match(/^(.*)\[(.*)\]$/)

      if (matches) {
        if (from === to) {
          to = matches[1]
        }
        from = matches[1]
        transforms[to] = (value, props) => {
          return value[props[matches[2]]]
        }
      }

      if (from === '*') {
        hash[to] = isFunction ? logic : (logic.selector ? logic.selector : selectors)
      } else if (isFunction) {
        hash[to] = (state) => (logic(state) || {})[from]
      } else if (typeof selectors[from] !== 'undefined') {
        hash[to] = selectors[from]
      } else {
        console.error(`[KEA-LOGIC] selector "${query}" missing for logic:`, logic)
        console.trace()
      }
    })
  }

  return {
    selectors: createStructuredSelector(hash),
    transforms: transforms
  }
}

export function selectPropsFromLogic (mapping = []) {
  return createPropTransforms(mapping).selectors
}

export function propTypesFromMapping (mapping, extra = null) {
  let propTypes = Object.assign({}, mapping.propTypes || mapping.passedProps || {})

  if (mapping.props) {
    if (mapping.props.length % 2 === 1) {
      console.error('[KEA-LOGIC] uneven props mapping given to propTypesFromLogic:', mapping)
      console.trace()
      return
    }
    for (let i = 0; i < mapping.props.length; i += 2) {
      const logic = mapping.props[i]
      const props = mapping.props[i + 1]

      if (logic && logic.reducers) {
        props.forEach(query => {
          let from = query
          let to = query

          if (query.includes(' as ')) {
            [from, to] = query.split(' as ')
          }

          const matches = from.match(/^(.*)\[(.*)]$/)

          if (matches) {
            if (from === to) {
              to = matches[1]
            }
            from = matches[1]
          }

          const reducer = logic.reducers[from]

          if (reducer && reducer.type) {
            propTypes[to] = reducer.type
          } else {
            console.error(`[KEA-LOGIC] prop type "${query}" missing for logic:`, logic)
            console.trace()
          }
        })
      }
    }
  }

  if (mapping.actions) {
    if (mapping.actions.length % 2 === 1) {
      console.error('[KEA-LOGIC] uneven actions mapping given to propTypesFromLogic:', mapping)
      console.trace()
      return
    }

    let actions = {}

    for (let i = 0; i < mapping.actions.length; i += 2) {
      const logic = mapping.actions[i]
      const actionsArray = mapping.actions[i + 1]

      const actions = logic && logic.actions ? logic.actions : logic

      actionsArray.forEach(query => {
        let from = query
        let to = query

        if (query.includes(' as ')) {
          [from, to] = query.split(' as ')
        }

        const matches = from.match(/^(.*)\((.*)\)$/)

        if (matches) {
          if (from === to) {
            to = matches[1]
          }
          from = matches[1]
        }

        if (actions[from]) {
          propTypes[to] = PropTypes.func
        } else {
          console.error(`[KEA-LOGIC] action "${query}" missing for logic:`, logic)
          console.trace()
        }
      })
    }

    propTypes.actions = PropTypes.shape(actions)
  }

  if (extra) {
    Object.assign(propTypes, extra)
  }

  return propTypes
}

function havePropsChangedDebug (nextProps) {
  const changedProps = Object.keys(nextProps).filter(key => key !== 'actions' && nextProps[key] !== this.props[key])
  if (changedProps.length > 0) {
    changedProps.forEach(key => {
      console.log(`prop '${key}' changed`, this.props[key], nextProps[key])
    })
    return true
  }
  return false
}

function havePropsChangedProduction (nextProps) {
  for (var key in nextProps) {
    if (key === 'actions') {
      continue
    }
    if (nextProps[key] !== this.props[key]) {
      return true
    }
  }
  return false
}

export function havePropsChanged (debug = false) {
  if (debug) {
    return havePropsChangedDebug
  } else {
    return havePropsChangedProduction
  }
}
