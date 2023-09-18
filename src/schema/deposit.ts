import { z } from 'zod'

import * as Base from './base.js'

const { bool, hash, hex, label, pubkey, signature, stamp } = Base

const utxo = z.object({
  tapkey : hash,
  txid   : hash,
  value  : z.bigint(),
  vout   : z.number()
})

const template = z.object({
  deposit_key : pubkey,
  nonce_key   : signature,
  refund_key  : pubkey,
  refund_tx   : hex,
  signatures  : z.tuple([ label, hex ]).array(),
  timelock    : z.number(),
  utxo
})

const data = template.extend({
  confirmed  : bool,  // If deposit txid is confirmed.
  height     : z.number().optional(),
  updated_at : stamp
})

export default { data, template, utxo }
