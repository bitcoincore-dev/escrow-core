import { z } from 'zod'

import * as base from './base.js'

const { bech32, hash, hex, label, nonce } = base

const deposit = z.object({
  deposit_key : hash,
  recover_sig : hex,
  session_key : nonce,
  signatures  : z.tuple([ label, hex ]).array(),
  txinput     : bech32
})

export { deposit }
