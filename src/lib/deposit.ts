import { Bytes }           from '@cmdcode/buff'
import { Signer }          from '@cmdcode/signer'
import { TxFullInput }     from '@scrow/tapscript'

import { get_deposit_ctx, get_session_ctx } from './context.js'

import {
  AgentData,
  DepositContext,
  DepositTemplate,
  ProposalData,
  SessionContext
} from '@/types/index.js'

export function get_session_key (
  deposit_ctx : DepositContext,
  signer      : Signer
) {
  const { key_data, sighashes } = deposit_ctx
  return signer.gen_session_nonce(key_data.group_pubkey, sighashes)
}

export function get_session_psig (
  session_ctx  : SessionContext,
  signer       : Signer
) {
  const { nonce_tweak, sighashes, musig_ctx } = session_ctx
  const nonce_tweaks = [ nonce_tweak ]
  return signer.musign(musig_ctx, sighashes, { nonce_tweaks })
}

export function verify_deposit_psig (
  session_ctx : SessionContext,
  partial_sig : Bytes
) {
  const { musig_ctx } = session_ctx
  return Signer.musig.verify_psig(musig_ctx, partial_sig)
}

export function create_deposit (
  agent      : AgentData,
  proposal   : ProposalData,
  refund_pub : Bytes,
  signer     : Signer,
  txinput    : TxFullInput,
) : DepositTemplate {
  const deposit_ctx  = get_deposit_ctx(agent, proposal, refund_pub, txinput)
  const session_pub  = get_session_key(deposit_ctx, signer)
  const session_pubs = [ session_pub, deposit_ctx.agent.session_key ]
  const partial_sigs = deposit_ctx.sighashes.map(sighash => {
    const sctx = get_session_ctx(deposit_ctx, sighash, session_pubs)
    return get_session_psig(sctx, signer)
  })

  return {
    partial_sigs,
    refund_pub,
    session_pub,
    txinput
  }
}
