import { taproot }         from '@scrow/tapscript/sighash'
import { parse_sequence }  from '@scrow/tapscript/tx'

import {
  DepositContext,
  DepositTemplate,
  ReturnContext,
  SpendOut
} from '../types/index.js'

import * as assert from '../assert.js'
import * as schema from '../schema/index.js'

export function validate_deposit (
  tmpl : Record<string, any>
) : asserts tmpl is DepositTemplate {
  schema.deposit.template.parse(tmpl)
}

export function verify_deposit (
  deposit_ctx : DepositContext,
  return_ctx  : ReturnContext,
  txout       : SpendOut
) {
  // Unpack our transaction template.
  const { sequence, tap_data } = deposit_ctx
  const { pubkey, tapkey, tx } = return_ctx
  const { txid, vout, value, scriptkey } = txout
  // Assert that the sequence value is valid.
  const sdata = parse_sequence(sequence)
  assert.ok(sdata.enabled,                'Sequence field timelock is not enabled.')
  assert.ok(sdata.type === 'stamp',       'Sequence field is not configured for timelock.')
  // Get the deposit context.
  assert.ok(tap_data.tapkey === tapkey,   'Deposit tapkey does not match return tapkey!')
  // Prepare recovery tx for signature verification.
  const opt  = { pubkey, txindex : 0 }
  const txin = tx.vin[0]
  assert.ok(txin.txid === txid,           'recovery txid does not match utxo')
  assert.ok(txin.vout === vout,           'recovery vout does not match utxo')
  tx.vin[0].prevout = { value : BigInt(value), scriptPubKey : scriptkey }
  // Assert that the recovery tx is fully valid for broadcast.
  assert.ok(taproot.verify_tx(tx, opt),   'Recovery tx failed to validate!')
}
