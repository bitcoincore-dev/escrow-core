import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'

const { hash, hex, nonce, num, stamp, str } = base
const { txinput } = tx

const covenant = z.object({
  agent_id : hash,
  cid      : hash,
  pnonce   : nonce,
  psigs    : z.tuple([ str, str ]).array()
})

const confirmed = z.object({
  confirmed    : z.literal(true),
  block_hash   : hash,
  block_height : num,
  block_time   : stamp,
  close_txid   : hash.nullable(),
  expires_at   : stamp
})

const unconfirmed = z.object({
  confirmed    : z.literal(false),
  block_hash   : z.null(),
  block_height : z.null(),
  block_time   : z.null(),
  close_txid   : z.null(),
  expires_at   : z.null()
})

const state = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])

const status = z.enum([ 'pending', 'open', 'locked', 'expired', 'closed' ])

const template = z.object({
  agent_id    : hash,
  covenant    : covenant.nullable(),
  deposit_key : hash,
  recovery_tx : hex,
  sequence    : num,
  signing_key : hash
})

const data = template.extend({
  state,
  status,
  txinput,
  account_id : hash,
  created_at : stamp,
  updated_at : stamp
})

export default { covenant, data, state, template }
