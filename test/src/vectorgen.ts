import { Buff }            from '@cmdcode/buff'
import { create_sequence } from '@scrow/tapscript/tx'
import { Signer }          from '@scrow/core/signer'
import { parse_payments }  from '@scrow/core/parse'
import { create_contract } from '@scrow/core/contract'
import { create_covenant } from '@scrow/core/session'
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
  get_deposit_address,
  get_deposit_ctx,
  get_deposit_input,
  init_deposit
} from '@scrow/core/deposit'

import {
  ContractData,
  Deposit,
  DepositData,
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
    expires  : 14400,
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
      [ 'dispute',       'payout', 'proof', 1, alice.signer.pubkey ],
      [ 'resolve',       '*',      'proof', 1, carol.signer.pubkey ],
      [ 'close|resolve', '*',      'proof', 2, alice.signer.pubkey, bob.signer.pubkey ]
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
  const deposits : DepositData[] = []

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
    const txin = get_deposit_input(context, tx.txdata)
    const data = create_deposit(context, signer, txin)

    deposits.push(data)
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

async function gen_funds (
  contract : ContractData,
  deposits : DepositData[],
  members  : MemberData[]
) : Promise<Deposit[]> {
  return deposits.map(e => {
    const deposit = init_deposit(e)
    for (const mbr of members) {
      const sign_key = Buff.bytes(deposit.signing_key).hex
      if (sign_key === mbr.signer.pubkey) {
        deposit.confirmed = true
        deposit.covenant  = create_covenant(contract, deposit, mbr.signer)
      }
    }
    return deposit
  })
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
  funds    : gen_funds,
  members  : gen_members,
  proposal : gen_proposal,
  witness  : gen_witness
}
