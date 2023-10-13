import { Buff } from '@cmdcode/buff'

import {
  ProgramData,
  ProgramTerms,
  WitnessEntry,
  WitnessData,
  MachineState,
  ContractState,
  ContractData,
  StoreMap,
  StoreEntry,
  Payment
} from '../types/index.js'

import * as schema from '../schema/index.js'

export function parse_exp (paths : string[], expr : string) {
  let blist : string[], wlist : string[]
  if (expr === '*') {
    wlist = paths
    blist = []
  } else if (expr.includes('|')) {
    wlist = expr.split('|')
    blist = paths.filter(e => !wlist.includes(e))
  } else {
    wlist = [ expr ]
    blist = paths.filter(e => e !== expr)
  }
  return { wlist, blist }
}

export function parse_payments (
  payments : Payment[]
) : Payment[] {
  return schema.payment.array().parse(payments)
}

export function parse_program (terms : ProgramTerms) : ProgramData {
  const [ actions, paths, method, ...literal ] = terms
  const params = literal.map(e => String(e))
  const id     = Buff.json(terms.slice(2)).digest.hex
  return { actions, id, method, params, paths }
}

export function parse_contract (
  contract : unknown
) : ContractData {
  return schema.contract.data.parse(contract)
}

export function parse_store (store : StoreMap) {
  const entries : StoreEntry[] = []
  for (const [ key, val ] of store.entries()) {
    const dump = JSON.stringify([ ...val.entries() ])
    entries.push([ key, dump ])
  }
  return entries
}

export function parse_vm (state : MachineState) : ContractState {
  const { log, progs, tasks, ...cstate } = state
  const paths = [ ...state.paths.entries() ]
  const store = parse_store(state.store)
  return { ...cstate, paths, store }
}

export function parse_witness (witness : WitnessEntry) : WitnessData {
  const wit = schema.contract.witness
  const [ stamp, action, path, prog_id, ...args ] = wit.parse(witness)
  const id = Buff.json(witness.slice(0, 4)).digest.hex
  return { action, args, id, path, prog_id, stamp }
}
