import { Buff, Bytes }  from '@cmdcode/buff'
import { Signer }       from '@cmdcode/signer'
import { hash340 }      from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey } from '@cmdcode/crypto-tools/keys'

import {
  now,
  sort_bytes
} from './util.js'

import {
  get_pay_total,
  get_prop_id
} from './proposal.js'

import {
  AgentSession,
  DepositContext,
  Payment,
  ProposalData,
} from '../types/index.js'

export function get_session (
  proposal : ProposalData,
  signer   : Signer,
  payments : Payment[] = [],
  created_at = now()
) : AgentSession {
  const platform_id = Buff.bytes(signer.pubkey).digest.hex
  const session_id  = calc_session_id(platform_id, created_at, proposal)
  const sess_signer = signer.derive(session_id)
  const session_key = sess_signer.gen_session_nonce(session_id).hex
  const signing_key = sess_signer.pubkey.hex
  const subtotal    = proposal.value + get_pay_total(payments)
  return { created_at, payments, platform_id, session_key, signing_key, subtotal }
}

export function get_session_id (
  proposal : ProposalData,
  agent    : AgentSession,
  ...aux   : Bytes[]
) {
  const { platform_id, created_at } = agent
  return calc_session_id(platform_id, created_at, proposal, aux)
}

export function calc_session_id (
  agent_id : string,
  created  : number,
  proposal : ProposalData,
  aux_data : Bytes[] = []
) {
  const prop_id = get_prop_id(proposal)
  const stamp   = Buff.num(created, 4)
  const preimg  = Buff.join([ prop_id, agent_id, stamp, ...aux_data ])
  return hash340('escrow/session_id', preimg).hex
}

export function get_session_key (
  context : DepositContext,
  signer  : Signer
) {
  const { session_id } = context
  return signer.gen_session_nonce(session_id)
}

export function get_session_tweak (
  context : DepositContext,
  pnonces : Bytes[],
  sighash : Bytes
) : Buff {
  const { group_pub } = context
  return hash340 (
    'escrow/session_tweak',
    group_pub,
    sighash,
    ...sort_bytes(pnonces)
  )
}

export function get_session_pnonce (
  key   : Bytes,
  tweak : Bytes
) {
  const pnonces = Buff
    .parse(key, 32, 64)
    .map(k => tweak_pubkey(k, [ tweak ], true))
  return Buff.join(pnonces)
}

export function get_session_pnonces (
  keys  : Bytes[],
  tweak : Bytes
) : Buff[] {
  return keys.map(e => get_session_pnonce(e, tweak))
}
