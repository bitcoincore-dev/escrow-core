import { AgentSession }  from './session.js'
import { ContractState } from './vm.js'

import {
  Payment,
  ProposalData
} from './proposal.js'

import {
  SpendState,
  SpendTemplate
} from './tx.js'

export type ContractStatus = 'published' | 'active' | 'canceled' | 'expired' | 'closing' | 'closed'

export interface ContractConfig {
  fees      : Payment[]
  moderator : string
  published : number
}

export interface ContractData {
  activated   : null | number
  balance     : number
  cid         : string
  deadline    : number
  expires_at  : null | number
  fees        : Payment[]
  moderator   : string | null
  outputs     : SpendTemplate[]
  published   : number
  session     : AgentSession
  spend_state : SpendState
  status      : ContractStatus
  terms       : ProposalData
  total       : number
  updated_at  : number
  vm_state    : null | ContractState
}
