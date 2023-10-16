import { z }        from 'zod'
import { deposit }  from './deposit.js'
import { proposal } from './proposal.js'
import { vout }     from './tx.js'

import * as base from './base.js'

const { bool, hash, hex, label, literal, nonce, num, stamp, str } = base

const action = z.enum([ 'lock', 'release', 'dispute', 'resolve', 'close' ])
const commit = z.tuple([ num, num, hash, hash, label, num ])
const store  = z.tuple([ label, str ])
const status = z.enum([ 'published', 'active', 'closed', 'cancelled', 'expired' ])

const vm_status = z.enum([ 'init', 'open', 'hold', 'disputed', 'closed' ])

const output = z.tuple([ label, vout.array() ])

const session = z.object({
  agent_id : hash,
  sid      : hash,
  pnonce   : nonce,
  pubkey   : hash,
})

const state = z.object({
  commits : commit.array(),
  head    : hash,
  paths   : z.tuple([ str, num ]).array(),
  result  : label.nullable(),
  start   : stamp,
  steps   : num.max(255),
  store   : store.array(),
  status  : vm_status,
  updated : stamp
})

const tx = z.object({
  confirmed  : bool,
  height     : num,
  txid       : hash,
  txdata     : hex,
  updated_at : stamp
})

const witness = z.tuple([ stamp, action, label, str ]).rest(literal)

const data = z.object({
  session,
  state,
  status,
  tx,
  activated  : stamp.nullable(),
  cid        : hash,
  deadline   : stamp,
  expires    : stamp.nullable(),
  fees       : base.payment.array(),
  funds      : deposit.data.array(),
  outputs    : output.array(),
  published  : stamp,
  terms      : proposal.data,
  total      : num,
  witness    : witness.array(),
})

const contract = { action, commit, data, output, session, state, status, tx, witness }

export { contract }
