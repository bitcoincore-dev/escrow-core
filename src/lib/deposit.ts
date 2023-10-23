import { Buff, Bytes } from '@cmdcode/buff'
import { Network }     from '@scrow/tapscript'
import { Signer }      from '../signer.js'
import { now }         from './util.js'

import {
  get_key_ctx,
  tweak_key_ctx
} from '@cmdcode/musig2'

import {
  create_return_tx,
  get_return_script
} from './return.js'

import {
  get_address,
  get_tapkey,
  parse_timelock
} from './tx.js'

import {
  DepositConfig,
  DepositContext,
  DepositData,
  DepositState,
  DepositStatus,
  DepositTemplate,
  OracleTxStatus,
  SpendOut
} from '../types/index.js'

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
  txspend     : SpendOut,
  options     : Partial<DepositConfig> = {}
) : DepositTemplate {
  /**
   * Create a template for registering a deposit.
   */
  const { covenant } = options
  const sign_key  = signer.pubkey
  const context   = get_deposit_ctx(deposit_key, sign_key, sequence)
  const return_tx = create_return_tx(context, signer, txspend, options)
  return { agent_id, covenant, return_tx }
}

export function register_deposit (
  context    : DepositContext,
  deposit_id : string,
  txspend    : SpendOut,
  state      : DepositState,
  template   : DepositTemplate,
  created_at = now()
) : DepositData {
  /**
   * Initialize deposit with default values.
   */
  const { deposit_key, sequence, signing_key } = context

  const updated_at = created_at

  let status : DepositStatus = 'pending'

  if (state.confirmed) {
    status = 'open'
    if (template.covenant !== undefined) {
      status = 'locked'
    }
  }

  return {
    ...template,
    created_at,
    deposit_id,
    deposit_key,
    sequence,
    signing_key,
    txspend,
    state,
    status,
    updated_at
  }
}

export function get_deposit_ctx (
  deposit_key : Bytes,
  signing_key : Bytes,
  sequence    : number
) : DepositContext {
  deposit_key    = Buff.bytes(deposit_key).hex
  signing_key    = Buff.bytes(signing_key).hex
  const members  = [ deposit_key, signing_key ]
  const script   = get_return_script(signing_key, sequence)
  const int_data = get_key_ctx(members)
  const tap_data = get_tapkey(int_data.group_pubkey.hex, script)
  const key_data = tweak_key_ctx(int_data, [ tap_data.taptweak ])

  return { deposit_key, signing_key, sequence, script, tap_data, key_data }
}

export function get_deposit_address (
  context  : DepositContext,
  network ?: Network
) {
  const { tap_data } = context
  return get_address(tap_data.tapkey, network)
}

export function get_spend_state (
  context  : DepositContext,
  txstatus : OracleTxStatus
) {
  let state : DepositState = INIT_STATE

  if (txstatus !== undefined && txstatus.confirmed) {
    const timelock   = parse_timelock(context.sequence)
    const expires_at = txstatus.block_time + timelock
    state  = { ...txstatus, expires_at, close_txid : null }
  }

  return state
}
