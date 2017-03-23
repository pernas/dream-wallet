import { createStore, combineReducers, applyMiddleware } from 'redux'
import { createMetadata, createMetadataEntry } from './index'
import whatsNewReducer, { updateWhatsNew } from './whats-new'
import labelsReducer, { addLabel } from './labels'

let metadata = createMetadata({
  whatsNew: createMetadataEntry(1, whatsNewReducer),
  labels: createMetadataEntry(3, labelsReducer)
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

store.dispatch(addLabel(0, 0, 'My Label'))
store.dispatch(addLabel(0, 2, 'Third Addr Label'))
store.dispatch(addLabel(1, 1, 'Other Acct Label'))
