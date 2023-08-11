import { z }          from 'zod'
import { BaseSchema } from './base.js'

const { index, label, network, payment, pubkey, stamp, value } = BaseSchema

const claims = z.object({ mediator: pubkey })

const schedule = z.object({
  deadline  : stamp,  // Duration to wait for funding.
  duration  : stamp,  // Duration to hold contract open.
  expires   : stamp,  // Expiration of contract.
  onclose   : label,  // Payment action on close.
  onexpired : label   // Payment action on contract expiration.
})

const sigpath = z.tuple([ label, index ]).rest(pubkey)

const terms = z.object({
  claims     : claims.optional(),
  fees       : payment.array(),
  paths      : payment.array(),
  schedule,
  settlement : sigpath.array().optional()
})

const template = z.object({
  version : z.number(),
  title   : z.string(),
  details : z.string(),
  members : pubkey.array(),
  network,
  terms,
  value
})

export const ProposalSchema = { sigpath, template, terms }
