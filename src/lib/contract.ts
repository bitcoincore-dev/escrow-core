import { create_txhex }     from './tx.js'
import { now }              from './util.js'
import { DEFAULT_DEADLINE } from '../config.js'
import { init_vm }          from '../vm/main.js'

import {
  get_path_names,
  get_path_vouts,
  get_pay_total,
} from './proposal.js'

import {
  AgentSession,
  ContractConfig,
  ContractData,
  Payment,
  ProposalData,
  SpendOutput
} from '../types/index.js'

export function create_contract (
  cid       : string,
  proposal  : ProposalData,
  session   : AgentSession,
  options   : Partial<ContractConfig> = {}
) : ContractData {
  const {
    fees      = [],
    moderator = null,
    published = now()
  } = options

  return {
    cid,
    fees,
    moderator,
    published,
    session,
    activated  : null,
    balance    : 0,
    deadline   : get_deadline(proposal, published),
    expires_at : null,
    outputs    : get_spend_outputs(proposal, fees),
    state      : null,
    status     : 'published',
    terms      : proposal,
    total      : proposal.value + get_pay_total(fees),
    tx         : null,
    updated_at : published,
  }
}

export function get_deadline (
  proposal : ProposalData,
  created  : number
) {
  const { deadline, effective } = proposal
  if (effective !== undefined) {
    return effective - created
  } else {
    return created + (deadline ?? DEFAULT_DEADLINE)
  }
}

export function activate_contract (
  contract  : ContractData,
  activated : number = now()
) {
  const { cid, terms } = contract
  return {
    ...contract,
    activated,
    expires   : activated + terms.expires,
    state     : init_vm(cid, terms, activated),
    status    : 'active'
  }
}

export function get_spend_outputs (
  prop : ProposalData,
  fees : Payment[]
) : SpendOutput[] {
  const { payments, paths } = prop
  const total_fees = [ ...payments, ...fees ]
  const path_names = get_path_names(paths)
  const outputs : SpendOutput[] = []
  for (const name of path_names) {
    const vout  = get_path_vouts(name, paths, total_fees)
    const txhex = create_txhex(vout)
    outputs.push([ name, txhex ])
  }
  return outputs
}
