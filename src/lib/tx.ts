import { Buff, Bytes }  from '@cmdcode/buff'
import { taproot }      from '@scrow/tapscript/sighash'
import { parse_script } from '@scrow/tapscript/script'

import {
  combine_psigs,
  MusigContext
} from '@cmdcode/musig2'

import {
  SigHashOptions,
  TxBytes,
  TxData,
  TxInput,
  TxOutput,
  TxPrevout
} from '@scrow/tapscript'

import {
  create_prevout,
  create_tx,
  encode_tx,
  parse_tx,
  parse_txid
} from '@scrow/tapscript/tx'

import {
  PathTemplate,
  SignerAPI
} from '../types/index.js'

export function parse_prevout (
  txdata    : TxBytes | TxData,
  pubkey    : Bytes,
  sequence ?: number
) : TxPrevout | null {
  txdata = parse_tx(txdata)
  const vout = txdata.vout.findIndex(txout => {
    const { type, key } = parse_script(txout.scriptPubKey)
    return (
      type === 'p2tr'    && 
      key  !== undefined &&
      Buff.is_equal(key, pubkey)
    )
  })

  if (vout !== -1) {
    const txid    = parse_txid(txdata)
    const prevout = txdata.vout[vout]
    return create_prevout({ txid, vout, prevout, sequence })
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

export function create_sighash (
  txinput : TxInput,
  vout    : TxOutput[]
) {
  const txdata = create_tx({ vout })
  return taproot.hash_tx(txdata, { sigflag : 0x81, txinput }).hex
}

export function get_sighash (
  path_name : string,
  templates : PathTemplate[],
  txinput   : TxPrevout
) {
  const template = templates.find(e => e[0] === path_name)
  if (template === undefined) {
    throw new Error('Unable to find spending path:' + path_name)
  }
  return create_sighash(txinput, template[1])
}

export function get_sighashes (
  templates : PathTemplate[],
  txinput   : TxPrevout
) {
  return templates.map(([ label, vout ]) => {
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
