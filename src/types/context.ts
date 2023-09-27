import { Bytes }        from '@cmdcode/buff'
import { AgentData }    from './contract.js'

import {
  KeyContext,
  MusigContext
} from '@cmdcode/musig2'

import {
  TapContext,
  TxOutput
} from '@scrow/tapscript'

import {
  ProposalData,
  WitnessTerms
} from './proposal.js'

export type PathTemplate = [
  label : string,
  vout  : TxOutput[]
]

export type SessionEntry = [
  label   : string,
  session : SessionContext
]

export interface DepositContext {
  agent      : AgentData
  group_pub  : string
  key_data   : KeyContext
  locktime   : number
  proposal   : ProposalData
  programs   : WitnessTerms[]
  session_id : string
  tap_data   : TapContext
  templates  : PathTemplate[]
}

export interface SessionContext {
  ctx   : MusigContext
  id    : Bytes
  tweak : Bytes
}
