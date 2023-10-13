import { Bytes }             from '@cmdcode/buff'
import { Signer }            from '@cmdcode/signer'
import { hash340 }           from '@cmdcode/crypto-tools/hash'
import { DEFAULT_DEADLINE }  from '../config.js'
import { create_signed_tx }  from './spend.js'
import { now }               from './util.js'

import {
  parse_deposit_req,
  parse_txvin
} from './deposit.js'

import {
  get_path_templates,
  get_pay_total,
  get_prop_id
} from './proposal.js'

import {
  create_agent_session,
  create_session_psigs
} from './session.js'

import {
  eval_stack,
  init_vm,
  start_vm
} from '../vm/main.js'

import {
  ContractConfig,
  ContractContext,
  ContractData,
  Covenant,
  DepositRecord,
  ProposalData
} from '../types/index.js'

import * as assert from '../assert.js'

export function create_contract (
  agent    : Signer,
  proposal : ProposalData,
  options ?: Partial<ContractConfig>
) : ContractData {
  const context = get_contract_ctx(proposal, options)
  const session = create_agent_session(agent, context)
  return {
    ...context,
    session,
    covenants : [],
    effective : null,
    expires   : null,
    state     : null,
    status    : 'published',
    total     : 0,
    tx        : null,
    witness   : []
  }
}

export function get_contract_ctx (
  proposal : ProposalData,
  options ?: Partial<ContractConfig>
) : ContractContext {
  const { aux = [], fees = [], created_at = now() } = options ?? {}
  const cid       = get_contract_id(created_at, proposal, ...aux)
  const deadline  = get_deadline(proposal, created_at)
  const subtotal  = proposal.value + get_pay_total(fees)
  const templates = get_path_templates(proposal, fees)
  const terms     = proposal
  return { cid, created_at, deadline, fees, subtotal, templates, terms }
}

export function create_covenant (
  contract : ContractData,
  record   : DepositRecord,
  signer   : Signer
) : Covenant {
  const deposit = parse_deposit_req(record)
  const session = create_session_psigs(contract, deposit, signer)
  return { ...record, ...session }
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
    if (check_covenants(contract)) {
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
  // We should validate the deposits here:
  if (!check_covenants(contract)) {
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
  return create_signed_tx(agent, contract, pathname)
}

export function check_covenants (contract : ContractData) {
  const { covenants, subtotal } = contract
  const conf  = covenants.filter(e => e.confirmed).map(x => parse_txvin(x.txvin))
  const total = conf.reduce((p, n) => p + Number(n.prevout.value), 0)
  return total >= subtotal
  return true
}
