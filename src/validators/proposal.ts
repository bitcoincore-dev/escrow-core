import { MIN_WINDOW, MAX_WINDOW } from '../config.js'

import {
  parse_proposal,
  get_payment_totals,
  get_path_totals
} from '../lib/proposal.js'

import * as assert from '../assert.js'

import {
  Payment,
  Network,
  PayPath,
  ProposalData,
  ScheduleData
} from '../types/index.js'

// import { WitnessProg }  from '@/types/program.js'

export function validate_proposal (
  proposal : ProposalData
) : asserts proposal is ProposalData {
  // Assert the proposal schema is valid.
  validate_schema(proposal)
  // Validate the terms of the proposal.
  validate_terms(proposal)
}

export function validate_schema (
  proposal : ProposalData
) : asserts proposal is ProposalData {
  void parse_proposal(proposal)
}

export function validate_terms (
  proposal : ProposalData
) {
  const { payments, network, paths, schedule, value } = proposal
  // Check fees and spending paths.
  check_path_addr(network, paths, payments)
  check_path_totals(value, paths, payments)
  // Chech if schedule terms are valid.
  check_schedule(paths, schedule)
  // Chech if settlement terms are valid.
  // check_programs(terms)
}

function check_path_addr (
  network  : Network,
  paths    : PayPath[],
  payments : Payment[] = []
) {
  paths.forEach(e => { assert.valid_address(e[2], network) })
  payments.forEach(e  => { assert.valid_address(e[1], network) })
}

function check_path_totals (
  value    : number,
  paths    : PayPath[],
  payments : Payment[] = []
) {
  // Get totals for fees and paths.
  const total_fees  = get_payment_totals(payments)
  const total_paths = get_path_totals(paths)

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
  paths    : PayPath[],
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
  proposal : validate_proposal,
  schema   : validate_schema,
  terms    : validate_terms
}
