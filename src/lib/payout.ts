import { Tx }     from '@scrow/tapscript'
import * as musig from '@cmdcode/musig2'

import {
  get_musig_ctx,
  get_signed_tx
} from '@/lib/context.js'

import {
  SignerAPI,
  DepositContext
} from '@/types/index.js'

export function create_payout_tx (
  ctx : DepositContext,
  pathname : string
) {
  const { templates, txinput } = ctx
  const res = templates.find(e => e[0] === pathname)
  if (res === undefined) {
    throw new Error('Payment path does not exist: ' + pathname)
  }
  // Need better way of handling miner fees
  // while keeping mutual consensus.
  return Tx.create_tx({ vin : [ txinput ], vout : res[1] })
}

export function get_payout_psig (
  ctx : DepositContext,
  pathname : string
) {
  const psigs = ctx.deposit.signatures
  const psig  = psigs.find(e => e[0] === pathname)
  if (psig === undefined) {
    throw new Error('No partial signature found for path: ' + pathname)
  }
  return psig[1]
}

export function sign_payout_tx (
  ctx      : DepositContext,
  signer   : SignerAPI,
  pathname : string
) {
  const txdata = create_payout_tx(ctx, pathname)
  const payout = get_musig_ctx(ctx, txdata)
  return signer.musign(payout)
}

export function verify_payout_tx (
  ctx      : DepositContext,
  pathname : string
) {
  const psig   = get_payout_psig(ctx, pathname)
  const txdata = create_payout_tx(ctx, pathname)
  const payout = get_musig_ctx(ctx, txdata)
  return musig.verify.psig(payout, psig[1])
}

export function complete_payout_tx (
  ctx      : DepositContext,
  signer   : SignerAPI,
  pathname : string
) {
  const psigs  = [ get_payout_psig(ctx, pathname) ]
  const txdata = create_payout_tx(ctx, pathname)
  const payout = get_musig_ctx(ctx, txdata)
  psigs.push(signer.musign(payout))
  return get_signed_tx(payout, psigs, txdata)
}
