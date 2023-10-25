import { z } from 'zod'
import base  from './base.js'

const { hash, hex, num, stamp } = base

// const word   = z.union([ num, str ])
// const script = z.union([ word, word.array() ])

const spent = z.object({
  spent       : z.literal(true),
  spent_at    : stamp,
  spent_txid  : hash,
})

const unspent = z.object({
  spent       : z.literal(false),
  spent_at    : z.null(),
  spent_txid  : z.null(),
})

const settled = z.object({
  closed      : z.literal(true),
  closed_at   : stamp,
})

const unsettled = z.object({
  closed      : z.literal(false),
  closed_at   : z.null(),
})

const spend_state = z.discriminatedUnion('spent',     [ spent,     unspent     ])
const close_state = z.discriminatedUnion('closed',    [ settled,   unsettled   ])

const txspend = z.object ({
  txid      : hash,
  vout      : num,
  value     : num,
  scriptkey : hex
})

// const txout = z.object({ value, scriptPubKey : script })

// const txin = z.object({
//   txid      : hash,
//   vout      : num,
//   scriptSig : str.array(),
//   sequence  : num,
//   witness   : script.array().default([])
// })

// const txprev = txin.extend({ prevout : txout })

// const txdata = z.object({
//   version  : num,
//   vin      : txin.array(),
//   vout     : txout.array(),
//   locktime : num
// })

export default { close_state, spend_state, txspend }