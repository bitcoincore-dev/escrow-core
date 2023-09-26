import { z }    from 'zod'

import * as Base     from './base.js'
import * as Proposal from './proposal.js'

const {
  hash,  hex,     label,
  nonce, payment, pubkey,
  stamp, value
} = Base

const { data : proposal } = Proposal

const agent = z.object({
  created_at : stamp,
  payments   : payment.array(),
  pnonce     : nonce,
  prop_id    : hash,
  pubkey     : hash,
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
  endorsements : Base.proof.array(),
})

const data = template.merge(session)

export {
  agent,
  data,
  session,
  template
}
