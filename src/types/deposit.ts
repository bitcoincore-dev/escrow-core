import { Bytes } from '@cmdcode/buff'

export type PathHash = [
  label   : string,
  sighash : string
]

export type PathPsig = [
  label : string,
  psig  : string
]

export interface DepositTemplate {
  pubkey : Bytes
  pnonce : Bytes,
  psigs  : string[][],
  txvin  : string
}

export interface DepositData extends DepositTemplate {

}
