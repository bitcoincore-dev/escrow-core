import { Buff, Bytes } from '@cmdcode/buff'
import { taproot }     from '@scrow/tapscript/sighash'

import {
  combine_psigs,
  MusigContext
} from '@cmdcode/musig2'

import {
  TxData,
  TxFullInput,
  TxInput,
  TxOutput
} from '@scrow/tapscript'

import {
  create_tx,
  encode_tx
} from '@scrow/tapscript/tx'

export function create_spend_tx (
  deposit    : TxFullInput,
  script_key : string,
  fee_rate   : number
) {
  const prev_value   = deposit.prevout.value
  const new_value    = prev_value - BigInt(fee_rate)
  const scriptPubKey = [ 0x51, script_key ]
  // Need better way of handling miner fees
  // while keeping mutual consensus.
  return create_tx({
    vin  : [ deposit ],
    vout : [{ value: new_value, scriptPubKey }],
  })
}

export function get_signed_tx (
  ctx    : MusigContext,
  psigs  : string[],
  txdata : TxData
) {
  const signature = combine_psigs(ctx, psigs)
  txdata.vin[0].witness = [ signature ]
  taproot.verify_tx(txdata, { txindex : 0 })
  return encode_tx(txdata)
}

export function get_sighash (
  txinput : TxInput,
  vout    : TxOutput[]
) {
  const txdata = create_tx({ vout })
  return taproot.hash_tx(txdata, { sigflag : 0x81, txinput })
}

export function get_refund_script (
  refund_key : Bytes,
  timelock   : number
) {
  return [
    Buff.num(timelock, 4).hex,
    'OP_CHECKSEQUENCEVERIFY',
    'OP_DROP',
    Buff.bytes(refund_key).hex,
    'OP_CHECKSIG'
  ]
}
