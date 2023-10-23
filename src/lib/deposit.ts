import { Bytes }      from '@cmdcode/buff'
import { P2TR }       from '@scrow/tapscript/address'
import { tap_pubkey } from '@scrow/tapscript/tapkey'
import { Signer }     from '../signer.js'
import { now }        from './util.js'

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
  parse_prevout,
  parse_timelock
} from './tx.js'

import {
  DepositConfig,
  DepositContext,
  DepositData,
  DepositState,
  DepositStatus,
  DepositTemplate,
  OracleTxStatus
} from '../types/index.js'

import * as schema from '../schema/index.js'

const INIT_STATE = {
  confirmed    : false as const,
  block_hash   : null,
  block_height : null,
  block_time   : null,
  close_txid   : null,
  expires_at   : null
}

export function create_deposit (
  agent_id    : string,
  deposit_key : string,
  sequence    : number,
  signer      : Signer,
  txinput     : TxPrevout,
  options     : Partial<DepositConfig> = {}
) : DepositTemplate {
  /**
   * Create a template for registering a deposit.
   */
  const signing_key = signer.pubkey
  const context     = get_deposit_ctx(deposit_key, signing_key, sequence)
  const covenant    = null
  const recovery_tx = create_recovery_tx(context, signer, txinput, options)
  return { agent_id, covenant, deposit_key, recovery_tx, sequence, signing_key }
}

export function register_deposit (
  account_id : string,
  template   : DepositTemplate,
  txinput    : TxPrevout,
  txstatus  ?: OracleTxStatus,
  created_at = now()
) : DepositData {
  /**
   * Initialize deposit with default values.
   */
  let state  : DepositState  = INIT_STATE,
      status : DepositStatus = 'pending'
  
  if (txstatus !== undefined && txstatus.confirmed) {
    const timelock   = parse_timelock(template.sequence)
    const expires_at = txstatus.block_time + timelock
    state  = { ...txstatus, expires_at, close_txid : null }
    status = 'open' 
  }

  return {
    ...template,
    account_id,
    created_at,
    state,
    status,
    txinput,
    updated_at : created_at
  }
}

export function parse_deposit (
  tmpl : Record<string, any>
) : DepositTemplate {
  return schema.deposit.template.parse(tmpl)
}

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

export function get_deposit_txinput (
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
