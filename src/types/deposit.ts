import { Bytes }        from '@cmdcode/buff'
import { AgentData }    from './contract.js'
import { ProposalData } from './proposal.js'

import {
  KeyContext,
  MusigContext
} from '@cmdcode/musig2'

import {
  TapContext,
  TxPrevout,
  TxOutput
} from '@scrow/tapscript'

export type PathHash = [
  label   : string,
  sighash : string
]

export type PathPsig = [
  label : string,
  psig  : string
]

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
  prop_id    : string
  tap_data   : TapContext
  templates  : PathTemplate[]
}

export interface DepositTemplate {
  deposit_pub : Bytes
  psigs       : string[][],
  session_pub : Bytes,
  txinput     : TxPrevout
}

export interface SessionContext {
  ctx     : MusigContext
  prop_id : Bytes
  tweak   : Bytes
}

export interface DepositData extends DepositTemplate {

}
