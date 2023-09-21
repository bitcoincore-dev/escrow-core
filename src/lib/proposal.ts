import { parse_addr }  from '@scrow/tapscript/address'
import { create_vout } from '@scrow/tapscript/tx'
import { Signer }      from '@cmdcode/signer'
import { TxOutput }    from '@scrow/tapscript'

import * as schema from '../schema/proposal.js'

import {
  Fee,
  Payout,
  PathTemplate,
  ProposalData,
  AgentData
} from '../types/index.js'

type PathTotal = [ path: string, total : number ]

export function parse_proposal (
  proposal : Record<string, any>
) : ProposalData {
  return schema.data.parse(proposal)
}

export function endorse_proposal (
  signer   : Signer,
  proposal : ProposalData
) {
  const prop = parse_proposal(proposal)
  return signer.sign_note(prop)
}

export function verify_endorsement (
  proof    : string,
  proposal : ProposalData
) {
  const prop = parse_proposal(proposal)
  return Signer.proof.verify(proof, prop)
}

export function filter_paths (
  label : string,
  paths : Payout[]
) {
  return paths.filter(e => e[0] === label)
}

export function get_path_names (paths : Payout[]) {
  return [ ...new Set(paths.map(e => e[0])) ]
}

export function get_fee_totals (fees : Fee[]) : number {
  return fees.map(e => e[0]).reduce((acc, curr) => acc + curr, 0)
}

export function get_addresses (paths : Payout[]) {
  return [ ...new Set(paths.map(e => e[2])) ]
}

export function get_path_vout (
  pathname  : string,
  templates : PathTemplate[]
) {
  const ret = templates.find(e => e[0] === pathname)
  if (ret === undefined) {
    throw new Error('template not found for path: ' + pathname)
  }
  return ret[1]
}

export function get_path_templates (
  agent    : AgentData,
  proposal : ProposalData
) : PathTemplate[] {
  const { fees, paths } = proposal
  const total_fees = [ ...fees, ...agent.fees ]
  const path_names = get_path_names(paths)
  const templates : PathTemplate[] = []
  for (const name of path_names) {
    const vouts = get_path_vouts(name, paths, total_fees)
    templates.push([ name, vouts ])
  }
  return templates
}

export function get_path_vouts (
  label : string,
  paths : Payout[] = [],
  fees  : Fee[]    = []
) : TxOutput[] {
  const filtered : Fee[] = filter_paths(label, paths).map(e => [ e[1], e[2] ])
  const template : Fee[] = [ ...filtered.sort(), ...fees.sort() ]
  return template.map(([ value, addr ]) => {
    const scriptPubKey = parse_addr(addr).script
    return create_vout({ value, scriptPubKey })
  })
}

export function get_path_totals (
  paths : Payout[]
) : PathTotal[] {
  // Setup an array for out totals.
  const path_totals : PathTotal[] = []
  // Collect a set of unique path names.
  const path_names = get_path_names(paths)
  // For each unique name in the set:
  for (const label of path_names) {
    // Collect all values for that path.
    const val = filter_paths(label, paths).map(e => e[1])
    // Reduce the values into a total amount.
    const amt = val.reduce((acc, curr) => acc + curr, 0)
    // Add the total to the array.
    path_totals.push([ label, amt ])
  }
  return path_totals
}
