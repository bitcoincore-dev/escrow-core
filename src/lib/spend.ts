import { Bytes }           from '@cmdcode/buff'
import { combine_psigs }   from '@cmdcode/musig2'
import { create_tx }       from '@scrow/tapscript/tx'
import { get_deposit_ctx } from './deposit.js'
import { Signer }          from '../signer.js'
import { get_entry }       from './util.js'

import {
  TxData,
  TxOutput,
  TxPrevout
} from '@scrow/tapscript'

import {
  create_path_psig,
  get_mupath_ctx
} from './session.js'

import {
  AgentSession,
  ContractData,
  Deposit
} from '../types/index.js'

import * as assert from '../assert.js'

export function create_settlment (
  agent    : Signer,
  contract : ContractData,
  pathname : string
) : TxData {
  const { cid, funds, session, templates } = contract
  const vin  : TxPrevout[] = []
  const vout = get_entry<TxOutput[]>(pathname, templates)
  for (const fund of funds) {
    const txin = sign_txinput(agent, cid, fund, pathname, session, vout)
    vin.push(txin)
  }
  return create_tx({ vin, vout })
}

export function sign_txinput (
  agent    : Signer,
  cid      : Bytes,
  deposit  : Deposit,
  pathname : string,
  session  : AgentSession,
  template : TxOutput[]
) : TxPrevout {
  const { deposit_key, covenant, sequence, signing_key, txinput } = deposit
  assert.exists(covenant)
  const { pnonce, psigs } = covenant
  const dep_ctx  = get_deposit_ctx(deposit_key, signing_key, sequence)
  const pnonces  = [ pnonce, session.pnonce ]
  const mupath   = get_mupath_ctx(cid, dep_ctx, pnonces, template, txinput)
  const psig_a   = create_path_psig(mupath, agent)
  const psig_d   = get_entry(pathname, psigs)
  const musig    = combine_psigs(mupath.musig, [ psig_d, psig_a ])
  return { ...txinput, witness : [ musig.append(0x81) ] }
}
