import { TxOutput }      from '@scrow/tapscript'
import { DepositRecord } from './deposit.js'
import { ContractState } from './vm.js'

import {
  Literal,
  TxStatus
} from './base.js'

import {
  Payment,
  ProposalData
} from './proposal.js'

import {
  AgentSession,
  CovenantData
} from './covenant.js'

export type ContractStatus = 'published' | 'active' | 'closed' | 'canceled' | 'expired'
export type Covenant       = DepositRecord & CovenantData

export type PathTemplate = [
  label : string,
  vout  : TxOutput[]
]

export interface ContractData {
  activated  : null | number
  balance    : number
  cid        : string
  covenants  : Covenant[]
  created_at : number
  deadline   : number
  expires    : null | number
  fees       : Payment[]
  session    : AgentSession
  state      : null | ContractState
  status     : ContractStatus
  templates  : PathTemplate[]
  terms      : ProposalData
  total      : number
  tx         : null | TxStatus
  witness    : WitnessEntry[]
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
