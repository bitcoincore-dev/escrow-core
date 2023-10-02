import { z }     from 'zod'

import { agent }    from './agent.js'
import { deposit }  from './deposit.js'
import { proposal } from './proposal.js'

import * as base from './base.js'

const { bool, entry, hash, hex, label, literal, num, stamp, str, value } = base

const action = z.enum([ 'lock', 'release', 'dispute', 'resolve', 'close' ])
const commit = z.tuple([ num, num, hash, hash, label, num ])
const store  = z.tuple([ label, literal.array() ])

const ct_status = z.enum([ 'init', 'open', 'hold', 'disputed', 'closed', 'expired' ])
const vm_status = z.enum([ 'init', 'open', 'hold', 'disputed', 'closed' ])

const state = z.object({
  commits : commit.array(),
  head    : hash,
  paths   : entry.array(),
  result  : label.nullable(),
  start   : stamp,
  steps   : num.max(255),
  store   : store.array(),
  status  : vm_status,
  updated : stamp
})

const tx = z.object({
  confirmed  : bool,
  txid       : hash,
  txdata     : hex,
  updated_at : stamp
})

const witness = z.tuple([ stamp, action, label, str ]).rest(literal)

const data = z.object({
  agent,
  state,
  cid       : hash,
  deposits  : deposit.array(),
  published : stamp,
  terms     : proposal,
  total     : value,
  witness   : witness.array(),
})

const contract = { action, commit, data, state, ct_status, tx, vm_status, witness }

export { contract }
