import { Buff }         from '@cmdcode/buff'
import { Signer }       from '../signer.js'
import { now }          from './util.js'
import { create_proof } from './proof.js'

import {
  WitnessEntry,
  WitnessData
} from '../types/index.js'

import * as schema from '../schema/index.js'

export function create_witness (
  action  : string,
  path    : string,
  prog_id : string,
  stamp   = now()
) : WitnessEntry {
  return [ stamp, action, path, prog_id ]
}

export function parse_witness (witness : WitnessEntry) : WitnessData {
  const wit = schema.contract.witness
  const [ stamp, action, path, prog_id, ...args ] = wit.parse(witness)
  const wid = Buff.json(witness.slice(0, 4)).digest.hex
  return { action, args, wid, path, prog_id, stamp }
}

export function endorse_witness (
  signer  : Signer,
  witness : WitnessEntry
) : string {
  const entry = witness.slice(0, 4)
  return create_proof(signer, entry)
}
