import { Buff }   from '@cmdcode/buff-utils'
import { signer } from '@cmdcode/crypto-utils'

import { AGENT_CONFIG }  from '../config/agent.js'

import * as assert from '../../lib/assert.js'
import * as lib    from '../../lib/proposal.js'
import * as schema from '../schema/index.js'
import * as util   from '../../lib/utils.js'

import {
  Endorsement,
  Network,
  Proposal,
  Settlement,
  Terms
} from '../types/index.js'

const { MIN_WINDOW, MAX_EXPIRES, MAX_MULTISIG } = AGENT_CONFIG

export function validate_proposal (
  proposal : Proposal
) {
  // Validate data model is correct.
  assert_proposal_schema(proposal)
  // Unpack proposal terms.
  const { network, terms, value } = proposal
  // Validate proposal terms.
  validate_terms(network, terms, value)
}

function assert_proposal_schema (
  proposal : Proposal
) : asserts proposal is Proposal {
  void schema.proposal.data.parseAsync(proposal)
}

function validate_terms (
  network : Network,
  terms   : Terms,
  value   : number
) : void {
  // Check fees and spending paths.
  check_paths(network, terms, value)
  // Chech if schedule terms are valid.
  check_schedule(terms)
  // Chech if settlement terms are valid.
  check_settlement(terms)
}

function check_paths (
  network : Network,
  terms   : Terms,
  value   : number
) {
  // Unpack the terms object.
  const { fees, paths } = terms
  // Check that payment addresses are valid.
  const fee_addrs  = lib.get_path_addrs(fees)
  const path_addrs = lib.get_path_addrs(paths)
  fee_addrs.forEach(e => { assert.valid_address(e, network) })
  path_addrs.forEach(e => { assert.valid_address(e, network) })
  // Get totals for fees and paths.
  const total_fees  = lib.calc_fee_total(fees)
  const total_paths = lib.calc_path_total(paths)

  if (total_fees > value) {
    throw new Error(`Total fees should not exceed contract value: ${total_fees} > ${value}`)
  }

  for (const [ name, amt ] of total_paths) {
    if (amt + total_fees !== value) {
      const tally = `${amt} + ${total_fees} !== ${value}`
      throw new Error(`Path "${name}" + fees does not equal contract value: ${tally}`)
    }
  }
}

function check_schedule (
  terms : Terms
) : void {
  const { paths, schedule } = terms
  const { deposit, duration, expires, onclose, onexpired } = schedule

  const close_path = paths.find(e => e[0] === onclose)
  const exp_path   = paths.find(e => e[0] === onexpired)

  if (close_path === undefined) {
    assert.fail(`onclose must specify a defined spending path. (onclose: ${onclose})`, true)
  }

  if (exp_path === undefined) {
    assert.fail(`onexpired must specify a defined spending path. (onclose: ${onexpired})`, true)
  }

  if (deposit < MIN_WINDOW) {
    assert.fail(`Funding duration must allow at least a 2 hour window. (deposit: ${deposit})`, true)
  }

  if (duration > expires - MIN_WINDOW) {
    assert.fail(`Escrow duration must allow at least a 2 hour window. (duration: ${duration})`, true)
  }

  if (deposit > MAX_EXPIRES) {
    assert.fail(`Escrow funding duration is currently limited to 30 days max. (deposit: ${deposit})`, true)
  }

  if (expires > MAX_EXPIRES) {
    assert.fail(`Escrow contract expiration is currently limited to 30 days max. (expires: ${expires})`, true)
  }
}

function check_settlement (
  terms : Terms
) {
  /* Check that all spending events point to defined spending paths. */
  const { paths, settlement } = terms
  if (settlement !== undefined) {
    const path_names = lib.get_path_names(paths)
    for (const path of settlement) {
      check_settlement_path(path, path_names)
    }
  }
}

function check_settlement_path (
  params : Settlement,
  paths  : string[]
) {
  const [ path, thold, ...pubkeys ] = params

  if (!paths.includes(path)) {
    throw new Error(`Settlement path "${path}" does not exist!`)
  }

  if (thold > pubkeys.length) {
    throw new Error('Threshold is greater than number of keys!')
  }

  if (pubkeys.length > MAX_MULTISIG) {
    throw new Error('Current limit for a settlement path is 100 key members.')
  }
}
