import { Buff, Bytes }  from '@cmdcode/buff'
import { Signer }       from '@cmdcode/signer'
import { sha256 }       from '@cmdcode/crypto-tools/hash'
import { parse_script } from '@scrow/tapscript/script'
import { tweak_pubkey } from '@cmdcode/crypto-tools/keys'
import { hash }         from '../schema/index.js'

import {
  Network,
  ScriptData,
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
  create_tx,
  parse_tx,
  parse_witness
} from '@scrow/tapscript/tx'

import { DepositContext } from '../types/index.js'

import * as assert from '../assert.js'

// import { taproot, verify_tx } from '@scrow/tapscript/sighash'

interface RecoverConfig {
  txfee   : number
  address : string
}

const MIN_RECOVER_FEE = 10000

export function get_recovery_script (
  return_key : Bytes,
  locktime   : number
) {
  return [
    Buff.num(locktime, 4),
    'OP_CHECKSEQUENCEVERIFY',
    'OP_DROP',
    Buff.bytes(return_key),
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
  options : Partial<RecoverConfig> = {}
) : TxData {
  const { sequence, tap_data } = context
  const { cblock, script } = tap_data
  const { address, txfee = MIN_RECOVER_FEE } = options
  assert.ok(txinput !== null, 'txinput is null!')
  assert.ok(script !== undefined, 'recovery script is undefined!')
  const scriptkey  = (address !== undefined)
    ? parse_addr(address).script
    : create_recover_key(signer)
  const prev_value = txinput.prevout.value
  const recover_tx = create_tx({
    vin  : [{ ...txinput, sequence }],
    vout : [{
      value        : prev_value - BigInt(txfee),
      scriptPubKey : scriptkey
    }]
  })
  const opt : SigHashOptions = {
    pubkey  : signer.pubkey,
    sigflag : 0x83, 
    txindex : 0, 
    throws  : true
  }
  const sig = signer.sign_tx(recover_tx, opt)
  recover_tx.vin[0].witness = [ sig, script, cblock ]
  // assert.ok(verify_tx(recover_tx, opt), 'recovery tx failed to validate!')
  return recover_tx
}

export function create_recover_key (
  signer : Signer
) {
  return signer.pubkey
}

export function scan_recovery_tx (
  signer : Signer,
  txdata : TxBytes | TxData
) : number | null {
  const { vin, vout } = parse_tx(txdata)
  // const txid 
  for (let idx = 0; idx < vin.length; idx++) {
    const { scriptPubKey } = vout[idx]
    const { witness }      = vin[idx]
    const scrkey  = parse_script(scriptPubKey).key
    if (scrkey === undefined) { continue }
    const witdata = parse_witness(witness)
    if (witdata.script === null) { continue }
    const redeem  = parse_script(witdata.script)
    const pubkey  = parse_recovery_key(redeem.asm)
    if (pubkey === null) { continue }
    const shared  = signer.ecdh(pubkey)
    const hashed  = sha256(shared).hex
    const reckey  = tweak_pubkey(pubkey, [ hashed ], true)
    if (reckey.hex === scrkey.hex) {
      const [ _sig ] = witdata.params
      // const txinput = create_prevout()
      // return { pubkey, reckey, sig }
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

export function parse_recovery_key (data : ScriptData) {
  if (data === undefined) return null
  const script = parse_script(data)
  const pubkey = script.asm[3]
  return (hash.safeParse(pubkey).success) 
    ? pubkey
    : null
}
