import { Buff, Bytes }     from '@cmdcode/buff'
import { Signer }          from '@cmdcode/signer'
import { create_sighash, parse_prevout }   from '../tx.js'

import {
  TxBytes,
  TxData
} from '@scrow/tapscript'

import { get_sessions } from './context.js'

import {
  get_deposit_ctx,
  parse_deposit_req
} from '../deposit.js'

import {
  AgentSession,
  ContractData,
  DepoContext,
  DepositConfig,
  DepositData,
  DepositRequest,
  ProposalData,
  SessionContext,
  SessionEntry
} from '../../types/index.js'

import * as assert from '../../assert.js'

import { get_path_templates } from '../proposal.js'
import { parse_txin } from '../parse.js'
import { PathTemplate } from '../../types/context.js'


export function get_covenant_ctx (
  contract : ContractData,
  deposit  : DepositData
) {
  const { depo_key, sequence, sign_key, txinput } = deposit
  const context = get_deposit_ctx(depo_key, sign_key, sequence)
  const sighash = create_sighash(txinput, template)
  const pnonces = [ ]
  const session = get_session_ctx(context, session_pubs, sighash)

  return {
    contract,
    deposit,
    templates
  }
}

export function get_path_ctx (
  contract : ContractData,
  deposit  : DepositData,
  template : PathTemplate
) : SessionEntry[] {
  const { templates } = deposit_ctx
  return templates.map(([ label, vout ]) => {
    
    return [ label, session ]
  })
}

export function create_covenant (
  contract : ContractData,
  deposit  : DepositData,
  signer   : Signer,
  options ?: DepositConfig
) {
  const { cid, session } = contract
  const txinput = parse_txin(deposit.txinput)
  // const ctx     = get_covenant_ctx(proposal, agent, signer.pubkey, options)
  const pnonce  = get_session_pnonce(cid, signer)
  const pnonces = [ pnonce, session.pnonce ]
  const sessions_ctx  = get_sessions(ctx, sess_pnonces, txinput)
  const session_psigs = create_deposit_psigs(sessions_ctx, signer)
  return session_psigs
}

export function get_path_ctx (
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

export function get_session_pnonce (
  cid    : Bytes,
  signer : Signer
) {
  return signer.gen_session_nonce(cid)
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
