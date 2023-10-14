import { Bytes }        from '@cmdcode/buff'
import { KeyContext }   from '@cmdcode/musig2'
import { CovenantData } from './session.js'

import {
  ScriptWord,
  TapContext,
  TxData,
  TxPrevout,
} from '@scrow/tapscript'

export type Deposit = DepositData & DepositMeta

export interface DepositContext {
  deposit_key : Bytes
  key_data    : KeyContext
  script      : ScriptWord[]
  sequence    : number
  signing_key : Bytes
  tap_data    : TapContext
}

export interface DepositData {
  deposit_key : Bytes
  recovery_tx : TxData
  sequence    : number
  signing_key : Bytes
  txinput     : TxPrevout
}

export interface DepositMeta {
  confirmed  : boolean
  covenant   : CovenantData | null
  expires_at : number | null
  updated_at : number | null
}
