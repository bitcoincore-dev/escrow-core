
import EscrowClient from './client.js'
import EventEmitter from './emitter.js'

import { ContractData } from '../../types/index.js'

export default class EscrowContract extends EventEmitter {
  readonly _client : EscrowClient
  readonly _data   : ContractData

  constructor (
    client   : EscrowClient,
    contract : ContractData
  ) {
    super()
    this._client = client
    this._data   = contract
  }

  get client () : EscrowClient {
    return this._client
  }

  get data () : ContractData {
    return this._data
  }

  toJSON() {
    return this.data
  }
}
