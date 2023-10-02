import { Signer }       from '@cmdcode/signer'
import { verify_proof } from '@cmdcode/crypto-tools/proof'
import { now }          from './util.js'
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
  return signer.sign_note(entry)
}

export function verify_witness (
  witness : WitnessEntry
) {
  const entry  = witness.slice(0, 4)
  const proofs = witness.slice(4).map(e => String(e))
  const valid  = proofs.filter(e => verify_proof(e, entry))
  return valid.length
}

export function verify_vm_state() {

}
