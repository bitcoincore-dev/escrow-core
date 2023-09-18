import config from '@/config.js'

import * as assert from '@/lib/assert.js'
import * as lib    from '@/lib/index.js'
import * as schema from '@/schema/index.js'

import {
  Fee,
  Network,
  Payout,
  ProposalData,
  ScheduleData
} from '../types/index.js'

// import { WitnessProg }  from '@/types/program.js'

const { MIN_WINDOW, MAX_WINDOW } = config

export function validate_proposal (
  proposal : ProposalData,
  proofs   : string[]
) : asserts proposal is ProposalData {
  const { members } = proposal
  // Assert the proposal schema is valid.
  assert.valid_proposal(proposal)
  // Validate the terms of the proposal.
  validate_terms(proposal)
  // Check that all members have endorsements.
  validate_members(members, proofs)
  // Check that all endorsements are valid.
  validate_proofs(proposal, proofs)
}

export function validate_members (
  members : string[],
  proofs  : string[]
) {
  const pubs = lib.proof.parse_proofs(proofs).map(e => e.pub)
  for (const member of members) {
    if (!pubs.includes(member)) {
      throw new Error('Proposal member is missing from proof data: ' + member)
    }
  }
}

export function validate_proofs (
  proposal : ProposalData,
  proofs   : string[]
) {
  for (const proof of proofs) {
    const { pub } = lib.proof.parse_proof(proof)
    if (!lib.proof.validate_proof(proof)) {
      throw new Error('Proof formatting is invalid for key: ' + pub)
    }
    if (!lib.prop.verify_endorsement(proof, proposal)) {
      throw new Error('Proof signature is invalid for key: ' + pub)
    }
  }
}

export function validate_schema (
  proposal : ProposalData
) : asserts proposal is ProposalData {
  void parse_proposal(proposal)
}

export function validate_terms (
  proposal : ProposalData
) {
  const { fees, network, paths, schedule, value } = proposal
  // Check fees and spending paths.
  check_path_addr(network, paths, fees)
  check_path_totals(value, paths, fees)
  // Chech if schedule terms are valid.
  check_schedule(paths, schedule)
  // Chech if settlement terms are valid.
  // check_programs(terms)
}

export function parse_proposal (proposal : ProposalData) {
  return schema.proposal.data.parse(proposal)
}

function check_path_addr (
  network : Network,
  paths   : Payout[],
  fees    : Fee[] = []
) {
  paths.forEach(e => { assert.valid_address(e[2], network) })
  fees.forEach(e  => { assert.valid_address(e[1], network) })
}

function check_path_totals (
  value : number,
  paths : Payout[],
  fees  : Fee[] = []
) {
  // Get totals for fees and paths.
  const total_fees  = lib.prop.get_fee_totals(fees)
  const total_paths = lib.prop.get_path_totals(paths)

  if (total_fees > value) {
    throw new Error(`Total fees should not exceed contract value: ${total_fees} > ${value}`)
  }

  for (const [ name, amt ] of total_paths) {
    if (amt + total_fees !== value) {
      const tally = `${amt} + ${total_fees} !== ${value}`
      throw new Error(`Path "${name}" plus fees does not equal contract value: ${tally}`)
    }
  }
}

function check_schedule (
  paths    : Payout[],
  schedule : ScheduleData
) : void {
  const { deadline, duration, expires, onclose, onexpire } = schedule

  const closing_path = paths.find(e => e[0] === onclose)
  const expires_path = paths.find(e => e[0] === onexpire)
  const total_time   = deadline + duration + expires

  if (closing_path === undefined) {
    throw new Error(`onclose must specify a valid spending path. (onclose: ${onclose})`)
  }

  if (expires_path === undefined) {
    throw new Error(`onexpired must specify a valid spending path. (onexpire: ${onexpire})`)
  }

  if (deadline < MIN_WINDOW) {
    throw new Error(`Funding deadline must allow at least a 2 hour window. (deadline: ${deadline})`)
  }

  if (expires < MIN_WINDOW) {
    throw new Error(`Contract expiration must allow at least a 2 hour window. (expires: ${expires})`)
  }

  if (total_time > MAX_WINDOW) {
    throw new Error(`Total contract duration is currently limited to 30 days max. (total_time: ${total_time})`)
  }
}

// function check_programs (terms : TermData) {
//   /* Check that all spending events point to defined spending paths. */
//   const { paths, programs } = terms
//   const path_labels = lib.prop.get_pathnames(paths)
//   for (const label of path_labels) {
//     const templ = prop.filter_path(label )
//     const progs = programs.filter(e => e[0] === name)
//     for (const prog of progs) {
//       check_program(prog)
//     }
//   }
//   for (const name of path_names) {
//     check_program(name, path_names)
//   }
// }

// function check_program (program : WitnessProg) {
//   // const [ path, thold, ...pubkeys ] = params

//   if (!paths.includes(path)) {
//     throw new Error(`Settlement path "${path}" does not exist!`)
//   }

//   if (thold > pubkeys.length) {
//     throw new Error('Threshold is greater than number of keys!')
//   }

//   if (pubkeys.length > MAX_MULTISIG) {
//     throw new Error('Current limit for a settlement path is 100 key members.')
//   }
// }

export default {
  members  : validate_members,
  proofs   : validate_proofs,
  proposal : validate_proposal,
  terms    : validate_terms
}
