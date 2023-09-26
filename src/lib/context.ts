import { Buff, Bytes }        from '@cmdcode/buff'
import { tap_pubkey }         from '@scrow/tapscript/tapkey'
import { hash340 }            from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey }       from '@cmdcode/crypto-tools/keys'
import { TxPrevout }          from '@scrow/tapscript'
import { get_path_templates } from './proposal.js'
import { sort_bytes }         from './util.js'
import { GRACE_PERIOD }       from '../config.js'

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
} from '../types/index.js'

export function get_deposit_ctx (
  agent       : AgentData,
  proposal    : ProposalData,
  deposit_pub : Bytes
) : DepositContext {
  const members   = [ deposit_pub, agent.pubkey ]
  const prop_id   = Buff.json(proposal).digest.hex
  const locktime  = get_deposit_locktime(agent, proposal)
  const script    = get_refund_script(deposit_pub, locktime)
  const int_data  = get_key_ctx(members)
  const tap_data  = tap_pubkey(int_data.group_pubkey, { script })
  const key_data  = tweak_key_ctx(int_data, [ tap_data.taptweak ])
  const templates = get_path_templates(agent, proposal)

  // console.log('int_data:', int_data)
  // console.log('tap_data:', tap_data)
  // console.log('key_data:', key_data)

  return {
    agent,
    key_data,
    locktime,
    proposal,
    prop_id,
    tap_data,
    templates,
    group_pub : key_data.group_pubkey.hex
  }
}

export function get_session_ctx (
  context : DepositContext,
  pnonces : Bytes[],
  sighash : Bytes
) : SessionContext {
  const { group_pub, prop_id, key_data, tap_data } = context
  const nonce_twk = get_nonce_tweak(context, pnonces, sighash)
  const pubnonces = get_tweaked_pnonces(pnonces, nonce_twk)
  const nonce_ctx = get_nonce_ctx(pubnonces, group_pub, sighash)
  const musig_opt = { key_tweaks : [ tap_data.taptweak ] }
  const musig_ctx = create_ctx(key_data, nonce_ctx, musig_opt)
  return {
    prop_id,
    ctx   : musig_ctx,
    tweak : nonce_twk
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

function get_deposit_locktime (
  agent    : AgentData,
  proposal : ProposalData
) : number {
  const created  = agent.created_at
  const expires  = proposal.schedule.expires
  return created + expires + GRACE_PERIOD
}

export function get_nonce_tweak (
  context : DepositContext,
  pnonces : Bytes[],
  sighash : Bytes
) : Buff {
  const { group_pub } = context
  return hash340 (
    'musig/nonce_tweak',
    group_pub,
    sighash,
    ...sort_bytes(pnonces)
  )
}

export function get_tweaked_pnonces (
  pnonces : Bytes[],
  tweak   : Bytes
) : Buff[] {
  return pnonces.map(e => {
    const pnonces = Buff
      .parse(e, 32, 64)
      .map(k => tweak_pubkey(k, [ tweak ], true))
    return Buff.join(pnonces)
  })
}
