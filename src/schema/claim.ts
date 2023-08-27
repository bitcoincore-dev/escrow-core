import { z } from 'zod'
import Base  from './base.js'

const { hash, pubkey, signature, str, stamp } = Base

const content    = str,
      created_at = stamp,
      id         = hash,
      sig        = signature

const template = z.object({ content }),
      preimage = template.extend({ pubkey, created_at }),
      data     = preimage.extend({ id, sig })

export default { data, preimage, template }
