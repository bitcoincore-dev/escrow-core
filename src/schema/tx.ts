import { z } from 'zod'

import * as base from './base.js'

const { hash, index, num, str, value } = base

const word   = z.union([ num, str ])
const script = z.union([ word, word.array() ])
const vout   = z.object({ value, scriptPubKey : script })

const vin = z.object({
  txid      : hash,
  vout      : index,
  scriptSig : str.array(),
  sequence  : num,
  witness   : script.array().default([])
})

const txinput = vin.extend({ prevout : vout })

const txdata = z.object({
  version  : index,
  vin      : vin.array(),
  vout     : vout.array(),
  locktime : num
})

export { script, txdata, txinput, vin, vout, word }