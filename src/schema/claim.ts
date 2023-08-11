import { z }          from 'zod'
import { BaseSchema } from './base.js'

const { hash, pubkey, signature, str, stamp } = BaseSchema

const content    = str,
      created_at = stamp,
      id         = hash,
      sig        = signature

const template = z.object({ content }),
      preimage = template.extend({ pubkey, created_at }),
      data     = preimage.extend({ id, sig })

export const ClaimSchema = { data, preimage, template }
