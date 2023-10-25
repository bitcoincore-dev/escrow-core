import { Bytes }        from '@cmdcode/buff'
import { MusigContext } from '@cmdcode/musig2'

export type MutexEntry = [
  label : string,
  ctx   : MutexContext
]

export interface CovenantData {
  cid    : string
  pnonce : string
  psigs  : [ string, string ][]
}

export interface MutexContext {
  sid   : Bytes
  mutex : MusigContext
  tweak : Bytes
}
