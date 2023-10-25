import EscrowClient from './client.js'
import EventEmitter from './emitter.js'

import { DepositData }  from '../../types/index.js'

export default class EscrowDeposit extends EventEmitter {
  readonly _client : EscrowClient
  readonly _data   : DepositData

  constructor (
    client  : EscrowClient,
    deposit : DepositData
  ) {
    super()
    this._client = client
    this._data   = deposit
  }

  get client () : EscrowClient {
    return this._client
  }

  get data () : DepositData {
    return this._data
  }
}
