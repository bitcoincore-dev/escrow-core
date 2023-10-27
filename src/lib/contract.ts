import { create_txhex }     from './tx.js'
import { now, sort_record } from './util.js'
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
  SpendTemplate
} from '../types/index.js'
import { Buff } from '@cmdcode/buff'

export function create_contract (
  cid       : string,
  proposal  : ProposalData,
  session   : AgentSession,
  options   : Partial<ContractConfig> = {}
) : ContractData {
  const { fees = [], moderator = null, published = now() } = options

  return sort_record({
    ...session,
    activated   : null,
    balance     : 0,
    cid,
    closed      : false,
    closed_at   : null,
    deadline    : get_deadline(proposal, published),
    expires_at  : null,
    fees,
    moderator,
    outputs     : get_spend_outputs(proposal, fees),
    prop_id     : Buff.json(proposal).digest.hex,
    published,
    spent       : false,
    spent_at    : null,
    spent_txid  : null,
    status      : 'published',
    terms       : proposal,
    total       : proposal.value + get_pay_total(fees),
    updated_at  : published,
    vm_state    : null
  })
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
) : SpendTemplate[] {
  const { payments, paths } = prop
  const total_fees = [ ...payments, ...fees ]
  const path_names = get_path_names(paths)
  const outputs : SpendTemplate[] = []
  for (const name of path_names) {
    const vout  = get_path_vouts(name, paths, total_fees)
    const txhex = create_txhex(vout)
    outputs.push([ name, txhex ])
  }
  return outputs
}
