import { Buff, Bytes }  from '@cmdcode/buff'
import { P2TR }         from '@scrow/tapscript/address'
import { taproot }      from '@scrow/tapscript/sighash'
import { parse_script } from '@scrow/tapscript/script'
import { tap_pubkey }   from '@scrow/tapscript/tapkey'

import {
  combine_psigs,
  MusigContext
} from '@cmdcode/musig2'

import {
  Network,
  SigHashOptions,
  TxBytes,
  TxData,
  TxInput,
  TxOutput,
  TxPrevout
} from '@scrow/tapscript'

import {
  create_prevout,
  parse_sequence,
  create_tx,
  encode_tx,
  parse_tx,
  parse_txid,
  decode_tx,
  create_sequence
} from '@scrow/tapscript/tx'

import {
  SpendTemplate,
  SignerAPI,
  OracleTxIn,
  SpendOut,
  SpendState,
} from '@/types/index.js'

import * as assert from '../assert.js'

export const INIT_SPEND_STATE : SpendState = {
  closed     : false,
  closed_at  : null,
  close_txid : null,
  spent      : false,
  spent_at   : null
}

export function create_timelock (
  duration : number
) {
  return create_sequence('stamp', duration)
}

export function get_address (
  tapkey   : Bytes,
  network ?: Network
) {
  return P2TR.encode(tapkey, network)
}

export function get_tapkey (
  pubkey : string,
  script : string[]
) {
  return tap_pubkey(pubkey, { script })
}

export function get_parent_txid (
  txdata : TxBytes | TxData,
  index  = 0
) {
  const tx = parse_tx(txdata)
  return tx.vin[index].txid
}

export function create_txspend (
  txin : OracleTxIn
) : SpendOut {
  const { txid, vout, prevout } = txin
  assert.exists(prevout)
  const { value, scriptpubkey } = prevout
  return { txid, vout, value, scriptkey : scriptpubkey }
}

export function prevout_to_txspend (
  txinput : TxPrevout
) : SpendOut {
  const { txid, vout, prevout } = txinput
  const { value, scriptPubKey } = prevout
  const script = parse_script(scriptPubKey).hex
  return { txid, vout, value : Number(value), scriptkey : script }
}

export function create_spend_txinput (
  txspend : SpendOut
) : TxPrevout {
  const { txid, vout, value, scriptkey } = txspend
  const prevout = { value, scriptPubKey : scriptkey }
  return create_prevout({ txid, vout, prevout })
}

export function parse_timelock (sequence : number) {
  const sdata    = parse_sequence(sequence)
  const timelock = sdata.stamp
  assert.ok(sdata.enabled,          'Timelock is not enabled.')
  assert.ok(sdata.type === 'stamp', 'Lock type is not a timelock.')
  assert.exists(timelock)
  return timelock
}

export function parse_prevout (
  txdata : TxBytes | TxData,
  tapkey : Bytes
) : TxPrevout | null {
  txdata = parse_tx(txdata)
  const vout = txdata.vout.findIndex(txout => {
    const { type, key } = parse_script(txout.scriptPubKey)
    return (
      type === 'p2tr'    && 
      key  !== undefined &&
      Buff.is_equal(key, tapkey)
    )
  })

  if (vout !== -1) {
    const txid    = parse_txid(txdata)
    const prevout = txdata.vout[vout]
    return create_prevout({ txid, vout, prevout })
  } else {
    return null
  }
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

export function create_txhex (
  vout : TxOutput[]
) {
  const txdata = create_tx({ vout })
  return encode_tx(txdata).hex
}

export function create_sighash (
  txinput : TxInput,
  txbytes : TxBytes
) {
  const txdata = decode_tx(txbytes, false)
  return taproot.hash_tx(txdata, { sigflag : 0x81, txinput }).hex
}

export function get_sighash (
  path_name : string,
  outputs   : SpendTemplate[],
  txinput   : TxPrevout
) {
  const output = outputs.find(e => e[0] === path_name)
  if (output === undefined) {
    throw new Error('Unable to find spending path:' + path_name)
  }
  return create_sighash(txinput, output[1])
}

export function get_sighashes (
  outputs : SpendTemplate[],
  txinput : TxPrevout
) {
  return outputs.map(([ label, vout ]) => {
    return [ label, create_sighash(txinput, vout) ]
  })
}

export function sign_tx (
  signer  : SignerAPI,
  txdata  : TxBytes | TxData, 
  config ?: SigHashOptions
) {
  // Set the signature flag type.
  const { sigflag = 0x00 } = config ?? {}
  // Calculate the transaction hash.
  const hash = taproot.hash_tx(txdata, config)
  // Sign the transaction hash with secret key.
  const sig  = signer.sign(hash)
  // Return the signature.
  return (sigflag === 0x00)
    ? sig
    : Buff.join([ sig, sigflag ]).hex
}
