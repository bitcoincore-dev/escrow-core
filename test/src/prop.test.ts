import { Test } from 'tape'

import { parse_proposal }    from '../../src/lib/proposal.js'
import { validate_proposal } from '../../src/validators/proposal.js'

import pass_vectors from './vectors/pass.vectors.js'

// Refactor this to include unit tests for proposal methods.

export default function (t : Test) {
  t.test('Testing proposal validation:', t => {
    t.plan(pass_vectors.length)
    for (const v of pass_vectors) {
      const { proposal } = v

      try {
        const prop = parse_proposal(proposal)
        validate_proposal(prop)
        t.pass('The proposal should pass validation.')
      } catch (err) {
        const { message } = err as Error
        t.fail(message)
      }
    }
  })
}
