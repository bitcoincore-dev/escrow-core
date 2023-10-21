import { ContractData } from '@/types/index.js'
import { EscrowClient } from './client.js'

export class EscrowContract {
  readonly _client : EscrowClient
  readonly _data   : ContractData

  constructor (
    client   : EscrowClient,
    contract : ContractData
  ) {
    this._client = client
    this._data   = contract
  }
}
