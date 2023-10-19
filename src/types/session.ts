import { Bytes }        from '@cmdcode/buff'
import { MusigContext } from '@cmdcode/musig2'

export type MutexEntry = [
  label : string,
  ctx   : MutexContext
]

export interface AgentSession {
  agent_id : string,
  pubkey   : string,
  pnonce   : string
}

export interface CovenantData {
  agent_id : string
  cid      : string
  pnonce   : string
  psigs    : [ string, string ][]
}

export interface MutexContext {
  sid   : Bytes
  mutex : MusigContext
  tweak : Bytes
}
