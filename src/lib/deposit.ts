import { Bytes }          from '@cmdcode/buff'
import { P2TR }           from '@scrow/tapscript/address'
import { tap_pubkey }     from '@scrow/tapscript/tapkey'
import { create_prevout } from '@scrow/tapscript/tx'
import { Signer }         from '../signer.js'
import { exists, now }    from './util.js'

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
  DepositInput,
  DepositStatus,
  DepositTemplate,
  DepositUtxo
} from '../types/index.js'

import * as schema from '../schema/index.js'

const DEFAULT_STATUS : DepositStatus = {
  confirmed    : false,
  block_hash   : null,
  block_height : null,
  block_time   : null
}

export function create_deposit_template (
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
  const recovery_tx = create_recovery_tx(context, signer, txinput, options)
  return { agent_id, deposit_key, recovery_tx, sequence, signing_key }
}

export function find_utxo (
  tapkey : string,
  txid   : string,
  vout   : number,
  set    : DepositUtxo[]
) : DepositInput | null {
  const utxo = set.find(e => e.txid === txid && e.vout === vout)
  if (utxo !== undefined) {
    const script  = [ 'OP_1', tapkey ]
    const prevout = { value : utxo.value, scriptPubKey : script }
    const txinput = create_prevout({ txid, vout, prevout })
    return { txinput, status: utxo.status }
  } else {
    return null
  }
}

export function register_deposit (
  template : DepositTemplate,
  txinput  : TxPrevout,
  status  ?: DepositStatus,
  updated_at = now()
) : DepositData {
  /**
   * Initialize deposit with default values.
   */
  status = { ...DEFAULT_STATUS, ...status }
  const sequence   = template.sequence
  const block_time = status.block_time
  const timelock   = parse_timelock(sequence)
  const expires_at = (exists(block_time))
    ? block_time + timelock
    : null
  return { ...template, ...status, expires_at, txinput, updated_at, spent: false }
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
