export type Literal = string | number | boolean | null
export type Network = 'bitcoin' | 'testnet' | 'regtest'

export interface TxStatus {
  confirmed_at : boolean
  height       : number | null
  txid         : string
  updated_at   : number
}
