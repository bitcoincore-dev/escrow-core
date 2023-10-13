import { Bytes }             from '@cmdcode/buff'
import { Signer }            from '@cmdcode/signer'
import { hash340 }           from '@cmdcode/crypto-tools/hash'
import { DEFAULT_DEADLINE }  from '../config.js'
import { create_session }    from './session.js'
import { create_settlment }  from './spend.js'
import { now }               from './util.js'

import {
  get_path_templates,
  get_pay_total,
  get_prop_id
} from './proposal.js'

import {
  eval_stack,
  init_vm,
  start_vm
} from '../vm/main.js'

import {
  ContractConfig,
  ContractData,
  ProposalData
} from '../types/index.js'

import * as assert from '../assert.js'

export function create_contract (
  agent    : Signer,
  proposal : ProposalData,
  options ?: Partial<ContractConfig>
) : ContractData {
  const { aux = [], fees = [], published = now() } = options ?? {}
  const cid = get_contract_id(published, proposal, ...aux)

  return {
    cid,
    fees,
    published,
    activated : null,
    deadline  : get_deadline(proposal, published),
    expires   : null,
    funds     : [],
    session   : create_session(agent, cid),
    state     : null,
    status    : 'published',
    templates : get_path_templates(proposal, fees),
    terms     : proposal,
    tx        : null,
    value     : proposal.value + get_pay_total(fees),
    witness   : []
  }
}

export function get_contract_id (
  created  : number,
  proposal : ProposalData,
  ...aux   : Bytes[]
) {
  /** Calculate the session id from the proposal and agent session. */
  const pid = get_prop_id(proposal)
  return hash340('escrow/contract_id', pid, created, ...aux).hex
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
    if (check_deposits(contract)) {
      activate_contract(contract, timestamp)
    } else if (timestamp >= deadline) {
      contract.status = 'cancelled'
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
  // We should validate the deposits here:
  if (!check_deposits(contract)) {
    throw new Error('Not enough valid deposits to cover contract value.')
  }
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

export function check_deposits (contract : ContractData) {
  const { funds, value } = contract
  const conf  = funds.filter(e => e.confirmed).map(x => x.txinput)
  const total = conf.reduce((p, n) => p + Number(n.prevout.value), 0)
  return total >= value
}
