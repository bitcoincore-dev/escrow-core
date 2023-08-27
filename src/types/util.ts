import { Buff }         from '@cmdcode/buff-utils'
import { MusigContext } from '@cmdcode/musig2'
import { ScriptData }   from '@scrow/tapscript'

import { AgentData, DepositTemplate, ContractTerms } from './index.js'

export interface SignerAPI {
  sign : (msg : string) => string
  getPublicKey : () => string
  musign : (ctx : MusigContext) => string
}

export interface TapContext {
  int_key  : Buff
  script   : string[]
  taptweak : Buff
  tapkey   : Buff
  cblock   : Buff
}

export type PayTemplate = [
  label : string,
  vout  : TxOutput[]
]

export type TxHash = [
  label   : string,
  sighash : string
]

export interface TxInput {
  txid     : string
  vout     : number
  prevout  : TxOutput
  sequence : number
  witness  : ScriptData[]
}

export interface TxOutput {
  value        : number
  scriptPubKey : ScriptData
}

export interface DepositContext extends TapContext {
  agent     : AgentData
  deposit   : DepositTemplate
  nonces    : string[]
  pubkeys   : string[]
  templates : PayTemplate[]
  terms     : ContractTerms
  timelock  : number
  txinput   : TxInput
  txhashes  : TxHash[]
}
