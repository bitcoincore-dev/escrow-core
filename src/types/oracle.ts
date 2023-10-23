export type OracleTxStatus = OracleConfirmed | OracleUnconfirmed

interface OracleConfirmed {
  confirmed    : true
  block_hash   : string
  block_height : number
  block_time   : number
}

interface OracleUnconfirmed {
  confirmed : false
}

export interface OracleTxData {
  txid     : string
  version  : number,
  locktime : number
  vin      : OracleTxIn[]
  vout     : OracleTxOut[]
  size     : number
  weight   : number
  fee      : number
  status   : OracleTxStatus
}

export interface OracleTxIn {
  txid          : string
  vout          : number
  prevout       : OracleTxOut
  scriptsig     : string
  scriptsig_asm : string
  witness       : string[]
  sequence      : number
  is_coinbase   : boolean
}

export interface OracleTxOut {
  scriptpubkey         : string
  scriptpubkey_asm     : string
  scriptpubkey_type    : string
  scriptpubkey_address : string
  value                : number
}

export interface OracleTxSpend {
  spent  : boolean
  txid   : string
  vin    : number
  status : OracleTxStatus
}
