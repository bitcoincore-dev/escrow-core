import { z } from 'zod'
import base  from './base.js'

const { hash, num, str, value } = base

const word   = z.union([ num, str ])
const script = z.union([ word, word.array() ])

const txout = z.object({ value, scriptPubKey : script })

const txin = z.object({
  txid      : hash,
  vout      : num,
  scriptSig : str.array(),
  sequence  : num,
  witness   : script.array().default([])
})

const txprev = txin.extend({ prevout : txout })

const txdata = z.object({
  version  : num,
  vin      : txin.array(),
  vout     : txout.array(),
  locktime : num
})

export default { script, txdata, txprev, txin, txout, word }