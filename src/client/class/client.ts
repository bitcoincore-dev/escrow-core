import { Signer }          from '../../signer.js'
import { create_proof }    from '../../lib/proof.js'
import { is_hex, now }     from '../../lib/util.js'

import EscrowContract from './contract.js'
import EscrowDeposit  from './deposit.js'

import deposit_api from '../lib/deposit.js'

import {
  broadcast_tx,
  fee_estimates,
  get_fee_target,
  get_spend_data,
  get_tx_data,
  resolve
} from '../../lib/oracle.js'

import {
  validate_covenant,
  validate_proposal,
  verify_proposal,
  validate_witness,
  verify_witness
} from '../../validators/index.js'

import {
  ContractData,
  CovenantData,
  DepositData,
  OracleQuery,
  ProposalData,
  WitnessData,
  WitnessEntry
} from '../../types/index.js'

import { ClientOptions } from '../types.js'

import * as assert from '@/assert.js'

type Resolver = ReturnType<typeof get_fetcher>

const DEFAULT_HOST   = 'http://localhost:3000'
const DEFAULT_ORACLE = 'http://172.21.0.3:3000'

export default class EscrowClient {
  readonly _fetcher : Resolver
  readonly _host    : string
  readonly _oracle  : string
  readonly _signer  : Signer

  constructor (
    signer  : Signer,
    options : ClientOptions = {}
  ) {
    const { fetcher, hostname, oracle } = options
    this._fetcher = get_fetcher(fetcher ?? fetch)
    this._host    = hostname ?? DEFAULT_HOST
    this._oracle  = oracle   ?? DEFAULT_ORACLE
    this._signer  = signer
  }

  get fetcher() {
    return this._fetcher
  }

  get host () {
    return this._host
  }

  get signer () {
    return this._signer
  }
 
  contract = {
    create : async (
      proposal : Record<string, any>
    ) : Promise<EscrowContract> => {
      validate_proposal(proposal)
      verify_proposal(proposal)
      const opt = {
        method  : 'POST', 
        body    : JSON.stringify(proposal),
        headers : { 'content-type' : 'application/json' }
      }
      const url = this._host + '/api/contract/create'
      const res = await this.fetcher<ContractData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    },
    read : async (
      cid : string
    ) : Promise<EscrowContract> => {
      assert.is_hash(cid)
      const url = `${this._host}/api/contract/${cid}`
      const res = await this.fetcher<ContractData>(url)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    },
    list : async () : Promise<EscrowContract[]> => {
      const url = this._host + `/api/contract/list`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { token : tkn } }
      const res = await this.fetcher<ContractData[]>(url, opt)
      if (!res.ok) throw res.error
      return res.data.map(e => new EscrowContract(this, e))
    },
    cancel : async (
      cid : string
    ) : Promise<EscrowContract> => {
      assert.is_hash(cid)
      const url = this._host + `/api/contract/${cid}/cancel`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { token : tkn } }
      const res = await this.fetcher<ContractData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    }
  }

  covenant = {
    list : async (
      cid : string
    ) : Promise<EscrowDeposit[]> => {
      assert.is_hash(cid)
      const url = `${this._host}/api/contract/${cid}/funds`
      const res = await this.fetcher<DepositData[]>(url)
      if (!res.ok) throw res.error
      return res.data.map(e => new EscrowDeposit(this, e))
    },
    add : async (
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
      const url = `${this._host}/api/covenant/${deposit_id}/add`
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    remove : async (
      deposit_id : string
    ) : Promise<EscrowDeposit> => {
      assert.is_hash(deposit_id)
      const url = `${this._host}/api/covenant/${deposit_id}/remove`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    }
  }

  deposit = {
    close    : deposit_api.close(this),
    create   : deposit_api.create(this),
    list     : deposit_api.list(this),
    read     : deposit_api.read(this),
    register : deposit_api.register(this),
    request  : deposit_api.request(this)
  }

  oracle = {
    broadcast_tx : async (txhex : string) => {
      assert.ok(is_hex(txhex))
      return broadcast_tx(this._oracle, txhex)
    },
    fee_estimates : async () => {
      return fee_estimates(this._oracle)
    },
    get_fee_target : async (target : number) => {
      return get_fee_target(this._oracle, target)
    },
    get_tx_data : async (txid : string) => {
      assert.is_hash(txid)
      return get_tx_data(this._oracle, txid)
    },
    get_spend_out : async (query : OracleQuery) => {
      assert.is_hash(query.txid)
      return get_spend_data(this._oracle, query)
    }
  }

  witness = {
    read : async (
      wid : string
    ) : Promise<WitnessData> => {
      assert.is_hash(wid)
      const url = `${this._host}/api/witness/${wid}`
      const res = await this.fetcher<WitnessData>(url)
      if (!res.ok) throw res.error
      return res.data
    },
    list : async (
      cid : string
    ) : Promise<WitnessData[]> => {
      assert.is_hash(cid)
      const url = `${this._host}/api/contract/${cid}/witness`
      const res = await this.fetcher<WitnessData[]>(url)
      if (!res.ok) throw res.error
      return res.data
    },
    submit : async (
      cid     : string, 
      witness : WitnessEntry
    ) : Promise<EscrowContract> => {
      assert.is_hash(cid)
      validate_witness(witness)
      verify_witness(witness)
      const opt = {
        method  : 'POST', 
        body    : JSON.stringify(witness),
        headers : { 'content-type' : 'application/json' }
      }
      const url = `${this._host}/api/contract/${cid}/submit`
      const res = await this.fetcher<ContractData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    }
  }

}

export function get_fetcher (
  fetcher : typeof fetch
) {
  return async <T> (
    input : RequestInfo | URL, 
    init ?: RequestInit | undefined
  ) => {
    const res = await fetcher(input, init)
    return resolve<T>(res)
  }
}
