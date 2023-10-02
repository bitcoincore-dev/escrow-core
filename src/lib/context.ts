import { Bytes }        from '@cmdcode/buff'
import { tap_pubkey }   from '@scrow/tapscript/tapkey'
import { GRACE_PERIOD } from '../config.js'
import { TxPrevout }    from '@scrow/tapscript'

import {
  create_ctx,
  get_nonce_ctx,
  get_key_ctx,
  tweak_key_ctx
} from '@cmdcode/musig2'

import {
  get_path_templates,
} from './proposal.js'

import {
  get_session_id,
  get_session_pnonces,
  get_session_tweak
} from './session.js'

import {
  create_sighash,
  get_refund_script
} from './tx.js'

import {
  AgentSession,
  DepositContext,
  ProposalData,
  SessionContext,
  SessionEntry
} from '../types/index.js'

export function get_deposit_ctx (
  proposal    : ProposalData,
  agent       : AgentSession,
  deposit_pub : Bytes
) : DepositContext {
  const members    = [ deposit_pub, agent.signing_key ]
  const locktime   = get_deposit_locktime(proposal, agent)
  const script     = get_refund_script(deposit_pub, locktime)
  const int_data   = get_key_ctx(members)
  const tap_data   = tap_pubkey(int_data.group_pubkey, { script })
  const key_data   = tweak_key_ctx(int_data, [ tap_data.taptweak ])
  const session_id = get_session_id(proposal, agent)
  const templates  = get_path_templates(proposal, agent)

  return {
    agent,
    key_data,
    locktime,
    proposal,
    session_id,
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
  const { group_pub, key_data, session_id, tap_data } = context
  const nonce_twk = get_session_tweak(context, pnonces, sighash)
  const pubnonces = get_session_pnonces(pnonces, nonce_twk)
  const nonce_ctx = get_nonce_ctx(pubnonces, group_pub, sighash)
  const musig_opt = { key_tweaks : [ tap_data.taptweak ] }
  const musig_ctx = create_ctx(key_data, nonce_ctx, musig_opt)
  return {
    ctx   : musig_ctx,
    id    : session_id,
    tweak : nonce_twk
  }
}

export function get_sessions (
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
  proposal : ProposalData,
  agent    : AgentSession
) : number {
  const created  = agent.created_at
  const expires  = proposal.expires

  return created + expires + GRACE_PERIOD
}
