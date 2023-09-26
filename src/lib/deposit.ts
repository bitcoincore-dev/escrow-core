import { Buff, Bytes }   from '@cmdcode/buff'
import { Signer }        from '@cmdcode/signer'
import { P2TR }          from '@scrow/tapscript/address'
import { parse_prevout } from './tx.js'

import {
  Network,
  TxBytes,
  TxData
} from '@scrow/tapscript'

import {
  get_deposit_ctx,
  get_full_ctx
} from './context.js'

import {
  AgentData,
  DepositContext,
  DepositTemplate,
  ProposalData,
  SessionContext,
  SessionEntry
} from '../types/index.js'

import * as assert from './assert.js'

export function get_deposit_address (
  context  : DepositContext,
  network ?: Network
) {
  const { tap_data } = context
  return P2TR.encode(tap_data.tapkey, network)
}

export function get_deposit_nonce (
  context : DepositContext,
  signer  : Signer
) {
  return signer.gen_session_nonce(context.prop_id)
}

export function create_deposit (
  agent    : AgentData,
  proposal : ProposalData,
  signer   : Signer,
  txdata   : TxBytes | TxData
) : DepositTemplate {
  const context   = get_deposit_ctx(agent, proposal, signer.pubkey)
  const group_pub = context.group_pub
  const txinput   = parse_prevout(group_pub, txdata)
  assert.ok(txinput !== null)
  const session_pnonce  = get_deposit_nonce(context, signer)
  const session_pnonces = [ session_pnonce, agent.pnonce ]
  const sessions_ctx    = get_full_ctx(context, session_pnonces, txinput)
  const session_psigs   = create_deposit_psigs(sessions_ctx, signer)
  return {
    pubkey : signer.pubkey.hex,
    pnonce : session_pnonce.hex,
    psigs  : session_psigs,
    txvin  : Buff.json(txinput).to_bech32m('txvin')
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
  const { ctx, prop_id, tweak } = session_ctx
  const opt = { nonce_tweak : tweak }
  return signer.musign(ctx, prop_id, opt).hex
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
