import { z } from 'zod'
import base  from './base.js'
import tx    from './tx.js'

const { bool, hash, hex, nonce, num, stamp, str } = base

const covenant = z.object({
  agent_id : hash,
  sid      : nonce,
  pnonce   : nonce,
  psigs    : z.tuple([ str, str ]).array()
})

const template = z.object({
  txinput     : tx.txinput,
  agent_id    : hash,
  deposit_key : hash,
  recovery_tx : hex,
  sequence    : num,
  signing_key : hash
})

const data = template.extend({
  confirmed  : bool,
  covenant   : covenant.nullable(),
  expires_at : stamp.nullable(),
  settled    : bool,
  updated_at : stamp.nullable()
})

export default { covenant, data, template }
