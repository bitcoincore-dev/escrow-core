import { taproot }    from '@scrow/tapscript/sighash'
import { Signer }     from '../signer.js'
import { get_tx_ctx } from '../lib/tx.js'

import {
  decode_tx,
  parse_sequence
} from '@scrow/tapscript/tx'

import {
  get_deposit_ctx,
  parse_deposit
}   from '../lib/deposit.js'

import {
  DepositTemplate,
} from '../types/index.js'

import * as assert from '../assert.js'
import { TxPrevout } from '@scrow/tapscript'

export function validate_deposit (
  tmpl : Record<string, any>
) : asserts tmpl is DepositTemplate {
  parse_deposit(tmpl)
}

export function verify_deposit (
  agent    : Signer,
  template : DepositTemplate,
  txinput  : TxPrevout
) {
  // Unpack our transaction template.
  const { agent_id, deposit_key, recovery_tx, sequence, signing_key } = template
  // Assert that the agent information is correct.
  assert.ok(agent_id    === agent.id,     'Agent ID does not match!')
  assert.ok(deposit_key === agent.pubkey, 'Agent ID pubkey does not match!')
  // Assert that the sequence value is valid.
  const sdata = parse_sequence(sequence)
  assert.ok(sdata.enabled,                'Sequence field timelock is not enabled.')
  assert.ok(sdata.type === 'stamp',       'Sequence field is not configured for timelock.')
  // Get the recovery tx context.
  const txmeta = get_tx_ctx(recovery_tx)
  // Assert that the recovery tx details are correct.
  assert.ok(sequence === txmeta.sequence, 'Recovery tx sequence does not match!')
  // Get the deposit context.
  const ctx = get_deposit_ctx(deposit_key, signing_key, sequence)
  const tapkey = ctx.tap_data.tapkey
  // Assert that the recovery tapkey is correct.
  assert.ok(tapkey === txmeta.tapkey,     'Recovery tapkey does not match deposit.')
  // Prepare recovery tx for signature verification.
  const opt  = { pubkey : txmeta.pubkey, txindex : 0 }
  const tx   = decode_tx(recovery_tx)
  const txin = tx.vin[0]
  assert.ok(txin.txid === txinput.txid,   'recovery txid does not match utxo')
  assert.ok(txin.vout === txinput.vout,   'recovery vout does not match utxo')
  tx.vin[0].prevout = txinput.prevout
  // Assert that the recovery tx is fully valid for broadcast.
  assert.ok(taproot.verify_tx(tx, opt),   'Recovery tx failed to validate!')
}
