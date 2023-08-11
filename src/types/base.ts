export type Network = 'bitcoin' | 'testnet' | 'regtest' | string

export type HashLock = [
  path    : string,
  ...keys : string[]
]

export type Payout = [
  path    : string,
  value   : number,
  address : string
]

export type SigHash = [
  label : string,
  hash  : string
]

export interface Transaction {
  confirmed : boolean
  kind      : 'deposit' | 'close'
  txid      : string
  txdata    : string
  timestamp : number
}

export type WitnessEvent = [
  content : string,
  id      : string,
  pubkey  : string,
  sig     : string,
  stamp   : number
]
