import { TxPrevout }        from '@scrow/tapscript'
import { taproot }          from '@scrow/tapscript/sighash'
import { parse_sequence }   from '@scrow/tapscript/tx'
import { Signer }           from '../signer.js'
import { get_recovery_ctx } from '../lib/recovery.js'

import {
  get_deposit_ctx,
  parse_deposit
} from '../lib/deposit.js'

import {
  DepositTemplate,
  RecoveryContext
} from '../types/index.js'

import * as assert from '../assert.js'

export function validate_deposit (
  tmpl : Record<string, any>
) : asserts tmpl is DepositTemplate {
  parse_deposit(tmpl)
}

export function verify_deposit (
  agent     : Signer,
  template  : DepositTemplate,
  txinput   : TxPrevout,
  recovery ?: RecoveryContext
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
  const rec = (recovery !== undefined)
    ? recovery
    : get_recovery_ctx(recovery_tx)
  // Assert that the recovery tx details are correct.
  assert.ok(sequence === rec.sequence,    'Recovery tx sequence does not match!')
  // Get the deposit context.
  const ctx    = get_deposit_ctx(deposit_key, signing_key, sequence)
  const tapkey = ctx.tap_data.tapkey
  // Assert that txmetathe recovery tapkey is correct.
  assert.ok(tapkey === rec.tapkey,        'Recovery tapkey does not match deposit.')
  // Prepare recovery tx for signature verification.
  const opt  = { pubkey : rec.pubkey, txindex : 0 }
  const txin = rec.tx.vin[0]
  assert.ok(txin.txid === txinput.txid,   'recovery txid does not match utxo')
  assert.ok(txin.vout === txinput.vout,   'recovery vout does not match utxo')
  rec.tx.vin[0].prevout = txinput.prevout
  // Assert that the recovery tx is fully valid for broadcast.
  assert.ok(taproot.verify_tx(rec.tx, opt),   'Recovery tx failed to validate!')
}
