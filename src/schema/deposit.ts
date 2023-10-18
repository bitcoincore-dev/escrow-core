import { z } from 'zod'
import base  from './base.js'

const { bool, hash, hex, nonce, num, stamp, str } = base

const covenant = z.object({
  agent_id : hash,
  sid      : nonce,
  pnonce   : nonce,
  psigs    : z.tuple([ str, str ]).array()
})

const reservation = z.object({
  address     : str,
  agent_id    : hash,
  sequence    : num,
  signing_key : hash
})

const template = z.object({
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
  txinput    : str,
  updated_at : stamp
})

export default { covenant, data, reservation, template }
