import { z }              from 'zod'
import { BaseSchema }     from './base.js'
import { ProposalSchema } from './proposal.js'

const {
  hash,  hex,     label,
  nonce, payment, pubkey,
  stamp, value
} = BaseSchema

const { template : proposal } = ProposalSchema

const agent = z.object({
  fees : payment.array(),
  nonce,
  pubkey
})

const session = z.object({
  agent,
  members   : pubkey.array(),
  deadline  : stamp,
  expires   : stamp,
  sighashes : z.tuple([ label, hex ]).array(),
  state     : z.enum([ 'draft', 'published', 'active', 'disputed', 'closed' ]),
  total     : value
})

const template = z.object({
  contract_id  : hash,
  created_at   : stamp,
  details      : proposal,
  endorsements : BaseSchema.proof.array(),
})

const data = template.merge(session)

export const ContractSchema = {
  agent,
  data,
  session,
  template
}
