import { combineReducers } from 'redux'
import * as R from 'ramda'
import * as Wallet from '../../data/Wallet'
import * as KV from '../../data/KVStoreEntry'

const KV_SYNC = 'KV_SYNC'
const syncKv = (kv) => ({ type: KV_SYNC, payload: kv })

const kvStoreMiddleware = (reducers, { api, path, walletPath, serialize = JSON.stringify } = {}) => {
  let keyPaths = R.keys(reducers)
  let select = (state) => (keyPath) => state[path][keyPath]

  let reducer = () => combineReducers(reducers)

  let middleware = () => (store) => (next) => (action) => {
    let prevs = keyPaths.map(select(store.getState()))
    let result = next(action)
    let currs = keyPaths.map(select(store.getState()))
    let zipped = R.zip(prevs, currs)

    let wallet = store.getState()[walletPath].get('walletImmutable')

    if (!wallet || !wallet.guid || action.type === KV_SYNC) {
      return result
    }

    let hd = Wallet.selectHdWallet(wallet)

    let run = (task) => task.fork(
      (e) => console.log('error:', e),
      R.compose(store.dispatch, syncKv)
    )

    zipped.forEach(([p, c]) => {
      if (c.magicHash === void 0) {
        console.log('kv: fetching')
        let kv = KV.fromHdWallet(hd, c.typeId)
        run(api.fetch(kv))
      } else {
        console.log(`kv: has value (is ${serialize(c.value)})`)
        if (serialize(p.value) !== serialize(c.value)) {
          console.log(`kv: updating (was ${serialize(p.value)})`)
          run(api.update(c))
        } else {
          console.log('kv: no update needed')
        }
      }
    })

    return result
  }

  return {
    reducer,
    middleware
  }
}

export default kvStoreMiddleware
