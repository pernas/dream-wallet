import * as R from 'ramda'
import { combineReducers } from 'redux'
import { makeNamespace, randStr, stringify } from '../util'

let ns = makeNamespace('@dream/metadata')

const UPDATE_METADATA_HASH = ns('UPDATE_METADATA_HASH')
const metadataHashUpdate = (index, hash) => ({ type: UPDATE_METADATA_HASH, payload: { index, hash } })

export const createMetadata = (entries) => {
  let middleware = (path) => (store) => (next) => (action) => {
    let getEntriesState = () => R.values(store.getState()[path])
    let prevState = getEntriesState()
    let result = next(action)
    let nextState = getEntriesState()

    R.zip(prevState, nextState).forEach(([before, after], i) => {
      if (stringify(before.data) !== stringify(after.data)) {
        // update metadata entry on server
        store.dispatch(metadataHashUpdate(after.index, randStr()))
      }
    })

    return result
  }

  return {
    middleware,
    reducer: combineReducers(entries)
  }
}

export const createMetadataEntry = (index, reducer) => {
  const INIT = { index, magichash: '', data: void 0 }
  return (state = INIT, action) => {
    if (action.type === UPDATE_METADATA_HASH && action.payload.index === state.index) {
      return R.assoc('magichash', action.payload.hash, state)
    }
    return R.assoc('data', reducer(state.data, action), state)
  }
}
