import { z } from 'zod'

import * as Base from './base.js'

const { fee, literal, label, network, payment, pubkey, stamp, value } = Base

const path_regex = z.string().regex(/[a-zA-Z0-9\_\|\*\-]/)

const actions = z.enum([ 'close', 'dispute', 'resolve', 'unlock' ])
const methods = z.enum([ 'signature' ])

const schedule = z.object({
  deadline : stamp,  // Duration to wait for funding.
  duration : stamp,  // Duration to hold contract open.
  expires  : stamp,  // Expiration of contract.
  onclose  : label,  // Payment action on close.
  onexpire : label   // Payment action on contract expiration.
})

const program = z.tuple([ path_regex, actions, methods ]).rest(literal)

const data = z.object({
  details  : z.string(),
  fees     : fee.array(),
  members  : pubkey.array(),
  network  : network.default('bitcoin'),
  paths    : payment.array().default([]),
  programs : program.array().default([]),
  schedule,
  title    : z.string(),
  value,
  version  : z.number(),
})

export { actions, data, methods, path_regex, schedule }
