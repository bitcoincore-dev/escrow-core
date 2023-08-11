import { z }          from 'zod'
import { BaseSchema } from './base.js'

const { hash, hex, stamp } = BaseSchema

const data = z.object({
  confirmed  : z.boolean(),
  kind       : z.enum([ 'deposit', 'close' ]),
  txid       : hash,
  txdata     : hex,
  updated_at : stamp
})

export const TxSchema = { data }
