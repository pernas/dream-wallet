import { createStore, combineReducers, applyMiddleware } from 'redux'
import { createMetadata, createMetadataEntry } from './index'
import whatsNewReducer, { updateWhatsNew } from './whats-new'

let metadata = createMetadata({
  whatsNew: createMetadataEntry(1, whatsNewReducer)
})

let rootReducer = combineReducers({
  metadata: metadata.reducer
})

let middleware = applyMiddleware(
  metadata.middleware('metadata')
)

let store = createStore(rootReducer, middleware)
let logstate = () => console.log(JSON.stringify(store.getState(), null, 2))

logstate()
store.subscribe(logstate)

store.dispatch(updateWhatsNew(123))
store.dispatch(updateWhatsNew(123))
store.dispatch(updateWhatsNew(456))
