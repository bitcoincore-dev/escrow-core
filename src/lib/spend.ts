
import { combine_psigs }   from '@cmdcode/musig2'
import { TxData }          from '@scrow/tapscript'
import { decode_tx }       from '@scrow/tapscript/tx'
import { get_deposit_ctx } from './deposit.js'
import { Signer }          from '../signer.js'
import { get_entry }       from './util.js'

import {
  create_path_psig,
  get_mutex_ctx
} from './session.js'

import {
  AgentSession,
  ContractData,
  DepositData,
  SpendOutput
} from '../types/index.js'

import * as assert from '../assert.js'

export function create_settlment (
  agent    : Signer,
  contract : ContractData,
  deposits : DepositData[],
  pathname : string
) : TxData {
  const { outputs, session } = contract
  const output = outputs.find(e => e[0] === pathname)
  assert.exists(output)
  const tx = decode_tx(output[1], false)
  for (const fund of deposits) {
    const txin = fund.txinput
    const sig  = sign_txinput(agent, fund, output, session)
    tx.vin.push({ ...txin, witness : [ sig ] })
  }
  return tx
}

export function sign_txinput (
  agent    : Signer,
  deposit  : DepositData,
  output   : SpendOutput,
  session  : AgentSession
) : string {
  const { covenant, sequence, signing_key, txinput } = deposit
  assert.exists(covenant)
  const [ label, vout ]   = output
  const { pnonce, psigs } = covenant
  const dep_key = agent.pubkey
  const dep_ctx = get_deposit_ctx(dep_key, signing_key, sequence)
  const pnonces = [ pnonce, session.pnonce ]
  const mut_ctx = get_mutex_ctx(dep_ctx, vout, pnonces, session.sid, txinput)
  const psig_a  = create_path_psig(mut_ctx, agent)
  const psig_d  = get_entry(label, psigs)
  const musig   = combine_psigs(mut_ctx.mutex, [ psig_d, psig_a ])
  return musig.append(0x81).hex
}
