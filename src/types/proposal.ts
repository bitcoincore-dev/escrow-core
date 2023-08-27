import { Network, Payout } from './base.js'
import { SettleMethod }    from './methods.js'

export type MusigMember = [
  pubkey : string,
  nonce  : string
]

export type QuorumMember = [
  pubkey : string,
  value  : number
]

export interface DisputeTerms {
  members   : MusigMember[]
  quorum    : QuorumMember[]
  threshold : number
}

export interface Proposal {
  version : number
  title   : string
  details : string
  feerate : number
  members : string[]
  network : Network
  terms   : ContractTerms
  value   : number
}

export interface ContractTerms {
  fees     : Payout[]
  paths    : Payout[]
  programs : SettleMethod[]
  schedule : ScheduleTerms
}

export interface ScheduleTerms {
  deadline  : number
  duration  : number
  expires   : number
  onclose   : string
  onexpired : string
}
