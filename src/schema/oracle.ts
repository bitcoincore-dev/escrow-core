import { z } from 'zod'
import base  from './base.js'

const { bool, hash, hex, num, stamp, str } = base

const status = z.object({
  confirmed    : bool,
  block_hash   : hash,
  block_height : num,
  block_time   : stamp
})

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
  prevout       : num,
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
  fee      : num
})

const txspend = z.object({
  status,
  spent : bool,
  txid  : hash,
  vin   : num
})

export default { status, txin, txout, txdata, txspend }
