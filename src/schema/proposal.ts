import { z } from 'zod'

import * as base from './base.js'

const { num, payment, literal, network, paypath, stamp, value } = base

const regex_str = z.string().regex(/[a-zA-Z0-9\_\|\*\-]/)

const action = z.enum([ 'close', 'dispute', 'release', 'resolve' ])
const method = z.enum([ 'proof' ])

const program_terms  = z.tuple([ regex_str, regex_str, method ]).rest(literal)
const schedule_terms = z.tuple([ num, action, regex_str ])

const proposal = z.object({
  details   : z.string(),
  deadline  : num.optional(),
  duration  : num.optional(),
  effective : stamp.optional(),
  expires   : num,
  fallback  : z.string().optional(),
  network   : network.default('bitcoin'),
  paths     : paypath.array().default([]),
  payments  : payment.array(),
  programs  : program_terms.array().default([]),
  schedule  : schedule_terms.array().default([]),
  title     : z.string(),
  value,
  version   : z.number(),
})

export { proposal }
