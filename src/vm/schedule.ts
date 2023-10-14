import { parse_regex }       from '../lib/parse.js'
import { update_vout_state } from './state.js'

import {
  MachineState,
  ScheduleTerms,
  WitnessEntry
} from '../types/index.js'

const debug = false

export function run_schedule (
  state  : MachineState,
  marker : number
) {
  if (debug) console.log('[vm] running tasks up to marker:', marker)
  const tasks = state.tasks
  for (const task of tasks) {
    const [ ts ] = task
    const stamp = state.start + ts
    const prev  = state.updated
    if (prev <= stamp && stamp <= marker) {
      run_task(state, task)
      if (state.result !== null) return
      state.tasks.shift()
    }
  }
}

function run_task (
  state : MachineState,
  task  : ScheduleTerms
) {
  const [ ts, action, pathexp ] = task
  if (debug) console.log('[vm] running task:', task)
  const paths = [ ...state.paths.keys() ]
  const stamp = state.start + ts
  const expr  = parse_regex(pathexp, paths)
    let wit : WitnessEntry
  for (const path of expr.wlist) {
    wit = [ stamp, action, path, 'task' ]
    update_vout_state(state, wit)
    if (state.result !== null) return
  }
}
