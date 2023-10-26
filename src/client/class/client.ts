import { Signer }          from '../../signer.js'
import { create_proof }    from '../../lib/proof.js'
import { is_hex, now }     from '../../lib/util.js'

import EscrowContract from './contract.js'
import EscrowDeposit  from './deposit.js'

import {
  create_deposit,
  get_deposit_address,
  get_deposit_ctx
} from '../../lib/deposit.js'

import {
  broadcast_tx,
  get_spend_data,
  get_tx_data,
  resolve
} from '../../lib/oracle.js'

import {
  create_covenant,
  create_return
} from '../../lib/session.js'

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
  DepositConfig,
  DepositData,
  DepositInfo,
  DepositTemplate,
  Literal,
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
    close : async (
      address : string,
      deposit : DepositData | EscrowDeposit
    ) : Promise<EscrowDeposit> => {
      if (deposit instanceof EscrowDeposit) {
        deposit = deposit.data
      }
      const dpid = deposit.deposit_id
      const req  = create_return(address, deposit, this.signer)
      const url  = `${this._host}/api/deposit/${dpid}/close`
      const body = JSON.stringify(req)
      const tkn  = create_proof(this.signer, url + body, [[ 'stamp', now() ]])
      console.log('preimg:', url + body)
      console.log('token:', tkn.slice(0, 64))
      const opt  = {
        body,
        headers : {
          'content-type': 'application/json',
          token : tkn
        },
        method  : 'POST'
      }
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    create : async (
      agent_id  : string,
      agent_key : string,
      sequence  : number,
      txid      : string,
      options  ?: DepositConfig
    ) => {
      const { cid, network = 'regtest' } = options ?? {}
      const pub  = this.signer.pubkey
      const ctx  = get_deposit_ctx(agent_key, pub, sequence)
      const addr = get_deposit_address(ctx, network)
      const odat = await this.oracle.get_spend_out({ txid, address : addr })
      assert.ok(odat !== null, 'transaction output not found')
      const utxo = odat.txspend
      const tmpl = create_deposit(agent_id, ctx, this.signer, utxo, options)
      if (cid !== undefined) {
        const ct  = await this.contract.read(cid)
        const cov = create_covenant(ctx, ct.data, this.signer, utxo)
        tmpl.covenant = cov
      }
      return tmpl
    },
    list : async () : Promise<EscrowDeposit[]> => {
      const url = `${this._host}/api/deposit/list`
      const tkn = create_proof(this.signer, url, [[ 'stamp', now() ]])
      const opt = { headers : { token : tkn } }
      const res = await this.fetcher<DepositData[]>(url, opt)
      if (!res.ok) throw res.error
      return res.data.map(e => new EscrowDeposit(this, e))
    },
    read : async (
      deposit_id : string
    ) : Promise<EscrowDeposit> => {
      assert.is_hash(deposit_id)
      const url = `${this._host}/api/deposit/${deposit_id}`
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
      const url = `${this._host}/api/deposit/register`
      const res = await this.fetcher<DepositData>(url, opt)
      if (!res.ok) throw res.error
      return new EscrowDeposit(this, res.data)
    },
    request : async (
      params : Record<string, Literal> = {}
    ) : Promise<DepositInfo> => {
      const arr = Object.entries(params).map(([ k, v ]) => [ k, String(v) ])
      const qry = new URLSearchParams(arr).toString()
      const url = `${this._host}/api/deposit/request?${qry}`
      const ret = await this.fetcher<DepositInfo>(url)
      if (!ret.ok) throw new Error(ret.error)
      return ret.data
    }
  }

  oracle = {
    broadcast_tx : async (txhex : string) => {
      assert.ok(is_hex(txhex))
      return broadcast_tx(this._oracle, txhex)
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
