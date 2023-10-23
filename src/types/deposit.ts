import { Bytes }        from '@cmdcode/buff'
import { KeyContext }   from '@cmdcode/musig2'
import { CovenantData } from './session.js'

import {
  ScriptWord,
  TapContext,
  TxData,
  TxPrevout
} from '@scrow/tapscript'

export type DepositState  = DepositConfirmed | DepositUnconfirmed
export type DepositStatus = 'pending' | 'open' | 'locked' | 'expired' | 'closed'

interface DepositConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
  close_txid   : string | null
  expires_at   : number
}

interface DepositUnconfirmed {
  confirmed    : false
  block_hash   : null
  block_height : null
  block_time   : null
  close_txid   : null
  expires_at   : null
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
  covenant    : CovenantData | null
  deposit_key : string
  recovery_tx : string
  sequence    : number
  signing_key : string
}

export interface DepositData extends DepositTemplate {
  account_id : string
  created_at : number
  state      : DepositState
  status     : DepositStatus
  txinput    : TxPrevout
  updated_at : number
}

export interface DepositConfig {
  txfee   : number
  address : string
  pubkey  : string
}

export interface RecoveryContext {
  pubkey    : string
  sequence  : number
  signature : string
  tapkey    : string
  tx        : TxData
}
