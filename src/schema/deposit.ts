import { z } from 'zod'

import {
  bool,
  hash,
  hex,
  nonce,
  num,
  stamp,
  str
} from './base.js'

import { txinput } from './tx.js'

const covenant = z.object({
  agent_id : hash,
  sid      : nonce,
  pnonce   : nonce,
  psigs    : z.tuple([ str, str ]).array()
})

const template = z.object({
  txinput,
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
  txid       : hash.nullable(),
  updated_at : stamp.nullable()
})

const deposit = { covenant, data, template }

export { deposit }
