import { Bytes }        from '@cmdcode/buff'
import { AgentData }    from './contract.js'
import { ProposalData } from './proposal.js'

import {
  KeyContext,
  MusigContext
} from '@cmdcode/musig2'

import {
  TapContext,
  TxFullInput,
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

export interface DepositContext {
  agent        : AgentData
  key_data     : KeyContext
  proposal     : ProposalData
  signing_pubs : Bytes[]
  sighashes    : string[]
  tap_data     : TapContext
  templates    : PathTemplate[]
  timelock     : number
  txinput      : TxFullInput
}

export interface SessionContext {
  musig_ctx   : MusigContext
  nonce_tweak : Bytes
  sighashes   : Bytes[]
}

export interface DepositTemplate {
  partial_sigs : Bytes[],
  refund_pub   : Bytes,
  session_pub  : Bytes,
  txinput      : TxFullInput
}

export interface DepositData extends DepositTemplate {

}
