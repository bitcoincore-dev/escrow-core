import { z } from 'zod'
import Base  from './base.js'

const { hash, hex, stamp } = Base

const data = z.object({
  confirmed  : z.boolean(),
  kind       : z.enum([ 'deposit', 'close' ]),
  txid       : hash,
  txdata     : hex,
  updated_at : stamp
})

export default { data }
