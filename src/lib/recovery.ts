import { Buff, Bytes }  from '@cmdcode/buff'
import { sha256 }       from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey } from '@cmdcode/crypto-tools/keys'
import { parse_script } from '@scrow/tapscript/script'
import { parse_proof }  from '@scrow/tapscript/tapkey'
import { Signer }       from '../signer.js'
import { hash }         from '../schema/index.js'
import { sign_tx }      from './tx.js'

import {
  Network,
  ScriptWord,
  SigHashOptions,
  TxBytes,
  TxData,
  TxPrevout
} from '@scrow/tapscript'

import {
  P2TR, 
  parse_addr
} from '@scrow/tapscript/address'

import {
  create_prevout,
  create_tx,
  encode_tx,
  parse_tx,
  parse_txid,
  parse_witness
} from '@scrow/tapscript/tx'

import {
  DepositContext,
  RecoveryConfig
} from '../types/index.js'

import * as assert from '../assert.js'

const MIN_RECOVER_FEE = 10000

export function get_recovery_script (
  return_key : Bytes,
  sequence   : number
) {
  return [
    Buff.num(sequence, 4).reverse().hex,
    'OP_CHECKSEQUENCEVERIFY',
    'OP_DROP',
    Buff.bytes(return_key).hex,
    'OP_CHECKSIG'
  ]
}

export function get_return_address (
  recovery_key : Bytes,
  network     ?: Network
) {
  return P2TR.encode(recovery_key, network)
}

export function create_recovery_tx (
  context : DepositContext,
  signer  : Signer,
  txinput : TxPrevout,
  options : Partial<RecoveryConfig> = {}
) : string {
  const { sequence, tap_data }        = context
  const { cblock, extension, script } = tap_data
  const { txfee = MIN_RECOVER_FEE }   = options
  assert.exists(script)
  const scriptkey  = create_script_key(signer, options)
  const prev_value = txinput.prevout.value
  const recover_tx = create_tx({
    vin  : [{ ...txinput, sequence }],
    vout : [{
      value        : prev_value - BigInt(txfee),
      scriptPubKey : scriptkey
    }]
  })
  const opt : SigHashOptions = { extension, pubkey: signer.pubkey, txindex : 0, throws: true }
  const sig = sign_tx(signer, recover_tx, opt)
  recover_tx.vin[0].witness = [ sig, script, cblock ]
  // assert.ok(taproot.verify_tx(recover_tx, opt), 'recovery tx failed to generate!')
  return encode_tx(recover_tx).hex
}

export function parse_recovery_tx (
  txdata : TxBytes | TxData
) {
  const tx = parse_tx(txdata)
  const txinput = tx.vin.at(0)
  assert.exists(txinput)
  const proof = parse_proof(txinput.witness)
  const { params, script, tapkey } = proof
  const pub = script.at(3)
  const seq = script.at(0)
  const sig = params.at(0)
  assert.exists(pub)
  assert.exists(seq)
  assert.exists(sig)
  const pubkey   = Buff.bytes(pub).hex
  const sequence = Buff.hex(seq).reverse().num
  return { pubkey, sequence, sig: sig.hex, tapkey, tx }
}

export function create_script_key (
  signer  : Signer,
  options : Partial<RecoveryConfig>
) {
  const { address, pubkey } = options
  let script_key : ScriptWord[]
  if (address !== undefined) {
    script_key = parse_addr(address).script
  } else if (pubkey !== undefined) {
    const shared  = signer.ecdh(pubkey)
    const hashed  = sha256(shared)
    const tweaked = tweak_pubkey(pubkey, [ hashed ], true)
    script_key = [ 'OP_1', tweaked.hex ]
  } else {
    throw new Error('You must define a recovery address or public key.')
  }
  return script_key
}

export function parse_recovery_key (words : ScriptWord[]) {
  const pubkey = words.at(3)
  if (pubkey === undefined) return null
  try {
    return hash.parse(pubkey)
  } catch {
    return null
  }
}

export function scan_recovery_tx (
  signer : Signer,
  txdata : TxBytes | TxData
) {
  const { vin, vout } = parse_tx(txdata)
  for (let idx = 0; idx < vin.length; idx++) {
    const txout   = vout[idx]
    const txin    = vin[idx]
    const scrkey  = parse_script(txout.scriptPubKey).key
    if (scrkey === undefined) { continue }
    const witdata = parse_witness(txin.witness)
    if (witdata.script === null) { continue }
    const redeem  = parse_script(witdata.script)
    const pubkey  = parse_recovery_key(redeem.asm)
    if (pubkey === null) { continue }
    const reckey  = create_script_key(signer, { pubkey })
    if (reckey[1] === scrkey.hex) {
      const [ sig ] = witdata.params
      const txid    = parse_txid(txdata)
      const txinput = create_prevout({ txid, vout : idx, prevout : txout })
      return { pubkey, sig, txinput }
    }
  }
  return null
}

// export function sweep_recovery_tx (
//   address : string,
//   signer  : Signer,
//   txinput : TxBytes | TxData,
//   txfee = 0
// ) {
//   // Extract the pubkey from script, and sig from witness.
//   // Use secret to recover the private key
//   // create a sweep tx using the address
//   const tx       = parse_tx(txdata)
//   const witness  = parse_witness(tx.vin[txindex].witness)
//   const prevout  = tx.vout[txindex]
//   const txid     = parse_txid(txdata)
//   const input    = create_prevout({ txid, prevout, vout : txindex })
//   const sweep_tx = create_tx({
//     vin  : [ input ],
//     vout : [{
//       value : prevout.value - BigInt(txfee),
//       scriptPubKey : parse_addr(address).script
//     }]
//   })
//   // need signer.recover() and signer.can_recover()
//   /* 
//     can recover:
//       - perform ecdh with key from txinput.
//       - hash shared secret.
//       - tweak key from txinput with shared hash.
//       - if tweaked key matches output key, then is recoverable.
//   */
//   recover_key
// }
