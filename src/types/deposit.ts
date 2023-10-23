import { KeyContext }   from '@cmdcode/musig2'
import { CovenantData } from './session.js'

import {
  ScriptWord,
  TapContext,
  TxData
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
  deposit_key : string
  key_data    : KeyContext
  script      : ScriptWord[]
  sequence    : number
  signing_key : string
  tap_data    : TapContext
}

export interface DepositTemplate {
  agent_id  : string
  covenant ?: CovenantData
  return_tx : string
}

export interface DepositData extends DepositTemplate {
  created_at  : number
  deposit_id  : string
  deposit_key : string
  sequence    : number
  signing_key : string
  txspend     : SpendOut
  state       : DepositState
  status      : DepositStatus
  updated_at  : number
}

export interface DepositConfig {
  address  : string
  covenant : CovenantData
  pubkey   : string
  txfee    : number
}

export interface ReturnContext {
  pubkey    : string
  sequence  : number
  signature : string
  tapkey    : string
  tx        : TxData
}

export interface SpendOut {
  txid      : string,
  vout      : number,
  value     : number,
  scriptkey : string
}
