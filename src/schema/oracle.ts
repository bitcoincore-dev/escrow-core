import { z }    from 'zod'
import { base } from './index.js'

const { bool, hash, hex, num, stamp, str } = base

const confirmed = z.object({
  confirmed    : z.literal(true),
  block_hash   : hash,
  block_height : num,
  block_time   : stamp,
  expires_at   : stamp
})

const unconfirmed = z.object({
  confirmed : z.literal(false)
})

const status = z.discriminatedUnion('confirmed', [ confirmed, unconfirmed ])

const txout = z.object({
  scriptpubkey         : hex,
  scriptpubkey_asm     : str,
  scriptpubkey_type    : str,
  scriptpubkey_address : str,
  value                : num
})

const txin = z.object({
  txid          : hash,
  vout          : num,
  prevout       : txout.nullable().default(null),
  scriptsig     : hex,
  scriptsig_asm : str,
  sequence      : num,
  witness       : hex.array(),
  is_coinbase   : bool
})

const txdata = z.object({
  status,
  txid     : hash,
  version  : num,
  locktime : num,
  vin      : txin.array(),
  vout     : txout.array(),
  size     : num,
  weight   : num,
  fee      : num,
  hex      : hex.optional()
})

const txspend = z.object({
  status : status.optional(),
  spent  : bool,
  txid   : hash.optional(),
  vin    : num.optional()
})

export default { status, txin, txout, txdata, txspend }
