import * as A from './actions.js'

const INITIAL_STATE = {}

const ratesReducer = (state = INITIAL_STATE, action) => {
  let { type } = action
  switch (type) {
    case A.RATES_DATA_LOAD: {
      let { payload } = action
      return payload
    }
    default:
      return state
  }
}

export default ratesReducer
