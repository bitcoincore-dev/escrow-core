import { Bytes }           from '@cmdcode/buff'
import { P2TR }            from '@scrow/tapscript/address'
import { tap_pubkey }      from '@scrow/tapscript/tapkey'
import { create_sequence } from '@scrow/tapscript/tx'
import { Signer }          from '../signer.js'
import { parse_prevout }   from './tx.js'

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
  DepositData,
  DepositContext,
  DepositTemplate,
  RecoveryConfig,
  DepositAccount
} from '../types/index.js'

import * as schema from '../schema/index.js'

export function create_deposit_account (
  agent    : Signer,
  locktime : number,
  network  : Network,
  pubkey   : string
) : DepositAccount {
  /**
   * Return account information for registering
   * a deposit in advance of a contract. Optional.
   */
  const sequence = create_sequence('stamp', locktime)
  const context  = get_deposit_ctx(agent.pubkey, pubkey, sequence)
  const address  = get_deposit_address(context, network)
  return {
    address,
    sequence,
    agent_id    : agent.id,
    deposit_key : agent.pubkey,
    signing_key : pubkey,
  }
}

export function create_deposit_template (
  agent_id    : string,
  deposit_key : string,
  sequence    : number,
  signer      : Signer,
  txinput     : TxPrevout,
  options     : Partial<RecoveryConfig> = {}
) : DepositTemplate {
  /**
   * Create a template for registering a
   * deposit with the escrow platform.
   */
  const signing_key = signer.pubkey
  const context     = get_deposit_ctx(deposit_key, signing_key, sequence)
  const recovery_tx = create_recovery_tx(context, signer, txinput, options)
  return { agent_id, deposit_key, recovery_tx, sequence, signing_key }
}

export function register_deposit (
  template : DepositTemplate,
  txinput  : TxPrevout
) : DepositData {
  /**
   * Register a full deposit with the escrow platform.
   */
  return {
    ...template,
    txinput,
    confirmed  : false,
    covenant   : null,
    expires_at : null,
    settled    : false,
    updated_at : null
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
