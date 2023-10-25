import { z }    from 'zod'
import base     from './base.js'
import proposal from './proposal.js'
import tx       from './tx.js'
import witness  from './witness.js'

const { hash, hex, label, nonce, num, payment, stamp } = base
const { close_state, spend_state } = tx

const status = z.enum([ 'published', 'active', 'canceled', 'expired', 'closing', 'closed' ])

const output = z.tuple([ label, hex ])

const data = z.object({
  activated   : stamp.nullable(),
  agent_id    : hash,
  agent_key   : hash,
  balance     : num,
  cid         : hash,
  deadline    : stamp,
  expires_at  : stamp.nullable(),
  fees        : payment.array(),
  outputs     : output.array(),
  moderator   : hash.nullable(),
  published   : stamp,
  session_pn  : nonce,
  status,
  terms       : proposal.data,
  total       : num,
  updated_at  : stamp,
  vm_state    : witness.vm_state.nullable(),
}).and(spend_state).and(close_state)

export default { data, output, status }
