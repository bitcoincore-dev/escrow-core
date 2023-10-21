import { DepositData }  from '@/types/index.js'
import { EscrowClient } from './client.js'

export class EscrowDeposit {
  readonly _client : EscrowClient
  readonly _data   : DepositData

  constructor (
    client  : EscrowClient,
    deposit : DepositData
  ) {
    this._client = client
    this._data   = deposit
  }
}
