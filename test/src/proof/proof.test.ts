import { Test }   from 'tape'
import { Signer } from '@cmdcode/signer'

import * as plib from '../../../src/lib/proof.js'

import pass_vectors from './pass.vectors.json' assert { type : 'json' }

const DEFAULT_OPT = { aux : '00'.repeat(32) }

export default function (t : Test) {
  t.test('Testing proof generation:', t => {
    t.plan(3 * pass_vectors.length)
    for (const v of pass_vectors) {
      const { content, secret, params, proof: expected } = v
      const signer = new Signer(secret, DEFAULT_OPT)
      const actual = plib.create_proof(signer, content, params)
      t.equal(actual, expected, 'Both proof strings should be identical.')
      t.true(plib.validate_proof(v.proof), 'The proof string should be valid.')
      try {
        t.true(plib.verify_proof(actual, content, true), 'The proof signature should be valid.')
      } catch (err) {
        const { message } = err as Error
        t.fail(message)
      }
    }
  })
}
