import { Signer }                from '../../signer.js'
import { create_proof }          from '../../lib/proof.js'
import { is_hex, now }           from '../../lib/util.js'
import { broadcast_tx, resolve } from '../../lib/oracle.js'

import EscrowContract from './contract.js'
import EscrowDeposit  from './deposit.js'

import {
  get_spend_data,
  get_tx_data
} from '../../lib/oracle.js'

import {
  validate_covenant,
  validate_deposit,
  validate_proposal,
  verify_proposal,
  validate_witness,
  verify_witness
} from '../../validators/index.js'

import {
  ContractData,
  CovenantData,
  DepositData,
  DepositInfo,
  DepositTemplate,
  Literal,
  ProposalData,
  WitnessData,
  WitnessEntry
} from '../../types/index.js'

import * as assert from '@/assert.js'

type Resolver = ReturnType<typeof get_fetcher>

export default class EscrowClient {
  readonly host     : string
  readonly _fetcher : Resolver
  readonly _signer  : Signer

  constructor (
    hostname : string,
    signer   : Signer,
    fetcher ?: typeof fetch
  ) {
    this.host     = hostname
    this._fetcher = get_fetcher(fetcher ?? fetch)
    this._signer  = signer
  }

  get fetcher() {
    return this._fetcher
  }

  get signer () {
    return this._signer
  }
 
  contract = {
    create : async (
      proposal : ProposalData
    ) : Promise<EscrowContract> => {
      validate_proposal(proposal)
      verify_proposal(proposal)
      const opt = {
        method  : 'POST', 
        body    : JSON.stringify(proposal),
        headers : { 'content-type' : 'application/json' }
      }
      const url = this.host + '/api/contract/create'
      const res = await this.fetcher<ContractData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    },
    read : async (
      cid : string
    ) : Promise<EscrowContract> => {
      assert.is_hash(cid)
      const url = `${this.host}/api/contract/${cid}`
      const res = await this.fetcher<ContractData>(url)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    },
    list : async () : Promise<EscrowContract[]> => {
      const url = this.host + `/api/contract/list`
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
      const url = this.host + `/api/contract/${cid}/cancel`
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
      const url = `${this.host}/api/contract/${cid}/funds`
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
      const url = `${this.host}/api/covenant/${deposit_id}/add`
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    remove : async (
      deposit_id : string
    ) : Promise<EscrowDeposit> => {
      assert.is_hash(deposit_id)
      const url = `${this.host}/api/covenant/${deposit_id}/remove`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    }
  }

  deposit = {
    close : async (
      deposit_id : string
    ) : Promise<EscrowDeposit> => {
      assert.is_hash(deposit_id)
      const url = `${this.host}/api/deposit/${deposit_id}/close`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    read : async (
      deposit_id : string
    ) : Promise<EscrowDeposit> => {
      assert.is_hash(deposit_id)
      const url = `${this.host}/api/deposit/${deposit_id}`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    register : async (
      template : DepositTemplate
    ) : Promise<EscrowDeposit> => {
      validate_deposit(template)
      const opt = {
        method  : 'POST', 
        body    : JSON.stringify(template),
        headers : { 'content-type' : 'application/json' }
      }
      const url = `${this.host}/api/deposit/register`
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    request : async (
      params : Record<string, Literal> = {}
    ) : Promise<DepositInfo> => {
      const arr = Object.entries(params).map(([ k, v ]) => [ k, String(v) ])
      const qry = new URLSearchParams(arr).toString()
      const url = `${this.host}/api/deposit/request?${qry}`
      const ret = await this.fetcher<DepositInfo>(url)
      if (!ret.ok) throw new Error(ret.error)
      return ret.data
    }
  }

  oracle = {
    broadcast_tx : async (host : string, txhex : string) => {
      assert.ok(is_hex(txhex))
      return broadcast_tx(host, txhex)
    },
    get_tx_data : async (host : string, txid : string) => {
      assert.is_hash(txid)
      return get_tx_data(host, txid)
    },
    get_spend_data : async (host : string, txid : string, vout : number) => {
      assert.is_hash(txid)
      return get_spend_data(host, txid, vout)
    }
  }

  witness = {
    read : async (
      wid : string
    ) : Promise<WitnessData> => {
      assert.is_hash(wid)
      const url = `${this.host}/api/witness/${wid}`
      const res = await this.fetcher<WitnessData>(url)
      if (!res.ok) throw res.error
      return res.data
    },
    list : async (
      cid : string
    ) : Promise<WitnessData[]> => {
      assert.is_hash(cid)
      const url = `${this.host}/api/contract/${cid}/witness`
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
      const url = `${this.host}/api/contract/${cid}/submit`
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
