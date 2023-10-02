import { PathState } from '../types/index.js'

const debug = false

export function run_action (
  action : string,
  state  : PathState
) : PathState | null {
  switch (action) {
    case 'close':
      return exec_close(state)
    case 'dispute':
      return exec_dispute(state)
    case 'lock':
      return exec_lock(state)
    case 'release':
      return exec_release(state)
    case 'resolve':
      return exec_resolve(state)
    default:
      throw new Error('Action not found: ' + action)
  }
}

export function exec_dispute (state : PathState) {
  if (state === PathState.disputed) {
    if (debug) console.log('Path is already in dispute.')
    return null
  } else {
    return PathState.disputed
  }
}

export function exec_resolve (state : PathState) {
  if (state !== PathState.disputed) {
    if (debug) console.log('Path is not in a dispute.')
    return null
  } else {
    return PathState.closed
  }
}

export function exec_lock (state : PathState) {
  if (state === PathState.locked) {
    if (debug) console.log('[vm] Path is already locked.')
    return null
  } else if (state === PathState.disputed) {
    if (debug) console.log('[vm] Path is in a dispute.')
    return null
  } else {
    return PathState.locked
  }
}

export function exec_release (state : PathState) {
  if (state !== PathState.locked) {
    if (debug) console.log('[vm] Path is not locked.')
    return null
  } else {
    return PathState.open
  }
}

function exec_close (state : PathState) {
  if (state === PathState.locked) {
    if (debug) console.log('[vm] Path is locked.')
    return null
  } else if (state === PathState.disputed) {
    if (debug) console.log('[vm] Path is in dispute.')
    return null
  } else {
    return PathState.closed
  }
}
