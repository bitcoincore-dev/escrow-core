import { z }    from 'zod'
import base     from './base.js'
import proposal from './proposal.js'
import tx       from './tx.js'

const { hash, hex, label, literal, nonce, num, payment, stamp, str } = base

const action = z.enum([ 'lock', 'release', 'dispute', 'resolve', 'close' ])
const commit = z.tuple([ num, num, hash, hash, label, num ])
const store  = z.tuple([ label, str ])
const status = z.enum([ 'published', 'active', 'canceled', 'expired', 'closing', 'closed' ])

const vm_status = z.enum([ 'init', 'open', 'hold', 'disputed', 'closed' ])

const output = z.tuple([ label, hex ])

const session = z.object({
  agent_id : hash,
  pnonce   : nonce,
  pubkey   : hash
})

const vm_state = z.object({
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

const witness = z.tuple([ stamp, action, label, str ]).rest(literal)

const data = z.object({
  session,
  status,
  activated   : stamp.nullable(),
  balance     : num,
  cid         : hash,
  deadline    : stamp,
  expires_at  : stamp.nullable(),
  fees        : payment.array(),
  outputs     : output.array(),
  moderator   : hash.nullable(),
  published   : stamp,
  spend_state : tx.spend_state,
  terms       : proposal.data,
  total       : num,
  updated_at  : stamp,
  vm_state    : vm_state.nullable(),
})

export default { action, commit, data, output, session, vm_state, status, tx, witness }
