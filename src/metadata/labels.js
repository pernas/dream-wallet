import * as R from 'ramda'
import { makeNamespace } from '../util'

let ns = makeNamespace('@dream/labels-metadata')

export const LABELS_ADD = ns('LABELS_ADD')
export const addLabel = (acctIndex, addrIndex, label) => ({ type: LABELS_ADD, payload: { addrIndex, acctIndex, label } })

const INIT = {
  accounts: {}
}

const labelsReducer = (state = INIT, action) => {
  switch (action.type) {
    case LABELS_ADD: {
      let { acctIndex, addrIndex, label } = action.payload
      state.accounts[acctIndex] = state.accounts[acctIndex] || {}
      return R.assocPath(['accounts', acctIndex, addrIndex], { label }, state)
    }
    default:
      return state
  }
}

export default labelsReducer
