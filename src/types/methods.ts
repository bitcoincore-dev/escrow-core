export type SettleMethod = QuorumMethod | HashLockMethod | WitnessData
export type WitnessInput = QuorumInput  | HashLockInput  | WitnessData

type WitnessData = [
  path      : string,
  method    : string,
  ...params : string[]
]

type QuorumMethod = [
  path       : string,
  method     : 'quorum',
  threshold  : number,
  ...pubkeys : string[]
]

type HashLockMethod = [
  path      : string,
  method    : 'hashlock',
  threshold : number,
  ...hashes : string[]
]

type QuorumInput = [
  path   : string,
  method : 'quorum',
  pubkey : string,
  sig    : string
]

type HashLockInput = [
  path   : string,
  method : 'hashlock',
  ...preimg : string[]
]
