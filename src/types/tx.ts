export type SpendState = Spent | Unspent
export type CloseState = Open  | Closed

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

interface Open {
  closed    : true
  closed_at : number
}

interface Closed {
  closed    : false
  closed_at : null
}
