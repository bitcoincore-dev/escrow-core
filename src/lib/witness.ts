import { Buff }         from '@cmdcode/buff'
import { create_proof } from './proof.js'
import { Signer }       from '../signer.js'
import { now, regex }   from './util.js'

import {
  Literal,
  WitnessEntry
} from '../types/index.js'

import * as schema from '../schema/index.js'

interface WitnessConfig {
  method   ?: string
  prog_id  ?: string
  programs ?: Literal[][]
  stamp    ?: number
}

export function create_witness (
  action   : string,
  path     : string,
  signer   : Signer,
  options ?: WitnessConfig
) : WitnessEntry {
  const {
    method   = 'proof',
    stamp    = now(),
    programs = [],
  } = options ?? {}

  let prog_id = options?.prog_id

  if (prog_id === undefined) {
    const pub = signer.pubkey
    prog_id   = get_program_id(action, path, method, pub, programs)
  }

  const data   = [ stamp, action, path, prog_id ]
  const proof  = create_proof(signer, data)
  const parser = schema.witness.entry
  return parser.parse([ ...data, proof ])
}

export function endorse_witness (
  signer  : Signer,
  witness : WitnessEntry
) : string {
  const entry = witness.slice(0, 4)
  return create_proof(signer, entry)
}

export function get_program_id (
  action   : string,
  path     : string,
  method   : string,
  param    : string,
  programs : Literal[][]
) {
  const parser = schema.proposal.program.array()
  const progs  = parser.safeParse(programs)
  if (!progs.success) {
    throw new Error('Programs list failed validation!')
  }
  for (const [ actions, paths, label, ...params ] of progs.data) {
    if (!regex(action, actions)) continue
    if (!regex(path, paths))     continue
    if (method !== label)        continue
    if (!params.includes(param)) continue
    return Buff.json([ label, ...params ]).digest.hex
  }
  throw new Error('Matching program not found!')
}
