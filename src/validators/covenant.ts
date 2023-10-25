import { verify_psig } from '@cmdcode/musig2'
import { Signer }      from '../signer.js'
import { get_entry }   from '../lib/util.js'

import {
  get_mutex_entries,
  get_session_pnonce,
  parse_covenant
} from '../lib/session.js'

import {
  ContractData,
  CovenantData,
  DepositData,
  MutexEntry
} from '../types/index.js'

import * as assert from '../assert.js'

export function validate_covenant (
  covenant : unknown
) : asserts covenant is CovenantData {
  parse_covenant(covenant)
}

export function verify_covenant (
  contract : ContractData,
  deposit  : DepositData,
  d_agent  : Signer,
  s_agent  : Signer,
) {
  // Unpack data objects.
  const { session_pn } = contract
  const { covenant }   = deposit
  // Check if covenant exists from the current session.
  assert.exists(covenant)
  assert.ok(covenant.cid === contract.cid, 'Covenant cid does not match the contract!')
  // Check if the signing agents are valid.
  check_deposit_agent(d_agent, deposit)
  check_session_agent(s_agent, contract)
  // Get the mutex entries.
  const pnonces = [ covenant.pnonce, session_pn ]
  const entries = get_mutex_entries(contract, deposit, pnonces)
  // Check that we can use the deposit psigs.
  check_deposit_psigs(entries, covenant.psigs)
}

function check_deposit_agent (
  agent    : Signer,
  deposit  : DepositData
) {
  const { agent_id, agent_key } = deposit
  assert.ok(agent_id  === agent.id,     'Agent ID does not match deposit.')
  assert.ok(agent_key === agent.pubkey, 'Agent pubkey does not match deposit.')
}

function check_session_agent (
  agent    : Signer,
  contract : ContractData
) {
  const { agent_id, cid, session_pn } = contract
  assert.ok(agent_id === agent.id,     'Agent ID does not match session.')
  const pnonce = get_session_pnonce(agent.id, cid, agent)
  assert.ok(pnonce.hex === session_pn, 'Agent pnonce does not match session.')
}

function check_deposit_psigs (
  mutexes : MutexEntry[],
  psigs   : [ string, string ][]
) {
  psigs.forEach(([ label, psig ]) => {
    const ctx = get_entry(label, mutexes)
    assert.ok(verify_psig(ctx.mutex, psig), 'psig verification failed for path: ' + label)
  })
}
