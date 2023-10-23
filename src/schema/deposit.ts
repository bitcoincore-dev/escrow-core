import { z } from 'zod'
import base  from './base.js'

const { hash, hex, nonce, num, stamp, str } = base

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
  agent_id  : hash,
  covenant  : covenant.optional(),
  return_tx : hex,
})

const txout = z.object ({
  txid      : hash,
  vout      : num,
  value     : num,
  scriptkey : hex
})

const data = template.extend({
  state,
  status,
  txout,
  created_at  : stamp,
  deposit_id  : hash,
  deposit_key : hash,
  sequence    : num,
  signing_key : hash,
  updated_at  : stamp
})

export default { covenant, data, state, template }
