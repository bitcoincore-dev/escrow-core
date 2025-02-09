import { Buff }            from '@cmdcode/buff'
import { TxBytes }         from '@scrow/tapscript'
import { create_sequence } from '@scrow/tapscript/tx'
import { Signer }          from '@scrow/core/signer'
import { create_covenant } from '@scrow/core/session'
import { gen_signer }      from 'test/src/util.js'

import {
  parse_prevout,
  parse_txout,
  prevout_to_txspend
} from '@scrow/core/tx'

import {
  create_witness,
  endorse_witness
}  from '@scrow/core/witness'

import {
  CoreClient,
  CoreWallet
} from '@cmdcode/core-cmd'

import {
  create_registration,
  get_deposit_address,
  get_deposit_ctx
} from '@scrow/core/deposit'

import {
  ContractData,
  DepositContext,
  DepositData,
  DepositTemplate,
  ProposalData
} from '@scrow/core'

interface MemberData {
  label  : string,
  signer : Signer, 
  wallet : CoreWallet
}

import * as assert from '@scrow/core/assert'

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
  const deposits : DepositTemplate[] = []

  for (const member of members) {
    const { signer, wallet } = member
    const agent_id = agent.signer.id
    const depo_key = agent.signer.pubkey
    const sign_key = signer.pubkey
    const timelock = 60 * 60 * 2
    const sequence = create_sequence('stamp', timelock)
    const context  = get_deposit_ctx(depo_key, sign_key, sequence)
    const address  = get_deposit_address(context, 'regtest')

    await wallet.ensure_funds(1_000_000)

    const txid = await wallet.send_funds(amount, address)
    const tx   = await wallet.client.get_tx(txid)
    assert.exists(tx)
    const txin = get_deposit_txinput(context, tx.hex)
    const sout = prevout_to_txspend(txin)
    const data = create_registration(agent_id, context, signer, sout, { pubkey : sign_key })

    deposits.push(data)
  }
  
  await agent.wallet.client.mine_blocks(1)

  return deposits
}

async function gen_funds (
  contract : ContractData,
  deposits : DepositData[],
  members  : MemberData[]
) : Promise<DepositData[]> {
  return deposits.map(dep => {
    for (const mbr of members) {
      const sign_key = Buff.bytes(dep.deposit_key).hex
      if (sign_key === mbr.signer.pubkey) {
        const ctx = get_deposit_ctx(dep.agent_key, dep.deposit_key, dep.sequence)
        const txo = parse_txout(dep)
        dep.covenant = create_covenant(ctx, contract, mbr.signer, txo)
      }
    }
    return dep
  })
}

async function gen_witness (
  members : MemberData[],
  action  : string,
  path    : string,
  prog_id : string
) {
  const [ member, ...rest ] = members
  const witness = create_witness(action, path, member.signer, { prog_id })
  for (const member of rest) {
    witness.push(endorse_witness(member.signer, witness))
  }
  return witness
}

function get_deposit_txinput (
  context : DepositContext,
  txhex   : TxBytes
) {
  const { tap_data } = context
  const txinput = parse_prevout(txhex, tap_data.tapkey)
  if (txinput === null) {
    throw new Error('Unable to locate txinput!')
  }
  return txinput
}


export default {
  agent    : gen_agent,
  deposits : gen_deposits,
  funds    : gen_funds,
  members  : gen_members,
  proposal : gen_proposal,
  witness  : gen_witness
}
