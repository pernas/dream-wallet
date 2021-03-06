import { combineReducers } from 'redux'
import addresses from './data/Addresses/reducers.js'
import latestBlock from './data/LatestBlock/reducers.js'
import transactions from './data/Transactions/reducers.js'
import info from './data/Info/reducers.js'
import rates from './data/Rates/reducers.js'
import wallet from './wallet/reducers.js'
import settings from './settings/reducers.js'

const data = combineReducers({
  addresses: addresses,
  latest_block: latestBlock,
  txs: transactions,
  info: info,
  rates: rates
})

export {
  data,
  wallet,
  settings
}
