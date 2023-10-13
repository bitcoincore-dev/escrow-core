export type PathMap    = Map<string, PathState>
export type ProgMap    = Map<string, ProgState>
export type StoreMap   = Map<string, StoreState>
export type StoreState = Map<string, any>
export type WitProgram = (...args : any[]) => boolean

export type PathStatus = 'init' | 'open' | 'hold' | 'disputed' | 'closed'

export enum PathState {
  open = 0,
  locked,
  disputed,
  closed
}

export interface StateData {
  commits : CommitEntry[]
  head    : string
  result  : string | null
  steps   : number
  start   : number
  status  : PathStatus
  updated : number
}

export interface StateResult extends StateData {
  path : string | null
}

export interface ContractState extends StateData {
  paths : StateEntry[]
  store : StoreEntry[]
}

export interface MachineState extends StateData {
  log   : LogEntry[]
  paths : PathMap
  progs : ProgMap
  store : StoreMap
  tasks : TaskEntry[]
}

export interface ProgramData {
  actions : string
  id      : string
  method  : string
  params  : string[]
  paths   : string
}

export interface ProgState extends ProgramData {
  exec  : WitProgram
  store : StoreState
}

export type CommitEntry = [
  step  : number,
  stamp : number,
  id    : string,
  head  : string,
  path  : string,
  state : PathState
]

export type LogEntry = [
  stamp  : number,
  hash   : string,
  id     : string,
  reason : string
]

export type StateEntry = [
  path  : string, 
  state : PathState
]

export type StoreEntry = [
  key : string,
  val : string
]

export type TaskEntry = [
  timer  : number, 
  action : string, 
  paths  : string
]
