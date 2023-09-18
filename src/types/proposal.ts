import { Literal, Network } from './base.js'

export type Fee = [
  value   : number,
  address : string
]

export type Payout = [
  path    : string,
  value   : number,
  address : string
]

type WitnessData = [
  path    : string,
  action  : string,
  method  : string,
  ...args : Literal[]
]

export interface ProposalData {
  details  : string
  fees     : Fee[]
  members  : string[]
  network  : Network
  paths    : Payout[]
  programs : WitnessData[]
  schedule : ScheduleData
  title    : string
  value    : number
  version  : number
}

export interface ScheduleData {
  deadline : number
  duration : number
  expires  : number
  onclose  : string
  onexpire : string
}
