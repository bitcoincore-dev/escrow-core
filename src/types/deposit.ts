import { Bytes }      from '@cmdcode/buff'
import { KeyContext } from '@cmdcode/musig2'
import { TxStatus }   from './base.js'

import {
  ScriptWord,
  TapContext,
  TxData,
  TxPrevout,
} from '@scrow/tapscript'

export type DepositRecord = DepositRequest & TxStatus

export interface DepositContext {
  depo_key : Bytes
  key_data : KeyContext
  script   : ScriptWord[]
  sequence : number
  sign_key : Bytes
  tap_data : TapContext
}

export interface DepositData {
  depo_key  : Bytes
  recovery  : TxData
  sequence  : number
  sign_key  : Bytes
  txinput   : TxPrevout
}

export interface DepositRequest {
  depo_key : string
  recovery : string
  sequence : number
  sign_key : string
  txvin    : string
}
