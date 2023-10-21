import { Bytes }        from '@cmdcode/buff'
import { KeyContext }   from '@cmdcode/musig2'
import { CovenantData } from './session.js'

import {
  ScriptWord,
  TapContext,
  TxData,
  TxPrevout
} from '@scrow/tapscript'

export type DepositStatus = StatusConfirmed | StatusUnconfirmed
export type DepositData   = DepositTemplate & DepositMeta & DepositStatus

interface StatusConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
}

interface StatusUnconfirmed {
  confirmed    : false
  block_hash   : null
  block_height : null
  block_time   : null
}

export interface DepositContext {
  deposit_key : Bytes
  key_data    : KeyContext
  script      : ScriptWord[]
  sequence    : number
  signing_key : Bytes
  tap_data    : TapContext
}

export interface DepositTemplate {
  agent_id    : string
  covenant   ?: CovenantData | null
  deposit_key : string
  recovery_tx : string
  sequence    : number
  signing_key : string
}

export interface DepositMeta {
  expires_at : number | null
  spent      : boolean
  txinput    : TxPrevout
  updated_at : number
}

export interface DepositConfig {
  txfee   : number
  address : string
  pubkey  : string
}

export interface DepositUtxo {
  status : DepositStatus
  txid   : string,
  vout   : number,
  value  : number
}

export interface DepositInput {
  status  : DepositStatus
  txinput : TxPrevout
}

export interface RecoveryContext {
  pubkey    : string
  sequence  : number
  signature : string
  tapkey    : string
  tx        : TxData
}
