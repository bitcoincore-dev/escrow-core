import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'

const { hash, hex, nonce, num, stamp, str } = base

const covenant = z.object({
  cid      : hash,
  pnonce   : nonce,
  psigs    : z.tuple([ str, str ]).array()
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

const fund_state = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])

const status = z.enum([ 'pending', 'open', 'locked', 'expired', 'closing', 'closed' ])

const template = z.object({
  agent_id  : hash,
  covenant  : covenant.optional(),
  return_tx : hex,
})

const data = template.extend({
  fund_state,
  status,
  created_at  : stamp,
  deposit_id  : hash,
  deposit_key : hash,
  sequence    : num,
  signing_key : hash,
  spend_state : tx.spend_state,
  txout       : tx.spendout,
  updated_at  : stamp
})

export default { covenant, data, fund_state, status, template }
