import { DepositData } from './deposit.js'
import { Proposal }    from './proposal.js'

import {
  Payout,
  SigHash,
  Transaction,
  WitnessEvent
} from './base.js'

export type ContractStatus = 'published' | 'verified' | 'active' | 'disputed' | 'closed'
export type ContractData   = ContractTemplate & ContractRecords & ContractSession

export interface AgentData {
  /* Agent data is required for signature sessions. */
  fees   : Payout[]
  pubkey : string
  nonce  : string
}

export interface SessionData {
  /* Session data is computable, and can be discarded. */
  deadline  : number
  expires   : number
  sighashes : SigHash[]
  total     : number
}

export interface ContractSession {
  agent   : AgentData
  members : string[]
  session : SessionData
  state   : ContractStatus
}

export interface ContractTemplate {
  /* Base template required to start a contract. */
  contract_id  : string
  created_at   : string
  details      : Proposal
  endorsements : string[][]
}

export interface ContractRecords {
  /* State of the contract plus relational data. */
  deposits     : DepositData[]
  transactions : Transaction[]
  witness      : WitnessEvent[]
}
