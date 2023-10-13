import { now } from '../lib/util.js'

import {
  MIN_DEADLINE,
  MIN_EXPIRY,
  MAX_EXPIRY,
  MIN_WINDOW,
  MAX_EFFECT,
  ACTIONS_LIST
} from '../config.js'

import {
  parse_proposal,
  get_pay_total,
  get_path_total,
  get_path_names
} from '../lib/proposal.js'

import {
  Literal,
  ProposalData
} from '../types/index.js'

import * as assert from '../assert.js'

export function validate_proposal (
  proposal : ProposalData
) : asserts proposal is ProposalData {
  // Assert the proposal schema is valid.
  validate_schema(proposal)
  // Validate the terms of the proposal.
  validate_terms(proposal)
}

function validate_schema (
  proposal : ProposalData
) : asserts proposal is ProposalData {
  parse_proposal(proposal)
}

function validate_terms (
  proposal : ProposalData
) {
  // Check spending paths are valid.
  check_payments(proposal)
  // Check if timestamps are valid.
  check_stamps(proposal)
  // Check if program terms are valid.
  check_programs(proposal)
  // Check if schedule tasks are valid.
  check_schedule(proposal)
}

function check_payments (proposal : ProposalData) {
  const { network, paths, payments, value } = proposal
  paths.forEach(e => { assert.valid_address(e[2], network) })
  payments.forEach(e  => { assert.valid_address(e[1], network) })

  // Get totals for fees and paths.
  const total_fees  = get_pay_total(payments)
  const total_paths = get_path_total(paths)

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

function check_programs (proposal : ProposalData) {
  const { paths, programs } = proposal
  const names = get_path_names(paths)
  programs.forEach(([ actions, paths, method, ...params ]) => {
    check_regex(ACTIONS_LIST, actions)
    check_regex(names, paths)
    check_method(method, params)
  })
}

function check_schedule (proposal : ProposalData) {
  const { expires, paths, schedule } = proposal
  const names = get_path_names(paths)
  schedule.forEach(task => {
    const [ timer, action, regex ] = task
    check_timer(timer, expires)
    check_action(action)
    check_regex(names, regex)
  })
}

function check_stamps (proposal : ProposalData) {
  const { deadline = MIN_DEADLINE, effective, expires } = proposal
  const current = now()

  if (expires < MIN_EXPIRY) {
    throw new Error(`The specified expiration window is below the minimum allowed: ${expires} < ${MIN_EXPIRY}`)
  }

  if (expires > MAX_EXPIRY) {
    throw new Error(`The specified expiration window is above the maximum allowed: ${expires} > ${MAX_EXPIRY}`)
  }

  if (deadline < MIN_DEADLINE) {
    throw new Error(`The specified deadline is below the minimum allowed: ${deadline} < ${MIN_DEADLINE}`)
  }

  if (deadline > (expires - MIN_WINDOW)) {
    throw new Error(`The delta between deadline and expiration does not meet the minimum execution window.`)
  }

  if (typeof effective === 'number') {
    const MIN_EFFECT = current + MIN_WINDOW
    const MIN_DLINE  = current + deadline
    const MAX_DATE   = current + MAX_EFFECT
    if (effective < MIN_EFFECT) {
      throw new Error(`The effective date does not currently meet the minimum execution window.`)
    }
    if (effective < MIN_DLINE) {
      throw new Error(`The effective date does not currently leave enough time for the deadline.`)
    }
    if (effective > MAX_DATE) {
      throw new Error(`The effective date is too far into the future: ${effective} > ${MAX_DATE}`)
    }
  }
}

function check_action (
  action : string
) {
  if (!ACTIONS_LIST.includes(action)) {
    throw new Error('Invalid action: ' + action)
  }
}

function check_method (
  method : string,
  params : Literal[]
) {
  switch (method) {
    case 'proof':
      check_proof_terms(params)
      break
    default:
      throw new Error('Invalid method: ' + method)
  }
}

function check_proof_terms (params : Literal[]) {
  const [ thold, ...pubkeys ] = params
  if (typeof thold !== 'number' || thold > pubkeys.length) {
    throw new Error('Invalid threshold specified: ' + String(thold))
  }
  pubkeys.forEach(e => assert.valid_pubkey(e))
}

function check_regex (
  labels : string[],
  regex  : string
) {
  if (regex === '*') return
  const arr = (regex.includes('|'))
    ? regex.split('|') 
    : [ regex ]
  arr.forEach(label => check_label_exists(label, labels))
}

function check_label_exists (
  label  : string,
  labels : string[]
) {
  if (!labels.includes(label)) {
    throw new Error('Referenced label does not exist: ' + label)
  }
}

function check_timer (
  timer  : number,
  expiry : number
) {
  if (timer >= expiry) {
    throw new Error('Scheduled timer equals or exceeds expiry value: ' + String(timer))
  }
}
