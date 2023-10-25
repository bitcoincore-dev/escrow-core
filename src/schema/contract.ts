import { z }    from 'zod'
import base     from './base.js'
import proposal from './proposal.js'
import tx       from './tx.js'
import witness  from './witness.js'

const { hash, hex, label, nonce, num, payment, stamp, str } = base
const { commit, store, vm_status } = witness

const status = z.enum([ 'published', 'active', 'canceled', 'expired', 'closing', 'closed' ])

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

export default { data, output, session, status, tx, vm_state }
