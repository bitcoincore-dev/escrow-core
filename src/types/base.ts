export type Literal = string | number | boolean | null
export type Network = 'bitcoin' | 'testnet' | 'regtest'

export interface Transaction {
  confirmed : boolean
  kind      : 'deposit' | 'close'
  txid      : string
  txdata    : string
  timestamp : number
}
