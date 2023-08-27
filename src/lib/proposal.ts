import { Address } from '@scrow/tapscript'

import {
  Payout,
  PayTemplate
} from '../types/index.js'

export type PathTotal = [ path: string, total : number ]

export function get_path_names (paths : Payout[]) {
  return [ ...new Set(paths.map(e => e[0])) ]
}

export function get_path_addrs (paths : Payout[]) {
  return [ ...new Set(paths.map(e => e[2])) ]
}

export function get_templates (
  paths : Payout[],
  fees ?: Payout[]
) : PayTemplate[] {
  const ret : PayTemplate[] = []
  const path_names = get_path_names(paths)
  // For each unique name in the set:
  for (const name of path_names) {
    const txouts = paths
      .filter(e => e[0] === name)
      .map(e => payout_to_txout(e))
    ret.push([ name, txouts ])
  }
  return (fees !== undefined)
    ? apply_fees(fees, ret)
    : ret
}

export function apply_fees (
  fees      : Payout[],
  templates : PayTemplate[]
) : PayTemplate[] {
  const txouts = fees.map(e => payout_to_txout(e))
  return templates.map(e => [ e[0], [ ...txouts, ...e[1] ]])
}

export function payout_to_txout (payout : Payout) {
  return {
    value : payout[1], 
    scriptPubKey: Address.parse(payout[2]).script
  }
}

export function calc_path_total (
  paths : Payout[]
) : PathTotal[] {
  // Setup an array for out totals.
  const path_totals : PathTotal[] = []
  // Collect a set of unique path names.
  const path_names = get_path_names(paths)
  // For each unique name in the set:
  for (const name of path_names) {
    // Collect all values for that path.
    const val = paths.filter(e => e[0] === name).map(e => e[1])
    // Reduce the values into a total amount.
    const amt = val.reduce((acc, curr) => acc + curr, 0)
    // Add the total to the array.
    path_totals.push([ name, amt ])
  }
  return path_totals
}

export function calc_fee_total (
  fees : Payout[]
) : number {
  // Collect all values for that path.
  const val = fees.map(e => e[1])
  // Reduce the values into a total amount.
  return val.reduce((acc, curr) => acc + curr, 0)
}
