import { Signer }       from '@/signer.js'
import { create_proof } from '@/lib/proof.js'
import { now }          from '@/lib/util.js'
import { handler }      from '@/client/lib/handler.js'

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

type Fetcher = typeof fetch

export class EscrowClient {
  readonly host     : string
  readonly _fetcher : Fetcher
  readonly _signer  : Signer

  constructor (
    hostname : string,
    signer   : Signer,
    fetcher ?: Fetcher
  ) {
    this.host     = hostname
    this._fetcher = fetcher ?? fetch
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
      return this.fetcher(this.host + '/api/contract/create', opt)
        .then(async res => handler<ContractData>(res))
    },
    fetch : async (cid : string) => {
      assert.is_hash(cid)
      return this.fetcher(this.host + `/api/contract/${cid}`)
        .then(async res => handler<ContractData>(res))
    },
    list : async (pubkey : string) => {
      assert.is_hash(pubkey)
      const url = this.host + `/api/contract/list`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      return this._fetcher(url, opt)
        .then(async res => handler<ContractData>(res))
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
      return this.fetcher(this.host + '/api/deposit/assign', opt)
        .then(async res => handler<DepositData>(res))
    },
    cancel : async (dep_id : string) => {
      assert.is_hash(dep_id)
      const url = `${this.host}/api/deposit/${dep_id}/cancel`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      return this.fetcher(url, opt)
        .then(async res => handler<DepositData>(res))
    },
    fetch : async (dep_id : string) => {
      assert.is_hash(dep_id)
      const url = `${this.host}/api/deposit/${dep_id}`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      return this.fetcher(url, opt)
        .then(async res => handler<DepositData>(res))
    },
    register : async (template : DepositTemplate) => {
      validate_deposit(template)
      const opt = {
        method  : 'POST', 
        body    : JSON.stringify(template),
        headers : { 'content-type' : 'application/json' }
      }
      return this.fetcher(this.host + '/api/deposit/register', opt)
        .then(async res => handler<DepositData>(res))
    },
    request : async (req : Record<string, string>) => {
      const params = new URLSearchParams(req).toString()
      console.log('params:', params)
      return this.fetcher(this.host + '/api/deposit/request')
        .then(async res => handler<Record<string, string>>(res))
    }
  }

  witness = {
    fetch : async (wit_id : string) => {
      assert.is_hash(wit_id)
      const url = `${this.host}/api/witness/${wit_id}`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { proof : tkn } }
      return this.fetcher(url, opt)
        .then(async res => handler<WitnessData>(res))
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
      return this.fetcher(`${this.host}/api/witness/submit`, opt)
        .then(async res => handler<WitnessData>(res))
    }
  }

}
