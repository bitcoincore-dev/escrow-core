import { taproot }           from '@scrow/tapscript/sighash'
import { Signer }            from '../signer.js'
import { parse_recovery_tx } from '../lib/recovery.js'

import {
  decode_tx,
  parse_sequence
} from '@scrow/tapscript/tx'

import {
  get_deposit_ctx,
  parse_deposit
}   from '../lib/deposit.js'

import {
  DepositTemplate
} from '../types/index.js'

import * as assert from '../assert.js'

export function validate_deposit (
  tmpl : Record<string, any>
) : asserts tmpl is DepositTemplate {
  parse_deposit(tmpl)
}

export function verify_deposit (
  agent : Signer,
  tmpl  : DepositTemplate
) {
  // Unpack our transaction template.
  const { agent_id, deposit_key, recovery_tx, sequence, signing_key, txinput } = tmpl
  // Assert that the agent information is correct.
  assert.ok(agent_id    === agent.id,     'Agent ID does not match!')
  assert.ok(deposit_key === agent.pubkey, 'Agent ID pubkey does not match!')
  // Assert that the sequence value is valid.
  const sdata = parse_sequence(sequence)
  assert.ok(sdata.enabled,                'Sequence field timelock is not enabled.')
  assert.ok(sdata.type === 'stamp',       'Sequence field is not configured for timelock.')
  // Get the recovery tx context.
  const rec = get_recovery_ctx(tmpl)
  // Assert that the recovery tx details are correct.
  assert.ok(sequence    === rec.sequence, 'Recovery tx sequence does not match!')
  assert.ok(signing_key === rec.pubkey,   'Recovery tx pubkey does not match!')
  // Get the deposit context.
  const ctx = get_deposit_ctx(deposit_key, signing_key, sequence)
  const tapkey = ctx.tap_data.tapkey
  // Assert that the recovery tapkey is correct.
  assert.ok(tapkey === rec.tapkey,        'Recovery tapkey does not match deposit.')
  // Prepare recovery tx for signature verification.
  const opt = { pubkey : signing_key, txindex : 0 }
  const tx  = decode_tx(recovery_tx)
  tx.vin[0].prevout = txinput.prevout
  // Assert that the recovery tx is fully valid for broadcast.
  assert.ok(taproot.verify_tx(tx, opt),   'Recovery tx failed to validate!')
}

function get_recovery_ctx (tmpl : DepositTemplate) {
  try {
    return parse_recovery_tx(tmpl.recovery_tx)
  } catch (err) {
    throw new Error('Failed to parse recovery tx.')
  }
}
