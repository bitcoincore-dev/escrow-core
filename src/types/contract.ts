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

export interface ContractSession {
  agent     : AgentData
  deadline  : number
  expires   : number
  members   : string[]
  sighashes : SigHash[]
  status    : ContractStatus
  total     : number
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
