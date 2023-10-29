import { Literal } from './base.js'

export type Payment = [
  value   : number,
  address : string
]

export type PayPath = [
  path    : string,
  value   : number,
  address : string
]

export type ProgramTerms = [
  actions : string,
  paths   : string,
  method  : string,
  ...args : Literal[]
]

export type ScheduleTerms = [
  stamp  : number,
  action : string,
  path   : string
]

export interface ProposalData {
  confirmation  ?: boolean
  deadline      ?: number
  details        : string
  effective     ?: number
  expires        : number
  fallback      ?: string
  feerate       ?: number
  network        : string
  paths          : PayPath[]
  payments       : Payment[]
  programs       : ProgramTerms[]
  schedule       : ScheduleTerms[]
  title          : string
  value          : number
  version        : number
}
