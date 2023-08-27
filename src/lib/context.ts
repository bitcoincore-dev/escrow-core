import { SigHash, Tx, TxData } from '@scrow/tapscript'

import { hash }   from '@cmdcode/crypto-utils'
import * as musig from '@cmdcode/musig2'

import { get_templates } from '@/lib/proposal.js'

import {
  get_timelock,
  get_tx_input,
  get_txhashes,
  get_tap_ctx
} from '@/lib/tapscript.js'

import {
  AgentData,
  ContractTerms,
  DepositContext,
  DepositTemplate
} from '@/types/index.js'

type MusigContext = musig.MusigContext

export function get_deposit_ctx (
  agent   : AgentData,
  deposit : DepositTemplate,
  terms   : ContractTerms
) : DepositContext {
  const { deposit_key, nonce_key, refund_key, utxo } = deposit
  const timelock  = get_timelock(terms.schedule.expires)
  const txinput   = get_tx_input(timelock, utxo)
  const nonces    = [ nonce_key, agent.nonce ]
  const pubkeys   = [ deposit_key, agent.pubkey ]
  const templates = get_templates(terms.paths, terms.fees)
  const txhashes  = get_txhashes(txinput, agent.fees, templates)
  const tap_ctx   = get_tap_ctx(pubkeys, refund_key, timelock)

  return {
    ...tap_ctx,
    agent,
    deposit,
    nonces,
    pubkeys,
    templates,
    terms,
    timelock,
    txinput,
    txhashes
  }
}

export function get_musig_ctx (
  ctx : DepositContext,
  template : TxData
) {
  const { pubkeys, nonces, taptweak, txinput: vin } = ctx
  const txinput  = Tx.create_vin(vin)
  const sighash  = SigHash.taproot.hash_tx(template, { txinput, sigflag: 0x81 })
  const sigtweak = hash.digest('musig/sigtweak', sighash)
  const options  = { key_tweaks : [ taptweak ], nonce_tweaks : [ sigtweak ] }
  return musig.ctx.get_ctx(pubkeys, nonces, sighash, options)
}

export function get_signed_tx (
  ctx    : MusigContext,
  psigs  : string[],
  txdata : TxData
) {
  const signature = musig.combine.psigs(ctx, psigs)
  txdata.vin[0].witness = [ signature ]
  SigHash.taproot.verify_tx(txdata, { txindex : 0 })
  return Tx.encode_tx(txdata)
}
