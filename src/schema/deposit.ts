import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'

const { bool, hash, hex, network, nonce, num, stamp, str } = base
const { txinput } = tx

const covenant = z.object({
  agent_id : hash,
  cid      : hash,
  pnonce   : nonce,
  psigs    : z.tuple([ str, str ]).array()
})

const request = z.object({
  signing_key : hash,
  locktime    : num.optional(),
  network     : network.optional()
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

const state = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])

const template = z.object({
  agent_id    : hash,
  covenant    : covenant.nullish(),
  deposit_key : hash,
  recovery_tx : hex,
  sequence    : num,
  signing_key : hash
})

const data = template.extend({
  state,
  txinput,
  deposit_id : hash,
  spent      : bool,
  created_at : stamp,
  updated_at : stamp
})

export default { covenant, data, request, state, template }
