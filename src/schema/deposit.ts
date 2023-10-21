import { z } from 'zod'
import base  from './base.js'

const { bool, hash, hex, network, nonce, num, stamp, str } = base

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
  block_hash   : hash.nullable().default(null),
  block_height : num.nullable().default(null),
  block_time   : stamp.nullable().default(null),
})

const template = z.object({
  agent_id    : hash,
  covenant    : covenant.nullish(),
  deposit_key : hash,
  recovery_tx : hex,
  sequence    : num,
  signing_key : hash
})

const utxo = z.object({
  status,
  txid  : hash,
  vout  : num,
  value : num
})

const data = template.merge(meta).merge(status)

export default { covenant, data, meta, request, status, template, utxo }
