import { Buff, Bytes }     from '@cmdcode/buff'
import { hash340, sha512 } from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey }    from '@cmdcode/crypto-tools/keys'
import { get_deposit_ctx } from './deposit.js'
import { Signer }          from '../signer.js'

import {
  create_ctx,
  get_nonce_ctx,
  verify_psig,
} from '@cmdcode/musig2'

import {
  TxBytes,
  TxPrevout
} from '@scrow/tapscript'

import {
  create_sighash,
  create_spend_txinput
}  from './tx.js'

import {
  get_entry,
  sort_bytes
} from './util.js'

import {
  AgentSession,
  ContractData,
  CovenantData,
  DepositContext,
  DepositData,
  MutexContext,
  MutexEntry
} from '../types/index.js'

import * as schema from '../schema/index.js'

export function create_session (
  agent : Signer,
  cid   : string
) : AgentSession {
  const pnonce = get_session_pnonce(agent.id, cid, agent)
  return {
    agent_id : agent.id,
    pnonce   : pnonce.hex,
    pubkey   : agent.pubkey
  }
}

export function create_covenant (
  contract : ContractData,
  deposit  : DepositData,
  signer   : Signer
) : CovenantData {
  const { cid, session } = contract
  const { agent_id }     = session
  const pnonce  = get_session_pnonce(agent_id, cid, signer).hex
  const pnonces = [ pnonce, session.pnonce ]
  const mupaths = get_mutex_entries(contract, deposit, pnonces)
  const psigs   = create_path_psigs(mupaths, signer)
  return { cid, pnonce, psigs }
}

export function parse_covenant (
  covenant : unknown
) : CovenantData {
  return schema.deposit.covenant.parse(covenant as CovenantData)
}

export function get_mutex_entries (
  contract : ContractData,
  deposit  : DepositData,
  pnonces  : Bytes[]
) : MutexEntry[] {
  const { cid, outputs, session } = contract
  const { deposit_key, signing_key, sequence, txout } = deposit
  const dep_ctx = get_deposit_ctx(deposit_key, signing_key, sequence)
  const sid = get_session_id(session.agent_id, cid)
  return outputs.map(([ label, vout ]) => {
    const txinput = create_spend_txinput(txout)
    const mut_ctx = get_mutex_ctx(dep_ctx, vout, pnonces, sid, txinput)
    return [ label, mut_ctx ]
  })
}

export function get_mutex_ctx (
  context : DepositContext,
  output  : TxBytes,
  pnonces : Bytes[],
  sid     : Bytes,
  txinput : TxPrevout
) : MutexContext {
  const { key_data, tap_data } = context
  const group_pub = key_data.group_pubkey
  // This can be optimized and further broken down.
  const sighash   = create_sighash(txinput, output)
  const nonce_twk = get_session_tweak(sid, pnonces, sighash)
  const pubnonces = tweak_pnonces(pnonces, nonce_twk)
  const nonce_ctx = get_nonce_ctx(pubnonces, group_pub, sighash)
  const musig_opt = { key_tweaks : [ tap_data.taptweak ] }
  const musig_ctx = create_ctx(key_data, nonce_ctx, musig_opt)

  return {
    sid,
    mutex : musig_ctx,
    tweak : nonce_twk
  }
}

export function get_session_id (aid : Bytes, cid : Bytes) {
  return sha512(aid, cid)
}

export function get_session_pnonce (
  agent_id : Bytes,
  cid      : Bytes,
  signer   : Signer
) {
  const sid = get_session_id(agent_id, cid)
  const pn1 = signer.gen_nonce(sid.subarray(0, 32))
  const pn2 = signer.gen_nonce(sid.subarray(32, 64))
  return Buff.join([ pn1, pn2 ])
}

export function get_session_tweak (
  sid     : Bytes,
  pnonces : Bytes[],
  sighash : Bytes
) : Buff {
  const pns = Buff.join(sort_bytes(pnonces))
  return hash340 ('contract/session', sid, pns, sighash)
}

export function tweak_pnonces (
  keys  : Bytes[],
  tweak : Bytes
) : Buff[] {
  return keys.map(e => tweak_pnonce(e, tweak))
}

export function tweak_pnonce (
  key   : Bytes,
  tweak : Bytes
) {
  const pnonces = Buff
    .parse(key, 32, 64)
    .map(k => tweak_pubkey(k, [ tweak ], true))
  return Buff.join(pnonces)
}

export function create_path_psigs (
  mutex  : MutexEntry[],
  signer : Signer
) : [ string, string ][] {
  return mutex.map(([ label, ctx ]) => {
    return [ label, create_path_psig(ctx, signer) ]
  })
}

export function create_path_psig (
  context : MutexContext,
  signer  : Signer
) : string {
  const { sid, mutex, tweak } = context
  const opt = { nonce_tweak : tweak }
  return signer.musign(mutex, sid, opt).hex
}

export function verify_path_psigs (
  mutexes : MutexEntry[],
  psigs   : [ string, string ][]
) {
  for (const [ label, ctx ] of mutexes) {
    const psig = get_entry(label, psigs)
    if (!verify_path_psig(ctx, psig)) {
      throw new Error('psig failed validation for path: ' + label)
    }
  }
}

export function verify_path_psig (
  ctx  : MutexContext,
  psig : Bytes
) {
  return verify_psig(ctx.mutex, psig)
}
