import { Buff, Bytes }      from '@cmdcode/buff-utils'
import { combine }          from '@cmdcode/musig2'
import { SigHash, Tap, Tx } from '@scrow/tapscript'

import { apply_fees } from './proposal.js'

import {
  UTXO,
  TapContext,
  Payout,
  PayTemplate,
  TxHash,
  TxInput
} from '../types/index.js'

export function get_tap_ctx (
  pubkeys    : Bytes[],
  refund_key : string,
  timelock   : number
) : TapContext {
  const [ pt ]   = combine.pubkeys(pubkeys)
  const int_key  = Buff.big(pt.x, 32)
  const script   = get_refund_script(refund_key, timelock)
  const target   = Tap.encode_script(script)
  const taproot  = Tap.tree.get_root([ target ])
  const taptweak = Tap.tweak.get_tweak(refund_key, taproot)
  const tapdata  = Tap.key.get_pubkey(int_key, { target })

  return {
    int_key,
    script,
    taptweak,
    tapkey: Buff.bytes(tapdata[0]),
    cblock: Buff.bytes(tapdata[1])
  }
}

export function get_txhashes (
  tx_input   : TxInput,
  agent_fees : Payout[],
  templates  : PayTemplate[]
) {
  templates = apply_fees(agent_fees, templates)
  const hashes : TxHash[] = []
  for (const [ label, vout ] of templates) {
    const txinput = Tx.create_vin(tx_input)
    const txdata  = Tx.create_tx({ vout })
    const txhash  = SigHash.taproot.hash_tx(txdata, { sigflag : 0x81, txinput })
    hashes.push([ label, txhash.hex ])
  }
  return hashes
}

export function get_tx_input (
  sequence : number,
  utxo     : UTXO
) {
  const { txid, vout, ...prevout } = utxo
  return Tx.create_vin({ txid, vout, prevout, sequence }) as TxInput
}

export function get_refund_script (
  refund_key : string,
  timelock   : number
) {
  return [
    Buff.num(timelock, 4).hex,
    'OP_CHECKSEQUENCEVERIFY',
    'OP_DROP',
    refund_key,
    'OP_CHECKSIG'
  ]
}

export function get_timelock (
  timestamp : number
) {
  // Also need to set timelock bit.
  return Math.floor(timestamp / 512)
}
