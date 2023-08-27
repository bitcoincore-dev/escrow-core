export type DepositData = DepositTemplate & DepositDetails

export type PartSig = [
  path : string,
  psig : string
]

export interface DepositTemplate {
  deposit_key : string
  feerate     : number
  nonce_key   : string
  refund_key  : string
  refund_sig  : string
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
  coeffs  : string[][]
}

export interface UTXO {
  scriptPubKey : string[]
  txid  : string
  value : number
  vout  : number
}
