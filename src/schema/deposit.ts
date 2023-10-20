import { z } from 'zod'
import base  from './base.js'

const { bech32, bool, hash, hex, network, nonce, num, stamp, str } = base

const covenant = z.object({
  agent_id : hash,
  cid      : hash,
  pnonce   : nonce,
  psigs    : z.tuple([ str, str ]).array()
})

const meta = z.object({
  expires_at : stamp.nullable(),
  spent      : bool,
  txinput    : str,
  updated_at : stamp
})

const request = z.object({
  signing_key : hash,
  locktime    : num.optional(),
  network     : network.optional()
})

const status = z.object({
  confirmed    : bool,
  block_hash   : hash.nullish(),
  block_height : num.nullish(),
  block_time   : stamp.nullish(),
})

const template = z.object({
  agent_id    : hash,
  covenant    : covenant.nullish(),
  deposit_key : hash,
  recovery_tx : hex,
  sequence    : num,
  signing_key : hash,
  txvin       : bech32
})

const data = template.merge(meta).merge(status)

export default { covenant, data, meta, request, status, template }
