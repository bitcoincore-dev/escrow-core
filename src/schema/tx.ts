import { z } from 'zod'
import base  from './base.js'

const { bool, hash, hex, num, stamp, str, value } = base

const word   = z.union([ num, str ])
const script = z.union([ word, word.array() ])

const spendout = z.object ({
  txid      : hash,
  vout      : num,
  value     : num,
  scriptkey : hex
})

const spend_state = z.object({
  closed     : bool,
  closed_at  : stamp.nullable(),
  close_txid : hash.nullable(),
  spent      : bool,
  spent_at   : stamp.nullable()
})

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

export default { script, spendout, spend_state, txdata, txprev, txin, txout, word }