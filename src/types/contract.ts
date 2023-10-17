import { TxBytes }       from '@scrow/tapscript'
import { AgentSession }  from './session.js'
import { ContractState } from './vm.js'

import {
  Payment,
  ProposalData
} from './proposal.js'

export type ContractStatus = 'published' | 'active' | 'closed' | 'canceled' | 'expired'

export type SpendOutput = [
  label : string,
  txhex : TxBytes
]

export interface ContractConfig {
  fees      : Payment[]
  moderator : string
  published : number
}

export interface ContractData {
  activated  : null | number
  balance    : number
  cid        : string
  deadline   : number
  expires_at : null | number
  fees       : Payment[]
  moderator  : string | null
  outputs    : SpendOutput[]
  published  : number
  session    : AgentSession
  state      : null | ContractState
  status     : ContractStatus
  terms      : ProposalData
  total      : number
  tx         : null | TxStatus
  updated_at : number
}

export interface TxStatus {
  confirmed  : boolean
  height     : number | null
  txid       : string
  updated_at : number
}
