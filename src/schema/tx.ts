import { z } from 'zod'

import * as base from './base.js'

const { hash, index, num, str, value } = base

const vout    = z.object({ value, scriptPubKey : str.array() })
const word    = z.union([ num, str ])
const witness = z.union([ word, word.array() ]).array()

const vin = z.object({
  txid      : hash,
  vout      : index,
  scriptSig : str.array(),
  sequence  : num,
  witness   : witness.default([])
})

const txinput = vin.extend({ prevout : vout })

const txdata = z.object({
  version  : index,
  vin      : vin.array(),
  vout     : vout.array(),
  locktime : num
})

export { txdata, txinput, vin, vout, witness }