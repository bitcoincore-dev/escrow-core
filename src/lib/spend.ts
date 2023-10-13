import { Bytes }         from '@cmdcode/buff'
import { Signer }        from '@cmdcode/signer'
import { combine_psigs } from '@cmdcode/musig2'
import { create_tx }     from '@scrow/tapscript/tx'
import { get_entry }     from './util.js'

import {
  TxData,
  TxOutput,
  TxPrevout
} from '@scrow/tapscript'

import {
  get_deposit_ctx,
  parse_txvin
} from './deposit.js'

import {
  create_path_psig,
  get_mupath_ctx
} from './session.js'

import {
  AgentSession,
  ContractData,
  Covenant
} from '../types/index.js'

export function create_signed_tx (
  agent    : Signer,
  contract : ContractData,
  pathname : string
) : TxData {
  const { cid, covenants, session, templates } = contract
  const vin  : TxPrevout[] = []
  const vout = get_entry<TxOutput[]>(pathname, templates)
  for (const cov of covenants) {
    const txin = sign_txinput(agent, cid, cov, pathname, session, vout)
    vin.push(txin)
  }
  return create_tx({ vin, vout })
}

export function sign_txinput (
  agent    : Signer,
  cid      : Bytes,
  covenant : Covenant,
  pathname : string,
  session  : AgentSession,
  template : TxOutput[]
) : TxPrevout {
  const { depo_key, pnonce, psigs, sequence, sign_key, txvin } = covenant
  const txinput  = parse_txvin(txvin)
  const dep_ctx  = get_deposit_ctx(depo_key, sign_key, sequence)
  const pnonces  = [ pnonce, session.pnonce ]
  const mupath   = get_mupath_ctx(cid, dep_ctx, pnonces, template, txinput)
  const psig_a   = create_path_psig(mupath, agent)
  const psig_d   = get_entry(pathname, psigs)
  const musig    = combine_psigs(mupath.musig, [ psig_d, psig_a ])
  return { ...txinput, witness : [ musig.append(0x81) ] }
}
