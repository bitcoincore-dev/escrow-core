import { Buff, Bytes }        from '@cmdcode/buff'
import { tap_pubkey }         from '@scrow/tapscript/tapkey'
import { create_sequence }    from '@scrow/tapscript/tx'
import { hash340 }            from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey }       from '@cmdcode/crypto-tools/keys'
import { get_path_templates } from '@/lib/proposal.js'
import { TxPrevout }          from '@scrow/tapscript'
import { sort_bytes }         from './util.js'

import {
  create_sighash,
  get_refund_script
}  from './tx.js'

import {
  create_ctx,
  get_nonce_ctx,
  get_key_ctx,
  tweak_key_ctx
} from '@cmdcode/musig2'

import {
  AgentData,
  DepositContext,
  ProposalData,
  SessionContext,
  SessionEntry
} from '@/types/index.js'

export function get_deposit_ctx (
  agent       : AgentData,
  proposal    : ProposalData,
  deposit_pub : Bytes
) : DepositContext {
  const members   = [ deposit_pub, agent.signing_pub ]
  const prop_id   = Buff.json(proposal).digest.hex
  const sequence  = get_deposit_sequence(agent, proposal)
  const script    = get_refund_script(deposit_pub, sequence)
  const int_data  = get_key_ctx(members)
  const tap_data  = tap_pubkey(int_data.group_pubkey, { script })
  const key_data  = tweak_key_ctx(int_data, [ tap_data.taptweak ])
  const templates = get_path_templates(agent, proposal)

  return {
    agent,
    key_data,
    proposal,
    prop_id,
    sequence,
    tap_data,
    templates,
    group_pub : key_data.group_pubkey.hex
  }
}

export function get_session_ctx (
  deposit_ctx  : DepositContext,
  session_pubs : Bytes[],
  sighash      : Bytes
) : SessionContext {
  const { group_pub, prop_id, key_data } = deposit_ctx
  const nonce_twk = get_nonce_tweak(deposit_ctx, session_pubs, sighash)
  const pubnonces = tweak_nonce_pubs(session_pubs, nonce_twk)
  const nonce_ctx = get_nonce_ctx(pubnonces, group_pub, sighash)
  const musig_ctx = create_ctx(key_data, nonce_ctx)
  return {
    prop_id,
    ctx     : musig_ctx,
    tweak   : nonce_twk
  }
}

export function get_full_ctx (
  deposit_ctx  : DepositContext,
  session_pubs : Bytes[],
  txinput      : TxPrevout
) : SessionEntry[] {
  const { templates } = deposit_ctx
  return templates.map(([ label, vout ]) => {
    const sighash = create_sighash(txinput, vout)
    const session = get_session_ctx(deposit_ctx, session_pubs, sighash)
    return [ label, session ]
  })
}

function get_deposit_sequence (
  agent    : AgentData,
  proposal : ProposalData
) {
  const current  = Math.floor(Date.now() / 1000)
  const created  = agent.created_at
  const expires  = proposal.schedule.expires
  const timelock = (created + expires) - current
  return create_sequence('timestamp', timelock)
}

export function get_nonce_tweak (
  deposit_ctx  : DepositContext,
  session_pubs : Bytes[],
  sighash      : Bytes
) : Buff {
  const { group_pub } = deposit_ctx
  return hash340 (
    'musig/nonce_tweak',
    group_pub,
    sighash,
    ...sort_bytes(session_pubs)
  )
}

export function tweak_nonce_pubs (
  session_keys  : Bytes[],
  session_tweak : Bytes
) : Buff[] {
  return session_keys.map(e => {
    const sn = Buff
      .parse(e, 32, 64)
      .map(k => tweak_pubkey(k, [ session_tweak ]))
    return Buff.join(sn)
  })
}
