import { z } from 'zod'

import * as base from './base.js'

const { hash, nonce, payment, stamp, value } = base

const agent = z.object({
  created_at  : stamp,
  payments    : payment.array(),
  platform_id : hash,
  session_key : nonce,
  signing_key : hash,
  subtotal    : value
})

export { agent }
