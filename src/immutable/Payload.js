import * as R from 'ramda'
import { traverseOf } from 'ramda-lens'
import { Map } from 'immutable'
import Either from 'data.either'
import * as crypto from '../WalletCrypto'
import { typeDef, rename } from '../util'
import * as WalletUtil from './Wallet'

// data Payload = Encrypted | Decrypted Wallet
function Payload (x, tag) {
  this.__internal = Map(x)
  this.__decrypted = tag
}

const { guard, define } = typeDef(Payload)

export const payload = define('payload')
export const prevChecksum = define('prevChecksum')

Payload.prototype.map = function (f) {
  return this.__decrypted ? Decrypted(R.over(payload, f, this)) : this
}

export const fromJS = (payload) => {
  let renameChecksum = rename('payload_checksum', 'prevChecksum')
  return new Payload(renameChecksum(payload), false)
}

export const toJS = R.pipe(guard, (payload) => {
  if (isDecrypted(payload)) {
    throw new Error('Cannot create a decrypted JS payload')
  }
  let renameChecksum = rename('prevChecksum', 'payload_checksum')
  return renameChecksum(payload.__internal.toJS())
})

const Encrypted = R.pipe(guard, (payload) => {
  return new Payload(payload.__internal, false)
})

const Decrypted = R.pipe(guard, (payload) => {
  return new Payload(payload.__internal, true)
})

export const isPayload = (payload) => {
  return R.is(Payload, payload)
}

export const isEncrypted = R.pipe(guard, (payload) => {
  return !payload.__decrypted
})

export const isDecrypted = R.pipe(guard, (payload) => {
  return payload.__decrypted
})

// decrypt :: String -> Payload$Encrypted -> Either Error Payload$Decrypted
export const decrypt = R.curry((password, wrapper) => {
  guard(wrapper)

  let decryptWallet = R.compose(
    R.map(WalletUtil.fromJS),
    crypto.decryptWallet(password),
    JSON.parse
  )

  return Either.of(wrapper)
    .chain(traverseOf(payload, Either.of, decryptWallet))
    .map(Decrypted)
})

// encrypt :: String -> Payload$Decrypted -> Either Error Payload$Encrypted
export const encrypt = R.curry((password, wrapper) => {
  guard(wrapper)
  let iters = WalletUtil.selectIterations(R.view(payload, wrapper))

  let encryptWallet = R.compose(
    Either.try(JSON.parse),
    crypto.encryptWallet(R.__, password, iters, 3.0),
    (w) => JSON.stringify(w, null, 2),
    WalletUtil.toJS
  )

  return Either.of(wrapper)
    .chain(traverseOf(payload, Either.of, encryptWallet))
    .map(R.over(payload, JSON.stringify))
    .map(Encrypted)
})

export const getChecksum = R.pipe(guard, (payload) => {
  if (isDecrypted(payload)) {
    throw new Error('Cannot get checksum before payload has been encrypted')
  }
  return crypto.sha256(payload.payload).toString('hex')
})
