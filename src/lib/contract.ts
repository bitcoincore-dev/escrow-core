import { Buff, Bytes }    from '@cmdcode/buff'
import { hash340 }        from '@cmdcode/crypto-tools/hash'
import { init_vm }        from '../vm/vm.js'
import { parse_txin }     from './parse.js'
import { get_session_id } from './session.js'
import { now }            from './util.js'

import {
  AgentSession,
  ContractData,
  DepositData,
  ProposalData
} from '../types/index.js'

export function get_contract (
  deposits  : DepositData[],
  proposal  : ProposalData,
  session   : AgentSession,
  published : number = now()
) : ContractData {
  const sid = get_session_id(proposal, session)
  const cid = get_contract_id(deposits, sid, published)
  const vin = get_deposit_vin(deposits)

  return {
    cid,
    deposits,
    published,
    agent   : session,
    members : [],
    state   : init_vm(cid, proposal, published),
    terms   : proposal,
    total   : vin.reduce((p, n) => p + Number(n.prevout.value), 0),
    witness : []
  }
}

function get_contract_id (
  deposits   : DepositData[],
  session_id : Bytes,
  published  : number
) {
  const stamp   = Buff.num(published, 4)
  const txids   = deposits.map(e => parse_txin(e.txinput).txid)
  const preimg  = Buff.join([ session_id, stamp, ...txids.sort() ])
  return hash340('escrow/contract_id', preimg).hex
}

function get_deposit_vin (deposits : DepositData[]) {
  return deposits.map(e => parse_txin(e.txinput))
}
