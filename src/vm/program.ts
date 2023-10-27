import { Buff }              from '@cmdcode/buff'
import { update_vout_state } from './state.js'
import { regex }             from '../lib/util.js'
import { parse_witness }     from '../lib/parse.js'

import {
  MachineState,
  ProgramData,
  ProgMap,
  ProgramTerms,
  WitnessEntry
} from '../types/index.js'

import * as methods from './methods/index.js'

const debug = false

export function parse_program (terms : ProgramTerms) : ProgramData {
  const [ actions, paths, method, ...literal ] = terms
  const params = literal.map(e => String(e))
  const id     = Buff.json(terms.slice(2)).digest.hex
  return { actions, id, method, params, paths }
}

export function load_program (
  method : string,
  params : string[],
  store  : Map<string, any>
) {
  switch (method) {
    case 'proof':
      return methods.proof_v1(params, store)
    default:
      throw new Error('Method not found:' + method)
  }
}

export function run_program (
  state   : MachineState,
  witness : WitnessEntry
) {
  const { action, path, prog_id } = parse_witness(witness)
  const { actions, paths, exec }  = get_program(state.progs, prog_id)
  if (debug) console.log('[vm] loading witness program:', prog_id)
  // Execute the program with commit hash and args.
  if (!regex(path, paths)) {
    throw new Error('Program encountered invalid path: ' + path)
  } else if (!regex(action, actions)) {
    throw new Error('Program encountered invalid action: ' + action)
  } else if (exec(witness)) {
    update_vout_state(state, witness)
  }
}

function get_program (map : ProgMap, id : string) {
  const prog = map.get(id)
  if (prog === undefined) {
    throw new Error('Program not found with ID: ' + id)
  }
  return prog
}


