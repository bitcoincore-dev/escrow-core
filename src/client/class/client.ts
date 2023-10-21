import { Signer }         from '@/signer.js'
import { create_proof }   from '@/lib/proof.js'
import { now }            from '@/lib/util.js'
import { get_fetcher }    from '@/client/lib/fetcher.js'

import EscrowContract from './contract.js'
import EscrowDeposit  from './deposit.js'

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
  DepositTemplate,
  ProposalData,
  WitnessData,
  WitnessEntry
} from '@/types/index.js'

import * as assert from '@/assert.js'

type Fetcher = ReturnType<typeof get_fetcher>

export default class EscrowClient {
  readonly host     : string
  readonly _fetcher : Fetcher
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

  get fetcher () {
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
    fetch : async (cid : string) => {
      assert.is_hash(cid)
      const url = `${this.host}/api/contract/${cid}`
      const res = await this.fetcher<ContractData>(url)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    },
    list : async (pubkey : string) => {
      assert.is_hash(pubkey)
      const url = this.host + `/api/contract/list`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<ContractData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowContract(this, res.data)
    }
  }

  deposit = {
    assign : async (dep_id : string, covenant : CovenantData) => {
      assert.is_hash(dep_id)
      validate_covenant(covenant)
      const opt = {
        method  : 'POST',
        body    : JSON.stringify({ dep_id, covenant }),
        headers : { 'content-type' : 'application/json' }
      }
      const url = `${this.host}/api/deposit/assign`
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    cancel : async (dep_id : string) => {
      assert.is_hash(dep_id)
      const url = `${this.host}/api/deposit/${dep_id}/cancel`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    fetch : async (dep_id : string) => {
      assert.is_hash(dep_id)
      const url = `${this.host}/api/deposit/${dep_id}`
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
    request : async (req : Record<string, string>) => {
      const params = new URLSearchParams(req).toString()
      console.log('params:', params)
      const url = `${this.host}/api/deposit/request?${params}`
      return this.fetcher<DepositData>(url)
    }
  }

  witness = {
    fetch : async (wit_id : string) => {
      assert.is_hash(wit_id)
      const url = `${this.host}/api/witness/${wit_id}`
      const res = await this.fetcher<WitnessData>(url)
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
