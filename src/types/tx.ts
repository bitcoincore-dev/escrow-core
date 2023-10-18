import { Bytes }  from '@cmdcode/buff'
import { TxData } from '@scrow/tapscript'

export interface TxContext {
  pubkey   : Bytes
  sequence : number
  sig      : Bytes
  tapkey   : Bytes
  tx       : TxData
}
