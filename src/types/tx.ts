export type SpendState  = Spent | Unspent
export type SettleState = Open  | Closed

interface Spent {
  spent      : true,
  spent_at   : number
  spent_txid : string
}

interface Unspent {
  spent      : false,
  spent_at   : null
  spent_txid : null
}

interface Closed {
  settled    : true
  settled_at : number
}

interface Open {
  settled    : false
  settled_at : null
}
