import { TxBytes }  from '@scrow/tapscript'

export type SpendTemplate = [
  label : string,
  txhex : TxBytes
]

export interface SpendOut {
  txid      : string,
  vout      : number,
  value     : number,
  scriptkey : string
}

export interface SpendState {
  closed     : boolean
  closed_at  : number | null
  close_txid : string | null
  spent      : boolean
  spent_at   : number | null
}
