
import { combine_psigs }   from '@cmdcode/musig2'
import { TxData, TxPrevout }          from '@scrow/tapscript'
import { decode_tx }       from '@scrow/tapscript/tx'
import { get_deposit_ctx } from '../../src/lib/deposit.js'
import { parse_txinput }   from '../../src/lib/tx.js'
import { Signer }          from '../../src/signer.js'
import { get_entry }       from '../../src/lib/util.js'

import {
  create_path_psig,
  get_mutex_ctx,
  get_session_id
} from '../../src/lib/session.js'

import {
  ContractData,
  DepositData,
  SpendTemplate
} from '../../src/types/index.js'

import * as assert from '../../src/assert.js'

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
    const txin = parse_txinput(fund)
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
  const { covenant, deposit_key, sequence } = deposit
  const { agent_id, agent_pn, cid } = contract
  assert.exists(covenant)
  const [ label, vout ]   = output
  const { pnonce, psigs } = covenant
  const dep_ctx = get_deposit_ctx(agent.pubkey, deposit_key, sequence)
  const pnonces = [ pnonce, agent_pn ]
  const sid     = get_session_id(agent_id, cid)
  const mut_ctx = get_mutex_ctx(dep_ctx, vout, pnonces, sid, txinput)
  const psig_a  = create_path_psig(mut_ctx, agent)
  const psig_d  = get_entry(label, psigs)
  const musig   = combine_psigs(mut_ctx.mutex, [ psig_d, psig_a ])
  return musig.append(0x81).hex
}
