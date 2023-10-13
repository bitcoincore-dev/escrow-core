import { Buff, Bytes }     from '@cmdcode/buff'
import { Signer }          from '@cmdcode/signer'
import { P2TR }            from '@scrow/tapscript/address'
import { get_session_key } from '../session.js'
import { parse_prevout }   from '../tx.js'

import {
  Network,
  TxBytes,
  TxData
} from '@scrow/tapscript'

import {
  get_deposit_ctx,
  get_sessions
} from './context.js'

import {
  AgentSession,
  DepositConfig,
  DepositContext,
  DepositData,
  ProposalData,
  SessionContext,
  SessionEntry
} from '../../types/index.js'

import * as assert from '../../assert.js'

export function get_deposit_address (
  context  : DepositContext,
  network ?: Network
) {
  const { tap_data } = context
  return P2TR.encode(tap_data.tapkey, network)
}

export function get_deposit_txinput (
  context : DepositContext,
  txdata  : TxBytes | TxData
) {
  const { sequence, tap_data } = context
  return parse_prevout(txdata, tap_data.tapkey, sequence)
}

export function create_deposit (
  proposal : ProposalData,
  agent    : AgentSession,
  signer   : Signer,
  txdata   : TxBytes | TxData,
  options ?: DepositConfig
) : DepositData {
  const ctx     = get_deposit_ctx(proposal, agent, signer.pubkey, options)
  const txinput = parse_prevout(txdata, ctx.group_pub)
  assert.ok(txinput !== null)
  const recover_psig    = 'deadbeef' //get_recover_psig()
  const session_pnonce  = get_session_key(ctx.session_id, signer)
  const session_pnonces = [ session_pnonce, agent.session_key ]
  const sessions_ctx    = get_sessions(ctx, session_pnonces, txinput)
  const session_psigs   = create_deposit_psigs(sessions_ctx, signer)

  return {
    deposit_key : signer.pubkey.hex,
    recover_sig : recover_psig,
    session_key : session_pnonce.hex,
    signatures  : session_psigs,
    txinput     : Buff.json(txinput).to_bech32m('txvin'),
  }
}

export function create_deposit_psigs (
  sessions : SessionEntry[],
  signer   : Signer
) {
  return sessions.map(([ label, ctx ]) => {
    return [ label, create_deposit_psig(ctx, signer) ]
  })
}

export function create_deposit_psig (
  session_ctx : SessionContext,
  signer      : Signer
) : string {
  const { ctx, id, tweak } = session_ctx
  const opt = { nonce_tweak : tweak }
  return signer.musign(ctx, id, opt).hex
}

export function get_deposit_psig (
  psigs : string[][],
  label : string,
) : string {
  const psig = psigs.find(e => e[0] === label)
  if (psig === undefined) {
    throw new Error('psig not found for path: ' + label)
  }
  return psig[1]
}

export function add_deposit_meta (
  deposit : DepositData
) {
  return {
    ...deposit,
    confirmed : false,
    txid      : null,
    updated   : 0
  }
}

export function verify_deposit_psigs (
  sessions : SessionEntry[],
  psigs    : string[][]
) {
  for (const [ label, ctx ] of sessions) {
    const psig = get_deposit_psig(psigs, label)
    if (!verify_deposit_psig(ctx, psig)) {
      throw new Error('psig failed validation for path: ' + label)
    }
  }
}

export function verify_deposit_psig (
  session_ctx : SessionContext,
  partial_sig : Bytes
) {
  const { ctx } = session_ctx
  return Signer.musig.verify_psig(ctx, partial_sig)
}
