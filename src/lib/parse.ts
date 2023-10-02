import { Buff }           from '@cmdcode/buff'
import { create_prevout } from '@scrow/tapscript/tx'

import {
  ProposalData,
  ProgramData,
  ProgramTerms,
  WitnessEntry,
  WitnessData,
  MachineState,
  ContractState,
  ContractData
} from '../types/index.js'

import * as schema from '../schema/index.js'

export function parse_proposal (
  proposal : Record<string, any>
) : ProposalData {
  return schema.proposal.parse(proposal) as ProposalData
}

export function parse_txin (encoded : string) {
  const txinput = Buff.bech32m(encoded).to_json()
  return create_prevout(txinput)
}

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

export function parse_program (terms : ProgramTerms) : ProgramData {
  const [ actions, paths, method, ...literal ] = terms
  const params = literal.map(e => String(e))
  const id     = Buff.json(terms.slice(2)).digest.hex
  return { actions, id, method, params, paths }
}

export function parse_contract (contract : unknown) {
  return schema.contract.data.parse(contract) as ContractData
}

export function parse_vm (state : MachineState) : ContractState {
  const { log, paths, progs, store, tasks, ...cstate } = state
  const pmap = [ ...paths.entries() ]
  const smap = [ ...store.entries() ]
  const dmap = smap.map(e => [ e[0], [ ...e[1].entries() ]])
  return { ...cstate, paths : pmap, store : dmap }
}

export function parse_witness (witness : WitnessEntry) : WitnessData {
  const wit = schema.contract.witness
  const [ stamp, action, path, prog_id, ...args ] = wit.parse(witness)
  const id = Buff.json(witness.slice(0, 4)).digest.hex
  return { action, args, id, path, prog_id, stamp }
}
