import { Bytes }        from '@cmdcode/buff'
import { KeyContext }   from '@cmdcode/musig2'
import { CovenantData } from './session.js'

import {
  ScriptWord,
  TapContext,
  TxBytes,
  TxPrevout,
} from '@scrow/tapscript'

export type Deposit = DepositTemplate & DepositMeta

export interface DepositContext {
  deposit_key : Bytes
  key_data    : KeyContext
  script      : ScriptWord[]
  sequence    : number
  signing_key : Bytes
  tap_data    : TapContext
}

export interface DepositTemplate {
  agent_id    : Bytes
  deposit_key : Bytes
  recovery_tx : TxBytes
  sequence    : number
  signing_key : Bytes
  txinput     : TxPrevout
}

export interface DepositMeta {
  confirmed  : boolean
  covenant   : CovenantData | null
  settled    : boolean
  updated_at : number | null
}

export interface RecoveryConfig {
  txfee   : number
  address : string
  pubkey  : string
}
