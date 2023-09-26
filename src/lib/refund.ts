import { Signer }         from '@cmdcode/signer'
import { TxData }         from '@scrow/tapscript'
import { parse_prevout }  from './tx.js'
import { parse_addr }     from '@scrow/tapscript/address'
import { DepositContext } from '../types/index.js'

import {
  create_tx,
  encode_tx
} from '@scrow/tapscript/tx'

import * as assert from './assert.js'

export function get_refund_tx (
  address     : string,
  deposit_ctx : DepositContext,
  signer      : Signer,
  txdata      : TxData,
  txfee       : number
) {
  const { locktime, tap_data }     = deposit_ctx
  const { cblock, script, tapkey } = tap_data
  const txinput = parse_prevout(tapkey, txdata)
  assert.ok(txinput !== null)
  assert.ok(script !== undefined)
  const prev_value = txinput.prevout.value
  const refund_tx  = create_tx({
    locktime,
    vin  : [ txinput ],
    vout : [{
      value        : prev_value - BigInt(txfee),
      scriptPubKey : parse_addr(address).script
    }]
  })
  const sig = signer.sign_tx(refund_tx, { txindex : 0 })
  refund_tx.vin[0].witness = [ sig, script, cblock ]
  assert.ok(Signer.tx.verify_tx(refund_tx, { txindex : 0 }))
  return encode_tx(txdata)
}
