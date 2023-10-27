import { verify_proof }  from '../lib/proof.js'
import { parse_witness } from '../lib/parse.js'

import {
  WitnessEntry
} from '../types/index.js'

import * as assert from '../assert.js'

export function validate_witness (
  witness : unknown
) : asserts witness is WitnessEntry {
  parse_witness(witness as WitnessEntry)
}

export function verify_witness (
  witness : WitnessEntry
) {
  assert.ok(witness.length > 4,       'Not enough arguments provided in witness.')
  const entry  = witness.slice(0, 4)
  const proofs = witness.slice(4).map(e => String(e))
  proofs.forEach(e => {
    assert.ok(verify_proof(e, entry), 'Proof is invalid: ' + e)
  })
}
