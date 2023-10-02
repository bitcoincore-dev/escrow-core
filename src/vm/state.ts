import { Buff }           from '@cmdcode/buff'
import { run_action }     from './action.js'
import { parse_witness }  from '../lib/parse.js'
import { get_path_names } from '../lib/proposal.js'
import { regex }          from '../lib/util.js'

import {
  PathState,
  MachineState,
  WitnessEntry,
  PathMap,
  PathStatus,
  ProposalData,
  ProgramTerms,
  StateEntry
} from '../types/index.js'

const INIT_TERMS = {
  can_dispute : false,
  can_lock    : false,
  can_resolve : false
}

const debug = false

export function update_vout_state (
  state   : MachineState,
  witness : WitnessEntry
) {
  // Unpack the witness object.
  const { action, id, path, stamp } = parse_witness(witness)
  check_stamp(state, witness)
  const pst = get_path_state(state.paths, path)
  const ret = run_action(action, pst)
  if (ret !== null) {
    const head = state.head
    const step = state.steps
    state.paths.set(path, ret)
    state.commits.push([ step, stamp, id, head, path, ret ])
    state.head    = get_hash_tip(head, step, id)
    state.status  = update_status(state.status, ret)
    state.updated = stamp
    state.steps  += 1
    if (debug) console.log('[vm] new state:', state)
  }
  if (ret === PathState.closed) {
    state.result = path
  }
}

export function init_vout_state (proposal : ProposalData) {
  const { paths, programs } = proposal
  const states : StateEntry[] = []
  const pnames = get_path_names(paths)
  for (const path of pnames) {
    const state = init_path_state(path, programs)
    states.push([ path, state ])
  }
  return states
}

function init_path_state (
  pathname : string,
  programs : ProgramTerms[]
) : PathState {
  const terms = { ...INIT_TERMS }
    let state : PathState = PathState.open
  for (const prog of programs) {
    const [ actexp, pathexp ] = prog
    if (regex(pathname, pathexp)) {
      if (regex('dispute', actexp)) terms.can_dispute = true
      if (regex('resolve', actexp)) terms.can_resolve = true
      if (regex('lock',    actexp)) terms.can_lock    = true
      if (regex('release', actexp)) state = PathState.locked
    }
  }
  validate_path_terms(pathname, terms)
  return state
}

function update_status (
  status : PathStatus,
  state  : PathState
) {
  if (state === PathState.closed) {
    return 'closed'
  } else if (state === PathState.disputed) {
    return 'disputed'
  } else {
    return status
  }
}

function get_path_state (
  pmap : PathMap,
  key  : string
) : PathState {
  let state = pmap.get(key)
  if (state === undefined) {
    throw new Error('Path not found: ' + key)
  }
  return state
}

function validate_path_terms (
  path  : string,
  terms : typeof INIT_TERMS
) {
  if (terms.can_dispute && !terms.can_resolve) {
    throw new Error('Dispute action has no resolve action: ' + path)
  }

  // if (terms.can_resolve && !terms.can_dispute) {
  //   throw new Error('Resolve action has no dispute action: ' + path)
  // }
}

function check_stamp (
  state   : MachineState,
  witness : WitnessEntry
) {
  const { updated } = state
  const { prog_id, stamp } = parse_witness(witness)
  if (stamp < updated && prog_id !== 'task') {
    throw new Error(`Timestamp occurs before latest update: ${stamp} <= ${updated}`)
  }
}

function get_hash_tip (
  head   : string,
  step   : number,
  wit_id : string
) {
  return Buff.json([ step, wit_id, head ]).digest.hex
}
