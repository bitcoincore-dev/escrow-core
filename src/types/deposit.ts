import { Bytes }        from '@cmdcode/buff'
import { KeyContext }   from '@cmdcode/musig2'
import { CovenantData } from './session.js'

import {
  ScriptWord,
  TapContext,
  TxPrevout
} from '@scrow/tapscript'

export interface DepositContext {
  deposit_key : Bytes
  key_data    : KeyContext
  script      : ScriptWord[]
  sequence    : number
  signing_key : Bytes
  tap_data    : TapContext
}

export interface DepositAccount {
  address     : string
  agent_id    : string
  deposit_key : string
  sequence    : number
  signing_key : string
}

export interface DepositTemplate {
  agent_id    : string
  deposit_key : string
  recovery_tx : string
  sequence    : number
  signing_key : string
}

export interface DepositData extends DepositTemplate {
  confirmed  : boolean
  covenant   : CovenantData | null
  expires_at : number | null
  settled    : boolean
  txinput    : TxPrevout
  updated_at : number | null
}

export interface RecoveryConfig {
  txfee   : number
  address : string
  pubkey  : string
}
