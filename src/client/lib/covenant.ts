import EscrowClient          from '../class/client.js'
import EscrowDeposit         from '../class/deposit.js'
import { create_proof }      from '../../lib/proof.js'
import { now }               from '../../lib/util.js'
import { validate_covenant } from '../../validators/index.js'

import {
  CovenantData,
  DepositData
} from '../../types/index.js'

import * as assert from '@/assert.js'

function list_covenant_api (client : EscrowClient) {
  return async (
    cid : string
  ) : Promise<EscrowDeposit[]> => {
    assert.is_hash(cid)
    const url = `${client.host}/api/contract/${cid}/funds`
    const res = await client.fetcher<DepositData[]>(url)
    if (!res.ok) throw res.error
    return res.data.map(e => new EscrowDeposit(client, e))
  }
}

function add_covenant_api (client : EscrowClient) {
  return async (
    deposit_id : string, 
    covenant   : CovenantData
  ) : Promise<EscrowDeposit> => {
    assert.is_hash(deposit_id)
    validate_covenant(covenant)
    const opt = {
      method  : 'POST',
      body    : JSON.stringify(covenant),
      headers : { 'content-type' : 'application/json' }
    }
    const url = `${client.host}/api/covenant/${deposit_id}/add`
    const res = await client.fetcher<DepositData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowDeposit(client, res.data)
  }
}

function remove_covenant_api (client : EscrowClient) {
  return async (
    deposit_id : string
  ) : Promise<EscrowDeposit> => {
    assert.is_hash(deposit_id)
    const url = `${client.host}/api/covenant/${deposit_id}/remove`
    const tkn = create_proof(client.signer, url, [[ 'stamp', now() ]])
    const opt = { headers : { proof : tkn } }
    const res = await client.fetcher<DepositData>(url, opt)
    if (!res.ok) throw res.error
    return new EscrowDeposit(client, res.data)
  }
}

export default {
  list   : list_covenant_api,
  add    : add_covenant_api,
  remove : remove_covenant_api
}
