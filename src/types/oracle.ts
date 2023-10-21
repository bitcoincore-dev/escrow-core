export type OracleStatus = OracleConfirmed | OracleUnconfirmed

interface OracleConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
}

interface OracleUnconfirmed {
  confirmed : false
}
