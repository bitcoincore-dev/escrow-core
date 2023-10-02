import { Signer }          from '@cmdcode/signer'
import { get_deposit_ctx } from '@scrow/core/context'
import { get_session }     from '@scrow/core/session'
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
  get_deposit_address
} from '@scrow/core/deposit'

import {
  AgentSession,
  DepositData,
  Payment,
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
      [ 7200, 'close', 'payout|refund', ]
    ],
    value   : 100000,
    version : 1
  }
}

async function gen_session (
  agent    : MemberData,
  proposal : ProposalData
) : Promise<AgentSession> {
  const fees  = [[ 1000, await agent.wallet.new_address ]]
  return get_session(proposal, agent.signer, fees as Payment[])
}

export async function gen_deposits (
  members  : MemberData[],
  proposal : ProposalData,
  session  : AgentSession
) {
  const amount   = 105_000
  const deposits : DepositData[] = []

  for (const member of members) {
    const { signer, wallet } = member
    const context = get_deposit_ctx(proposal, session, signer.pubkey)
    const address = get_deposit_address(context, 'regtest')

    await wallet.ensure_funds(1_000_000)

    const txid = await wallet.send_funds(amount, address)
    const tx   = await wallet.client.get_tx(txid)
    const tmpl = create_deposit(proposal, session, signer, tx.txdata)

    deposits.push(tmpl)
  }

  return deposits
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
  members  : gen_members,
  proposal : gen_proposal,
  session  : gen_session,
  witness  : gen_witness
}
