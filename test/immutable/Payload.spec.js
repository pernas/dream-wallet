import { expect } from 'chai'

import Wallet, * as WalletUtil from '../../src/immutable/Wallet'
import * as PayloadUtil from '../../src/immutable/Payload'

describe('Payload', () => {
  const password = 'password123'
  const payloadFixture = require('../_fixtures/payload.json')
  const walletFixture = require('../_fixtures/wallet.v3.json')
  const payload = PayloadUtil.fromJS(payloadFixture)
  const decPayload = PayloadUtil.decrypt(password, payload).value

  describe('toJS', () => {
    it('should return the correct object', () => {
      expect(PayloadUtil.toJS(payload)).to.deep.equal(payloadFixture)
    })

    it('should refuse to convert a decrypted payload', () => {
      expect(() => PayloadUtil.toJS(decPayload)).to.throw()
    })
  })

  describe('map', () => {
    it('should be able to map over a decrypted payload', () => {
      let addr = '14mQxLtEagsS8gYsdWJbzthFFuPDqDgtxQ'
      let setLabel = WalletUtil.setAddressLabel(addr, 'new_label')
      let withNewLabel = decPayload.map(setLabel)
      expect(decPayload.payload.addresses.get(addr).label).to.equal('labeled_imported')
      expect(withNewLabel.payload.addresses.get(addr).label).to.equal('new_label')
    })

    it('should not do anything if the payload is encrypted', () => {
      let unchanged = payload.map(() => null)
      expect(unchanged.payload).to.equal(payload.payload)
    })
  })

  describe('decrypt', () => {
    it('should decrypt the payload', () => {
      let { value, isRight } = PayloadUtil.decrypt(password, payload)
      expect(isRight).to.equal(true)
      expect(PayloadUtil.isPayload(value)).to.equal(true)
      expect(value.payload).to.be.an.instanceof(Wallet)
      expect(WalletUtil.toJS(value.payload)).to.deep.equal(walletFixture)
      expect(PayloadUtil.isDecrypted(value)).to.equal(true)
    })

    it('should fail with an incorrect password', () => {
      let { value, isLeft } = PayloadUtil.decrypt('wrong', payload)
      expect(isLeft).to.equal(true)
      expect(value).to.be.an.instanceof(Error)
      expect(value.message).to.equal('WRONG_PASSWORD')
    })
  })

  describe('encrypt', () => {
    it('should encrypt the payload', () => {
      let { value, isRight } = PayloadUtil.encrypt(password, decPayload)
      expect(isRight).to.equal(true)
      expect(PayloadUtil.isEncrypted(value)).to.equal(true)
      expect(value.payload).to.be.a('string')
    })
  })
})
