import { z } from 'zod'

import * as Base from './base.js'

const { payment, literal, label, network, paypath, stamp, value } = Base

const regex_str = z.string().regex(/[a-zA-Z0-9\_\|\*\-]/)

const actions = z.enum([ 'close', 'dispute', 'resolve', 'unlock' ])
const methods = z.enum([ 'signature' ])

const schedule = z.object({
  deadline : stamp,  // Duration to wait for funding.
  duration : stamp,  // Duration to hold contract open.
  expires  : stamp,  // Expiration of contract.
  onclose  : label,  // Payment action on close.
  onexpire : label   // Payment action on contract expiration.
})

const program = z.tuple([ regex_str, regex_str, methods ]).rest(literal)

const data = z.object({
  details  : z.string(),
  // members  : pubkey.array(),
  network  : network.default('bitcoin'),
  paths    : paypath.array().default([]),
  payments : payment.array(),
  schedule,
  terms    : program.array().default([]),
  title    : z.string(),
  value,
  version  : z.number(),
})

export { actions, data, methods, regex_str, schedule }
