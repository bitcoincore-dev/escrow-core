import { Transaction }  from './base.js'
import { DepositData }  from './deposit.js'
import { WitnessData }  from '@scrow/tapscript'

import {
  Fee,
  ProposalData
} from './proposal.js'

export type ContractStatus = 'published' | 'verified' | 'active' | 'disputed' | 'closed'
export type ContractData   = ContractTemplate & ContractRecords & ContractSession

export type Sighash = [
  label : string,
  hash  : string
]

export interface AgentData {
  /* Agent data is required for signature sessions. */
  created_at  : number
  fees        : Fee[]
  signing_key : string
  session_key : string
}

export interface ContractSession {
  agent     : AgentData
  deadline  : number
  expires   : number
  members   : string[]
  sighashes : string[][]
  status    : ContractStatus
  total     : number
}

export interface ContractTemplate {
  /* Base template required to start a contract. */
  contract_id  : string
  created_at   : number
  endorsements :  string[]
  terms        : ProposalData
}

export interface ContractRecords {
  /* State of the contract plus relational data. */
  deposits     : DepositData[]
  transactions : Transaction[]
  witness      : WitnessData[]
}
