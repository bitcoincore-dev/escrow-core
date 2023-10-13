import { Buff }        from '@cmdcode/buff'
import { parse_addr }  from '@scrow/tapscript/address'
import { create_vout } from '@scrow/tapscript/tx'
import { TxOutput }    from '@scrow/tapscript'

import {
  Payment,
  PayPath,
  PathTemplate,
  ProposalData,
} from '../types/index.js'

import * as schema from '../schema/index.js'

type PathTotal = [ path: string, total : number ]

export function create_proposal (
  template : Record<string, any>
) : ProposalData {
  return schema.proposal.parse(template)
}

export function parse_proposal (
  proposal : Record<string, any>
) : ProposalData {
  return schema.proposal.parse(proposal)
}

export function filter_path (
  label : string,
  paths : PayPath[]
) {
  return paths.filter(e => e[0] === label)
}

export function get_path_names (paths : PayPath[]) {
  return [ ...new Set(paths.map(e => e[0])) ]
}

export function get_pay_total (
  payments : Payment[]
) : number {
  return payments.map(e => e[0]).reduce((acc, curr) => acc + curr, 0)
}

export function get_addrs (paths : PayPath[]) {
  return [ ...new Set(paths.map(e => e[2])) ]
}

export function get_path_templates (
  prop : ProposalData,
  fees : Payment[]
) : PathTemplate[] {
  const { payments, paths } = prop
  const total_fees = [ ...payments, ...fees ]
  const path_names = get_path_names(paths)
  const templates : PathTemplate[] = []
  for (const name of path_names) {
    const vouts = get_path_vouts(name, paths, total_fees)
    templates.push([ name, vouts ])
  }
  return templates
}

export function get_path_vouts (
  label   : string,
  paths   : PayPath[] = [],
  payouts : Payment[] = []
) : TxOutput[] {
  const filtered : Payment[] = filter_path(label, paths).map(e => [ e[1], e[2] ])
  const template : Payment[] = [ ...filtered.sort(), ...payouts.sort() ]
  return template.map(([ value, addr ]) => {
    const scriptPubKey = parse_addr(addr).script
    return create_vout({ value, scriptPubKey })
  })
}

export function get_path_total (
  paths : PayPath[]
) : PathTotal[] {
  // Setup an array for out totals.
  const path_totals : PathTotal[] = []
  // Collect a set of unique path names.
  const path_names = get_path_names(paths)
  // For each unique name in the set:
  for (const label of path_names) {
    // Collect all values for that path.
    const val = filter_path(label, paths).map(e => e[1])
    // Reduce the values into a total amount.
    const amt = val.reduce((acc, curr) => acc + curr, 0)
    // Add the total to the array.
    path_totals.push([ label, amt ])
  }
  return path_totals
}

export function get_prop_id (
  proposal  : ProposalData
) {
  return Buff.json(proposal).digest
}
