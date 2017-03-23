import { makeNamespace } from '../util'

let ns = makeNamespace('@dream/whats-new-metadata')

export const WHATS_NEW_UPDATE = ns('WHATS_NEW_UPDATE')
export const updateWhatsNew = (payload) => ({ type: WHATS_NEW_UPDATE, payload })

const whatsNewReducer = (state = 0, action) => {
  return action.type === WHATS_NEW_UPDATE ? action.payload : state
}

export default whatsNewReducer
