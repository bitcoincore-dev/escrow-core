import { DEFAULT_DEADLINE } from '../config.js'
import { Signer }           from '../signer.js'
import { create_settlment } from './spend.js'
import { now }              from './util.js'

import {
  get_path_names,
  get_path_vouts,
  get_pay_total,
} from './proposal.js'

import {
  eval_stack,
  init_vm,
  start_vm
} from '../vm/main.js'

import {
  AgentSession,
  ContractConfig,
  ContractData,
  Payment,
  ProposalData,
  SpendOutput
} from '../types/index.js'

import * as assert from '../assert.js'

export function create_contract (
  cid      : string,
  proposal : ProposalData,
  session  : AgentSession,
  options  : Partial<ContractConfig> = {}
) : ContractData {
  const { fees = [], published = now() } = options

  return {
    cid,
    fees,
    published,
    session,
    activated : null,
    deadline  : get_deadline(proposal, published),
    expires   : null,
    funds     : [],
    outputs   : get_spend_outputs(proposal, fees),
    state     : null,
    status    : 'published',
    terms     : proposal,
    total     : proposal.value + get_pay_total(fees),
    tx        : null,
    witness   : []
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
    return deadline ?? DEFAULT_DEADLINE
  }
}

export function update_contract (
  contract : ContractData,
  timestamp = now()
) {
  const { deadline, expires, state, status, terms, witness } = contract
  if (status === 'published') {
    if (is_funded(contract)) {
      activate_contract(contract, timestamp)
    } else if (timestamp >= deadline) {
      contract.status = 'canceled'
    }
  } else if (status === 'active') {
    assert.ok(state !== null)
    assert.ok(expires !== null)
    const vm  = start_vm(state, terms)
    const ret = eval_stack(vm, witness)
    if (ret.status === 'closed') {
      assert.ok(ret.result !== null)
      contract.status = 'closed'
    } else if (timestamp >= expires) {
      contract.status = 'expired'
    }
  }
}

export function activate_contract (
  contract  : ContractData,
  published : number = now()
) {
  const { cid, terms } = contract
  return {
    ...contract,
    effective : published,
    expires   : published + terms.expires,
    state     : init_vm(cid, terms, published),
    status    : 'active'
  }
}

export function cancel_contract (
  contract : ContractData,
  signer   : Signer
) {
  console.log(signer)
  return { ...contract, status : 'canceled' }
}

export function close_contract (
  agent    : Signer,
  contract : ContractData,
  pathname : string
) {
  return create_settlment(agent, contract, pathname)
}

export function is_funded (contract : ContractData) {
  const { funds, total } = contract
  const confirmed = funds.filter(e => e.confirmed).map(x => x.txinput)
  const funding   = confirmed.reduce((p, n) => p + Number(n.prevout.value), 0)
  return funding >= total
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
    const vouts = get_path_vouts(name, paths, total_fees)
    outputs.push([ name, vouts ])
  }
  return outputs
}
