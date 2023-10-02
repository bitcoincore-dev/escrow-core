import { Literal }       from './base.js'
import { ContractState } from './vm.js'

import {
  Payment,
  ProposalData
}  from './proposal.js'

export type ContractStatus = 'published' | 'verified' | 'active' | 'disputed' | 'closed'

export interface AgentSession {
  /* Agent data is required for signature sessions. */
  created_at  : number
  payments    : Payment[]
  platform_id : string
  session_key : string
  signing_key : string
  subtotal    : number
}

export interface ContractTemplate {
  /* Base template required to start a contract. */
  members ?: string[]
  proposal : ProposalData 
}

export interface ContractData {
  agent     : AgentSession
  cid       : string
  deposits  : DepositData[]
  members  ?: string[]
  published : number
  state     : ContractState
  terms     : ProposalData
  total     : number
  witness   : WitnessEntry[]
}

export interface DepositData {
  deposit_key : string
  recover_sig : string
  session_key : string,
  signatures  : string[][],
  txinput     : string
}

export interface Transaction {
  confirmed : boolean
  txid      : string
  txdata    : string
  timestamp : number
}

export type WitnessEntry = [
  stamp   : number,
  action  : string,
  path    : string,
  prog_id : string,
  ...args : Literal[]
]

export interface WitnessData {
  action  : string
  args    : Literal[]
  id      : string
  path    : string
  prog_id : string
  stamp   : number
}
