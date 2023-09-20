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
  signing_pub : string
  session_pub : string
}

export interface ContractSession {
  agent       : AgentData
  contract_id : string
  created_at  : string
  status      : ContractStatus
  total       : number
}

export interface ContractTemplate {
  /* Base template required to start a contract. */
  proofs : string[]
  terms  : ProposalData
}

export interface ContractRecords {
  /* State of the contract plus relational data. */
  deposits     : DepositData[]
  transactions : Transaction[]
  witness      : WitnessData[]
}
