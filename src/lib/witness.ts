import { Signer }       from '../signer.js'
import { now }          from './util.js'
import { create_proof } from './proof.js'
import { WitnessEntry } from '../types/index.js'

export function create_witness (
  action  : string,
  path    : string,
  prog_id : string,
  stamp   = now()
) : WitnessEntry {
  return [ stamp, action, path, prog_id ]
}

export function endorse_witness (
  signer  : Signer,
  witness : WitnessEntry
) : string {
  const entry = witness.slice(0, 4)
  return create_proof(signer, entry)
}
