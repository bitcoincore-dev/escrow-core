import { z } from 'zod'

import {
  bool,
  hash,
  hex,
  label,
  nonce,
  num,
  stamp,
  str
} from './base.js'

import { txdata, txinput } from './tx.js'

const covenant = z.object({
  cid    : hash,
  pnonce : nonce,
  psigs  : z.tuple([ str, str ]).array()
})

const template = z.object({
  txinput,
  deposit_key : hash,
  recovery_tx : txdata,
  sequence    : num,
  signing_key : hash,
  signatures  : z.tuple([ label, hex ]).array(),
})

const data = template.extend({
  confirmed  : bool,
  covenant   : covenant.nullable(),
  expires_at : stamp.nullable(),
  updated_at : stamp.nullable()
})

const deposit = { covenant, data, template }

export { deposit }
