import { Bytes }         from '@cmdcode/buff'
import { TxOutput }      from '@scrow/tapscript'
import { Literal }       from './base.js'
import { Deposit }       from './deposit.js'
import { AgentSession }  from './session.js'
import { ContractState } from './vm.js'

import {
  Payment,
  ProposalData
} from './proposal.js'

export type ContractStatus = 'published' | 'active' | 'closed' | 'cancelled' | 'expired'

export type PathTemplate = [
  label : string,
  vout  : TxOutput[]
]

export interface ContractConfig {
  aux       : Bytes[]
  fees      : Payment[]
  published : number
}

export interface ContractData {
  activated  : null | number
  cid        : string
  deadline   : number
  expires    : null | number
  fees       : Payment[]
  funds      : Deposit[]
  published  : number
  session    : AgentSession
  state      : null | ContractState
  status     : ContractStatus
  templates  : PathTemplate[]
  terms      : ProposalData
  tx         : null | TxStatus
  value      : number
  witness    : WitnessEntry[]
}

export interface TxStatus {
  confirmed  : boolean
  height     : number | null
  txid       : string
  updated_at : number
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
  path    : string
  prog_id : string
  stamp   : number
  wid     : string
}
