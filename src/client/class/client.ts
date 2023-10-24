import { Signer }         from '@/signer.js'
import { create_proof }   from '@/lib/proof.js'
import { now }            from '@/lib/util.js'
import { resolve }        from '@/lib/oracle.js'

import EscrowContract from './contract.js'
import EscrowDeposit  from './deposit.js'

import {
  get_spend_data,
  get_tx_data
} from '@/lib/oracle.js'

import {
  validate_covenant,
  validate_deposit,
  validate_proposal,
  verify_proposal,
  validate_witness,
  verify_witness
} from '@/validators/index.js'

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
} from '@/types/index.js'

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
    create : async (proposal : ProposalData) => {
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
    read : async (cid : string) => {
      assert.is_hash(cid)
      const url = `${this.host}/api/contract/${cid}`
      const res = await this.fetcher<ContractData>(url)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    },
    list : async () => {
      const url = this.host + `/api/contract/list`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<ContractData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    },
    cancel : async (cid : string) => {
      assert.is_hash(cid)
      const url = this.host + `/api/contract/${cid}/cancel`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<ContractData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    }
  }

  covenant = {
    sign : async (deposit_id : string, covenant : CovenantData) => {
      assert.is_hash(deposit_id)
      validate_covenant(covenant)
      const opt = {
        method  : 'POST',
        body    : JSON.stringify(covenant),
        headers : { 'content-type' : 'application/json' }
      }
      const url = `${this.host}/api/deposit/${deposit_id}/sign`
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    release : async (deposit_id : string) => {
      assert.is_hash(deposit_id)
      const url = `${this.host}/api/deposit/${deposit_id}/release`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    }
  }

  deposit = {
    close : async (deposit_id : string) => {
      assert.is_hash(deposit_id)
      const url = `${this.host}/api/deposit/${deposit_id}/close`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    read : async (deposit_id : string) => {
      assert.is_hash(deposit_id)
      const url = `${this.host}/api/deposit/${deposit_id}`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    register : async (template : DepositTemplate) => {
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
    request : async (params : Record<string, Literal> = {}) => {
      const arr = Object.entries(params).map(([ k, v ]) => [ k, String(v) ])
      const qry = new URLSearchParams(arr).toString()
      const url = `${this.host}/api/deposit/request?${qry}`
      return this.fetcher<DepositInfo>(url)
    }
  }

  oracle  = {
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
    read : async (wit_id : string) => {
      assert.is_hash(wit_id)
      const url = `${this.host}/api/witness/${wit_id}`
      const res = await this.fetcher<WitnessData>(url)
      if (!res.ok) throw res.error
      return res.data
    },
    list : async (cid : string) => {
      assert.is_hash(cid)
      const url = `${this.host}/api/contract/${cid}/witness`
      const res = await this.fetcher<WitnessData[]>(url)
      if (!res.ok) throw res.error
      return res.data
    },
    submit : async (cid : string, witness : WitnessEntry) => {
      assert.is_hash(cid)
      validate_witness(witness)
      verify_witness(witness)
      const opt = {
        method  : 'POST', 
        body    : JSON.stringify({ cid, witness }),
        headers : { 'content-type' : 'application/json' }
      }
      const url = `${this.host}/api/witness/submit`
      const res = await this.fetcher<WitnessData>(url, opt)
      if (!res.ok) throw res.error
      return res.data
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
