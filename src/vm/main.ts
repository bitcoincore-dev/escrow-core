import { parse_witness }   from '../lib/witness.js'
import { init_vout_state } from './state.js'
import { run_schedule }    from './schedule.js'

import {
  load_program,
  parse_program,
  run_program
} from './program.js'

import {
  ProgramTerms,
  ProposalData,
  ContractState,
  ContractData,
  MachineState,
  ProgMap,
  ScheduleTerms,
  StoreMap,
  WitnessEntry,
  StoreEntry
} from '../types/index.js'

import * as assert from '../assert.js'

const INIT_STATE = {
  commits : [],
  steps   : 0,
  store   : []
}

const debug = false

export function eval_stack (
  state   : MachineState,
  stack   : WitnessEntry[],
  marker ?: number,
  throws = false
) : MachineState {
  if (state.result !== null) return state
  for (const witness of stack.sort()) {
    try {
      eval_witness(state, witness)
      if (state.result !== null) return state
    } catch (err) {
      if (throws) throw err
      if (debug) console.log('[vm]', err)
      // const { message } = err as Error
      // state.log.push([ ...witness.slice(0, 4), message ])
    }
  }
  if (marker !== undefined && marker > state.updated) {
    run_schedule(state, marker)
  }
  return state
}

export function eval_witness (
  state   : MachineState,
  witness : WitnessEntry
) {
  // Parse the witness data.
  if (debug) console.log('[vm] eval witness data:', witness)
  const { stamp } = parse_witness(witness)
  // Evaluate the schedule for due events.
  run_schedule(state, stamp)
  if (state.result !== null) return state
  // Fetch the program by id, then run the program.
  run_program(state, witness)
  return state
}

export function get_vm (
  contract : ContractData
) : MachineState {
  const { vm_state, terms } = contract
  assert.exists(vm_state)
  return start_vm(vm_state, terms)
}

export function start_vm (
  state : ContractState,
  terms : ProposalData
) : MachineState {
  const paths = new Map(state.paths)
  const store = map_stores(state.store)
  const progs = map_programs(store, terms.programs)
  const tasks = filter_tasks(terms.schedule, state)
  // Initialize program map and state.
  return { ...state, paths, progs, store, tasks, log : [] }
}

export function init_vm (
  contract_id : string,
  proposal    : ProposalData,
  published   : number,
) : ContractState {
  // Sort schedule in descending order and strip extra data.
  const head    = contract_id
  const paths   = init_vout_state(proposal)
  const result  = null
  const start   = published
  const status  = 'init'
  const updated = start
  // Initialize program map and state.
  return { ...INIT_STATE, head, paths, start, status, result, updated }
}

function map_programs (
  smap  : StoreMap,
  terms : ProgramTerms[]
) : ProgMap {
  const pmap = new Map()
  for (const term of terms) {
    const prog = parse_program(term)
    if (pmap.has(prog.id)) {
      throw new Error('Duplicate program id: ' + prog.id)
    }
    const store = load_store(smap, prog.id)
    const exec  = load_program(prog.method, prog.params, store)
    pmap.set(prog.id, { ...prog, exec, store })
  }
  return pmap
}

function map_stores (entries : StoreEntry[]) : StoreMap {
  const smap = new Map()
  for (const [ k, v ] of entries) {
    const arr = JSON.parse(v)
    if (Array.isArray(arr)) {
      const store = new Map(arr)
      smap.set(k, store)
    }
  }
  return smap
}

function load_store (map : StoreMap, key : string) {
  let store = map.get(key)
  if (store === undefined) {
    store = new Map()
  }
  if (typeof store === 'string') {
    store = JSON.parse(store)
  }
  if (Array.isArray(store)) {
    store = new Map(store)
  }
  if (store instanceof Map) {
    map.set(key, store)
    return store
  }
  throw new Error('[vm] invalid store: ' + String(store))
}

export function filter_tasks (
  sched : ScheduleTerms[],
  state : ContractState
) {
  const { start, updated } = state
  return sched.filter(e => e[0] + start > updated).sort()
}
