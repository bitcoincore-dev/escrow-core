import { Bytes }         from '@cmdcode/buff'
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
  create_recovery_tx,
  get_recovery_script
} from './recovery.js'

import {
  Deposit,
  DepositContext,
  DepositData
} from '../types/index.js'

export function get_deposit_ctx (
  deposit_key : Bytes,
  signing_key : Bytes,
  sequence    : number
) : DepositContext {
  const members  = [ deposit_key, signing_key ]
  const script   = get_recovery_script(signing_key, sequence)
  const int_data = get_key_ctx(members)
  const tap_data = tap_pubkey(int_data.group_pubkey, { script })
  const key_data = tweak_key_ctx(int_data, [ tap_data.taptweak ])

  return { deposit_key, signing_key, sequence, script, tap_data, key_data }
}

export function get_deposit_address (
  context  : DepositContext,
  network ?: Network
) {
  const { tap_data } = context
  return P2TR.encode(tap_data.tapkey, network)
}

export function get_deposit_input (
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
  const { deposit_key, sequence, signing_key } = context
  const recovery_tx = create_recovery_tx(context, signer, txinput)
  return { deposit_key, recovery_tx, sequence, signing_key, txinput }
}

export function init_deposit (data : DepositData) : Deposit {
  return {
    ...data,
    confirmed  : false,
    covenant   : null,
    expires_at : null,
    updated_at : null
  }
}
