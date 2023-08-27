/**
 * Library for handling the _refund spending path.
 */

import { Tx } from '@scrow/tapscript'

import {
  get_musig_ctx,
  get_signed_tx
} from './context.js'

import * as musig from '@cmdcode/musig2'

import {
  SignerAPI,
  DepositContext
} from '@/types/index.js'

const REFUND_TX_VBYTES = 150

export function create_refund_tx (
  ctx : DepositContext
) {
  const { deposit, txinput }    = ctx
  const { feerate, refund_key } = deposit
  const fee   = REFUND_TX_VBYTES * feerate
  const value = Number(txinput.prevout.value) - fee
  const scriptPubKey = [ 0x51, refund_key ]
  // Need better way of handling miner fees
  // while keeping mutual consensus.
  return Tx.create_tx({
    vin  : [ txinput ],
    vout : [{ value, scriptPubKey }],
  })
}

export function sign_refund_tx (
  ctx    : DepositContext,
  signer : SignerAPI,
) {
  const txdata = create_refund_tx(ctx)
  const refund = get_musig_ctx(ctx, txdata)
  return signer.musign(refund)
}

export function verify_refund_tx (
  ctx : DepositContext
) {
  const psig   = ctx.deposit.refund_sig
  const txdata = create_refund_tx(ctx)
  const refund = get_musig_ctx(ctx, txdata)
  return musig.verify.psig(refund, psig)
}

export function complete_refund_tx (
  ctx    : DepositContext,
  signer : SignerAPI
) {
  const psigs  = [ ctx.deposit.refund_sig ]
  const txdata = create_refund_tx(ctx)
  const refund = get_musig_ctx(ctx, txdata)
  psigs.push(signer.musign(refund))
  return get_signed_tx(refund, psigs, txdata)
}
