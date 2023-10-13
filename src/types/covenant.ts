import { Bytes }        from '@cmdcode/buff'
import { MusigContext } from '@cmdcode/musig2'

export type MuPathEntry = [
  label : string,
  ctx   : MuPathContext
]

export interface AgentSession {
  id     : string,
  pubkey : string,
  pnonce : string
}

export interface CovenantData {
  pnonce : string
  psigs  : [ string, string ][]
}

export interface MuPathContext {
  cid   : Bytes
  musig : MusigContext
  tweak : Bytes
}
