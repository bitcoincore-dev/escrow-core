import { Buff } from '@cmdcode/buff'

import {
  MachineState,
  ContractState,
  ContractData,
  StoreMap,
  StoreEntry,
  Payment,
  DepositData,
  ProposalData,
  WitnessEntry,
  WitnessData,
  ProgramTerms,
  ProgramData
} from '../types/index.js'

import * as schema from '../schema/index.js'

export function parse_regex (
  expr   : string,
  labels : string[]
) {
  let blist : string[], wlist : string[]
  if (expr === '*') {
    wlist = labels
    blist = []
  } else if (expr.includes('|')) {
    wlist = expr.split('|')
    blist = labels.filter(e => !wlist.includes(e))
  } else {
    wlist = [ expr ]
    blist = labels.filter(e => e !== expr)
  }
  return { wlist, blist }
}

export function parse_payments (
  payments : Payment[]
) : Payment[] {
  return schema.base.payment.array().parse(payments)
}

export function parse_contract (
  contract : unknown
) : ContractData {
  return schema.contract.data.parse(contract)
}

export function parse_deposit (
  deposit : unknown
) : DepositData {
  return schema.deposit.data.parse(deposit)
}

export function parse_program (
  terms : ProgramTerms
) : ProgramData {
  const [ actions, paths, method, ...literal ] = terms
  const params = literal.map(e => String(e))
  const id     = Buff.json(terms.slice(2)).digest.hex
  return { actions, id, method, params, paths }
}

export function parse_proposal (
  proposal : unknown
) : ProposalData {
  return schema.proposal.data.parse(proposal)
}

export function parse_store (store : StoreMap) {
  const entries : StoreEntry[] = []
  for (const [ key, val ] of store.entries()) {
    const dump = JSON.stringify([ ...val.entries() ])
    entries.push([ key, dump ])
  }
  return entries
}

export function parse_witness (witness : WitnessEntry) : WitnessData {
  const parser = schema.witness.entry
  const [ stamp, action, path, prog_id, ...args ] = parser.parse(witness)
  const wid = Buff.json(witness.slice(0, 4)).digest.hex
  return { action, args, wid, path, prog_id, stamp }
}

export function parse_vm (state : MachineState) : ContractState {
  const { log, progs, tasks, ...cstate } = state
  const paths = [ ...state.paths.entries() ]
  const store = parse_store(state.store)
  return { ...cstate, paths, store }
}
