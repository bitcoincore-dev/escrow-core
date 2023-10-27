import { z } from 'zod'
import base  from './base.js'

const { num, payment, literal, network, paypath, stamp, str } = base

const regex    = z.string().regex(/[a-zA-Z0-9\_\|\*\-]/)
const action   = z.enum([ 'close', 'dispute', 'release', 'resolve' ])
const method   = z.enum([ 'proof' ])
const program  = z.tuple([ regex, regex, method ]).rest(literal)
const task     = z.tuple([ num, action, regex ])

const data = z.object({
  details    : str,
  deadline   : num.optional(),
  duration   : num.optional(),
  effective  : stamp.optional(),
  expires    : num,
  fallback   : str.optional(),
  network    : network.default('main'),
  paths      : paypath.array().default([]),
  payments   : payment.array(),
  programs   : program.array().default([]),
  schedule   : task.array().default([]),
  title      : str,
  value      : num,
  version    : num,
})

export default { action, data, method, program, task }
