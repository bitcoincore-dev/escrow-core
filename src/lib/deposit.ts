import { Buff, Bytes }   from '@cmdcode/buff'
import { Signer }        from '@cmdcode/signer'
import { P2TR }          from '@scrow/tapscript/address'
import { tap_pubkey }    from '@scrow/tapscript/tapkey'
import { parse_prevout } from './tx.js'

import {
  get_key_ctx,
  tweak_key_ctx
} from '@cmdcode/musig2'

import {
  Network,
  TxBytes,
  TxData,
  TxPrevout
} from '@scrow/tapscript'

import {
  decode_tx,
  encode_tx
} from '@scrow/tapscript/tx'

import {
  create_recovery_tx,
  get_recovery_script
} from './recovery.js'

import {
  DepositContext,
  DepositData,
  DepositRecord,
  DepositRequest
} from '../types/index.js'

export function get_deposit_ctx (
  depo_key : Bytes,
  sign_key : Bytes,
  sequence : number
) : DepositContext {
  const members  = [ depo_key, sign_key ]
  const script   = get_recovery_script(sign_key, sequence)
  const int_data = get_key_ctx(members)
  const tap_data = tap_pubkey(int_data.group_pubkey, { script })
  const key_data = tweak_key_ctx(int_data, [ tap_data.taptweak ])

  return { depo_key, sign_key, sequence, script, tap_data, key_data }
}

export function get_deposit_address (
  context  : DepositContext,
  network ?: Network
) {
  const { tap_data } = context
  return P2TR.encode(tap_data.tapkey, network)
}

export function get_deposit_vin (
  context : DepositContext,
  txdata  : TxBytes | TxData
) {
  const { tap_data } = context
  const txinput = parse_prevout(txdata, tap_data.tapkey)
  if (txinput === null) {
    throw new Error('Unable to locate txinput!')
  }
  return txinput
}

export function create_deposit (
  context : DepositContext,
  signer  : Signer,
  txinput : TxPrevout
) : DepositData {
  const { depo_key, sequence, sign_key } = context
  const recovery = create_recovery_tx(context, signer, txinput)
  return { depo_key, recovery, sequence, sign_key, txinput }
}

export function create_deposit_req (
  data : DepositData,
) : DepositRequest {
  const { depo_key, recovery, sequence, sign_key, txinput } = data
  return {
    sequence,
    depo_key : Buff.bytes(depo_key).hex,
    recovery : encode_tx(recovery).hex,
    sign_key : Buff.bytes(sign_key).hex,
    txvin    : Buff.json(txinput).to_bech32m('txvin')
  }
}

export function create_deposit_rec (
  request : DepositRequest,
) : DepositRecord {
  const { txvin } = request
  const txid = parse_txvin(txvin).txid
  return { ...request, txid, confirmed : false, updated : 0 }
}

export function parse_deposit_req (
  req : DepositRequest | DepositRecord
) : DepositData {
  const { depo_key, recovery, sequence, sign_key, txvin } = req
  return {
    sequence,
    recovery : decode_tx(recovery),
    depo_key : Buff.hex(depo_key),
    sign_key : Buff.hex(sign_key),
    txinput  : parse_txvin(txvin)
  }
}

export function parse_txvin (txvin : string) : TxPrevout {
  return Buff.bech32m(txvin).to_json()
}

export function validate_deposit (
  data : DepositData
) {
  console.log('deposit:', data)
  return true
}