import Task from 'data.task'
import * as R from 'ramda'
import { API_BLOCKCHAIN_INFO } from './Api'
import * as KV from '../data/KVStoreEntry'

const eitherToTask = (e) => e.fold(Task.rejected, Task.of)

const makeKvApi = ({ apiUrl = API_BLOCKCHAIN_INFO } = {}) => {
  let api = {}

  api.request = (method, endpoint, data) => {
    let url = apiUrl + 'metadata/' + endpoint

    let options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit'
    }

    if (method !== 'GET') {
      options.body = JSON.stringify(data)
    }

    const checkStatus = (response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json()
      } else if (method === 'GET' && response.status === 404) {
        return null
      } else {
        return response.json().then(Promise.reject.bind(Promise))
      }
    }

    return new Task((reject, resolve) => {
      fetch(url, options).then(checkStatus).then(resolve, reject)
    })
  }

  api.update = (kv) => {
    let createEncPayloadBuffer = kv.encKeyBuffer
      ? R.compose(KV.B64ToBuffer, KV.encrypt(kv.encKeyBuffer), JSON.stringify)
      : R.compose(KV.StringToBuffer, JSON.stringify)

    let encPayloadBuffer = createEncPayloadBuffer(kv.value)
    let signatureBuffer = KV.computeSignature(kv.signKey, encPayloadBuffer, kv.magicHash)

    let body = {
      'version': kv.VERSION,
      'payload': encPayloadBuffer.toString('base64'),
      'signature': signatureBuffer.toString('base64'),
      'prev_magic_hash': kv.magicHash ? kv.magicHash.toString('hex') : null,
      'type_id': kv.typeId
    }

    return api.request('PUT', kv.address, body).map((res) => {
      let magicHash = KV.magic(encPayloadBuffer, kv.magicHash)
      return R.set(KV.magicHash, magicHash, kv)
    })
  }

  api.fetch = (kv) => {
    let setKvFromResponse = R.curry((currentKv, res) => {
      if (res === null) return R.set(KV.value, null, currentKv)
      let setFromResponse = R.compose(
        R.set(KV.magicHash, R.prop('compute_new_magic_hash', res)),
        R.set(KV.value, KV.extractResponse(kv.encKeyBuffer, res)))
      return setFromResponse(currentKv)
    })

    return api.request('GET', kv.address)
      .map(KV.verifyResponse(kv.address))
      .chain(eitherToTask)
      .map(setKvFromResponse(kv))
      .rejectedMap((e) => {
        console.error(`Failed to fetch metadata entry ${kv.typeId} at ${kv.address}:`, e)
        return new Error('METADATA_FETCH_FAILED')
      })
  }

  return api
}

export default makeKvApi
