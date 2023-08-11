import { Network, Payout } from './base.js'

export interface Proposal {
  version : number
  title   : string
  details : string
  feerate : number
  members : string[]
  network : Network
  terms   : Terms
  value   : number
}

export interface Terms {
  fees        : Payout[]
  paths       : Payout[]
  schedule    : ScheduleTerms
  settlement ?: SettleTerms[]
}

export interface ScheduleTerms {
  deadline  : number
  duration  : number
  expires   : number
  onclose   : string
  onexpired : string
}

export type SettleTerms = [
  path       : string,
  threshold  : number,
  ...pubkeys : string[]
]
