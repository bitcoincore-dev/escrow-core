import { Bytes }        from '@cmdcode/buff'
import { KeyContext }   from '@cmdcode/musig2'
import { CovenantData } from './session.js'

import {
  ScriptWord,
  TapContext,
  TxPrevout
} from '@scrow/tapscript'

export type DepositData = DepositTemplate & DepositMeta & DepositStatus

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

export interface DepositStatus {
  confirmed     : boolean
  block_hash   ?: string | null
  block_height ?: number | null
  block_time   ?: number | null
}
