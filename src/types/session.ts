import { Bytes }        from '@cmdcode/buff'
import { MusigContext } from '@cmdcode/musig2'

export type MuPathEntry = [
  label : string,
  ctx   : MuPathContext
]

export interface AgentSession {
  agent_id : string,
  pubkey   : string,
  pnonce   : string
}

export interface MuPathContext {
  cid   : Bytes
  musig : MusigContext
  tweak : Bytes
}
