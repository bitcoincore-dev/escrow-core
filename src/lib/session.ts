import { Buff, Bytes }     from '@cmdcode/buff'
import { hash340, sha512 }         from '@cmdcode/crypto-tools/hash'
import { tweak_pubkey }    from '@cmdcode/crypto-tools/keys'
import { get_deposit_ctx } from './deposit.js'
import { Signer }          from '../signer.js'
import { create_sighash }  from './tx.js'

import {
  create_ctx,
  get_nonce_ctx,
  verify_psig,
} from '@cmdcode/musig2'

import {
  TxOutput,
  TxPrevout
} from '@scrow/tapscript'

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

import * as assert from '../assert.js'

export function create_session (
  agent : Signer,
  cid   : Bytes
) : AgentSession {
  const aid = agent.id
  const sid = get_session_id(aid, cid)
  return {
    sid    : sid.hex,
    pnonce : get_session_pnonce(sid, agent).hex,
    pubkey : agent.pubkey
  }
}

export function create_covenant (
  contract : ContractData,
  deposit  : DepositData,
  signer   : Signer
) : CovenantData {
  const { session } = contract
  const sid     = session.sid
  const pnonce  = get_session_pnonce(sid, signer).hex
  const pnonces = [ pnonce, session.pnonce ]
  const mupaths = get_mutex_entries(contract, deposit, pnonces)
  const psigs   = create_path_psigs(mupaths, signer)
  return { sid, pnonce, psigs }
}

export function get_mutex_entries (
  contract : ContractData,
  deposit  : DepositData,
  pnonces  : Bytes[]
) : MutexEntry[] {
  const { outputs, session } = contract
  const { deposit_key, signing_key, sequence, txinput } = deposit
  const dep_ctx = get_deposit_ctx(deposit_key, signing_key, sequence)
  return outputs.map(([ label, vout ]) => {
    const mut_ctx = get_mutex_ctx(dep_ctx, vout, pnonces, session.sid, txinput)
    return [ label, mut_ctx ]
  })
}

export function get_mutex_ctx (
  context : DepositContext,
  output  : TxOutput[],
  pnonces : Bytes[],
  sid     : Bytes,
  txinput : TxPrevout
) : MutexContext {
  const { key_data, tap_data } = context
  const group_pub = key_data.group_pubkey
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

export function get_session_id (agent_id : Bytes, cid : Bytes) {
  return sha512(agent_id, cid)
}

export function get_session_pnonce (
  session_id : Bytes,
  signer     : Signer
) {
  const sid = Buff.bytes(session_id)
  assert.size(sid, 64)
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
