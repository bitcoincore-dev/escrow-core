import { Buff, Bytes }     from '@cmdcode/buff'
import { hash340 }         from '@cmdcode/crypto-tools/hash'
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
  MuPathContext,
  MuPathEntry
} from '../types/index.js'

export function create_session (
  agent : Signer,
  cid   : string
) : AgentSession {
  return {
    agent_id : Buff.bytes(agent.pubkey).digest.hex,
    pubkey   : agent.pubkey,
    pnonce   : get_session_pnonce(cid, agent).hex
  }
}

export function create_covenant (
  contract : ContractData,
  deposit  : DepositData,
  signer   : Signer
) : CovenantData {
  const { cid, session } = contract
  const pnonce  = get_session_pnonce(cid, signer)
  const pnonces = [ pnonce, session.pnonce ]
  const mupaths = get_mupath_entries(contract, deposit, pnonces)
  const psigs   = create_path_psigs(mupaths, signer)
  return { cid, pnonce : pnonce.hex, psigs }
}

export function get_mupath_entries (
  contract : ContractData,
  deposit  : DepositData,
  pnonces  : Bytes[]
) : MuPathEntry[] {
  const { cid, templates } = contract
  const { deposit_key, signing_key, sequence, txinput } = deposit
  const context = get_deposit_ctx(deposit_key, signing_key, sequence)
  return templates.map(([ label, templ ]) => {
    const mupath = get_mupath_ctx(cid, context, pnonces, templ, txinput)
    return [ label, mupath ]
  })
}

export function get_mupath_ctx (
  cid      : Bytes,
  context  : DepositContext,
  pnonces  : Bytes[],
  template : TxOutput[],
  txinput  : TxPrevout
) : MuPathContext {
  const { key_data, tap_data } = context
  const group_pub = key_data.group_pubkey
  const sighash   = create_sighash(txinput, template)
  const nonce_twk = get_session_tweak(group_pub, pnonces, sighash)
  const pubnonces = tweak_pnonces(pnonces, nonce_twk)
  const nonce_ctx = get_nonce_ctx(pubnonces, group_pub, sighash)
  const musig_opt = { key_tweaks : [ tap_data.taptweak ] }
  const musig_ctx = create_ctx(key_data, nonce_ctx, musig_opt)

  return {
    cid,
    musig : musig_ctx,
    tweak : nonce_twk
  }
}

export function get_session_pnonce (
  cid    : Bytes, 
  signer : Signer
) {
  return signer.gen_nonce(cid, { size: '512' })
}

export function get_session_tweak (
  group_pub : Bytes,
  pnonces   : Bytes[],
  sighash   : Bytes
) : Buff {
  return hash340 (
    'escrow/session_tweak',
    group_pub,
    sighash,
    ...sort_bytes(pnonces)
  )
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
  mupaths : MuPathEntry[],
  signer  : Signer
) : [ string, string ][] {
  return mupaths.map(([ label, ctx ]) => {
    return [ label, create_path_psig(ctx, signer) ]
  })
}

export function create_path_psig (
  context : MuPathContext,
  signer  : Signer
) : string {
  const { cid, musig, tweak } = context
  const opt = { nonce_tweak : tweak }
  return signer.musign(musig, cid, opt).hex
}

export function verify_path_psigs (
  mupaths : MuPathEntry[],
  psigs   : [ string, string ][]
) {
  for (const [ label, ctx ] of mupaths) {
    const psig = get_entry(label, psigs)
    if (!verify_path_psig(ctx, psig)) {
      throw new Error('psig failed validation for path: ' + label)
    }
  }
}

export function verify_path_psig (
  ctx  : MuPathContext,
  psig : Bytes
) {
  return verify_psig(ctx.musig, psig)
}
