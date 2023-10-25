import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'

const { hash, hex, nonce, psig, num, stamp, str } = base
const { close_state, spend_state, txspend } = tx

const covenant = z.object({
  cid      : hash,
  pnonce   : nonce,
  psigs    : z.tuple([ str, psig ]).array()
})

const refund = z.object({
  deposit_id : hash,
  pnonce     : nonce,
  psig,
  txhex      : hex
})

const confirmed = z.object({
  confirmed    : z.literal(true),
  block_hash   : hash,
  block_height : num,
  block_time   : stamp,
  expires_at   : stamp
})

const unconfirmed = z.object({
  confirmed    : z.literal(false),
  block_hash   : z.null(),
  block_height : z.null(),
  block_time   : z.null(),
  expires_at   : z.null()
})

const state  = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])
const status = z.enum([ 'pending', 'open', 'locked', 'expired', 'closing', 'closed' ])

const template = z.object({
  agent_id  : hash,
  covenant  : covenant.optional(),
  return_tx : hex,
})

const data = txspend.extend({
  status,
  agent_id    : hash,
  agent_key   : hash,
  covenant    : covenant.nullable(),
  created_at  : stamp,
  deposit_id  : hash,
  deposit_key : hash,
  return_tx   : hex,
  session_pn  : nonce,
  sequence    : num,
  updated_at  : stamp
}).and(state).and(spend_state).and(close_state)

export default { covenant, data, refund, state, status, template }
