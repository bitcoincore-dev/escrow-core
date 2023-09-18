import { Test } from 'tape'

import { parse_proposal }    from '../../../src/lib/proposal.js'
import { validate_proposal } from '../../../src/validators/proposal.js'

import pass_vectors from './pass.vectors.json' assert { type : 'json' }

export default function (t : Test) {
  t.test('Testing proposal validation:', t => {
    t.plan(pass_vectors.length)
    for (const v of pass_vectors) {
      const { proofs, proposal } = v

      try {
        const prop = parse_proposal(proposal)
        validate_proposal(prop, proofs)
        t.pass('The proposal should pass validation.')
      } catch (err) {
        t.fail(err.message)
      }
    }
  })
}
