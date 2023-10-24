import EscrowClient   from './client.js'
import EscrowContract from './contract.js'
import EventEmitter   from './emitter.js'

import { WitnessEntry }  from '@/types/index.js'

export default class ContractVM extends EventEmitter {
  readonly _client   : EscrowClient
  readonly _contract : EscrowContract
  readonly _witness  : WitnessEntry[]

  constructor (
    client   : EscrowClient,
    contract : EscrowContract,
    witness  : WitnessEntry[]
  ) {
    super()
    this._client   = client
    this._contract = contract
    this._witness  = witness
  }
}
