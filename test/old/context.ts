import { Buff, Bytes }     from '@cmdcode/buff'
import { tap_pubkey }      from '@scrow/tapscript/tapkey'
import { TxPrevout }       from '@scrow/tapscript'
import { create_sequence } from '@scrow/tapscript/tx'
import { GRACE_PERIOD }    from '../../config.js'
import { create_sighash }  from '../tx.js'

import {
  create_ctx,
  get_nonce_ctx,
  get_key_ctx,
  tweak_key_ctx
} from '@cmdcode/musig2'

import {
  get_path_templates,
} from '../proposal.js'

import {
  get_recovery_script,
  get_return_address
} from '../recovery.js'

import {
  get_session_pnonces,
  get_session_tweak
} from '../session.js'

import {
  AgentSession,
  DepositConfig,
  DepositContext,
  ProposalData,
  SessionContext,
  SessionEntry
} from '../../types/index.js'

import { get_contract_id } from '../contract.js'

export function get_deposit_ctx (
  proposal    : ProposalData,
  agent       : AgentSession,
  deposit_key : Bytes,
  options     : Partial<DepositConfig> = {}
) : DepositContext {
  const {
    locktime    = get_deposit_locktime(proposal, agent),
    return_addr = get_return_address(deposit_key)
  } = options

  const members    = [ deposit_key, agent.deposit_key ]
  const sequence   = create_sequence('timestamp', locktime)
  const script     = get_recovery_script(deposit_key, locktime)
  const int_data   = get_key_ctx(members)
  const tap_data   = tap_pubkey(int_data.group_pubkey, { script })
  const key_data   = tweak_key_ctx(int_data, [ tap_data.taptweak ])
  const session_id = get_contract_id(proposal, agent)
  const templates  = get_path_templates(proposal, agent)

  return {
    agent,
    key_data,
    locktime,
    proposal,
    return_addr,
    sequence,
    session_id,
    tap_data,
    templates,
    deposit_pub : Buff.bytes(deposit_key).hex,
    group_pub   : key_data.group_pubkey.hex
  }
}

export function get_session_ctx (
  context : DepositContext,
  pnonces : Bytes[],
  sighash : Bytes
) : SessionContext {
  const { group_pub, key_data, session_id, tap_data } = context
  const nonce_twk = get_session_tweak(group_pub, pnonces, sighash)
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
