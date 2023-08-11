export type DepositData = DepositTemplate & DepositDetails

export type PartSig = [
  path : string,
  psig : string
]

export interface DepositTemplate {
  deposit_key : string
  nonce_key   : string
  refund_key  : string
  refund_tx   : string
  signatures  : PartSig[]
  timelock    : number
  utxo        : UTXO
}

export interface DepositDetails {
  confirmed  : boolean
  height    ?: number
  updated_at : number
}

export interface DepositSession {
  tapkey  : string
  cblock  : string
  int_key : string
  vectors : string[][]
}

export interface UTXO {
  tapkey : string
  txid   : string
  value  : number
  vout   : number
}
