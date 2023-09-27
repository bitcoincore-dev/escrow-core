import { Literal, Network } from './base.js'

export type Payment = [
  value   : number,
  address : string
]

export type PayPath = [
  path    : string,
  value   : number,
  address : string
]

export type WitnessTerms = [
  action  : string,
  path    : string,
  method  : string,
  ...args : Literal[]
]

export interface ProposalData {
  details    : string
  effective ?: number
  network    : Network
  paths      : PayPath[]
  payments   : Payment[]
  schedule   : ScheduleData
  terms      : WitnessTerms[]
  title      : string
  value      : number
  version    : number
}

export interface ScheduleData {
  deadline : number
  duration : number
  expires  : number
  onclose  : string
  onexpire : string
}
