
import { combine_psigs }        from '@cmdcode/musig2'
import { decode_tx }            from '@scrow/tapscript/tx'
import { get_deposit_ctx }      from './deposit.js'
import { create_spend_txinput } from './tx.js'
import { Signer }               from '../signer.js'
import { get_entry }            from './util.js'

import {
  TxData,
  TxPrevout
} from '@scrow/tapscript'

import {
  create_path_psig,
  get_mutex_ctx,
  get_session_id
} from './session.js'

import {
  ContractData,
  DepositData,
  SpendTemplate
} from '../types/index.js'

import * as assert from '../assert.js'

export function create_settlment (
  agent    : Signer,
  contract : ContractData,
  deposits : DepositData[],
  pathname : string
) : TxData {
  const { outputs } = contract
  const output = outputs.find(e => e[0] === pathname)
  assert.exists(output)
  const tx = decode_tx(output[1], false)
  for (const fund of deposits) {
    const txin = create_spend_txinput(fund.txout)
    const sig  = sign_txinput(agent, contract, fund, output, txin)
    tx.vin.push({ ...txin, witness : [ sig ] })
  }
  return tx
}

export function sign_txinput (
  agent    : Signer,
  contract : ContractData,
  deposit  : DepositData,
  output   : SpendTemplate,
  txinput  : TxPrevout
) : string {
  const { covenant, sequence, signing_key } = deposit
  const { cid, session } = contract
  assert.exists(covenant)
  const [ label, vout ]   = output
  const { pnonce, psigs } = covenant
  const dep_key = agent.pubkey
  const dep_ctx = get_deposit_ctx(dep_key, signing_key, sequence)
  const pnonces = [ pnonce, session.pnonce ]
  const sid     = get_session_id(session.agent_id, cid)
  const mut_ctx = get_mutex_ctx(dep_ctx, vout, pnonces, sid, txinput)
  const psig_a  = create_path_psig(mut_ctx, agent)
  const psig_d  = get_entry(label, psigs)
  const musig   = combine_psigs(mut_ctx.mutex, [ psig_d, psig_a ])
  return musig.append(0x81).hex
}
