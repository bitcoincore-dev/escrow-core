import { Signer }          from '@cmdcode/signer'
import { create_sequence } from '@scrow/tapscript/tx'
import { parse_payments }  from '@scrow/core/parse'
import { gen_signer }      from 'test/src/util.js'

import {
  create_witness,
  endorse_witness
}  from '@scrow/core/witness'

import {
  CoreClient,
  CoreWallet
} from '@cmdcode/core-cmd'

import {
  create_deposit,
  create_deposit_rec,
  create_deposit_req,
  get_deposit_address,
  get_deposit_ctx,
  get_deposit_vin
} from '@scrow/core/deposit'

import {
  create_contract,
  create_covenant
} from '@scrow/core/contract'

import {
  ContractData,
  Covenant,
  DepositRecord,
  ProposalData
} from '@scrow/core'

interface MemberData {
  label  : string,
  signer : Signer, 
  wallet : CoreWallet
}

const DEFAULT_ALIASES = [ 'alice', 'bob', 'carol' ]

async function gen_members (
  client  : CoreClient,
  aliases = DEFAULT_ALIASES
) : Promise<MemberData[]> {
  const members : MemberData[] = []
  for (const label of aliases) {
    members.push({
      label,
      signer : gen_signer(label),
      wallet : await client.load_wallet(`${label}_wallet`),
    })
  }
  return members
}

async function gen_agent (client : CoreClient) : Promise<MemberData> {
  const label = 'agent'
  return {
    label,
    signer : gen_signer(label),
    wallet : await client.load_wallet(`${label}_wallet`),
  }
}

async function gen_proposal (
  members : MemberData[]
) : Promise<ProposalData> {
  const [ alice, bob, carol ] = members
  return {
    title    : 'Basic two-party contract with third-party dispute resolution.',
    expires  : 7200,
    details  : 'n/a',
    network  : 'regtest',
    paths: [
      [ 'payout', 90000, await bob.wallet.new_address   ],
      [ 'return', 90000, await alice.wallet.new_address ]
    ],
    payments : [
      [ 10000,  await bob.wallet.new_address ]
    ],
    programs : [
      [ 'dispute',       'payout', 'proof', 1, alice.signer.pubkey.hex ],
      [ 'resolve',       '*',      'proof', 1, carol.signer.pubkey.hex ],
      [ 'close|resolve', '*',      'proof', 2, alice.signer.pubkey.hex, bob.signer.pubkey.hex ]
    ],
    schedule: [
      [ 7200, 'close', 'payout|return' ]
    ],
    value   : 100000,
    version : 1
  }
}

export async function gen_deposits (
  agent    : MemberData,
  members  : MemberData[]
) {
  const amount   = 105_000
  const deposits : DepositRecord[] = []

  for (const member of members) {
    const { signer, wallet } = member
    const depo_key = agent.signer.pubkey
    const sign_key = signer.pubkey
    const timelock = 60 * 60 * 2
    const sequence = create_sequence('timestamp', timelock)
    const context  = get_deposit_ctx(depo_key, sign_key, sequence)
    const address  = get_deposit_address(context, 'regtest')

    await wallet.ensure_funds(1_000_000)

    const txid = await wallet.send_funds(amount, address)
    const tx   = await wallet.client.get_tx(txid)
    const txin = get_deposit_vin(context, tx.txdata)
    const tmpl = create_deposit(context, signer, txin)
    const req  = create_deposit_req(tmpl)
    const depo = create_deposit_rec(req)

    deposits.push(depo)
  }

  return deposits
}

async function gen_contract (
  agent    : MemberData,
  proposal : ProposalData
) : Promise<ContractData> {
  const address = await agent.wallet.new_address
  const fees    = parse_payments([[ 1000, address ]])
  return create_contract(agent.signer, proposal, { fees })
}

async function gen_covenants (
  contract : ContractData,
  deposits : DepositRecord[],
  members  : MemberData[]
) : Promise<Covenant[]> {
  const covenants : Covenant[] = []
  for (const deposit of deposits) {
    for (const mbr of members) {
      const { sign_key } = deposit
      if (sign_key === mbr.signer.pubkey.hex) {
        deposit.confirmed = true
        const cov = create_covenant(contract, deposit, mbr.signer)
        covenants.push(cov)
      }
    } 
  }
  return covenants
}

async function gen_witness (
  members : MemberData[],
  action  : string,
  path    : string,
  prog_id : string,
  stamp  ?: number
) {
  const witness = create_witness(action, path, prog_id, stamp)
  for (const member of members) {
    witness.push(endorse_witness(member.signer, witness))
  }
  return witness
}

export default {
  agent    : gen_agent,
  deposits : gen_deposits,
  contract : gen_contract,
  covenant : gen_covenants,
  members  : gen_members,
  proposal : gen_proposal,
  witness  : gen_witness
}
