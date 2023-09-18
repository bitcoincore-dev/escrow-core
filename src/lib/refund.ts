/**
 * Library for handling the _refund spending path.
 */

import { Tx, TxData }     from '@scrow/tapscript'
import * as musig from '@cmdcode/musig2'

import { get_musig_ctx } from '@/lib/context.js'
import { get_signed_tx } from '@/lib/tx.js'

import {
  SignerAPI,
  DepositContext
} from '@/types/index.js'

const REFUND_TX_VBYTES = 150

export function get_refund_sig (
  context : DepositContext,
  signer  : SignerAPI,
  txdata  : TxData
) {
  const ctx = get_musig_ctx(context, txdata)
  return signer.musign(ctx)
}

export function verify_refund_sig (
  context : DepositContext,
  txdata  : TxData
) {
  const ctx    = get_musig_ctx(context, txdata)
  const psig   = ctx.deposit.refund_sig
  const txdata = create_refund_tx(ctx)
  const refund = get_musig_ctx(ctx, txdata)
  return musig.verify.psig(refund, psig)
}

export function create_refund_tx (
  ctx     : DepositContext,
  signer  : SignerAPI,
  feerate : number
) {
  const psigs  = [ ctx.deposit.refund_sig ]
  const txdata = create_refund_template(ctx)
  const refund = get_musig_ctx(ctx, txdata)
  psigs.push(signer.musign(refund))
  return get_signed_tx(refund, psigs, txdata)
}
